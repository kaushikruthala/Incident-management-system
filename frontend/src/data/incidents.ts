export type SeverityLevel = 'P0' | 'P1' | 'P2';
export type WorkItemStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';

export interface WorkItem {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: WorkItemStatus;
  service: string;
  component_id: string;
  first_signal_at: string;
  resolved_at: string | null;
  signal_count: number;
}

export interface RawSignal {
  _id: string;
  component_id: string;
  timestamp: string;
  work_item_id: string | null;
  payload: Record<string, unknown>;
}

export interface RCARecord {
  work_item_id: string;
  root_cause_category: string;
  fix_applied: string;
  prevention_steps: string;
  incident_start: string;
  incident_end: string;
}

export const VALID_TRANSITIONS: Record<WorkItemStatus, WorkItemStatus[]> = {
  OPEN: ['INVESTIGATING'],
  INVESTIGATING: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

/** Statuses an incident can be reopened TO (exceptional backward path). */
export const REOPEN_TARGET_STATUSES: WorkItemStatus[] = ['OPEN', 'INVESTIGATING'];

export const REOPEN_REASON_CATEGORIES = [
  'Regression — fix did not hold',
  'Incomplete Fix — partial remediation only',
  'Customer Recurrence — new reports after close',
  'Incorrect Root Cause — initial diagnosis wrong',
  'Monitoring Gap — alert fired again',
  'Follow-on Impact — downstream service affected',
  'Compliance / Audit Request',
  'Other',
] as const;

export type ReopenReasonCategory = (typeof REOPEN_REASON_CATEGORIES)[number];

export type AuditEventKind = 'TRANSITION' | 'REOPEN' | 'RCA_SUBMITTED';

export interface AuditEvent {
  id: string;
  work_item_id: string;
  kind: AuditEventKind;
  from_status: WorkItemStatus;
  to_status: WorkItemStatus;
  actor: string;
  timestamp: string;
  reason_category?: ReopenReasonCategory;
  justification?: string;
}

export const RCA_ROOT_CAUSE_CATEGORIES = [
  'Human Error',
  'Software Bug',
  'Infrastructure Failure',
  'Configuration Drift',
  'External Dependency',
  'Network Issue',
  'Capacity Exhaustion',
  'Security Incident',
  'Other',
] as const;

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'wi-001',
    title: 'Payment Gateway Timeout',
    severity: 'P0',
    status: 'OPEN',
    service: 'payment-svc',
    component_id: 'pay-gw-01',
    first_signal_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 142,
  },
  {
    id: 'wi-002',
    title: 'Database Connection Pool Exhausted',
    severity: 'P0',
    status: 'INVESTIGATING',
    service: 'user-db',
    component_id: 'pg-pool-03',
    first_signal_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 89,
  },
  {
    id: 'wi-003',
    title: 'Auth Service 5xx Spike',
    severity: 'P1',
    status: 'OPEN',
    service: 'auth-svc',
    component_id: 'auth-01',
    first_signal_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 67,
  },
  {
    id: 'wi-004',
    title: 'Redis Cluster Failover',
    severity: 'P1',
    status: 'INVESTIGATING',
    service: 'redis-edge',
    component_id: 'rc-02',
    first_signal_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 54,
  },
  {
    id: 'wi-005',
    title: 'CDN Edge Cache Miss Storm',
    severity: 'P2',
    status: 'OPEN',
    service: 'cdn-edge',
    component_id: 'cache-po-07',
    first_signal_at: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 201,
  },
  {
    id: 'wi-006',
    title: 'Kubernetes Pod OOMKilled',
    severity: 'P1',
    status: 'OPEN',
    service: 'billing-worker',
    component_id: 'k8s-bill-ax-12',
    first_signal_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 44,
  },
  {
    id: 'wi-007',
    title: 'Public API Latency Spike (p99)',
    severity: 'P2',
    status: 'OPEN',
    service: 'api-gateway',
    component_id: 'gw-use1-03',
    first_signal_at: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    resolved_at: null,
    signal_count: 128,
  },
  {
    id: 'wi-008',
    title: 'Disk Usage Critical — /var/log',
    severity: 'P0',
    status: 'RESOLVED',
    service: 'obs-host',
    component_id: 'log-node-14',
    first_signal_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    signal_count: 36,
  },
];

export const MOCK_RAW_SIGNALS: RawSignal[] = [
  {
    _id: 'sig-001',
    component_id: 'pay-gw-01',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    work_item_id: 'wi-001',
    payload: {
      error: 'ECONNREFUSED 10.0.3.42:443',
      service: 'stripe-proxy',
      latency_ms: 30042,
      circuit_state: 'OPEN',
    },
  },
  {
    _id: 'sig-002',
    component_id: 'pay-gw-01',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    work_item_id: 'wi-001',
    payload: {
      timeout: true,
      upstream: 'payments-api',
      retries_exhausted: 5,
    },
  },
  {
    _id: 'sig-003',
    component_id: 'pg-pool-03',
    timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    work_item_id: 'wi-002',
    payload: {
      error: 'PgBouncer pool exhausted',
      active_clients: 512,
      pool_limit: 400,
    },
  },
  {
    _id: 'sig-004',
    component_id: 'pg-pool-03',
    timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    work_item_id: 'wi-002',
    payload: {
      wait_event: 'ClientRead',
      blocking_pid: 88421,
      query: 'SELECT * FROM ledger WHERE …',
    },
  },
  {
    _id: 'sig-005',
    component_id: 'auth-01',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    work_item_id: 'wi-003',
    payload: {
      http_status: 503,
      error: 'upstream connect error',
      replicas_unready: 2,
    },
  },
  {
    _id: 'sig-006',
    component_id: 'auth-01',
    timestamp: new Date(Date.now() - 16 * 60 * 1000).toISOString(),
    work_item_id: 'wi-003',
    payload: {
      spike_rps: 18400,
      baseline_rps: 4200,
      saturation: 'cpu',
    },
  },
  {
    _id: 'sig-007',
    component_id: 'rc-02',
    timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
    work_item_id: 'wi-004',
    payload: {
      event: 'CLUSTER_FAILOVER',
      master: '10.2.8.1:6379',
      replica: '10.2.8.2:6379',
      failover_ms: 820,
    },
  },
  {
    _id: 'sig-008',
    component_id: 'cache-po-07',
    timestamp: new Date(Date.now() - 33 * 60 * 1000).toISOString(),
    work_item_id: 'wi-005',
    payload: {
      cache_miss_ratio: 0.91,
      origin_latency_ms: 1240,
      pop: 'bom-edge',
    },
  },
  {
    _id: 'sig-009',
    component_id: 'k8s-bill-ax-12',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    work_item_id: 'wi-006',
    payload: {
      reason: 'OOMKilled',
      memory_limit_mib: 512,
      memory_usage_mib: 511,
      exit_code: 137,
    },
  },
  {
    _id: 'sig-010',
    component_id: 'k8s-bill-ax-12',
    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
    work_item_id: 'wi-006',
    payload: {
      eviction_threshold: 'memory.pressure',
      cgroup_v2: true,
    },
  },
  {
    _id: 'sig-011',
    component_id: 'gw-use1-03',
    timestamp: new Date(Date.now() - 41 * 60 * 1000).toISOString(),
    work_item_id: 'wi-007',
    payload: {
      p99_ms: 8420,
      p50_ms: 120,
      error_budget_burn: '2.3x',
    },
  },
  {
    _id: 'sig-012',
    component_id: 'gw-use1-03',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    work_item_id: 'wi-007',
    payload: {
      dependency: 'catalog-grpc',
      breaker: 'HALF_OPEN',
    },
  },
  {
    _id: 'sig-013',
    component_id: 'log-node-14',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    work_item_id: 'wi-008',
    payload: {
      mount: '/var/log',
      use_percent: 96,
      inode_use_percent: 88,
    },
  },
  {
    _id: 'sig-014',
    component_id: 'log-node-14',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    work_item_id: 'wi-008',
    payload: {
      logrotate: 'failed',
      largest_file: '/var/log/audit/audit.log',
      size_gib: 42,
    },
  },
  {
    _id: 'sig-015',
    component_id: 'rc-02',
    timestamp: new Date(Date.now() - 23 * 60 * 1000).toISOString(),
    work_item_id: 'wi-004',
    payload: {
      replication_lag_ms: 140,
      partial_resync: true,
    },
  },
];

const SEVERITY_ORDER: Record<SeverityLevel, number> = { P0: 0, P1: 1, P2: 2 };

export function sortBySeverity(items: WorkItem[]): WorkItem[] {
  return [...items].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

export function signalsForWorkItem(signals: RawSignal[], workItemId: string): RawSignal[] {
  return signals.filter((s) => s.work_item_id === workItemId);
}

export function isActiveWorkItem(item: WorkItem): boolean {
  return item.status !== 'CLOSED';
}

export function canTransition(from: WorkItemStatus, to: WorkItemStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
