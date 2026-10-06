import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AddContactModal from "./AddContactModal";
import ContactListClient from "./ContactListClient";
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
            <Link href="/" className="w-10 h-10 rounded-sm bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
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
        <ContactListClient contacts={contacts} />
      </main>
    </div>
  );
}
