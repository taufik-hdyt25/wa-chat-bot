import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BroadcastForm from "./BroadcastForm";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col">
      <header className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/contacts" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Broadcast Message</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-white mb-2">Buat Pesan Siaran</h2>
          <p className="text-sm text-slate-400 mb-6">
            Pesan ini akan dikirimkan ke kontak-kontak yang Anda pilih. Harap gunakan fitur ini dengan bijak agar nomor WhatsApp tidak diblokir.
          </p>
          
          <BroadcastForm contacts={contacts} />
        </div>
      </main>
    </div>
  );
}
