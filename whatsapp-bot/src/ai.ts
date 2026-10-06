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
      take: 20,
    });

    // Urutkan secara kronologis (terlama ke terbaru)
    recentMessages.reverse();

    // 4. Susun System Prompt dengan Persona sebagai instruksi paling kuat
    const systemPrompt = `You are a personal WhatsApp assistant acting on behalf of the user.
Your job is to reply to messages naturally, AS IF YOU ARE the user — not an AI assistant.
Never reveal that you are an AI. Never say "as an AI" or similar phrases.
Reply in the same language as the incoming message unless instructed otherwise.
Do not invent facts. If unsure, be vague rather than making things up.
If the conversation involves highly sensitive topics (like transferring money, making promises, or agreeing to contracts), gently decline or say you need to think about it first.
${(userStyle as any).persona ? `
=== PERSONA / KARAKTER PENGGUNA (IKUTI INI DENGAN KETAT) ===
${(userStyle as any).persona}
=== AKHIR PERSONA ===
` : ""}
GAYA BAHASA:
Bahasa: ${userStyle.language}
Nada: ${userStyle.tone}
Formalitas: ${userStyle.formality}
Panjang Pesan: ${userStyle.messageLength}
Penggunaan Emoji: ${userStyle.emojiUsage}
Bahasa Gaul/Slang: ${userStyle.slangUsage ? "Ya" : "Tidak"}
${userStyle.customInstructions ? `\nINSTRUKSI TAMBAHAN (WAJIB DIIKUTI):\n${userStyle.customInstructions}\n` : ""}

TENTANG KONTAK INI:
Nama: ${contact.name || contact.phoneNumber}
Hubungan: ${contact.relationship || "Tidak diketahui"}
${contact.memories.length > 0 ? `\nFAKTA YANG DIKETAHUI TENTANG KONTAK INI:\n${contact.memories.map((m) => "- " + m.content).join("\n")}` : ""}

Balas HANYA dengan teks pesan yang ingin dikirim. Tanpa tanda kutip, tanpa basa-basi pengantar.`;

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
        // Riwayat percakapan dikirim sebagai messages terstruktur
        ...historyMessages,
        // Pesan terbaru yang masuk
        {
          role: "user",
          content: currentMessage,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.75,
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
