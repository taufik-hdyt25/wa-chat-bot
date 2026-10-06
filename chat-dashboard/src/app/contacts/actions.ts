"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addContact(formData: FormData) {
  let phoneNumber = formData.get("phoneNumber") as string;
  const name = formData.get("name") as string;

  // Clean the phone number (remove spaces, +, and replace leading 0 with 62)
  phoneNumber = phoneNumber.replace(/[\s+]/g, "");
  if (phoneNumber.startsWith("0")) {
    phoneNumber = "62" + phoneNumber.substring(1);
  }

  if (!phoneNumber) {
    throw new Error("Phone number is required");
  }

  const existing = await prisma.contact.findUnique({
    where: { phoneNumber }
  });

  if (existing) {
    throw new Error("Contact with this phone number already exists");
  }

  const newContact = await prisma.contact.create({
    data: {
      phoneNumber,
      name: name ? name.trim() : null,
    }
  });

  revalidatePath("/contacts");
  return newContact;
}
