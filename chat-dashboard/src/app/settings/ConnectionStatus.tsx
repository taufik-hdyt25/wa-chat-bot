"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<{ connected: boolean; qr: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://localhost:3001/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          setError(null);
        } else {
          setError("Failed to fetch status");
        }
      } catch (err) {
        setError("Bot offline");
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#1e293b] rounded-2xl border border-slate-800 p-8 shadow-xl mb-10">
      <h2 className="text-xl font-bold text-white mb-4">WhatsApp Connection</h2>
      
      {error ? (
        <div className="text-red-400 bg-red-400/10 p-4 rounded-lg">
          <p className="font-medium">Bot backend is offline</p>
          <p className="text-sm mt-1">Please start the bot backend by running `npm run dev` in the whatsapp-bot folder.</p>
        </div>
      ) : status ? (
        <div className="flex flex-col items-center sm:items-start">
          {status.connected ? (
            <div className="flex items-center gap-4 bg-green-500/10 text-green-400 px-6 py-5 rounded-xl border border-green-500/20 w-full">
              <div className="bg-green-500/20 p-2 rounded-full">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-lg">Connected to WhatsApp</p>
                <p className="text-sm opacity-80">Your bot is active and ready to process messages.</p>
              </div>
            </div>
          ) : status.qr ? (
            <div className="flex flex-col items-center w-full bg-[#0f172a] rounded-xl p-8 border border-slate-800">
              <p className="text-slate-300 mb-6 text-center font-medium">Scan this QR code with your WhatsApp to connect your bot.</p>
              <div className="bg-white p-4 rounded-xl shadow-2xl">
                <QRCode value={status.qr} size={256} />
              </div>
              <div className="flex items-center gap-2 mt-6 text-slate-400">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <p className="text-sm">Waiting for scan...</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-slate-400 w-full bg-[#0f172a] rounded-xl border border-slate-800">
              <svg className="w-6 h-6 animate-spin mr-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting connection...
            </div>
          )}
        </div>
      ) : (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-32 bg-slate-800 rounded-xl w-full"></div>
        </div>
      )}
    </div>
  );
}
