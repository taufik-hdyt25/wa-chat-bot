"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatInput({ contactId, sendMessageAction }: {
  contactId: number;
  sendMessageAction: (payload: {
    message: string;
    contactId: number;
    mediaData?: string;
    mediaMimeType?: string;
    mediaFileName?: string;
  }) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    
    let mediaData, mediaMimeType, mediaFileName;

    if (selectedFile) {
      const buffer = await selectedFile.arrayBuffer();
      let binary = '';
      const bytes = new Uint8Array(buffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      mediaData = window.btoa(binary);
      mediaMimeType = selectedFile.type;
      mediaFileName = selectedFile.name;
    }

    try {
      await sendMessageAction({
        message,
        contactId,
        mediaData,
        mediaMimeType,
        mediaFileName
      });
      setMessage("");
      setSelectedFile(null);
      toast.success("Message sent successfully!");
    } catch (err) {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-slate-50 shadow-sm border border-slate-100 border-t border-slate-200 p-4 sticky bottom-0 w-full z-10">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto flex flex-col gap-2 relative">
        {selectedFile && (
          <div className="flex items-center gap-2 bg-slate-100 w-fit px-3 py-1.5 rounded-sm border border-slate-200">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            <span className="text-xs text-slate-600 truncate max-w-[150px]">{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-red-600 ml-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex gap-3 relative items-center">
          <Button 
            type="button" 
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <Input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-white border-slate-200 text-slate-900 rounded-sm px-5 h-12 focus-visible:ring-blue-500 transition-colors"
            disabled={isSending}
          />
          <Button 
            type="submit"
            size="icon"
            disabled={(!message.trim() && !selectedFile) || isSending}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-sm w-12 h-12 flex-shrink-0 transition-colors shadow-lg shadow-blue-500/20"
          >
            {isSending ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 translate-x-[-2px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
