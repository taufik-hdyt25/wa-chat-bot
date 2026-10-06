import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const contactId = parseInt(resolvedParams.id);
    
    if (isNaN(contactId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const latestMsg = await prisma.message.findFirst({
      where: { contactId },
      orderBy: { id: "desc" },
    });

    if (!latestMsg) {
      return NextResponse.json({ latestId: null });
    }

    return NextResponse.json({ 
      latestId: latestMsg.id,
      direction: latestMsg.direction,
      message: latestMsg.message
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
