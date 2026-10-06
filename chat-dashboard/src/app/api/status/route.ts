import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiUrl = process.env.BOT_API_URL || "http://wa-bot:3001";
    const res = await fetch(`${apiUrl}/status`, { cache: "no-store" });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch status" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Bot offline" }, { status: 503 });
  }
}
