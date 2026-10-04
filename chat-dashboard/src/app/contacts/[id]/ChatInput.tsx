"use client";

import { useState } from "react";

export default function ChatInput({ contactId, sendMessageAction }: {
  contactId: number;
  sendMessageAction: (formData: FormData) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append("message", message);
    formData.append("contactId", contactId.toString());

    await sendMessageAction(formData);
    setMessage("");
    setIsSending(false);
  };

  return (
    <div className="bg-[#1e293b] border-t border-slate-800 p-4 sticky bottom-0 w-full z-10">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex gap-3 relative">
        <input 
          type="text" 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-full px-5 py-3 focus:outline-none focus:border-blue-500 transition-colors"
          disabled={isSending}
        />
        <button 
          type="submit"
          disabled={!message.trim() || isSending}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          {isSending ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5 translate-x-[-2px]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
}
