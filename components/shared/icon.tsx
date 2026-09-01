import {
  Sparkles, Megaphone, Target, Share2, ShoppingCart, Landmark, Calculator,
  ClipboardList, Zap, MessageSquare, Headphones, Code2, PenTool, Video, Search,
  Layout, Server, ShieldCheck, BarChart3, Users, GraduationCap, Workflow, Blocks,
  PieChart, CreditCard, Cloud, Mail, MessageCircle, MessagesSquare,
  Music, AtSign, Camera, ThumbsUp, Rocket, Bug, FileText, ListTodo,
  Briefcase, ShoppingBag, Plug, Box, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Sparkles, Megaphone, Target, Share2, ShoppingCart, Landmark, Calculator,
  ClipboardList, Zap, MessageSquare, Headphones, Code2, PenTool, Video, Search,
  Layout, Server, ShieldCheck, BarChart3, Users, GraduationCap, Workflow, Blocks,
  PieChart, CreditCard, Cloud, Mail, MessageCircle, MessagesSquare,
  Music, AtSign, Camera, ThumbsUp, Rocket, Bug, FileText, ListTodo,
  Briefcase, ShoppingBag, Plug, Box,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = map[name] || Box;
  return <Cmp className={className} />;
}
