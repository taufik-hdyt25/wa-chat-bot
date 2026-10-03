import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#1e293b]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Personal AI Assistant
            </h1>
          </div>
          <nav className="flex gap-6 text-sm font-medium">
            <Link href="/" className="text-blue-400">Dashboard</Link>
            <Link href="/contacts" className="text-slate-400 hover:text-white transition-colors">Conversations</Link>
            <Link href="/settings" className="text-slate-400 hover:text-white transition-colors">Settings</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-slate-400">Here&apos;s what your AI has been doing while you were away.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Messages Processed</p>
            <h3 className="text-4xl font-bold text-white">{messagesCount}</h3>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-sm font-medium text-slate-400 mb-1">Active Contacts</p>
            <h3 className="text-4xl font-bold text-white">{contactsCount}</h3>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-blue-900/20">
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
          <div className="bg-[#1e293b] rounded-2xl p-12 border border-slate-800 text-center">
            <p className="text-slate-400">All caught up! No pending AI drafts.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {recentDrafts.map((draft) => (
              <div key={draft.id} className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400">
                      {(draft.contact.name || draft.contact.phoneNumber).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{draft.contact.name || draft.contact.phoneNumber}</h4>
                      <p className="text-xs text-slate-500">Just now</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20">
                    Draft Pending
                  </span>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-800/50">
                  <p className="text-sm text-slate-400 mb-1">Incoming Message:</p>
                  <p className="text-white">&quot;{draft.incomingMessage.message}&quot;</p>
                </div>

                <div className="bg-blue-900/10 rounded-xl p-4 mb-6 border border-blue-500/20 relative">
                  <div className="absolute top-0 right-0 p-3">
                    <svg className="w-5 h-5 text-blue-500/40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <p className="text-sm text-blue-400 font-medium mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    AI Suggested Reply:
                  </p>
                  <p className="text-white text-lg">{draft.draft}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                    Send Reply
                  </button>
                  <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all border border-slate-700 active:scale-[0.98]">
                    Edit Draft
                  </button>
                  <button className="flex-none p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
