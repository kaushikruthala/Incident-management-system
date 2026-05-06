import { Database } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RawSignal } from '@/data/incidents';
import { formatTimeAgo } from '@/components/incidents/SeverityBadge';

type ErrorLogTableProps = {
  signals: RawSignal[];
};

export function ErrorLogTable({ signals }: ErrorLogTableProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border bg-background">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-3 py-2">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-severity-low">
          <Database className="h-3.5 w-3.5" aria-hidden />
          Raw Data Lake Signals — MongoDB
        </div>
        <span className="rounded border border-severity-low/30 bg-severity-low/10 px-2 py-0.5 text-[9px] font-bold text-severity-low">
          {signals.length} entries
        </span>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 p-2">
          {signals.length === 0 ? (
            <p className="px-2 py-6 text-center text-[10px] text-muted-foreground">No signals for this work item.</p>
          ) : (
            signals.map((s) => (
              <article key={s._id} className="rounded-md border border-border bg-card">
                <header className="flex items-center justify-between border-b border-border px-2 py-1.5 text-[10px]">
                  <span className="font-semibold text-primary">{s._id}</span>
                  <span className="text-muted-foreground">{formatTimeAgo(s.timestamp)}</span>
                </header>
                <pre className="m-0 overflow-x-auto p-2 text-[10px] leading-relaxed text-severity-low">
                  {JSON.stringify(s.payload, null, 2)}
                </pre>
              </article>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
