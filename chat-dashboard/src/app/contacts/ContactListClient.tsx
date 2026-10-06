"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

export default function ContactListClient({ contacts }: { contacts: any[] }) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) => 
    (c.name && c.name.toLowerCase().includes(search.toLowerCase())) ||
    c.phoneNumber.includes(search)
  );

  const recentContacts = filtered.filter(c => c._count.messages > 0);
  const otherContacts = filtered.filter(c => c._count.messages === 0);

  recentContacts.sort((a, b) => {
    const tA = a.messages[0]?.timestamp ? new Date(a.messages[0].timestamp).getTime() : 0;
    const tB = b.messages[0]?.timestamp ? new Date(b.messages[0].timestamp).getTime() : 0;
    return tB - tA;
  });

  const ContactCard = ({ contact }: { contact: any }) => (
    <Link href={`/contacts/${contact.id}`} className="block group">
      <div className="bg-slate-50 shadow-sm rounded-sm p-4 sm:p-6 group-hover:border-blue-500/50 group-hover:bg-white border border-slate-100/80 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-4 max-w-full">
          <div className="w-12 h-12 rounded-sm bg-gradient-to-br from-blue-500 to-indigo-500 flex-shrink-0 flex items-center justify-center font-bold text-lg text-slate-900 shadow-lg">
            {(contact.name || contact.phoneNumber).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 flex flex-wrap items-center gap-2">
              <span className="truncate">{contact.name || contact.phoneNumber}</span>
              {contact.name && (
                <span className="text-xs font-normal px-2 py-0.5 rounded-sm bg-slate-100 text-slate-500 border border-slate-200 truncate max-w-full">
                  {contact.phoneNumber}
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-1">
              {contact.messages.length > 0
                ? contact.messages[0].message
                : "Belum ada pesan"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-slate-500 mb-1">AI Mode</p>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              contact.aiMode === 'auto_reply' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {contact.aiMode.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-500 mb-1">Total Messages</p>
            <p className="text-slate-900 font-bold">{contact._count.messages}</p>
          </div>
          <div className="w-8 h-8 rounded-sm bg-blue-50 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:text-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input 
          type="text"
          placeholder="Cari nama atau nomor telepon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 bg-white"
        />
      </div>

      {recentContacts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Chat Terbaru</h2>
          <div className="grid gap-4">
            {recentContacts.map(c => <ContactCard key={c.id} contact={c} />)}
          </div>
        </div>
      )}

      {otherContacts.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">Daftar Kontak</h2>
          <div className="grid gap-4">
            {otherContacts.map(c => <ContactCard key={c.id} contact={c} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          Tidak ada kontak yang ditemukan.
        </div>
      )}
    </div>
  );
}
