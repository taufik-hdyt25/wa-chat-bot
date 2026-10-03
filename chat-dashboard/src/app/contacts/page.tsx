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
            <Link href="/contacts/broadcast" className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              Broadcast
            </Link>
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
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {contact.name || contact.phoneNumber}
                      {contact.name && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                          {contact.phoneNumber}
                        </span>
                      )}
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
