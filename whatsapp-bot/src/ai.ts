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
      // Jika belum ada, buat default style
      userStyle = await prisma.userStyle.create({ data: {} });
    }

    // 3. Ambil Percakapan Terakhir (Recent Messages) untuk Konteks
    const recentMessages = await prisma.message.findMany({
      where: { contactId },
      orderBy: { timestamp: "desc" },
      take: 8,
    });
    
    // Urutkan secara kronologis (terlama ke terbaru)
    recentMessages.reverse();

    // 4. Susun System Prompt
    const systemPrompt = `You are a personal WhatsApp assistant.
Your job is to help the user reply to messages.
Follow the user's communication style based on the configuration provided.
Keep replies concise and natural. If the user sends a short greeting like "P", "Ping", or "Halo", just reply casually like "Iya, kenapa?" or according to the user's tone.
Do not invent facts.
ONLY use "[Approval Required]" if the user explicitly asks for money transfers, signing contracts, or important decisions. Otherwise, just reply normally.

USER WRITING STYLE:
Language: ${userStyle.language}
Tone: ${userStyle.tone}
Formality: ${userStyle.formality}
Message Length: ${userStyle.messageLength}
Emoji Usage: ${userStyle.emojiUsage}
Slang Usage: ${userStyle.slangUsage ? "Yes" : "No"}
${userStyle.customInstructions ? `\nCUSTOM INSTRUCTIONS (CRITICAL - STRICTLY FOLLOW THIS):\n${userStyle.customInstructions}\n` : ""}

CONTACT MEMORY:
Relationship: ${contact.relationship || "Unknown"}
Memories:
${contact.memories.length > 0 ? contact.memories.map((m) => "- " + m.content).join("\n") : "No specific memory yet."}

RECENT MESSAGES:
${recentMessages.map((m) => `${m.direction === "incoming" ? contact.name || contact.phoneNumber : "Me"}: ${m.message}`).join("\n")}

Respond ONLY with the exact text you want to send as a reply. Do not use quotes or introductory phrases.`;

    // 5. Minta Groq memproses balasan (menggunakan llama3-70b-8192)
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: `CURRENT MESSAGE from ${contact.name || contact.phoneNumber}: ${currentMessage}`
            }
        ],
        model: "qwen/qwen3.8-27b", // Model Qwen yang dioptimalkan untuk percakapan
        temperature: 0.7,
        max_tokens: 256,
    });

    const draftText = chatCompletion.choices[0]?.message?.content || "";

    // 6. Simpan Draft ke Database
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
