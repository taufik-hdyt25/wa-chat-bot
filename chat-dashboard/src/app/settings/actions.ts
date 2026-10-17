"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  try {
    const rawMin = parseInt(formData.get("replyDelayMin") as string, 10);
    const rawMax = parseInt(formData.get("replyDelayMax") as string, 10);
    const rawTypingBefore = parseInt(formData.get("typingDelayBefore") as string, 10);
    const replyDelayMin = isNaN(rawMin) ? 3 : Math.max(0, rawMin);
    const replyDelayMax = isNaN(rawMax) ? 8 : Math.max(0, rawMax);
    const typingDelayBefore = isNaN(rawTypingBefore) ? 2 : Math.max(0, rawTypingBefore);
    const simulateTyping = formData.get("simulateTyping") === "on";

    let userStyle = await prisma.userStyle.findFirst();
    if (!userStyle) {
      userStyle = await prisma.userStyle.create({ data: {} });
    }

    const language = (formData.get("language") as string) || userStyle.language || "id";
    const tone = (formData.get("tone") as string) || userStyle.tone || "casual";
    const formality = (formData.get("formality") as string) || userStyle.formality || "low";
    const messageLength = (formData.get("messageLength") as string) || userStyle.messageLength || "short";
    const emojiUsage = (formData.get("emojiUsage") as string) || userStyle.emojiUsage || "low";
    const slangUsage = formData.get("slangUsage") === "on";
    const respondToGroups = formData.get("respondToGroups") === "on";
    const customInstructions = (formData.get("customInstructions") as string)?.trim() || null;
    const persona = (formData.get("persona") as string)?.trim() || null;

    await prisma.userStyle.update({
      where: { id: userStyle.id },
      data: {
        language,
        tone,
        formality,
        messageLength,
        emojiUsage,
        slangUsage,
        respondToGroups,
        replyDelayMin: Math.min(replyDelayMin, replyDelayMax),
        replyDelayMax: Math.max(replyDelayMin, replyDelayMax),
        typingDelayBefore,
        simulateTyping,
        customInstructions,
        persona,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update AI settings:", error);
    throw new Error(error?.message || "Failed to update configuration");
  }
}
