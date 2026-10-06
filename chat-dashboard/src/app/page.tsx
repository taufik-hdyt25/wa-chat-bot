import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import DraftCard from "./DraftCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  async function deleteDraft(formData: FormData) {
    "use server";
    const draftId = parseInt(formData.get("draftId") as string);
    await prisma.aIDraft.delete({ where: { id: draftId } });
    revalidatePath("/");
  }

  async function sendDraftReply(formData: FormData) {
    "use server";
    const draftId = parseInt(formData.get("draftId") as string);
    const draftText = formData.get("draftText") as string;
    const contactId = parseInt(formData.get("contactId") as string);

    try {
      const res = await fetch("http://localhost:3001/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: draftText,
          contactIds: [contactId]
        })
      });
      if (res.ok) {
        await prisma.aIDraft.update({
          where: { id: draftId },
          data: { status: "sent" }
        });
      }
    } catch (e) {
      console.error("Failed to send draft reply:", e);
    }
    revalidatePath("/");
  }

  // Fetch real data from shared SQLite database
  const contactsCount = await prisma.contact.count();
  const messagesCount = await prisma.message.count();
  const pendingDraftsCount = await prisma.aIDraft.count({
    where: { status: "pending" },
  });

  const recentDrafts = await prisma.aIDraft.findMany({
    where: { status: "pending" },
    include: {
      contact: true,
      incomingMessage: true,
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-700 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm border border-slate-100/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-0 min-h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <div className="w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-600 text-center sm:text-left">
              Personal AI Assistant
            </h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium w-full sm:w-auto">
            <Link href="/" className="text-blue-600">Dashboard</Link>
            <Link href="/contacts" className="text-slate-500 hover:text-slate-900 transition-colors">Conversations</Link>
            <Link href="/settings" className="text-slate-500 hover:text-slate-900 transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-sm p-8 mb-10 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
            <p className="text-blue-50 text-sm">Here&apos;s what&apos;s happening with your WhatsApp automation today.</p>
          </div>
          <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
            <div className="w-24 h-24 bg-white/20 rounded-sm flex items-center justify-center backdrop-blur-sm transform rotate-12">
               <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
               </svg>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-50 shadow-sm rounded-sm p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-500 mb-1">Messages Processed</p>
            <h3 className="text-4xl font-bold text-slate-900">{messagesCount}</h3>
          </div>
          <div className="bg-slate-50 shadow-sm rounded-sm p-6 border border-slate-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-500 mb-1">Active Contacts</p>
            <h3 className="text-4xl font-bold text-slate-900">{contactsCount}</h3>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-sm p-6 relative overflow-hidden shadow-xl shadow-blue-900/20">
            <p className="text-sm font-medium text-blue-100 mb-1">Pending AI Drafts</p>
            <h3 className="text-4xl font-bold text-slate-900">{pendingDraftsCount}</h3>
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Drafts Section */}
        <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Needs Your Approval
        </h3>
        
        {recentDrafts.length === 0 ? (
          <div className="bg-slate-50 shadow-sm rounded-sm p-12 border border-slate-200 text-center">
            <p className="text-slate-500">All caught up! No pending AI drafts.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {recentDrafts.map((draft) => (
              <DraftCard 
                key={draft.id} 
                draft={draft} 
                deleteAction={deleteDraft} 
                sendAction={sendDraftReply} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
