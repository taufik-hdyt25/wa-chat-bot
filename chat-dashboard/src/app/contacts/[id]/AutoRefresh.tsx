"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AutoRefresh({ contactId, latestMessageId }: { contactId: number, latestMessageId: number | null }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/contacts/${contactId}/latest-message`);
        if (res.ok) {
          const data = await res.json();
          if (data.latestId && latestMessageId && data.latestId > latestMessageId) {
            // New message arrived!
            if (data.direction === "incoming") {
              toast.info(`Pesan baru diterima!`);
              // Optional: HTML5 Notification
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Pesan WhatsApp Baru", {
                  body: data.message,
                });
              }
            }
            router.refresh();
          }
        }
      } catch (err) {
        // silently ignore fetch errors
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [contactId, latestMessageId, router]);

  useEffect(() => {
    // Request notification permission on mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return null;
}
