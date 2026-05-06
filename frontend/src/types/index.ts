export type SeverityLevel = "P0" | "P1" | "P2";
export type WorkItemStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "CLOSED";

export interface WorkItem {
  id: string; title: string; severity: SeverityLevel; status: WorkItemStatus;
  service: string; component_id: string; first_signal_at: string;
  resolved_at: string | null; signal_count: number;
}

export interface RawSignal {
  _id: string; component_id: string; timestamp: string;
  work_item_id: string | null; payload: Record<string, any>;
}
