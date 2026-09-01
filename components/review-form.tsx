"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ReviewForm({ toolId, toolName }: { toolId: string; toolName: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", useCase: "CRM", companySize: "1-10" });

  async function submit() {
    if (!rating) return toast.error("Please select a rating");
    if (!form.title.trim() || !form.content.trim()) return toast.error("Please add a title and review");
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId, rating, title: form.title, content: form.content,
          pros: pros.split(",").map((s) => s.trim()).filter(Boolean),
          cons: cons.split(",").map((s) => s.trim()).filter(Boolean),
          useCase: form.useCase, companySize: form.companySize,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success("Review submitted for moderation");
        setOpen(false);
        setRating(0); setPros(""); setCons(""); setForm({ title: "", content: "", useCase: "CRM", companySize: "1-10" });
        router.refresh();
      } else {
        toast.error(data.message || data.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{session?.user ? "Write a review" : "Sign in to review"}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Review {toolName}</DialogTitle>
          <DialogDescription>Share your experience. Reviews are held for moderation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1 block">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
                  <Star className={cn("h-6 w-6", i <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                </button>
              ))}
            </div>
          </div>
          <div><Label className="mb-1 block">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summarize your experience" /></div>
          <div><Label className="mb-1 block">Review</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="What did you like or dislike?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1 block">Pros (comma separated)</Label><Input value={pros} onChange={(e) => setPros(e.target.value)} placeholder="Easy, Fast" /></div>
            <div><Label className="mb-1 block">Cons (comma separated)</Label><Input value={cons} onChange={(e) => setCons(e.target.value)} placeholder="Pricing" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1 block">Use case</Label><Input value={form.useCase} onChange={(e) => setForm({ ...form, useCase: e.target.value })} /></div>
            <div><Label className="mb-1 block">Company size</Label><Input value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} /></div>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
