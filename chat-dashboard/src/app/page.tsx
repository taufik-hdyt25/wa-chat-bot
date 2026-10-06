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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-0 min-h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-tr from-blue-500 to-indigo-500 flex flex-shrink-0 items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 text-center sm:text-left">
              Personal AI Assistant
            </h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm font-medium w-full sm:w-auto">
            <Link href="/" className="text-blue-400">Dashboard</Link>
            <Link href="/contacts" className="text-slate-400 hover:text-white transition-colors">Conversations</Link>
            <Link href="/settings" className="text-slate-400 hover:text-white transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-slate-400">Here&apos;s what your AI has been doing while you were away.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 backdrop-blur-md rounded-sm p-6 border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Messages Processed</p>
            <h3 className="text-4xl font-bold text-white">{messagesCount}</h3>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md rounded-sm p-6 border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Active Contacts</p>
            <h3 className="text-4xl font-bold text-white">{contactsCount}</h3>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-sm p-6 relative overflow-hidden shadow-xl shadow-blue-900/20">
            <p className="text-sm font-medium text-blue-100 mb-1">Pending AI Drafts</p>
            <h3 className="text-4xl font-bold text-white">{pendingDraftsCount}</h3>
            <div className="absolute -right-6 -bottom-6 opacity-20">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Drafts Section */}
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Needs Your Approval
        </h3>
        
        {recentDrafts.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-md rounded-sm p-12 border border-slate-800 text-center">
            <p className="text-slate-400">All caught up! No pending AI drafts.</p>
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
