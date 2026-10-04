"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export default function DraftCard({ draft, deleteAction, sendAction }: { 
  draft: any, 
  deleteAction: (formData: FormData) => void,
  sendAction: (formData: FormData) => void
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(draft.draft);
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async () => {
    setIsSending(true);
    const formData = new FormData();
    formData.append("draftId", draft.id.toString());
    formData.append("draftText", draftText);
    formData.append("contactId", draft.contact.id.toString());
    
    await sendAction(formData);
    setIsSending(false);
  };

  return (
    <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
        <div className="flex items-center gap-3 max-w-full">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-blue-400">
            {(draft.contact.name || draft.contact.phoneNumber).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium text-white flex flex-wrap items-center gap-2">
              <span className="truncate">{draft.contact.name || draft.contact.phoneNumber}</span>
              {draft.contact.name && (
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800/50 text-slate-400 border border-slate-700 truncate max-w-full">
                  {draft.contact.phoneNumber}
                </span>
              )}
            </h4>
            <p className="text-xs text-slate-500">Just now</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/20 self-start sm:self-auto flex-shrink-0">
          Draft Pending
        </span>
      </div>
      
      <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-800/50">
        <p className="text-sm text-slate-400 mb-1">Incoming Message:</p>
        <p className="text-white">"{draft.incomingMessage.message}"</p>
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
        {isEditing ? (
          <Textarea 
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            className="w-full bg-[#0f172a] text-white border-slate-700 mt-2 min-h-[100px]"
          />
        ) : (
          <p className="text-white text-lg">{draftText}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {isEditing ? (
          <>
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70">
              {isSending ? "Sending..." : "Send Edited Reply"}
            </button>
            <button 
              onClick={() => {
                setIsEditing(false);
                setDraftText(draft.draft); // cancel edit
              }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all border border-slate-700 active:scale-[0.98]">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-70">
              {isSending ? "Sending..." : "Send Reply"}
            </button>
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-all border border-slate-700 active:scale-[0.98]">
              Edit Draft
            </button>
            <form action={deleteAction} className="flex sm:block">
              <input type="hidden" name="draftId" value={draft.id} />
              <button type="submit" className="flex-1 sm:flex-none p-3 flex justify-center items-center text-slate-400 hover:text-red-400 hover:bg-red-400/10 bg-slate-800/50 sm:bg-transparent rounded-xl transition-colors cursor-pointer border border-slate-800 sm:border-none" title="Hapus Draft">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
