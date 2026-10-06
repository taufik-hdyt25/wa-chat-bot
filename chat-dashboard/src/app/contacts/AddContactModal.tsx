"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { addContact } from "./actions";
import { useRouter } from "next/navigation";

export default function AddContactModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const newContact = await addContact(formData);
      toast.success("Contact added successfully!");
      setIsOpen(false);
      router.push(`/contacts/${newContact.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add contact");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger 
        render={
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2" />
        }
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Contact
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1e293b] border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Contact</DialogTitle>
          <DialogDescription className="text-slate-400">
            Manually add a contact to start messaging. Format number: 0812... or 62812...
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-300">
              Name (Optional)
            </label>
            <Input 
              id="name" 
              name="name" 
              placeholder="e.g. John Doe" 
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-slate-300">
              Phone Number <span className="text-red-400">*</span>
            </label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              placeholder="08123456789" 
              required
              className="bg-slate-900 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500">
              The number will automatically be converted to country code format (e.g. 62).
            </p>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
