import { cn } from '@/lib/utils';
import type { SeverityLevel, WorkItemStatus } from '@/data/incidents';
import { formatDistanceToNow } from 'date-fns';

const severityDot: Record<SeverityLevel, string> = {
  P0: 'bg-severity-critical',
  P1: 'bg-severity-medium',
  P2: 'bg-severity-low',
};

const severityLabel: Record<SeverityLevel, string> = {
  P0: 'text-severity-critical',
  P1: 'text-severity-medium',
  P2: 'text-severity-low',
};

export function SeverityBadge({ severity, className }: { severity: SeverityLevel; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
        severityLabel[severity],
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', severityDot[severity])} aria-hidden />
      {severity}
    </span>
  );
}

const statusStyles: Record<WorkItemStatus, string> = {
  OPEN: 'border-severity-critical/50 text-severity-critical bg-severity-critical/10',
  INVESTIGATING: 'border-severity-medium/55 text-severity-medium bg-severity-medium/12',
  RESOLVED: 'border-severity-low/50 text-severity-low bg-severity-low/10',
  CLOSED: 'border-primary/45 text-primary bg-primary/10',
};

export function StatusBadge({ status, className }: { status: WorkItemStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider',
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

export function formatTimeAgo(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
