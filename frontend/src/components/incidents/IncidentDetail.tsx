import * as React from 'react';
import { format } from 'date-fns';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AuditLog } from '@/components/incidents/AuditLog';
import { ErrorLogTable } from '@/components/incidents/ErrorLogTable';
import { ReopenDialog } from '@/components/incidents/ReopenDialog';
import { SeverityBadge, StatusBadge, formatTimeAgo } from '@/components/incidents/SeverityBadge';
import {
  RCA_ROOT_CAUSE_CATEGORIES,
  type AuditEvent,
  type RawSignal,
  type RCARecord,
  type WorkItem,
  type WorkItemStatus,
  canTransition,
} from '@/data/incidents';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

function mttrLabel(start: Date | undefined, end: Date | undefined): string {
  if (!start || !end || end <= start) return '—';
  const ms = end.getTime() - start.getTime();
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const min = m % 60;
  if (h > 0) return `${h}h ${min}m`;
  return `${min}m`;
}

type ReopenPayload = {
  targetStatus: WorkItemStatus;
  reasonCategory: string;
  justification: string;
};

type IncidentDetailProps = {
  workItem: WorkItem | null;
  signals: RawSignal[];
  auditEvents: AuditEvent[];
  onTransition: (id: string, to: WorkItemStatus) => void;
  onSubmitRCA: (record: RCARecord) => void;
  onReopen: (id: string, payload: ReopenPayload) => void;
};

export function IncidentDetail({
  workItem,
  signals,
  auditEvents,
  onTransition,
  onSubmitRCA,
  onReopen,
}: IncidentDetailProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
  const [category, setCategory] = React.useState<string>('');
  const [fixApplied, setFixApplied] = React.useState('');
  const [prevention, setPrevention] = React.useState('');

  React.useEffect(() => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCategory('');
    setFixApplied('');
    setPrevention('');
  }, [workItem?.id]);

  if (!workItem) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <Shield className="h-10 w-10 text-muted-foreground/40" aria-hidden />
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Select an incident to investigate…
          </p>
        </div>
      </div>
    );
  }

  const reopenCount = auditEvents.filter(
    (e) => e.work_item_id === workItem.id && e.kind === 'REOPEN',
  ).length;

  const handleTransition = (to: WorkItemStatus) => {
    if (!canTransition(workItem.status, to)) {
      toast({
        variant: 'destructive',
        title: 'Invalid transition',
        description: `Cannot move from ${workItem.status} to ${to}.`,
      });
      return;
    }
    onTransition(workItem.id, to);
    toast({ title: 'Status updated', description: `${workItem.id} is now ${to}.` });
  };

  const submitRca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Start and end times are required.' });
      return;
    }
    if (!category) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Select a root cause category.' });
      return;
    }
    if (!fixApplied.trim()) {
      toast({ variant: 'destructive', title: 'Validation', description: 'Fix applied is required.' });
      return;
    }
    const record: RCARecord = {
      work_item_id: workItem.id,
      root_cause_category: category,
      fix_applied: fixApplied.trim(),
      prevention_steps: prevention.trim(),
      incident_start: startDate.toISOString(),
      incident_end: endDate.toISOString(),
    };
    onSubmitRCA(record);
    toast({ title: 'RCA submitted', description: `${workItem.id} closed.` });
  };

  const showRca = workItem.status === 'RESOLVED';
  const canReopen = workItem.status === 'RESOLVED' || workItem.status === 'CLOSED' || workItem.status === 'INVESTIGATING';

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="shrink-0 border-b border-border bg-card px-3 py-3 md:px-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-primary">{workItem.id}</span>
              <SeverityBadge severity={workItem.severity} />
              <StatusBadge status={workItem.status} />
              {reopenCount > 0 && (
                <span className="rounded border border-severity-medium/40 bg-severity-medium/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-severity-medium">
                  Reopened ×{reopenCount}
                </span>
              )}
            </div>
            <h1 className="text-base font-bold leading-tight text-foreground md:text-lg">
              {workItem.title}
            </h1>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
              <span>{workItem.service}</span>
              <span>{workItem.component_id}</span>
              <span>{workItem.signal_count} signals</span>
              <span>{formatTimeAgo(workItem.first_signal_at)}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:pt-0.5">
            {/* Audit log viewer */}
            <AuditLog events={auditEvents} workItemId={workItem.id} />

            {/* Forward transitions */}
            {workItem.status === 'OPEN' && (
              <Button
                variant="investigating"
                size="sm"
                className="gap-1"
                onClick={() => handleTransition('INVESTIGATING')}
              >
                Investigate
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {workItem.status === 'INVESTIGATING' && (
              <Button
                variant="resolved"
                size="sm"
                className="gap-1"
                onClick={() => handleTransition('RESOLVED')}
              >
                Mark resolved
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
            {workItem.status === 'CLOSED' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Closed
              </span>
            )}

            {/* Exceptional backward path — separate, ghost-styled */}
            {canReopen && (
              <ReopenDialog
                workItem={workItem}
                onReopen={(payload) => onReopen(workItem.id, payload)}
              />
            )}
          </div>
        </div>
      </header>

      <div className={cn('flex min-h-0 flex-1 flex-col lg:flex-row')}>
        <ErrorLogTable signals={signals} />
        {showRca ? (
          <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card lg:w-96 lg:border-l lg:border-t-0">
            <div className="border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              RCA Gatekeeper Form
            </div>
            <form className="flex flex-1 flex-col gap-3 overflow-y-auto p-3" onSubmit={submitRca}>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Start time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 w-full justify-start text-left text-[10px] font-normal"
                      >
                        {startDate ? format(startDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label>End time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 w-full justify-start text-left text-[10px] font-normal"
                      >
                        {endDate ? format(endDate, 'PPP') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-1">
                <Label>MTTR (auto)</Label>
                <div className="rounded-md border border-border bg-background px-2 py-1.5 text-[11px] font-semibold text-primary">
                  {mttrLabel(startDate, endDate)}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Root cause category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category…" />
                  </SelectTrigger>
                  <SelectContent>
                    {RCA_ROOT_CAUSE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c} className="text-[11px]">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Fix applied (required)</Label>
                <Textarea
                  value={fixApplied}
                  onChange={(e) => setFixApplied(e.target.value)}
                  placeholder="Describe remediation…"
                />
              </div>
              <div className="space-y-1">
                <Label>Prevention steps (optional)</Label>
                <Textarea
                  value={prevention}
                  onChange={(e) => setPrevention(e.target.value)}
                  placeholder="Follow-up hardening…"
                />
              </div>
              <Button type="submit" variant="closed" className="mt-auto w-full gap-1">
                Submit RCA &amp; Close
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </form>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
