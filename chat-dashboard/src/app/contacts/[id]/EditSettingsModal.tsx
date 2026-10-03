"use client";

import { useState } from "react";
import { updateContactSettings, deleteContact } from "./actions";
import { useRouter } from "next/navigation";

export default function EditSettingsModal({ contact }: { contact: { id: number; aiMode: string; relationship: string | null } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    await updateContactSettings(contact.id, formData);
    setIsPending(false);
    setIsOpen(false);
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition border border-slate-700"
      >
        Edit Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Edit Contact Settings</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">AI Response Mode</label>
                <select name="aiMode" defaultValue={contact.aiMode} className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500">
                  <option value="auto_reply">Auto Reply (Bot membalas langsung)</option>
                  <option value="suggest_reply">Suggest Reply (Buat draf saja)</option>
                  <option value="manual">Manual (Matikan AI untuk kontak ini)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Relationship / Info</label>
                <input 
                  type="text" 
                  name="relationship" 
                  defaultValue={contact.relationship || ""} 
                  placeholder="e.g. Bos, Teman, Keluarga"
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Add New AI Memory (Optional)</label>
                <textarea 
                  name="newMemory" 
                  rows={2}
                  placeholder="e.g. Panggil orang ini dengan sebutan 'Bapak' dan tolak jika pinjam uang."
                  className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={async () => {
                    if (confirm("Yakin ingin menghapus kontak ini beserta seluruh history chatnya?")) {
                      setIsPending(true);
                      await deleteContact(contact.id);
                      router.push("/contacts");
                    }
                  }}
                  disabled={isPending}
                  className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Contact
                </button>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
