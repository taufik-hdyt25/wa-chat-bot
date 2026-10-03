import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">AI Configuration</h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/contacts" className="text-slate-400 hover:text-white transition-colors">Conversations</Link>
            <Link href="/settings" className="text-blue-400">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">Personal Writing Style</h2>
          <p className="text-slate-400 text-sm">
            Configure how you want the AI to sound when replying to your WhatsApp messages.
          </p>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 p-8 shadow-xl">
          <form action={updateSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Language</label>
                <select name="language" defaultValue={userStyle.language} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="id">Indonesian</option>
                  <option value="en">English</option>
                  <option value="javanese">Javanese</option>
                  <option value="sundanese">Sundanese</option>
                </select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Tone</label>
                <select name="tone" defaultValue={userStyle.tone} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="casual">Casual / Santai</option>
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly / Ramah</option>
                  <option value="sarcastic">Sarcastic / Ketus</option>
                </select>
              </div>

              {/* Formality */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Formality Level</label>
                <select name="formality" defaultValue={userStyle.formality} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="low">Low (Gue/Lu, Aku/Kamu)</option>
                  <option value="medium">Medium (Saya/Anda)</option>
                  <option value="high">High (Bapak/Ibu, Sangat Sopan)</option>
                </select>
              </div>

              {/* Message Length */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Message Length</label>
                <select name="messageLength" defaultValue={userStyle.messageLength} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="short">Short (To the point)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="long">Long (Detailed)</option>
                </select>
              </div>

              {/* Emoji Usage */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Emoji Usage</label>
                <select name="emojiUsage" defaultValue={userStyle.emojiUsage} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="none">None (Tanpa Emoji)</option>
                  <option value="low">Low (1-2 Emoji)</option>
                  <option value="high">High (Banyak Emoji 🔥💯)</option>
                </select>
              </div>
            </div>

            {/* Slang Usage Toggle */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-800">
              <div>
                <h4 className="text-white font-medium">Use Slang / Bahasa Gaul</h4>
                <p className="text-xs text-slate-500 mt-1">Mengizinkan AI menggunakan singkatan spt &quot;yg&quot;, &quot;dgn&quot;, &quot;bgt&quot;.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="slangUsage" defaultChecked={userStyle.slangUsage} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>

            {/* Custom Instructions */}
            <div className="pt-4 border-t border-slate-800">
              <label className="text-sm font-medium text-slate-300 block mb-2">Custom Instructions (Opsional)</label>
              <p className="text-xs text-slate-500 mb-3">
                Instruksi spesifik agar bot tidak terdengar kaku. Contoh: <i>&quot;Gunakan kata &apos;gue&apos; dan &apos;lu&apos;. Jangan panggil &apos;Bapak/Ibu&apos;. Jawab sesingkat mungkin tanpa basa-basi.&quot;</i>
              </p>
              <textarea 
                name="customInstructions" 
                defaultValue={userStyle.customInstructions || ""} 
                rows={4}
                placeholder="Masukkan instruksi khusus di sini..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                Save AI Configuration
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
