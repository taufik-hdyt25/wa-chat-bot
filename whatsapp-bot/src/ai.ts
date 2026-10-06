import Groq from "groq-sdk";
import { PrismaClient } from "@prisma/client";

// Inisialisasi Groq Client
const groq = new Groq({ apiKey: process.env.AI_API_KEY });

export async function generateAIDraft(
  prisma: PrismaClient,
  messageId: number,
  contactId: number,
  currentMessage: string
) {
  try {
    // 1. Ambil Info Kontak & Memorinya
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        memories: true,
      },
    });

    if (!contact) throw new Error("Contact not found");

    // 2. Ambil Gaya Bahasa Pengguna (Style)
    let userStyle = await prisma.userStyle.findFirst();
    if (!userStyle) {
      userStyle = await prisma.userStyle.create({ data: {} });
    }

    // 3. Ambil Riwayat Percakapan lebih banyak untuk konteks lebih baik
    const recentMessages = await prisma.message.findMany({
      where: { contactId },
      orderBy: { timestamp: "desc" },
      take: 20, // Naik dari 8 ke 20 untuk konteks lebih panjang
    });

    // Urutkan secara kronologis (terlama ke terbaru)
    recentMessages.reverse();

    // 4. Susun System Prompt (TANPA menyertakan riwayat chat di sini)
    const systemPrompt = `You are a personal WhatsApp assistant acting on behalf of the user.
Your job is to reply to messages naturally, as if you are the user.
Follow the user's communication style based on the configuration provided.
Keep replies concise and natural. If the user sends a short greeting like "P", "Ping", or "Halo", just reply casually like "Iya, kenapa?" or according to the user's tone.
Do not invent facts. Reply in the same language as the incoming message unless instructed otherwise.
If the conversation involves highly sensitive topics (like transferring money, making promises, or agreeing to contracts), gently decline or say you need to think about it first.

USER WRITING STYLE:
Language: ${userStyle.language}
Tone: ${userStyle.tone}
Formality: ${userStyle.formality}
Message Length: ${userStyle.messageLength}
Emoji Usage: ${userStyle.emojiUsage}
Slang Usage: ${userStyle.slangUsage ? "Yes" : "No"}
${userStyle.customInstructions ? `\nCUSTOM INSTRUCTIONS (CRITICAL - STRICTLY FOLLOW THIS):\n${userStyle.customInstructions}\n` : ""}

CONTACT INFO:
Name: ${contact.name || contact.phoneNumber}
Relationship: ${contact.relationship || "Unknown"}
${contact.memories.length > 0 ? `\nKNOWN FACTS ABOUT THIS CONTACT:\n${contact.memories.map((m) => "- " + m.content).join("\n")}` : ""}

Respond ONLY with the exact text you want to send as a reply. Do not use quotes or introductory phrases.`;

    // 5. Susun array messages dari riwayat percakapan (format yang lebih dipahami AI)
    const historyMessages: { role: "user" | "assistant"; content: string }[] = recentMessages.map((m) => ({
      role: m.direction === "incoming" ? "user" : "assistant",
      content: m.message,
    }));

    // 6. Minta Groq memproses balasan dengan konteks percakapan yang terstruktur
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        // Riwayat percakapan dikirim sebagai messages terstruktur (lebih dipahami model)
        ...historyMessages,
        // Pesan terbaru yang masuk
        {
          role: "user",
          content: currentMessage,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const draftText = chatCompletion.choices[0]?.message?.content || "";

    // 7. Simpan Draft ke Database
    await prisma.aIDraft.create({
      data: {
        contactId,
        incomingMessageId: messageId,
        draft: draftText.trim(),
        status: "pending",
      },
    });

    console.log(`[AI Draft Generated for ${contact.phoneNumber}]: ${draftText.trim()}`);

    return draftText.trim();
  } catch (error: any) {
    if (error?.status === 429) {
      console.log(`[AI Error] Rate Limit Groq tercapai. Silakan tunggu beberapa saat.`);
    } else {
      console.error("Failed to generate AI Draft:", error?.message || error);
    }
    return null;
  }
}
