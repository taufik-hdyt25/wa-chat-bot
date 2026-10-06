"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

export default function ConnectionStatus() {
  const [status, setStatus] = useState<{ connected: boolean; qr: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
          setError(null);
          // Auto hide QR if connected
          if (data.connected) {
            setShowQR(false);
          }
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
    <div className="bg-slate-50 shadow-sm rounded-sm border border-slate-200 p-8 shadow-xl mb-10">
      <h2 className="text-xl font-bold text-slate-900 mb-4">WhatsApp Connection</h2>
      
      {error ? (
        <div className="text-red-600 bg-red-400/10 p-4 rounded-sm">
          <p className="font-medium">Bot backend is offline</p>
          <p className="text-sm mt-1">Please start the bot backend by running `npm run dev` in the whatsapp-bot folder.</p>
        </div>
      ) : status ? (
        <div className="flex flex-col items-center sm:items-start">
          {status.connected ? (
            <div className="flex items-center justify-between bg-green-100 text-green-700 px-6 py-5 rounded-sm border border-green-200 w-full">
              <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-2 rounded-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-lg">Connected to WhatsApp</p>
                  <p className="text-sm opacity-80">Your bot is active and ready to process messages.</p>
                </div>
              </div>
            </div>
          ) : showQR ? (
            status.qr ? (
              <div className="flex flex-col items-center w-full bg-slate-50 rounded-sm p-8 border border-slate-200">
                <p className="text-slate-600 mb-6 text-center font-medium">Scan this QR code with your WhatsApp to connect your bot.</p>
                <div className="bg-white p-4 rounded-sm shadow-2xl">
                  <QRCode value={status.qr} size={256} />
                </div>
                <div className="flex items-center gap-2 mt-6 text-slate-500">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-sm bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-sm h-3 w-3 bg-blue-500"></span>
                  </span>
                  <p className="text-sm">Waiting for scan...</p>
                </div>
                <button 
                  onClick={() => setShowQR(false)} 
                  className="mt-4 text-sm text-slate-500 hover:text-slate-600 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-slate-500 w-full bg-slate-50 rounded-sm border border-slate-200">
                <svg className="w-6 h-6 animate-spin mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p>Generating QR Code...</p>
                <button onClick={() => setShowQR(false)} className="mt-4 text-sm text-slate-500 hover:text-slate-600">Cancel</button>
              </div>
            )
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-100 p-6 rounded-sm border border-slate-200 w-full gap-4">
              <div className="text-center sm:text-left">
                <p className="font-bold text-lg text-slate-900">Not Connected</p>
                <p className="text-sm text-slate-500 mt-1">Click the button to scan QR code and connect to WhatsApp.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={async () => {
                    const toastId = toast.loading("Restarting connection...");
                    try {
                      await fetch("/api/restart", { method: "POST" });
                      toast.success("Bot restarted!", { id: toastId });
                      setShowQR(true);
                    } catch (e) {
                      toast.error("Failed to restart bot", { id: toastId });
                    }
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2.5 px-4 rounded-sm transition-colors whitespace-nowrap"
                >
                  Restart
                </button>
                <button 
                  onClick={() => setShowQR(true)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-sm transition-colors shadow-lg shadow-blue-600/20 whitespace-nowrap"
                >
                  Connect to WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-32 bg-slate-100 rounded-sm w-full"></div>
        </div>
      )}
    </div>
  );
}
