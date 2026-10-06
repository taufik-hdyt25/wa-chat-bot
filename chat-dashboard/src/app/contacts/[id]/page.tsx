import { prisma } from "@/lib/prisma";
import Link from "next/link";
import EditSettingsModal from "./EditSettingsModal";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import ScrollToBottom from "./ScrollToBottom";
import ChatInput from "./ChatInput";

export const dynamic = "force-dynamic";

export default async function ContactDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const contactId = parseInt(resolvedParams.id);

  if (isNaN(contactId)) {
    notFound();
  }

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    include: {
      messages: {
        orderBy: { timestamp: "asc" },
      },
      memories: true,
    },
  });

  if (!contact) {
    notFound();
  }

  async function deleteMessage(formData: FormData) {
    "use server";
    const msgId = parseInt(formData.get("messageId") as string);
    const cId = formData.get("contactId") as string;
    await prisma.aIDraft.deleteMany({ where: { incomingMessageId: msgId } });
    await prisma.message.delete({ where: { id: msgId } });
    revalidatePath(`/contacts/${cId}`);
  }

  async function deleteMemoryAction(formData: FormData) {
    "use server";
    const memId = parseInt(formData.get("memoryId") as string);
    const cId = formData.get("contactId") as string;
    await prisma.memory.delete({ where: { id: memId } });
    revalidatePath(`/contacts/${cId}`);
  }

  async function sendMessage(formData: FormData) {
    "use server";
    const msgText = formData.get("message") as string;
    const cId = parseInt(formData.get("contactId") as string);
    const mediaData = formData.get("mediaData") as string | null;
    const mediaMimeType = formData.get("mediaMimeType") as string | null;
    const mediaFileName = formData.get("mediaFileName") as string | null;

    try {
      const payload: any = {
        message: msgText,
        contactIds: [cId]
      };

      if (mediaData) {
        payload.media = {
          data: mediaData,
          mimetype: mediaMimeType,
          fileName: mediaFileName
        };
      }

      const res = await fetch("http://localhost:3001/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        console.error("Failed to send message, status:", res.status);
        throw new Error("Failed to send message. Please ensure whatsapp bot is running.");
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      throw e;
    }
    revalidatePath(`/contacts/${cId}`);
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-700 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white shadow-sm border border-slate-100/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-0 min-h-20 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-start">
            <Link href="/contacts" className="w-10 h-10 rounded-sm bg-slate-800 flex flex-shrink-0 items-center justify-center hover:bg-slate-700 transition">
              <svg className="w-5 h-5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-500 flex flex-shrink-0 items-center justify-center font-bold text-slate-900 shadow-lg">
                {(contact.name || contact.phoneNumber).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">
                  {contact.name || contact.phoneNumber}
                </h1>
                <p className="text-xs text-slate-500 truncate">{contact.phoneNumber}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
            <span className={`px-3 py-1 rounded-sm text-xs font-semibold ${
              contact.aiMode === 'auto_reply' ? 'bg-green-100 text-green-700 border border-green-200' : 
              contact.aiMode === 'manual' ? 'bg-red-100 text-red-700 border border-red-200' :
              'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
              {contact.aiMode.replace('_', ' ').toUpperCase()}
            </span>
            <EditSettingsModal contact={contact} />
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Memories / Context Panel (Optional but good for AI context) */}
        {contact.memories.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-sm p-4 flex gap-4 items-start">
            <div className="mt-1">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-600 mb-2">AI Memories for this Contact:</h4>
              <ul className="text-sm text-blue-200/70 space-y-2 list-disc list-inside">
                {contact.memories.map(m => (
                  <li key={m.id} className="flex items-center gap-2 group">
                    <span>{m.content}</span>
                    <form action={deleteMemoryAction}>
                      <input type="hidden" name="memoryId" value={m.id} />
                      <input type="hidden" name="contactId" value={contact.id} />
                      <button type="submit" className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-red-600 transition" title="Hapus memori">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-6">
          {contact.messages.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              Belum ada pesan dengan kontak ini.
            </div>
          ) : (
            contact.messages.map((msg) => {
              const isMe = msg.direction === "outgoing";
              return (
                <div key={msg.id} className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-sm px-4 sm:px-5 py-3 shadow-sm relative ${
                    isMe 
                      ? 'bg-blue-600 text-slate-900 rounded-br-sm' 
                      : 'bg-white shadow-sm border border-slate-100 text-slate-700 border border-slate-200 rounded-bl-sm'
                  }`}>
                    <p className="text-[14px] sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                    
                    {/* Delete button (shows on hover) */}
                    <div className={`absolute top-1/2 -translate-y-1/2 ${isMe ? 'left-[-40px]' : 'right-[-40px]'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <form action={deleteMessage}>
                        <input type="hidden" name="messageId" value={msg.id} />
                        <input type="hidden" name="contactId" value={contact.id} />
                        <button type="submit" className="p-2 text-slate-500 hover:text-red-600 bg-white border-slate-200 rounded-sm" title="Hapus pesan ini">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 px-1">
                    {msg.timestamp.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })
          )}
          <ScrollToBottom />
        </div>
      </main>
      
      {/* Chat Input */}
      <ChatInput contactId={contact.id} sendMessageAction={sendMessage} />
    </div>
  );
}
