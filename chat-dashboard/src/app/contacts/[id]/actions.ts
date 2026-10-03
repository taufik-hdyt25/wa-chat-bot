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

export async function deleteContact(contactId: number) {
  // Hapus semua relasi terlebih dahulu agar tidak ada error foreign key
  await prisma.aIDraft.deleteMany({ where: { contactId } });
  await prisma.message.deleteMany({ where: { contactId } });
  await prisma.memory.deleteMany({ where: { contactId } });
  await prisma.conversation.deleteMany({ where: { contactId } });
  
  // Terakhir, hapus kontaknya
  await prisma.contact.delete({ where: { id: contactId } });
}

export async function deleteMemory(memoryId: number, contactId: number) {
  await prisma.memory.delete({ where: { id: memoryId } });
  revalidatePath(`/contacts/${contactId}`);
}
