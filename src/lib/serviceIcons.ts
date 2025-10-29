import { Brain, Heart, Sparkles, Users, BookOpen, MessageSquare, BarChart } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Map string identifiers stored in DB to actual Lucide icons
export const serviceIconMap: Record<string, LucideIcon> = {
  brain: Brain,
  heart: Heart,
  sparkles: Sparkles,
  users: Users,
  book: BookOpen,
  message: MessageSquare,
  chart: BarChart,
};

export function getServiceIcon(name: string): LucideIcon {
  return serviceIconMap[name] || Brain;
}
