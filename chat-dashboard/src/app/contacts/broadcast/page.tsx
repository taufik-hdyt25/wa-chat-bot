import { prisma } from "@/lib/prisma";
import Link from "next/link";
import BroadcastForm from "./BroadcastForm";

export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-700 font-sans flex flex-col">
      <header className="border-b border-slate-200 bg-white shadow-sm border border-slate-100/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center gap-4">
          <Link href="/contacts" className="w-10 h-10 rounded-sm bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition flex-shrink-0">
            <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900">Broadcast Message</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white shadow-sm border border-slate-100 border border-slate-200 rounded-sm p-6 shadow-xl">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Buat Pesan Siaran</h2>
          <p className="text-sm text-slate-500 mb-6">
            Pesan ini akan dikirimkan ke kontak-kontak yang Anda pilih. Harap gunakan fitur ini dengan bijak agar nomor WhatsApp tidak diblokir.
          </p>
          
          <BroadcastForm contacts={contacts} />
        </div>
      </main>
    </div>
  );
}
