import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  REOPEN_REASON_CATEGORIES,
  REOPEN_TARGET_STATUSES,
  type ReopenReasonCategory,
  type WorkItem,
  type WorkItemStatus,
} from '@/data/incidents';
import { toast } from '@/hooks/use-toast';

interface ReopenPayload {
  targetStatus: WorkItemStatus;
  reasonCategory: ReopenReasonCategory;
  justification: string;
}

interface ReopenDialogProps {
  workItem: WorkItem;
  onReopen: (payload: ReopenPayload) => void;
}

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  OPEN: 'OPEN — re-triage',
  INVESTIGATING: 'INVESTIGATING — active work',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
};

export function ReopenDialog({ workItem, onReopen }: ReopenDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [targetStatus, setTargetStatus] = React.useState<WorkItemStatus>('INVESTIGATING');
  const [reasonCategory, setReasonCategory] = React.useState<ReopenReasonCategory | ''>('');
  const [justification, setJustification] = React.useState('');

  const reset = () => {
    setTargetStatus('INVESTIGATING');
    setReasonCategory('');
    setJustification('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonCategory) {
      toast({ variant: 'destructive', title: 'Reason required', description: 'Select a reopen reason category.' });
      return;
    }
    if (justification.trim().length < 10) {
      toast({ variant: 'destructive', title: 'Justification too short', description: 'Provide at least 10 characters of justification.' });
      return;
    }
    onReopen({ targetStatus, reasonCategory: reasonCategory as ReopenReasonCategory, justification: justification.trim() });
    toast({
      title: `Incident reopened`,
      description: `${workItem.id} moved back to ${targetStatus}. Reason logged.`,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 border border-border text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:border-severity-medium hover:text-severity-medium"
        >
          <AlertTriangle className="h-3 w-3" />
          Reopen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md font-mono">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-severity-medium" />
            <DialogTitle>Reopen Incident — {workItem.id}</DialogTitle>
          </div>
          <DialogDescription>
            This is an exceptional action. Provide a reason category and justification for audit traceability.
          </DialogDescription>
        </DialogHeader>

        <form className="mt-1 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="rounded-md border border-severity-medium/30 bg-severity-medium/5 px-3 py-2 text-[10px] text-severity-medium">
            <span className="font-bold uppercase tracking-wider">Warning:</span> reopening creates an audit record
            and increments the reopen counter on this incident.
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider">Target status</Label>
            <Select value={targetStatus} onValueChange={(v) => setTargetStatus(v as WorkItemStatus)}>
              <SelectTrigger className="text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REOPEN_TARGET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s} className="text-[11px]">
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider">Reason category <span className="text-severity-critical">*</span></Label>
            <Select value={reasonCategory} onValueChange={(v) => setReasonCategory(v as ReopenReasonCategory)}>
              <SelectTrigger className="text-[11px]">
                <SelectValue placeholder="Select reason…" />
              </SelectTrigger>
              <SelectContent>
                {REOPEN_REASON_CATEGORIES.map((r) => (
                  <SelectItem key={r} value={r} className="text-[11px]">
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-wider">
              Justification <span className="text-severity-critical">*</span>
              <span className="ml-1 normal-case tracking-normal text-muted-foreground">(min 10 chars)</span>
            </Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Describe why this incident must be reopened…"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" className="text-[10px]" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="gap-1.5 bg-severity-medium/10 text-[10px] font-bold uppercase tracking-wider text-severity-medium hover:bg-severity-medium/20 border border-severity-medium/40"
            >
              <AlertTriangle className="h-3 w-3" />
              Confirm Reopen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
