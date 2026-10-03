"use client";

import { useEffect, useRef } from "react";

export default function ScrollToBottom() {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return <div ref={bottomRef} />;
}
