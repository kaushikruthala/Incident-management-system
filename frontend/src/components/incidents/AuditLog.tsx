import * as React from 'react';
import { format } from 'date-fns';
import { Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type AuditEvent } from '@/data/incidents';
import { cn } from '@/lib/utils';

const KIND_STYLES: Record<AuditEvent['kind'], { label: string; color: string }> = {
  TRANSITION:    { label: 'TRANSITION',    color: 'text-primary' },
  REOPEN:        { label: 'REOPEN',        color: 'text-severity-medium' },
  RCA_SUBMITTED: { label: 'RCA SUBMITTED', color: 'text-severity-low' },
};

interface AuditLogProps {
  events: AuditEvent[];
  workItemId: string;
}

export function AuditLog({ events, workItemId }: AuditLogProps) {
  const relevant = events.filter((e) => e.work_item_id === workItemId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 border border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-primary/50 hover:text-primary"
        >
          <History className="h-3 w-3" />
          {relevant.length} event{relevant.length !== 1 ? 's' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg font-mono">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <DialogTitle>Audit Trail — {workItemId}</DialogTitle>
          </div>
          <DialogDescription>
            All status transitions, reopens, and RCA submissions for this incident.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-2 max-h-96">
          {relevant.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-muted-foreground">No events yet.</p>
          ) : (
            <ol className="relative ml-4 border-l border-border">
              {relevant.map((ev, idx) => {
                const styles = KIND_STYLES[ev.kind];
                return (
                  <li key={ev.id} className={cn('mb-4 ml-4', idx === 0 && 'mt-2')}>
                    <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full border border-border bg-card" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('text-[10px] font-bold uppercase tracking-wider', styles.color)}>
                        {styles.label}
                      </span>
                      <span className="rounded border border-border px-1 py-0.5 text-[9px] text-muted-foreground">
                        {ev.from_status} → {ev.to_status}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(ev.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                      <span className="text-muted-foreground/60">·</span>
                      <span>{ev.actor}</span>
                    </div>
                    {ev.reason_category && (
                      <div className="mt-1 rounded border border-severity-medium/30 bg-severity-medium/5 px-2 py-1">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-severity-medium">
                          {ev.reason_category}
                        </div>
                        {ev.justification && (
                          <div className="mt-0.5 text-[10px] text-foreground/80">{ev.justification}</div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
