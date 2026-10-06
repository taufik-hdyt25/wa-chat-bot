"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SettingsForm({ userStyle, updateAction }: { userStyle: any, updateAction: (formData: FormData) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateAction(formData);
        toast.success("AI Configuration saved successfully!");
      } catch (err) {
        toast.error("Failed to save configuration.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-slate-600">Language</Label>
          <Select name="language" defaultValue={userStyle.language}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-sm focus:ring-blue-500">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50 border border-slate-200 text-slate-900 rounded-sm">
              <SelectItem value="id">Indonesian</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="javanese">Javanese</SelectItem>
              <SelectItem value="sundanese">Sundanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-3">
          <Label className="text-slate-600">Tone</Label>
          <Select name="tone" defaultValue={userStyle.tone}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-sm focus:ring-blue-500">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50 border border-slate-200 text-slate-900 rounded-sm">
              <SelectItem value="casual">Casual / Santai</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="friendly">Friendly / Ramah</SelectItem>
              <SelectItem value="sarcastic">Sarcastic / Ketus</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-600">Formality Level</Label>
          <Select name="formality" defaultValue={userStyle.formality}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-sm focus:ring-blue-500">
              <SelectValue placeholder="Select formality" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50 border border-slate-200 text-slate-900 rounded-sm">
              <SelectItem value="low">Low (Gue/Lu, Aku/Kamu)</SelectItem>
              <SelectItem value="medium">Medium (Saya/Anda)</SelectItem>
              <SelectItem value="high">High (Bapak/Ibu, Sangat Sopan)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-600">Message Length</Label>
          <Select name="messageLength" defaultValue={userStyle.messageLength}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-sm focus:ring-blue-500">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50 border border-slate-200 text-slate-900 rounded-sm">
              <SelectItem value="short">Short (To the point)</SelectItem>
              <SelectItem value="medium">Medium (Balanced)</SelectItem>
              <SelectItem value="long">Long (Detailed)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-slate-600">Emoji Usage</Label>
          <Select name="emojiUsage" defaultValue={userStyle.emojiUsage}>
            <SelectTrigger className="w-full bg-slate-50 border-slate-200 text-slate-900 h-12 rounded-sm focus:ring-blue-500">
              <SelectValue placeholder="Select emoji usage" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50 border border-slate-200 text-slate-900 rounded-sm">
              <SelectItem value="none">None (Tanpa Emoji)</SelectItem>
              <SelectItem value="low">Low (1-2 Emoji)</SelectItem>
              <SelectItem value="high">High (Banyak Emoji 🔥💯)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <div>
          <h4 className="text-slate-900 font-medium text-sm">Use Slang / Bahasa Gaul</h4>
          <p className="text-xs text-slate-500 mt-1">Mengizinkan AI menggunakan singkatan spt "yg", "dgn", "bgt".</p>
        </div>
        <Switch name="slangUsage" defaultChecked={userStyle.slangUsage} className="data-[state=checked]:bg-blue-600" />
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <div>
          <h4 className="text-slate-900 font-medium text-sm">Respond to Group Chats</h4>
          <p className="text-xs text-slate-500 mt-1">Jika aktif, bot juga akan merespons pesan di dalam grup WA.</p>
        </div>
        <Switch name="respondToGroups" defaultChecked={userStyle.respondToGroups} className="data-[state=checked]:bg-blue-600" />
      </div>

      {/* Persona Section */}
      <div className="pt-4 border-t border-slate-200">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🎭</span>
            <Label className="text-slate-800 font-semibold text-sm">Persona AI (Karakter Kamu)</Label>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Deskripsikan dirimu sedetail mungkin — cara bicara, kata-kata khas, kebiasaan, dan bagaimana kamu merespons situasi tertentu.
            Semakin detail, semakin mirip AI dengan kamu.
          </p>
          <div className="mt-2 bg-blue-50 border border-blue-100 rounded-sm p-3">
            <p className="text-xs text-blue-700 font-medium mb-1">Contoh isian yang bagus:</p>
            <p className="text-xs text-blue-600 italic leading-relaxed">
              &quot;Saya Taufik, cowok 25 tahun. Saya sering pakai kata &apos;gas&apos;, &apos;bro&apos;, &apos;sip&apos;, &apos;wkwk&apos;. 
              Kalau diajak janjian saya bilang &apos;ntar konfirmasi dulu ya&apos;. 
              Kalau ada yang nanya kerjaan, jawab &apos;lagi sibuk, nanti coba tanya lagi&apos;. 
              Saya tidak suka basa-basi panjang dan lebih suka jawaban singkat tapi jelas.&quot;
            </p>
          </div>
        </div>
        <Textarea 
          name="persona" 
          defaultValue={userStyle.persona || ""} 
          rows={6}
          placeholder="Deskripsikan karaktermu di sini: cara bicara, kata-kata khas, kebiasaanmu, bagaimana cara kamu merespons situasi tertentu..."
          className="resize-none text-sm"
        />
      </div>

      {/* Custom Instructions */}
      <div className="pt-4 border-t border-slate-200">
        <Label className="text-slate-600 mb-2 block">Custom Instructions (Opsional)</Label>
        <p className="text-xs text-slate-500 mb-4">
          Instruksi spesifik agar bot tidak terdengar kaku. Contoh: <i className="text-slate-500">&quot;Gunakan kata &apos;gue&apos; dan &apos;lu&apos;. Jangan panggil &apos;Bapak/Ibu&apos;. Jawab sesingkat mungkin tanpa basa-basi.&quot;</i>
        </p>
        <Textarea 
          name="customInstructions" 
          defaultValue={userStyle.customInstructions || ""} 
          rows={4}
          placeholder="Masukkan instruksi khusus di sini..."
          className="resize-none"
        />
      </div>

      <div className="pt-6">
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-bold rounded-sm transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          {isPending ? "Saving configuration..." : "Save AI Configuration"}
        </Button>
      </div>
    </form>
  );
}
