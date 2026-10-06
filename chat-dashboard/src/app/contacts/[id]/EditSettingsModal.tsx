"use client";

import { useState } from "react";
import { updateContactSettings, deleteContact } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function EditSettingsModal({
  contact,
}: {
  contact: { id: number; aiMode: string; relationship: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateContactSettings(contact.id, formData);
      toast.success("Contact settings updated!");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to update settings.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white h-8"
          />
        }
      >
        Edit Settings
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px] bg-slate-900/50 backdrop-blur-md border-slate-700 text-white rounded-sm">
        <DialogHeader>
          <DialogTitle>Edit Contact Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">AI Response Mode</label>
            <Select name="aiMode" defaultValue={contact.aiMode}>
              <SelectTrigger className="bg-slate-950/50 backdrop-blur-sm border-slate-700 text-white focus:ring-blue-500">
                <SelectValue placeholder="Pilih Mode" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900/50 backdrop-blur-md border-slate-700 text-white">
                <SelectItem value="auto_reply">Auto Reply (Bot membalas langsung)</SelectItem>
                <SelectItem value="suggest_reply">Suggest Reply (Buat draf saja)</SelectItem>
                <SelectItem value="manual">Manual (Matikan AI untuk kontak ini)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Relationship / Info</label>
            <Input
              name="relationship"
              defaultValue={contact.relationship || ""}
              placeholder="e.g. Bos, Teman, Keluarga"
              className="bg-slate-950/50 backdrop-blur-sm border-slate-700 text-white focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Add New AI Memory (Optional)</label>
            <Textarea
              name="newMemory"
              rows={2}
              placeholder="e.g. Panggil orang ini dengan sebutan 'Bapak'..."
              className="bg-slate-950/50 backdrop-blur-sm border-slate-700 text-white resize-none focus-visible:ring-blue-500"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-0 mt-6 pt-4 border-t border-slate-800 sm:justify-between items-center w-full">
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (confirm("Yakin ingin menghapus kontak ini beserta seluruh history chatnya?")) {
                  setIsPending(true);
                  try {
                    await deleteContact(contact.id);
                    toast.success("Contact deleted successfully");
                    router.push("/contacts");
                  } catch (error) {
                    console.error(error);
                    toast.error("Gagal menghapus kontak.");
                    setIsPending(false);
                  }
                }
              }}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Delete Contact
            </Button>

            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
