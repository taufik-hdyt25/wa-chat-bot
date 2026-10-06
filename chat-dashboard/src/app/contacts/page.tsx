import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddContactModal from "./AddContactModal";

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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-700 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm border border-slate-100/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-0 min-h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
            <Link href="/" className="w-10 h-10 rounded-sm bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition">
              <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Contacts & History
            </h1>
            <div className="flex items-center gap-2 ml-0 sm:ml-4 mt-2 sm:mt-0">
              <AddContactModal />
              <Link href="/contacts/broadcast" className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-sm text-xs sm:text-sm font-medium transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Broadcast
              </Link>
            </div>
          </div>
          <nav className="flex gap-4 sm:gap-6 text-sm font-medium w-full sm:w-auto justify-center sm:justify-end">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">Dashboard</Link>
            <Link href="/contacts" className="text-blue-600">Conversations</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <Link href={`/contacts/${contact.id}`} key={contact.id} className="block group">
              <div className="bg-slate-50 shadow-sm rounded-sm p-4 sm:p-6 border border-slate-200 group-hover:border-blue-500/50 group-hover:bg-white shadow-sm border border-slate-100/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
                <div className="flex items-center gap-4 max-w-full">
                  <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-lg text-slate-900 shadow-lg">
                    {(contact.name || contact.phoneNumber).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
                      <span className="truncate">{contact.name || contact.phoneNumber}</span>
                      {contact.name && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-sm bg-slate-800 text-slate-500 border border-slate-200 truncate max-w-full">
                          {contact.phoneNumber}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {contact.messages.length > 0
                        ? contact.messages[0].message
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-slate-500 mb-1">AI Mode</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      contact.aiMode === 'auto_reply' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {contact.aiMode.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-500 mb-1">Total Messages</p>
                    <p className="text-slate-900 font-bold">{contact._count.messages}</p>
                  </div>
                  <div className="w-8 h-8 rounded-sm bg-slate-800 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-600 transition-colors">
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
