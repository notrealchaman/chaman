"use client";

// A VS Code–inspired visual workflow editor: activity bar, explorer/palette
// sidebar, editor tabs, a draggable node canvas with SVG bezier connections,
// a status bar and a Cmd/Ctrl+Shift+P command palette.

import {
  useEffect, useRef, useState, useCallback,
} from "react";
import {
  Files, Search, GitBranch, Play, Puzzle, Settings as SettingsIcon,
  FilePlus2, Plus, Trash2, Mail, ListChecks, Tag, Workflow, Bell,
  Clock, Split, X, MoreHorizontal, Save, Loader2,
  RefreshCw, FileText, MessageSquare, Headphones, ShoppingBag, Target,
  PanelLeft, Command, ZoomIn, ZoomOut, Maximize2, Box,
  Webhook, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Automation } from "@/lib/types";

// ---------------------------------------------------------------------------
// Block palette
// ---------------------------------------------------------------------------
interface BlockDef { kind: "TRIGGER" | "ACTION"; type: string; icon: LucideIcon; color: string; bg: string; desc: string; group: string; }

const BLOCKS: BlockDef[] = [
  { kind: "TRIGGER", type: "New Lead", icon: Target, color: "#047857", bg: "#ecfdf5", desc: "Fires when a new lead is created", group: "Triggers" },
  { kind: "TRIGGER", type: "Order Paid", icon: ShoppingBag, color: "#047857", bg: "#ecfdf5", desc: "Fires when an order is paid", group: "Triggers" },
  { kind: "TRIGGER", type: "New Review", icon: MessageSquare, color: "#047857", bg: "#ecfdf5", desc: "Fires when a review is submitted", group: "Triggers" },
  { kind: "TRIGGER", type: "Ticket Created", icon: Headphones, color: "#047857", bg: "#ecfdf5", desc: "Fires when a support ticket opens", group: "Triggers" },
  { kind: "TRIGGER", type: "Subscription Renewal", icon: RefreshCw, color: "#047857", bg: "#ecfdf5", desc: "Fires before a subscription renews", group: "Triggers" },
  { kind: "TRIGGER", type: "Form Submitted", icon: FileText, color: "#047857", bg: "#ecfdf5", desc: "Fires when a form is submitted", group: "Triggers" },
  { kind: "ACTION", type: "Send Email", icon: Mail, color: "#0369a1", bg: "#e0f2fe", desc: "Send an email to a contact", group: "Actions" },
  { kind: "ACTION", type: "Create Task", icon: ListChecks, color: "#0369a1", bg: "#e0f2fe", desc: "Create a task for your team", group: "Actions" },
  { kind: "ACTION", type: "Add Tag", icon: Tag, color: "#0369a1", bg: "#e0f2fe", desc: "Add a tag to a contact", group: "Actions" },
  { kind: "ACTION", type: "Move Stage", icon: Workflow, color: "#0369a1", bg: "#e0f2fe", desc: "Move a deal to a new stage", group: "Actions" },
  { kind: "ACTION", type: "Send Webhook", icon: Webhook, color: "#0369a1", bg: "#e0f2fe", desc: "Call an external webhook", group: "Actions" },
  { kind: "ACTION", type: "Notify Team", icon: Bell, color: "#0369a1", bg: "#e0f2fe", desc: "Notify your team in Slack", group: "Actions" },
  { kind: "ACTION", type: "Wait", icon: Clock, color: "#b45309", bg: "#fef3c7", desc: "Wait a set amount of time", group: "Actions" },
  { kind: "ACTION", type: "Branch", icon: Split, color: "#b45309", bg: "#fef3c7", desc: "Run different paths based on a condition", group: "Actions" },
];

const blockOf = (kind: string, type: string): BlockDef => {
  const found = BLOCKS.find((b) => b.kind === kind && b.type === type);
  if (found) return found;
  // Fall back to a sensible, kind-aware block for any custom/migrated step.
  return kind === "TRIGGER"
    ? { kind: "TRIGGER", type, icon: Target, color: "#047857", bg: "#ecfdf5", desc: "When this happens", group: "Triggers" }
    : { kind: "ACTION", type, icon: Workflow, color: "#0369a1", bg: "#e0f2fe", desc: "Custom step", group: "Actions" };
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Node = { id: string; kind: "TRIGGER" | "ACTION"; type: string; x: number; y: number };
type Edge = { id: string; from: string; to: string };
type Doc = { key: string; id: string | null; name: string; description: string; active: boolean; runs: number; nodes: Node[]; edges: Edge[]; dirty: boolean };

const NODE_W = 192;
const NODE_H = 116;
const GRID = 24;

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

// ---------------------------------------------------------------------------
// Command actions
// ---------------------------------------------------------------------------
type Cmd = { id: string; label: string; hint?: string; icon: LucideIcon; run: () => void };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function WorkflowEditor({ automations, onRefresh }: { automations: Automation[]; onRefresh: () => void }) {
  const [docs, setDocs] = useState<Doc[]>(() =>
    automations.map((a) => buildDoc(a))
  );
  const [activeKey, setActiveKey] = useState<string | null>(automations[0] ? `${automations[0].id}:d` : null);
  const [activityTab, setActivityTab] = useState<"explorer" | "palette" | "run" | "ext" | "search" | "settings">("explorer");
  const [sidebarTab, setSidebarTab] = useState<"explorer" | "palette">("explorer");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pan, setPan] = useState({ x: 40, y: 60 });
  const [zoom, setZoom] = useState(1);
  const [sel, setSel] = useState<string | null>(null);
  const [tempEdge, setTempEdge] = useState<{ from: string; x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [hoverPort, setHoverPort] = useState<{ id: string; side: "in" | "out" } | null>(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [cmdIdx, setCmdIdx] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const viewportRef = useRef<HTMLDivElement>(null);
  const drag = useRef<null | { type: "node" | "pan" | "edge"; startWorld: { x: number; y: number }; nodeId?: string; nodeStart?: { x: number; y: number }; panStart?: { x: number; y: number }; edgeFrom?: string; }>(null);
  const dropSlot = useRef(0);

  const active = docs.find((d) => d.key === activeKey) || docs[0] || null;

  const updateDoc = useCallback((key: string, updater: (d: Doc) => Doc) => {
    setDocs((prev) => prev.map((d) => (d.key === key ? { ...updater(d), dirty: true } : d)));
  }, []);

  const activeTab = active?.key ?? null;

  // When automations change (e.g. after save/refresh), sync only metadata so we
  // never clobber the user's canvas layout or connections.
  useEffect(() => {
    setDocs((prev) => {
      const byId = new Map(automations.map((a) => [a.id, a]));
      let changed = false;
      const next = prev.map((d) => {
        if (!d.id) return d; // brand-new unsaved tab
        const a = byId.get(d.id);
        if (!a) return d;
        if (d.name !== a.name || d.description !== a.description || d.active !== a.active || d.runs !== a.runs) {
          changed = true;
          return { ...d, name: a.name, description: a.description || "", active: a.active, runs: a.runs };
        }
        return d;
      });
      return changed ? next : prev;
    });
  }, [automations]);

  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  }, [pan, zoom]);

  // --- persistence ---
  function persist(doc: Doc) {
    const triggers = doc.nodes.filter((n) => n.kind === "TRIGGER").sort((a, b) => a.x - b.x).map((n) => n.type);
    const actions = doc.nodes.filter((n) => n.kind === "ACTION").sort((a, b) => a.x - b.x).map((n) => n.type);
    return { triggers, actions };
  }

  async function save(doc: Doc) {
    setSaveState("saving");
    const body = { name: doc.name, description: doc.description, active: doc.active, ...persist(doc) };
    try {
      let id = doc.id;
      if (id) {
        const res = await fetch("/api/automations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...body }) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "save failed");
      } else {
        const res = await fetch("/api/automations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "save failed");
        id = j.id;
        setDocs((prev) => prev.map((d) => (d.id === null && d.key === doc.key ? { ...d, id, dirty: false } : d)));
        setActiveKey(doc.key);
      }
      setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, id, dirty: false } : d)));
      setSaveState("saved");
      toast.success(doc.id ? `Saved ${doc.name}` : `Created ${doc.name}`);
      onRefresh();
    } catch (e) {
      setSaveState("idle");
      toast.error((e as Error).message || "Failed to save");
    }
  }

  // --- doc ops ---
  function newDoc() {
    const name = window.prompt("Name your workflow");
    if (name === null) return;
    const key = `new:${uid()}`;
    const doc: Doc = { key, id: null, name: name || "Untitled workflow", description: "", active: true, runs: 0, nodes: [], edges: [], dirty: false };
    setDocs((prev) => [...prev, doc]);
    setActiveKey(key);
    setSel(null);
    setSidebarTab("palette");
  }

  function openDoc(key: string) {
    setActiveKey(key);
    setSel(null);
  }

  function addNode(kind: "TRIGGER" | "ACTION", type: string, worldPos?: { x: number; y: number }) {
    if (!active) return;
    const id = uid();
    const slot = dropSlot.current++;
    const pos = worldPos
      ? worldPos
      : { x: 80 + (slot % 3) * (NODE_W + 48), y: 140 + Math.floor(slot / 3) * (NODE_H + 48) };
    updateDoc(active.key, (d) => ({ ...d, nodes: [...d.nodes, { id, kind, type, x: pos.x, y: pos.y }] }));
  }

  function removeNode(nodeId: string) {
    if (!active) return;
    updateDoc(active.key, (d) => ({ ...d, nodes: d.nodes.filter((n) => n.id !== nodeId), edges: d.edges.filter((e) => e.from !== nodeId && e.to !== nodeId) }));
    setSel(null);
  }

  function connect(from: string, to: string) {
    if (!active || from === to) return;
    const exists = active.edges.some((e) => e.from === from && e.to === to);
    if (exists) return;
    updateDoc(active.key, (d) => ({ ...d, edges: [...d.edges, { id: uid(), from, to }] }));
  }

  async function toggleActive(doc: Doc) {
    if (!doc.id) { updateDoc(doc.key, (d) => ({ ...d, active: !d.active })); return; }
    await fetch("/api/automations", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: doc.id, name: doc.name, active: !doc.active }) });
    toast.success(doc.active ? "Workflow paused" : "Workflow activated");
    onRefresh();
  }

  async function deleteDoc(doc: Doc) {
    if (!doc.id) { setDocs((prev) => prev.filter((d) => d.id !== doc.id)); return; }
    if (!confirm(`Delete '${doc.name}'? This cannot be undone.`)) return;
    await fetch("/api/automations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: doc.id }) });
    toast.success("Workflow deleted");
    onRefresh();
  }

  // --- pointer handlers (node move / pan / edge connect) ---
  function onViewportPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    const closest = target.closest("[data-node-id]") as HTMLElement | null;
    const world = toWorld(e.clientX, e.clientY);
    if (closest) {
      const nodeId = closest.dataset.nodeId!;
      const node = active?.nodes.find((n) => n.id === nodeId);
      if (node) {
        drag.current = { type: "node", startWorld: world, nodeId, nodeStart: { x: node.x, y: node.y } };
        setSel(nodeId);
      }
      return;
    }
    drag.current = { type: "pan", startWorld: world, panStart: { ...pan } };
    setSel(null);
  }

  function onPortPointerDown(e: React.PointerEvent, nodeId: string, side: "in" | "out") {
    e.stopPropagation();
    e.preventDefault();
    if (side !== "out") return;
    const node = active?.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const world = toWorld(e.clientX, e.clientY);
    drag.current = { type: "edge", startWorld: world, edgeFrom: nodeId };
    setTempEdge({ from: nodeId, x1: node.x + NODE_W, y1: node.y + NODE_H / 2, x2: world.x, y2: world.y });
  }

  useEffect(() => {
    function onMove(e: PointerEvent) {
      const dr = drag.current;
      if (!dr) return;
      const world = toWorld(e.clientX, e.clientY);
      if (dr.type === "node" && dr.nodeId && active) {
        const dx = world.x - dr.startWorld.x;
        const dy = world.y - dr.startWorld.y;
        updateDoc(active.key, (d) => ({
          ...d,
          nodes: d.nodes.map((n) => (n.id === dr.nodeId ? { ...n, x: Math.round(dr.nodeStart!.x + dx), y: Math.round(dr.nodeStart!.y + dy) } : n)),
        }));
      } else if (dr.type === "pan") {
        const dx = world.x - dr.startWorld.x;
        const dy = world.y - dr.startWorld.y;
        setPan({ x: dr.panStart!.x + dx * zoom, y: dr.panStart!.y + dy * zoom });
      } else if (dr.type === "edge" && dr.edgeFrom) {
        const fromNode = active?.nodes.find((n) => n.id === dr.edgeFrom);
        if (fromNode) {
          setTempEdge({ from: dr.edgeFrom, x1: fromNode.x + NODE_W, y1: fromNode.y + NODE_H / 2, x2: world.x, y2: world.y });
        }
      }
    }
    function onUp() {
      const dr = drag.current;
      if (dr?.type === "edge" && dr.edgeFrom && hoverPort?.id && hoverPort.id !== dr.edgeFrom && hoverPort.side === "in") {
        connect(dr.edgeFrom, hoverPort.id);
      }
      drag.current = null;
      setTempEdge(null);
      setHoverPort(null);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => { window.removeEventListener("pointermove", onMove); window.removeEventListener("pointerup", onUp); };
  }, [toWorld, active, hoverPort, updateDoc]);

  // --- wheel zoom ---
  function onWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.min(1.75, Math.max(0.5, Math.round((z + delta) * 100) / 100)));
  }

  // --- drop from palette ---
  function onDragOver(e: React.DragEvent) { e.preventDefault(); }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/pblock");
    if (!raw) return;
    const { kind, type } = JSON.parse(raw);
    const world = toWorld(e.clientX, e.clientY);
    addNode(kind, type, { x: Math.round(world.x - NODE_W / 2), y: Math.round(world.y - 40) });
  }

  // --- command palette ---
  const commands: Cmd[] = [
    { id: "new", label: "Workflow: New workflow", hint: "Create a blank workflow", icon: FilePlus2, run: () => newDoc() },
    { id: "save", label: "Workflow: Save", hint: "Save the active workflow", icon: Save, run: () => active && save(active) },
    { id: "toggle", label: "Workflow: Toggle active", hint: "Run / pause", icon: Play, run: () => active && toggleActive(active) },
    { id: "del", label: "Workflow: Delete", hint: "Remove the active workflow", icon: Trash2, run: () => active && deleteDoc(active) },
    { id: "side", label: "View: Toggle sidebar", hint: "Show/hide the sidebar", icon: PanelLeft, run: () => setSidebarOpen((v) => !v) },
    { id: "zin", label: "View: Zoom in", icon: ZoomIn, run: () => setZoom((z) => Math.min(1.75, Math.round((z + 0.1) * 100) / 100)) },
    { id: "zout", label: "View: Zoom out", icon: ZoomOut, run: () => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 100) / 100)) },
    { id: "zreset", label: "View: Reset zoom", icon: Maximize2, run: () => setZoom(1) },
    ...BLOCKS.map((b, i) => ({ id: `add-${i}`, label: `Block: Add ${b.type}`, hint: b.desc, icon: b.icon, run: () => addNode(b.kind, b.type) })),
  ];

  const filteredCmds = commands.filter((c) => (c.label + (c.hint || "")).toLowerCase().includes(cmdQuery.toLowerCase()));
  useEffect(() => { setCmdIdx(0); }, [cmdQuery, cmdOpen]);

  function runCmd(c: Cmd) { c.run(); setCmdOpen(false); setCmdQuery(""); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "F1" || (mod && e.shiftKey && (e.key === "P" || e.key === "p"))) {
        e.preventDefault();
        setCmdOpen((v) => !v);
        setCmdQuery("");
        return;
      }
      if (cmdOpen) {
        if (e.key === "Escape") { setCmdOpen(false); setCmdQuery(""); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); setCmdIdx((i) => Math.min(filteredCmds.length - 1, i + 1)); return; }
        if (e.key === "ArrowUp") { e.preventDefault(); setCmdIdx((i) => Math.max(0, i - 1)); return; }
        if (e.key === "Enter") { e.preventDefault(); if (filteredCmds[cmdIdx]) runCmd(filteredCmds[cmdIdx]); return; }
      }
      if (mod && (e.key === "b" || e.key === "B")) { e.preventDefault(); setSidebarOpen((v) => !v); return; }
      if (mod && (e.key === "s" || e.key === "S") && active) { e.preventDefault(); save(active); return; }
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.key === "Delete" || e.key === "Backspace") && sel && tag !== "INPUT" && tag !== "TEXTAREA") {
        removeNode(sel);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cmdOpen, filteredCmds, cmdIdx, active, sel]);

  // delete-node toolbar
  function selectedNode() {
    return active?.nodes.find((n) => n.id === sel) || null;
  }

  const edgePath = (e: Edge) => {
    const a = active!.nodes.find((n) => n.id === e.from);
    const b = active!.nodes.find((n) => n.id === e.to);
    if (!a || !b) return null;
    const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2;
    const x2 = b.x, y2 = b.y + NODE_H / 2;
    const dx = Math.max(50, Math.abs(x2 - x1) * 0.5);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  const activeNode = selectedNode();
  const runTotal = docs.reduce((a, d) => a + d.runs, 0);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="flex h-[calc(100vh-7.5rem)] min-h-[560px] overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      {/* Activity bar */}
      <div className="flex w-12 shrink-0 flex-col items-center border-r border-border bg-slate-50 py-2">
        {([
          { key: "explorer", icon: Files, title: "Explorer (Ctrl+Shift+E)" },
          { key: "search", icon: Search, title: "Search" },
          { key: "palette", icon: Box, title: "Block palette" },
          { key: "run", icon: Play, title: "Run history" },
          { key: "ext", icon: Puzzle, title: "Connectors" },
        ] as { key: any; icon: LucideIcon; title: string }[]).map((it) => (
          <button
            key={it.key}
            title={it.title}
            onClick={() => {
              setActivityTab(it.key);
              if (it.key === "palette") setSidebarTab("palette");
              if (it.key === "explorer") setSidebarTab("explorer");
              setSidebarOpen(true);
            }}
            className={cn("relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0f172a]", activityTab === it.key && "text-[#16a34a]")}
          >
            {activityTab === it.key && <span className="absolute left-0 h-5 w-0.5 rounded-r bg-[#16a34a]" />}
            <it.icon className="h-5 w-5" />
          </button>
        ))}
        <div className="mt-auto flex flex-col items-center gap-1">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#22c55e] to-[#38bdf8] text-xs font-bold text-white">A</span>
          <button title="Settings" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100" onClick={() => { setActivityTab("settings"); setSidebarOpen(true); }}>
            <SettingsIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="flex w-64 shrink-0 flex-col border-r border-border bg-white">
          <div className="flex border-b border-border">
            {(["explorer", "palette"] as const).map((t) => (
              <button key={t} onClick={() => setSidebarTab(t)} className={cn("flex-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide", sidebarTab === t ? "border-b-2 border-[#16a34a] text-[#047857]" : "text-slate-500 hover:text-foreground")}>
                {t === "explorer" ? "Explorer" : "Palette"}
              </button>
            ))}
            <button className="px-2 text-slate-400 hover:text-foreground" onClick={() => setSidebarOpen(false)} title="Collapse sidebar"><PanelLeft className="h-4 w-4" /></button>
          </div>

          {sidebarTab === "explorer" ? (
            <div className="relative flex-1 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workflows</span>
                <button title="New workflow" onClick={newDoc} className="text-slate-400 hover:text-[#16a34a]"><FilePlus2 className="h-4 w-4" /></button>
              </div>
              {docs.length === 0 && <div className="px-3 py-6 text-center text-xs text-muted-foreground">No workflows</div>}
              <div className="space-y-0.5 px-1">
                {docs.map((d) => (
                  <button key={d.key} onClick={() => openDoc(d.key)} className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-50", activeTab === d.key && "bg-slate-100")}>
                    <Workflow className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className={cn("flex-1 truncate", d.id ? "" : "italic text-slate-400")}>{d.name}</span>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", d.active ? "bg-[#16a34a]" : "bg-slate-300")} title={d.active ? "Active" : "Paused"} />
                    {d.dirty && <span className="shrink-0 text-[10px] text-slate-400">●</span>}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {(["Triggers", "Actions"] as const).map((group) => (
                <div key={group} className="mb-3">
                  <div className="px-1 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group}</div>
                  <div className="space-y-0.5">
                    {BLOCKS.filter((b) => b.group === group).map((b) => (
                      <div
                        key={b.type}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("application/pblock", JSON.stringify({ kind: b.kind, type: b.type }))}
                        onDoubleClick={() => addNode(b.kind, b.type)}
                        className="group flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50 active:cursor-grabbing"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ background: b.bg, color: b.color }}><b.icon className="h-4 w-4" /></span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-slate-700">{b.type}</div>
                          <div className="truncate text-[10px] text-slate-400">{b.desc}</div>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor (tabs + canvas + status) */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tab bar */}
        <div className="flex items-stretch border-b border-border bg-slate-50">
          <div className="flex min-w-0 flex-1 overflow-x-auto">
            {docs.map((d) => {
              const isActive = activeTab === d.key;
              return (
                <div key={d.key} onClick={() => openDoc(d.key)} className={cn("group relative flex min-w-0 max-w-[200px] cursor-pointer items-center gap-2 border-r border-border px-3 py-2 text-sm", isActive ? "bg-white text-[#0f172a]" : "text-slate-500 hover:bg-slate-100")}>
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", d.active ? "bg-[#16a34a]" : "bg-slate-300")} />
                  <span className="truncate">{d.name}</span>
                  {d.dirty && <span className="shrink-0 text-slate-400">●</span>}
                  <button onClick={(e) => { e.stopPropagation(); deleteDoc(d); }} className="hidden shrink-0 text-slate-400 hover:text-red-500 group-hover:block" aria-label="Close">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            <button onClick={newDoc} className="flex items-center px-2 text-slate-500 hover:bg-slate-100 hover:text-[#16a34a]" title="New workflow"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="flex items-center gap-1 border-l border-border px-2">
            {active && (
              <>
                <button title="Save (Ctrl+S)" onClick={() => save(active)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-[#16a34a]">
                  {saveState === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
                <button title="Toggle active" onClick={() => toggleActive(active)} className={cn("flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100", active.active ? "text-[#16a34a]" : "text-slate-400")}>
                  <Play className="h-4 w-4" />
                </button>
                <button title="More" onClick={() => setCmdOpen(true)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"><MoreHorizontal className="h-4 w-4" /></button>
              </>
            )}
            <button title="Command palette (Ctrl+Shift+P)" onClick={() => setCmdOpen(true)} className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-slate-500 hover:bg-slate-100">
              <Command className="h-3.5 w-3.5" />⇧P
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={viewportRef}
          className="relative flex-1 overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(circle, #d6dce3 1px, transparent 1px)",
            backgroundSize: `${GRID * zoom}px ${GRID * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`,
            cursor: drag.current?.type === "pan" ? "grabbing" : drag.current ? "default" : "default",
          }}
          onPointerDown={onViewportPointerDown}
          onWheel={onWheel}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* zoom controls */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-lg border border-border bg-white/95 p-1 shadow-sm">
            <button onClick={() => setZoom((z) => Math.min(1.75, Math.round((z + 0.1) * 100) / 100))} className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100" title="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></button>
            <span className="w-10 text-center text-[10px] font-semibold text-slate-500">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 100) / 100))} className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100" title="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></button>
            <button onClick={() => setZoom(1)} className="flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-100" title="Reset"><Maximize2 className="h-3.5 w-3.5" /></button>
          </div>

          {/* selected node toolbar */}
          {activeNode && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-lg border border-border bg-white/95 px-2 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-700">{activeNode.type}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{activeNode.kind}</span>
              <button onClick={() => removeNode(activeNode.id)} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
            </div>
          )}

          {/* hint when empty */}
          {active && active.nodes.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <Box className="h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Drag blocks from the palette onto the canvas</p>
              <p className="mt-1 max-w-sm text-xs text-slate-400">Start with a <span className="font-semibold text-[#047857]">Trigger</span>, then connect <span className="font-semibold text-[#0369a1]">Actions</span>. Double-click a block to add it.</p>
            </div>
          )}

          {/* world (nodes + edges) */}
          <div className="absolute left-0 top-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
            <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width={20000} height={20000}>
              {active?.edges.map((e) => {
                const p = edgePath(e);
                if (!p) return null;
                return <path key={e.id} d={p} fill="none" stroke="#94a3b8" strokeWidth={2} markerEnd="url(#arrow)" />;
              })}
              {tempEdge && (
                <path d={`M ${tempEdge.x1} ${tempEdge.y1} C ${tempEdge.x1 + 50} ${tempEdge.y1}, ${tempEdge.x2 - 50} ${tempEdge.y2}, ${tempEdge.x2} ${tempEdge.y2}`} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 4" />
              )}
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                </marker>
              </defs>
            </svg>

            {active?.nodes.map((n) => {
              const def = blockOf(n.kind, n.type);
              const Icon = def.icon;
              const isSel = sel === n.id;
              return (
                <div
                  key={n.id}
                  data-node-id={n.id}
                  className={cn("absolute select-none rounded-lg border bg-white shadow-sm transition-shadow", isSel ? "ring-2 ring-[#16a34a] shadow-md" : "hover:shadow-md")}
                  style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H, touchAction: "none" }}
                >
                  {/* input port */}
                  <button
                    data-port-in
                    onPointerDown={(e) => onPortPointerDown(e, n.id, "in")}
                    onPointerEnter={() => setHoverPort({ id: n.id, side: "in" })}
                    onPointerLeave={() => setHoverPort((h) => (h?.id === n.id && h.side === "in" ? null : h))}
                    className={cn("absolute -left-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-300 bg-white transition-colors hover:border-[#16a34a]", n.kind === "TRIGGER" && "pointer-events-none opacity-40")}
                    title="Drag from an output to connect"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </button>

                  {/* output port */}
                  <button
                    data-port-out
                    onPointerDown={(e) => onPortPointerDown(e, n.id, "out")}
                    className="absolute -right-2 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-300 bg-white transition-colors hover:border-[#16a34a]"
                    title="Drag to connect"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                  </button>

                  <div className="flex h-full flex-col justify-between p-3">
                    <div className="flex items-center justify-between">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", n.kind === "TRIGGER" ? "bg-[#ecfdf5] text-[#047857]" : "bg-[#e0f2fe] text-[#0369a1]")}>
                        {n.kind === "TRIGGER" ? "Trigger" : "Action"}
                      </span>
                      {n.kind === "ACTION" && <button onClick={(e) => { e.stopPropagation(); removeNode(n.id); }} className="text-slate-300 hover:text-red-500"><X className="h-3.5 w-3.5" /></button>}
                    </div>
                    <div className="flex items-center gap-2.5">
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: def.bg, color: def.color }}><Icon className="h-[18px] w-[18px]" /></span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-[#0f172a]">{n.type}</div>
                        <div className="truncate text-[10px] text-slate-400">{def.desc}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between border-t border-border bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><GitBranch className="h-3 w-3" /><span className="font-medium text-[#0f172a]">{active?.name || "No workflow open"}</span></span>
            <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{active ? `${active.nodes.filter((n) => n.kind === "TRIGGER").length} trigger · ${active.nodes.filter((n) => n.kind === "ACTION").length} actions` : "0 blocks"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Play className="h-3 w-3" /> {runTotal.toLocaleString()} runs</span>
            <span className={cn("flex items-center gap-1", active?.active ? "text-[#047857]" : "")}><span className={cn("h-1.5 w-1.5 rounded-full", active?.active ? "bg-[#16a34a]" : "bg-slate-300")} />{active?.active ? "Active" : "Paused"}</span>
            {saveState === "saving" && <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>}
            {saveState === "saved" && <span className="text-[#047857]">Saved ✓</span>}
            <span className="hidden sm:inline">UTF-8 · {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Command palette */}
      {cmdOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[16vh]" onClick={() => setCmdOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Command className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") e.preventDefault(); }}
                placeholder="Type a command or block…"
                className="h-11 w-full bg-transparent text-sm outline-none"
              />
              <kbd className="rounded border border-border bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">Esc</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {filteredCmds.map((c, i) => (
                <button key={c.id} onClick={() => runCmd(c)} onMouseEnter={() => setCmdIdx(i)} className={cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm", i === cmdIdx ? "bg-[#f0fdf4]" : "")}>
                  <c.icon className={cn("h-4 w-4 shrink-0", i === cmdIdx ? "text-[#16a34a]" : "text-slate-400")} />
                  <span className="flex-1">{c.label}</span>
                  {c.hint && <span className="text-xs text-slate-400">{c.hint}</span>}
                </button>
              ))}
              {filteredCmds.length === 0 && <div className="px-3 py-6 text-center text-sm text-slate-400">No results</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildDoc(a: Automation): Doc {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let x = 40;
  const order: { kind: "TRIGGER" | "ACTION"; type: string }[] = [
    ...a.triggers.map((t) => ({ kind: "TRIGGER" as const, type: t.type })),
    ...a.actions.map((act) => ({ kind: "ACTION" as const, type: act.type })),
  ];
  order.forEach((item, i) => {
    const id = `${a.id}:n${i}`;
    nodes.push({ id, kind: item.kind, type: item.type, x, y: 120 });
    if (i > 0) edges.push({ id: `${a.id}:e${i}`, from: nodes[i - 1].id, to: id });
    x += NODE_W + 56;
  });
  return {
    key: `${a.id}:d`, id: a.id, name: a.name, description: a.description || "", active: a.active, runs: a.runs,
    nodes, edges, dirty: false,
  };
}
