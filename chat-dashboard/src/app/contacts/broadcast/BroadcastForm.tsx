"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function BroadcastForm({ contacts }: { contacts: any[] }) {
  const [message, setMessage] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(c => c.id));
    }
  };

  const handleSelectContact = (id: number) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(cId => cId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !selectedFile) {
      toast.error("Pesan atau lampiran tidak boleh kosong!");
      return;
    }
    if (selectedContacts.length === 0) {
      toast.error("Pilih minimal 1 kontak!");
      return;
    }

    if (!confirm(`Yakin ingin mengirim pesan ke ${selectedContacts.length} kontak?`)) return;

    setIsSending(true);
    const loadingToast = toast.loading("Mengirim broadcast...");
    
    try {
      const { sendBroadcast } = await import("./actions");
      
      let media: { data: string; mimetype: string; fileName: string } | undefined = undefined;
      if (selectedFile) {
        const buffer = await selectedFile.arrayBuffer();
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        media = {
          data: window.btoa(binary),
          mimetype: selectedFile.type,
          fileName: selectedFile.name
        };
      }

      const result = await sendBroadcast(message, selectedContacts, media);

      if (result.success) {
        toast.success(`Berhasil mengirim broadcast ke ${result.data.sentCount} kontak!`, { id: loadingToast });
        router.push("/contacts");
      } else {
        toast.error("Gagal: " + result.error, { id: loadingToast });
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat mengirim broadcast.", { id: loadingToast });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Pesan Broadcast</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Halo, promo khusus hari ini..."
          className="bg-white border-slate-200 border-slate-200 text-slate-900 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Lampiran File (Opsional)</label>
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-slate-200 text-slate-300 hover:text-slate-900 hover:bg-slate-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Pilih File
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          {selectedFile && (
            <div className="flex items-center gap-2 bg-white border-slate-200 px-3 py-1.5 rounded-sm border border-slate-200">
              <span className="text-sm text-slate-300 truncate max-w-[200px]">{selectedFile.name}</span>
              <button type="button" onClick={() => setSelectedFile(null)} className="text-slate-500 hover:text-red-600 ml-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-slate-300">Pilih Kontak ({selectedContacts.length} dipilih)</label>
          <button 
            type="button" 
            onClick={handleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-300"
          >
            {selectedContacts.length === contacts.length ? "Batal Pilih Semua" : "Pilih Semua"}
          </button>
        </div>
        
        <div className="bg-white border-slate-200 border border-slate-200 rounded-sm max-h-64 overflow-y-auto p-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-slate-500 p-4 text-center">Belum ada kontak tersimpan.</p>
          ) : (
            contacts.map(contact => (
              <label key={contact.id} className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-sm cursor-pointer transition">
                <input 
                  type="checkbox" 
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => handleSelectContact(contact.id)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-slate-900"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-700">{contact.name || contact.phoneNumber}</p>
                  <p className="text-xs text-slate-500">{contact.phoneNumber}</p>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="ghost"
          onClick={() => router.push("/contacts")}
          className="text-slate-300 hover:text-slate-900 hover:bg-slate-800"
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSending || selectedContacts.length === 0 || (!message.trim() && !selectedFile)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSending ? "Mengirim..." : "Kirim Broadcast"}
        </Button>
      </div>
    </form>
  );
}
