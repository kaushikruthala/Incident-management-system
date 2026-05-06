import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SeverityBadge, StatusBadge, formatTimeAgo } from '@/components/incidents/SeverityBadge';
import type { WorkItem } from '@/data/incidents';
import { cn } from '@/lib/utils';

type LiveFeedSidebarProps = {
  items: WorkItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function LiveFeedSidebar({ items, selectedId, onSelect, collapsed, onToggleCollapsed }: LiveFeedSidebarProps) {
  const open = items.filter((i) => i.status === 'OPEN').length;
  const investigating = items.filter((i) => i.status === 'INVESTIGATING').length;
  const resolved = items.filter((i) => i.status === 'RESOLVED').length;

  if (collapsed) {
    return (
      <aside className="flex w-11 shrink-0 flex-col border-r border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          className="mt-2 h-8 w-full rounded-none border-b border-border"
          onClick={onToggleCollapsed}
          aria-label="Expand live feed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-card md:max-lg:w-[240px]">
      <div className="flex items-center justify-between border-b border-border px-2 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live feed</span>
        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onToggleCollapsed} aria-label="Collapse">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1 border-b border-border px-2 py-2">
        <div className="text-center">
          <div className="text-[11px] font-bold text-foreground">{open}</div>
          <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Open</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-bold text-severity-medium">{investigating}</div>
          <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Inv.</div>
        </div>
        <div className="text-center">
          <div className="text-[11px] font-bold text-severity-low">{resolved}</div>
          <div className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Res.</div>
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0 p-1">
          {items.map((item) => {
            const sel = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'flex w-full flex-col gap-1 rounded-md border border-transparent p-2 text-left transition-colors hover:bg-muted/40',
                  sel && 'border-primary bg-primary/5 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]',
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[10px] font-semibold text-primary">{item.id}</span>
                  <SeverityBadge severity={item.severity} className="shrink-0 scale-90" />
                </div>
                <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-foreground">{item.title}</div>
                <div className="text-[9px] text-muted-foreground">
                  {item.service} · {item.signal_count} signals
                </div>
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <StatusBadge status={item.status} />
                  <span className="text-[9px] text-muted-foreground">{formatTimeAgo(item.first_signal_at)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
