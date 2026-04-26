"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import * as seed from "@/lib/console-mock";

// ── Types ────────────────────────────────────────────────────────────────────
// Kept deliberately close to the seed mock shape so existing components don't
// need rewrites. When wiring to real backend, swap the reducer for API calls.

export type Agent = {
  id: string;
  name: string;
  function: string;
  runs: number;
  avgMs: number;
  accuracy: number;
  status: "healthy" | "watch";
  createdAt: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: string;
  agents: string[];
  runs: number;
  status: "active" | "paused";
  createdAt: string;
};

export type FinetuneJob = {
  id: string;
  base: string;
  dataset?: string;
  status: "queued" | "running" | "deployed";
  progress: number;
  eta: string;
  stage: string;
  started: string;
};

export type Notification = {
  id: string;
  when: string;
  actor: string;
  text: string;
  kind: "agent" | "train" | "deploy" | "data" | "system";
  read: boolean;
};

export type Tenant = typeof seed.tenant;
export type Kpi = (typeof seed.kpis)[number];
export type DataSource = (typeof seed.dataSources)[number];

export type State = {
  tenant: Tenant;
  kpis: Kpi[];
  agents: Agent[];
  workflows: Workflow[];
  finetuneJobs: FinetuneJob[];
  dataSources: DataSource[];
  notifications: Notification[];
  search: string;
};

type Action =
  | { type: "ADD_AGENT"; agent: Omit<Agent, "id" | "createdAt"> }
  | {
      type: "ADD_WORKFLOW";
      workflow: Omit<Workflow, "id" | "createdAt" | "runs" | "status">;
    }
  | {
      type: "ADD_FINETUNE";
      job: { name: string; base: string; dataset: string };
    }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | {
      type: "ADD_NOTIFICATION";
      notification: Omit<Notification, "id" | "read">;
    }
  | { type: "SET_SEARCH"; q: string }
  | { type: "HYDRATE"; state: State };

// ── Initial state from seed mock ─────────────────────────────────────────────

function buildInitialState(): State {
  const now = new Date().toISOString();
  return {
    tenant: seed.tenant,
    kpis: seed.kpis,
    agents: seed.agentRuns.map((a, i) => ({
      ...a,
      id: `ag-${i + 1}`,
      createdAt: now,
    })),
    workflows: [
      {
        id: "wf-1",
        name: "Pharmacovigilance triage",
        description: "Auto-triage incoming ICSRs and route ambiguous cases to SMEs.",
        trigger: "Inbox · sentinel",
        agents: ["ICSR triage agent"],
        runs: 412,
        status: "active",
        createdAt: now,
      },
      {
        id: "wf-2",
        name: "MSL field copilot",
        description: "Cardiology Q&A grounded on approved KOL content.",
        trigger: "Slack · #msl-field",
        agents: ["MSL field copilot"],
        runs: 287,
        status: "active",
        createdAt: now,
      },
      {
        id: "wf-3",
        name: "Pre-visit summarizer",
        description: "Summarize EHR encounters before clinic appointments.",
        trigger: "Cron · 06:00 IST daily",
        agents: ["Pre-visit EHR summarizer"],
        runs: 1142,
        status: "active",
        createdAt: now,
      },
      {
        id: "wf-4",
        name: "Promotional compliance",
        description: "Review marketing assets against regulatory rules.",
        trigger: "Webhook · approval API",
        agents: ["Promotional compliance reviewer"],
        runs: 64,
        status: "paused",
        createdAt: now,
      },
    ],
    finetuneJobs: seed.finetuneJobs as FinetuneJob[],
    dataSources: seed.dataSources,
    notifications: seed.activityFeed.map((a, i) => ({
      ...a,
      id: `nt-${i + 1}`,
      read: i > 1, // first 2 are unread, rest are read
    })),
    search: "",
  };
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "ADD_AGENT": {
      const id = uid("ag");
      const createdAt = new Date().toISOString();
      const agent: Agent = { ...action.agent, id, createdAt };
      const note: Notification = {
        id: uid("nt"),
        when: "just now",
        actor: agent.name,
        text: "agent created · awaiting first run",
        kind: "agent",
        read: false,
      };
      return {
        ...state,
        agents: [agent, ...state.agents],
        notifications: [note, ...state.notifications],
      };
    }

    case "ADD_WORKFLOW": {
      const id = uid("wf");
      const createdAt = new Date().toISOString();
      const workflow: Workflow = {
        ...action.workflow,
        id,
        createdAt,
        runs: 0,
        status: "active",
      };
      const note: Notification = {
        id: uid("nt"),
        when: "just now",
        actor: workflow.name,
        text: `workflow activated · trigger ${workflow.trigger}`,
        kind: "deploy",
        read: false,
      };
      return {
        ...state,
        workflows: [workflow, ...state.workflows],
        notifications: [note, ...state.notifications],
      };
    }

    case "ADD_FINETUNE": {
      const id = uid("ft");
      const job: FinetuneJob = {
        id,
        base: action.job.base,
        dataset: action.job.dataset,
        status: "queued",
        progress: 0,
        eta: "queued",
        stage: "Queued · waiting for GPU",
        started: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      const note: Notification = {
        id: uid("nt"),
        when: "just now",
        actor: action.job.name,
        text: `fine-tune job queued · base ${action.job.base}`,
        kind: "train",
        read: false,
      };
      return {
        ...state,
        finetuneJobs: [job, ...state.finetuneJobs],
        notifications: [note, ...state.notifications],
      };
    }

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          { ...action.notification, id: uid("nt"), read: false },
          ...state.notifications,
        ],
      };

    case "SET_SEARCH":
      return { ...state, search: action.q };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

type ConsoleStore = {
  state: State;
  dispatch: React.Dispatch<Action>;
};

const ConsoleContext = createContext<ConsoleStore | null>(null);

const STORAGE_KEY = "evarx.console.v1";

export function ConsoleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const hydrated = useRef(false);

  // Hydrate from localStorage on mount (client-only).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as State;
      // Defensive: only hydrate if shape looks right (key fields present).
      if (parsed && Array.isArray(parsed.agents) && parsed.tenant) {
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // ignore corrupt storage; fall back to seed state
    }
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // quota / private mode — silently ignore
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}

export function useConsole() {
  const ctx = useContext(ConsoleContext);
  if (!ctx) {
    throw new Error("useConsole must be used inside <ConsoleProvider>");
  }
  return ctx;
}

/** Convenience: clears persisted demo state and reseeds. Used by the
 *  "reset demo" affordance in the live-preview banner. */
export function resetConsoleState() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
  if (typeof window !== "undefined") window.location.reload();
}
