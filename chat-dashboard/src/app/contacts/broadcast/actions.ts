"use server";

export async function sendBroadcast(
  message: string, 
  contactIds: number[],
  media?: { data: string, mimetype: string, fileName: string }
) {
  try {
    // Memanggil API wa-bot dari dalam container network
    // Nama service di docker-compose adalah "wa-bot", port 3001
    // Fallback ke localhost untuk development di luar docker
    const apiUrl = process.env.BOT_API_URL || "http://wa-bot:3001";
    
    const payload: any = { message, contactIds };
    if (media) payload.media = media;
    
    const res = await fetch(`${apiUrl}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Gagal menghubungi bot API");
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Broadcast Server Action Error:", error);
    return { success: false, error: error.message || "Internal Server Error" };
  }
}
