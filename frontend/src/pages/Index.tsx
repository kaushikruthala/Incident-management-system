import * as React from 'react';
import { CheckCircle2, Shield, Zap } from 'lucide-react';
import { LiveFeedSidebar } from '@/components/incidents/LiveFeedSidebar';
import { IncidentDetail } from '@/components/incidents/IncidentDetail';
import {
  MOCK_RAW_SIGNALS,
  MOCK_WORK_ITEMS,
  isActiveWorkItem,
  signalsForWorkItem,
  sortBySeverity,
  type AuditEvent,
  type RCARecord,
  type WorkItemStatus,
} from '@/data/incidents';
import { cn } from '@/lib/utils';

let auditSeq = 0;
function makeAuditId() {
  return `audit-${++auditSeq}`;
}

type ReopenPayload = {
  targetStatus: WorkItemStatus;
  reasonCategory: string;
  justification: string;
};

export default function Index() {
  const [workItems, setWorkItems] = React.useState(() => [...MOCK_WORK_ITEMS]);
  const [rawSignals] = React.useState(() => [...MOCK_RAW_SIGNALS]);
  const [selectedId, setSelectedId] = React.useState<string | null>('wi-002');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [auditEvents, setAuditEvents] = React.useState<AuditEvent[]>([]);

  const activeItems = React.useMemo(
    () => sortBySeverity(workItems.filter(isActiveWorkItem)),
    [workItems],
  );

  React.useEffect(() => {
    if (!selectedId) {
      if (activeItems[0]) setSelectedId(activeItems[0].id);
      return;
    }
    const stillThere = activeItems.some((i) => i.id === selectedId);
    if (!stillThere) setSelectedId(activeItems[0]?.id ?? null);
  }, [activeItems, selectedId]);

  const selected = workItems.find((w) => w.id === selectedId) ?? null;
  const itemSignals = selected ? signalsForWorkItem(rawSignals, selected.id) : [];

  const totalCount = workItems.length;
  const resolvedCount = workItems.filter((w) => w.status === 'RESOLVED' || w.status === 'CLOSED').length;

  const handleTransition = (id: string, to: WorkItemStatus) => {
    const now = new Date().toISOString();
    setWorkItems((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        const next = { ...w, status: to };
        if (to === 'RESOLVED') return { ...next, resolved_at: w.resolved_at ?? now };
        return next;
      }),
    );
    const from = workItems.find((w) => w.id === id)?.status ?? 'OPEN';
    setAuditEvents((prev) => [
      ...prev,
      {
        id: makeAuditId(),
        work_item_id: id,
        kind: 'TRANSITION',
        from_status: from,
        to_status: to,
        actor: 'you@sre-team',
        timestamp: now,
      },
    ]);
  };

  const handleSubmitRCA = (record: RCARecord) => {
    const now = new Date().toISOString();
    const from = workItems.find((w) => w.id === record.work_item_id)?.status ?? 'RESOLVED';
    setWorkItems((prev) =>
      prev.map((w) =>
        w.id === record.work_item_id
          ? { ...w, status: 'CLOSED', resolved_at: w.resolved_at ?? now }
          : w,
      ),
    );
    setAuditEvents((prev) => [
      ...prev,
      {
        id: makeAuditId(),
        work_item_id: record.work_item_id,
        kind: 'RCA_SUBMITTED',
        from_status: from,
        to_status: 'CLOSED',
        actor: 'you@sre-team',
        timestamp: now,
      },
    ]);
  };

  const handleReopen = (id: string, payload: ReopenPayload) => {
    const now = new Date().toISOString();
    const from = workItems.find((w) => w.id === id)?.status ?? 'CLOSED';
    setWorkItems((prev) =>
      prev.map((w) => {
        if (w.id !== id) return w;
        return {
          ...w,
          status: payload.targetStatus,
          resolved_at: payload.targetStatus === 'OPEN' || payload.targetStatus === 'INVESTIGATING'
            ? null
            : w.resolved_at,
        };
      }),
    );
    setAuditEvents((prev) => [
      ...prev,
      {
        id: makeAuditId(),
        work_item_id: id,
        kind: 'REOPEN',
        from_status: from,
        to_status: payload.targetStatus,
        actor: 'you@sre-team',
        timestamp: now,
        reason_category: payload.reasonCategory as AuditEvent['reason_category'],
        justification: payload.justification,
      },
    ]);
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background font-mono text-foreground">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-card px-3 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Shield className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate text-[11px] font-bold md:text-xs">Incident Command</span>
          <span className="hidden rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary sm:inline">
            SRE Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-foreground">
              <Zap className="h-3 w-3 text-severity-medium" aria-hidden />
              {totalCount} total
            </span>
            <span className="flex items-center gap-1 text-severity-low">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              {resolvedCount} resolved
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span
              className={cn('h-2 w-2 rounded-full bg-severity-low shadow-[0_0_8px_hsl(var(--severity-low))]', 'animate-pulse-live')}
              aria-hidden
            />
            <span className="hidden sm:inline">Live</span>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <LiveFeedSidebar
          items={activeItems}
          selectedId={selectedId}
          onSelect={setSelectedId}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((c) => !c)}
        />
        <IncidentDetail
          workItem={selected}
          signals={itemSignals}
          auditEvents={auditEvents}
          onTransition={handleTransition}
          onSubmitRCA={handleSubmitRCA}
          onReopen={handleReopen}
        />
      </div>
    </div>
  );
}
