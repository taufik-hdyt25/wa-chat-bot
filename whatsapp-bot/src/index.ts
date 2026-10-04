import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import qrcode from "qrcode-terminal";
import { generateAIDraft } from "./ai.js";
import express from "express";
import cors from "cors";

dotenv.config();

const prisma = new PrismaClient();

let currentQR: string | null = null;
let isConnected = false;
let globalSock: any = null;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state,
    browser: ["Personal AI Bot", "Chrome", "1.0.0"],
  });
  
  globalSock = sock;

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Jika ada QR Code baru dari Baileys, print ke terminal
    if (qr) {
      qrcode.generate(qr, { small: true });
      currentQR = qr;
    }

    if (connection === "close") {
      isConnected = false;
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "connection closed due to ",
        lastDisconnect?.error,
        ", reconnecting ",
        shouldReconnect,
      );

      if (shouldReconnect) {
        connectToWhatsApp();
      } else {
        // If logged out, delete session and restart
        console.log("Session invalid or logged out. Resetting...");
        import("fs").then(fs => {
          fs.rmSync("auth_info_baileys", { recursive: true, force: true });
          currentQR = null;
          connectToWhatsApp();
        });
      }
    } else if (connection === "open") {
      isConnected = true;
      currentQR = null;
      console.log("opened connection");
    }
  });

  sock.ev.on("messages.upsert", async (m) => {
    if (m.type === "notify") {
      for (const msg of m.messages) {
        const remoteJid = msg.key.remoteJid;
        // Hanya proses private chat, abaikan group dan status update.
        if (!remoteJid || remoteJid.includes('@g.us') || remoteJid.includes('status@broadcast')) continue;

        const isFromMe = msg.key.fromMe || false;
        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

        if (messageText) {
          console.log(`[Message] ${remoteJid} (fromMe: ${isFromMe}): ${messageText}`);

          const phoneNumber = remoteJid.split('@')[0];

          try {
            const pushName = msg.pushName || null;

            // 1. Cari atau buat Kontak baru, dan update namanya jika tersedia
            const contact = await prisma.contact.upsert({
              where: { phoneNumber },
              update: {
                ...((pushName && !isFromMe) && { name: pushName })
              },
              create: { 
                phoneNumber,
                name: !isFromMe ? pushName : null
              },
            });

            // 2. Simpan Pesan ke Database
            const savedMessage = await prisma.message.create({
              data: {
                contactId: contact.id,
                direction: isFromMe ? "outgoing" : "incoming",
                message: messageText,
              },
            });

            console.log(`Pesan disimpan ke DB dengan ID: ${savedMessage.id}`);

            // 3. Jika pesan masuk, buat Draft
            if (!isFromMe) {
              if (contact.aiMode === "suggest_reply") {
                console.log(`Membuat draft balasan AI untuk kontak ${contact.phoneNumber}...`);
                await generateAIDraft(prisma, savedMessage.id, contact.id, messageText);
              } else if (contact.aiMode === "auto_reply") {
                console.log(`Auto reply ke ${contact.phoneNumber}...`);
                const draft = await generateAIDraft(prisma, savedMessage.id, contact.id, messageText);
                if (draft) {
                  if (draft.includes("[Approval Required]")) {
                    console.log(`Pesan memerlukan approval. Menunda auto-reply.`);
                  } else {
                    await sock.sendMessage(remoteJid, { text: draft });
                    
                    // Update status draft menjadi sent agar tidak muncul di dashboard 'Needs Your Approval'
                    await prisma.aIDraft.updateMany({
                      where: { incomingMessageId: savedMessage.id },
                      data: { status: "sent" },
                    });

                    // Simpan pesan AI ke database agar muncul di history
                    await prisma.message.create({
                      data: {
                        contactId: contact.id,
                        direction: "outgoing",
                        message: draft,
                      },
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error("Database error:", error);
          }
        }
      }
    }
  });

  sock.ev.on("contacts.upsert", async (contacts) => {
    console.log(`Menerima ${contacts.length} kontak dari sinkronisasi WhatsApp...`);
    for (const contact of contacts) {
      if (!contact.id || !contact.id.endsWith('@s.whatsapp.net')) continue;
      
      const phoneNumber = contact.id.split('@')[0];
      const name = contact.name || contact.notify || contact.verifiedName || null;
      
      if (!name) continue; // Jangan simpan jika tidak ada namanya (kontak anonim/belum disimpan di HP)

      try {
        await prisma.contact.upsert({
          where: { phoneNumber },
          update: { name },
          create: { phoneNumber, name },
        });
      } catch (error) {
        // Abaikan error duplikat atau minor saat sinkronisasi massal
      }
    }
    console.log(`Sinkronisasi kontak selesai.`);
  });
}

// Setup Express server for API integrations (like broadcast)
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/broadcast', async (req, res) => {
  try {
    const { message, contactIds, media } = req.body;
    if (!message && !media) {
      return res.status(400).json({ error: "Message or media is required" });
    }

    if (!globalSock) {
      return res.status(503).json({ error: "WhatsApp socket not ready" });
    }

    let targetContacts = [];
    if (contactIds && contactIds.length > 0) {
      targetContacts = await prisma.contact.findMany({
        where: { id: { in: contactIds } }
      });
    } else {
      // Jika tidak ada ID yang dipilih, kirim ke semua kontak
      targetContacts = await prisma.contact.findMany();
    }

    let sentCount = 0;
    for (const contact of targetContacts) {
      const remoteJid = `${contact.phoneNumber}@s.whatsapp.net`;
      try {
        if (media && media.data) {
          const buffer = Buffer.from(media.data, 'base64');
          if (media.mimetype.startsWith('image/')) {
            await globalSock.sendMessage(remoteJid, { image: buffer, caption: message || "" });
          } else if (media.mimetype.startsWith('video/')) {
            await globalSock.sendMessage(remoteJid, { video: buffer, caption: message || "" });
          } else {
            await globalSock.sendMessage(remoteJid, { document: buffer, mimetype: media.mimetype, fileName: media.fileName, caption: message || "" });
          }
        } else {
          await globalSock.sendMessage(remoteJid, { text: message });
        }
        
        // Simpan pesan ke history
        await prisma.message.create({
          data: {
            contactId: contact.id,
            direction: "outgoing",
            message: message ? message : `[Media sent: ${media.fileName || 'file'}]`,
          }
        });
        sentCount++;
        // Delay sedikit agar tidak di-banned spam oleh WhatsApp
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) {
        console.error(`Failed to broadcast to ${contact.phoneNumber}:`, e);
      }
    }

    res.json({ success: true, sentCount, totalTargets: targetContacts.length });
  } catch (error: any) {
    console.error("Broadcast Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    qr: currentQR
  });
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Bot API is running on port ${PORT}`);
});

connectToWhatsApp();
