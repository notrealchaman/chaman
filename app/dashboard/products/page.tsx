"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Trash2, Pencil, Loader2, Boxes } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/utils";
import { toast } from "sonner";

const empty = { name: "", sku: "", price: "", cost: "", stock: "", category: "Apparel" };

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(empty);

  async function load() { const res = await fetch("/api/social?type=products"); const d = await res.json(); setProducts(d.products || []); setLoading(false); }
  useEffect(() => { load(); }, []);

  function openAdd() { setEditing(null); setForm(empty); setModal(true); }
  function openEdit(p: any) { setEditing(p); setForm({ name: p.name, sku: p.sku, price: String(p.price), cost: String(p.cost), stock: String(p.stock), category: p.category }); setModal(true); }

  async function save() {
    const payload = { ...form, id: editing?.id, price: Number(form.price || 0), cost: Number(form.cost || 0), stock: Number(form.stock || 0) };
    await fetch("/api/products", { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    toast.success(editing ? "Updated" : "Added");
    setModal(false); load();
  }

  async function del(p: any) { if (!confirm(`Delete ${p.name}?`)) return; await fetch("/api/products", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) }); toast.success("Deleted"); load(); }

  const stockValue = products.reduce((a, p) => a + p.cost * p.stock, 0);

  return (
    <div>
      <PageHeader eyebrow="Products" title="Products" description="Manage your catalog and inventory." actions={<Button size="sm" onClick={openAdd}><Plus className="h-4 w-4" /> Add product</Button>} />
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Card className="p-4"><div className="text-xs text-muted-foreground">Products</div><div className="text-xl font-bold">{products.length}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Units in stock</div><div className="text-xl font-bold">{products.reduce((a, p) => a + p.stock, 0)}</div></Card>
        <Card className="p-4"><div className="text-xs text-muted-foreground">Inventory value</div><div className="text-xl font-bold">{formatMoney(stockValue)}</div></Card>
      </div>
      {loading ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /> : products.length === 0 ? (
        <EmptyState icon={<Package className="h-6 w-6" />} title="No products" description="Add products to start selling on social channels." />
      ) : (
        <Card className="divide-y divide-border">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><Boxes className="h-5 w-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.sku} · {p.category}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatMoney(p.price)}</div>
                <div className="text-xs"><Badge variant={p.stock < 10 ? "destructive" : "secondary"}>{p.stock} in stock</Badge></div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon-sm" onClick={() => del(p)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          ))}
        </Card>
      )}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle><DialogDescription>Manage your catalog.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="mb-1 block">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3"><div><Label className="mb-1 block">SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div><div><Label className="mb-1 block">Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="mb-1 block">Price ($)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
              <div><Label className="mb-1 block">Cost ($)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
              <div><Label className="mb-1 block">Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            </div>
            <Button onClick={save} className="w-full">Save product</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
