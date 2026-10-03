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

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  const sock = makeWASocket({
    auth: state,
    browser: ["Personal AI Bot", "Chrome", "1.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Jika ada QR Code baru dari Baileys, print ke terminal
    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
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
      }
    } else if (connection === "open") {
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
                ...(pushName && { name: pushName })
              },
              create: { 
                phoneNumber,
                name: pushName
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

  // Setup Express server for API integrations (like broadcast)
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/broadcast', async (req, res) => {
    try {
      const { message, contactIds } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
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
          await sock.sendMessage(remoteJid, { text: message });
          
          // Simpan pesan ke history
          await prisma.message.create({
            data: {
              contactId: contact.id,
              direction: "outgoing",
              message: message,
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

  const PORT = process.env.API_PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Bot API is running on port ${PORT}`);
  });
}

connectToWhatsApp();
