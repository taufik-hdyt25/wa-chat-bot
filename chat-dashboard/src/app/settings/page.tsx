import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import ConnectionStatus from "./ConnectionStatus";

import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Fetch existing user style (assume ID 1 for personal bot)
  let userStyle = await prisma.userStyle.findFirst();
  if (!userStyle) {
    userStyle = await prisma.userStyle.create({ data: {} });
  }

  // Server Action to update settings
  async function updateSettings(formData: FormData) {
    "use server";
    
    await prisma.userStyle.update({
      where: { id: userStyle!.id },
      data: {
        language: formData.get("language") as string,
        tone: formData.get("tone") as string,
        formality: formData.get("formality") as string,
        messageLength: formData.get("messageLength") as string,
        emojiUsage: formData.get("emojiUsage") as string,
        slangUsage: formData.get("slangUsage") === "on",
        customInstructions: formData.get("customInstructions") as string || null,
      },
    });

    revalidatePath("/settings");
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-0 min-h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">AI Configuration</h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/contacts" className="text-slate-400 hover:text-white transition-colors">Conversations</Link>
            <Link href="/settings" className="text-blue-400">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ConnectionStatus />

        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Personal Writing Style</h2>
          <p className="text-slate-400 text-sm">
            Configure how you want the AI to sound when replying to your WhatsApp messages.
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-3xl border border-slate-800 p-8 shadow-xl">
          <SettingsForm userStyle={userStyle} updateAction={updateSettings} />
        </div>
      </main>
    </div>
  );
}
