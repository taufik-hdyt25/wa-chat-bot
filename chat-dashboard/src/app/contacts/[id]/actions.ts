"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateContactSettings(contactId: number, formData: FormData) {
  const aiMode = formData.get("aiMode") as string;
  const relationship = formData.get("relationship") as string;
  const newMemory = formData.get("newMemory") as string;

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      aiMode,
      relationship,
    },
  });

  if (newMemory && newMemory.trim() !== "") {
    await prisma.memory.create({
      data: {
        contactId,
        content: newMemory.trim(),
      },
    });
  }

  revalidatePath(`/contacts/${contactId}`);
}
