import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: {
      _count: {
        select: { messages: true },
      },
      messages: {
        orderBy: { timestamp: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-white">
              Contacts & History
            </h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">Dashboard</Link>
            <Link href="/contacts" className="text-blue-400">Conversations</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Link href={`/contacts/${contact.id}`} key={contact.id} className="block group">
              <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-[#1e293b]/80 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                    {(contact.name || contact.phoneNumber).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {contact.name || contact.phoneNumber}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {contact.messages.length > 0
                        ? contact.messages[0].message.substring(0, 50) + (contact.messages[0].message.length > 50 ? "..." : "")
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-slate-500 mb-1">AI Mode</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      contact.aiMode === 'auto_reply' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {contact.aiMode.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Messages</p>
                    <p className="text-white font-bold">{contact._count.messages}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              Belum ada kontak yang tersimpan di database.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
