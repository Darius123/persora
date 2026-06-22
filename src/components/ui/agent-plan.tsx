"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, CircleDotDashed } from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

type Status = "pending" | "in-progress" | "completed";

interface Subtask {
  id: string;
  title: string;
  status: Status;
}

interface AgentTask {
  id: string;
  name: string;
  status: Status;
  subtasks: Subtask[];
}

const INITIAL: AgentTask[] = [
  {
    id: "analyst",
    name: "The Analyst",
    status: "in-progress",
    subtasks: [
      { id: "a1", title: "Gathering market data", status: "pending" },
      { id: "a2", title: "Analyzing recent trends", status: "pending" },
      { id: "a3", title: "Computing probability estimate", status: "pending" },
    ],
  },
  {
    id: "skeptic",
    name: "The Skeptic",
    status: "in-progress",
    subtasks: [
      { id: "s1", title: "Identifying counter-arguments", status: "pending" },
      { id: "s2", title: "Evaluating risk factors", status: "pending" },
      { id: "s3", title: "Stress-testing assumptions", status: "pending" },
    ],
  },
  {
    id: "historian",
    name: "The Historian",
    status: "in-progress",
    subtasks: [
      { id: "h1", title: "Reviewing historical precedents", status: "pending" },
      { id: "h2", title: "Assessing base rates", status: "pending" },
      { id: "h3", title: "Identifying analogous events", status: "pending" },
    ],
  },
  {
    id: "synth",
    name: "Synthesizing Verdict",
    status: "pending",
    subtasks: [
      { id: "sy1", title: "Weighing agent outputs", status: "pending" },
      { id: "sy2", title: "Computing confidence score", status: "pending" },
    ],
  },
  {
    id: "storage",
    name: "Writing to 0G Storage",
    status: "pending",
    subtasks: [
      { id: "st1", title: "Encoding verdict hash", status: "pending" },
      { id: "st2", title: "Broadcasting to network", status: "pending" },
    ],
  },
];

// [taskId, subtaskId | null, newStatus]
type Change = [string, string | null, Status];

const SEQUENCE: { time: number; changes: Change[] }[] = [
  { time: 1200, changes: [["analyst","a1","in-progress"],["skeptic","s1","in-progress"],["historian","h1","in-progress"]] },
  { time: 3500, changes: [["analyst","a1","completed"],["skeptic","s1","completed"],["historian","h1","completed"]] },
  { time: 4000, changes: [["analyst","a2","in-progress"],["skeptic","s2","in-progress"],["historian","h2","in-progress"]] },
  { time: 7000, changes: [["analyst","a2","completed"],["skeptic","s2","completed"],["historian","h2","completed"]] },
  { time: 7500, changes: [["analyst","a3","in-progress"],["skeptic","s3","in-progress"],["historian","h3","in-progress"]] },
  { time: 11000, changes: [
    ["analyst","a3","completed"],["skeptic","s3","completed"],["historian","h3","completed"],
    ["analyst",null,"completed"],["skeptic",null,"completed"],["historian",null,"completed"],
    ["synth",null,"in-progress"],["synth","sy1","in-progress"],
  ]},
  { time: 13500, changes: [["synth","sy1","completed"],["synth","sy2","in-progress"]] },
  { time: 16000, changes: [
    ["synth","sy2","completed"],["synth",null,"completed"],
    ["storage",null,"in-progress"],["storage","st1","in-progress"],
  ]},
  { time: 18500, changes: [["storage","st1","completed"],["storage","st2","in-progress"]] },
  { time: 21000, changes: [["storage","st2","completed"],["storage",null,"completed"]] },
];

function applyChanges(tasks: AgentTask[], changes: Change[]): AgentTask[] {
  return tasks.map((task) => {
    const taskChanges = changes.filter(([tid]) => tid === task.id);
    if (taskChanges.length === 0) return task;

    let newStatus = task.status;
    const newSubtasks = [...task.subtasks];

    for (const [, subtaskId, status] of taskChanges) {
      if (subtaskId === null) {
        newStatus = status;
      } else {
        const idx = newSubtasks.findIndex((s) => s.id === subtaskId);
        if (idx !== -1) newSubtasks[idx] = { ...newSubtasks[idx], status };
      }
    }

    return { ...task, status: newStatus, subtasks: newSubtasks };
  });
}

function completeAll(tasks: AgentTask[]): AgentTask[] {
  return tasks.map((task) => ({
    ...task,
    status: "completed",
    subtasks: task.subtasks.map((s) => ({ ...s, status: "completed" })),
  }));
}

function StatusIcon({ status, size = 16 }: { status: Status; size?: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
        transition={{ duration: 0.18 }}
      >
        {status === "completed" ? (
          <CheckCircle2 size={size} className="text-white" />
        ) : status === "in-progress" ? (
          <CircleDotDashed size={size} className="text-[#888]" />
        ) : (
          <Circle size={size} className="text-[#333]" />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    "completed":   "bg-[#111] text-white border-[#222]",
    "in-progress": "bg-[#0d0d0d] text-[#888] border-[#222]",
    "pending":     "bg-[#0d0d0d] text-[#333] border-[#1a1a1a]",
  };
  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={`rounded px-1.5 py-0.5 text-[10px] font-mono border ${styles[status]}`}
    >
      {status}
    </motion.span>
  );
}

export default function AgentPlan({ isComplete }: { isComplete: boolean }) {
  const [tasks, setTasks] = useState<AgentTask[]>(INITIAL);
  const [expanded, setExpanded] = useState<string[]>(["analyst", "skeptic", "historian"]);

  useEffect(() => {
    if (isComplete) {
      setTasks(completeAll(INITIAL));
      setExpanded(["analyst", "skeptic", "historian", "synth", "storage"]);
      return;
    }

    const timers = SEQUENCE.map(({ time, changes }) =>
      setTimeout(() => setTasks((prev) => applyChanges(prev, changes)), time)
    );
    return () => timers.forEach(clearTimeout);
  }, [isComplete]);

  const toggle = (id: string) =>
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  return (
    <div className="flex flex-col gap-1">
      <LayoutGroup>
        {tasks.map((task) => {
          const isOpen = expanded.includes(task.id);
          return (
            <motion.div key={task.id} layout>
              {/* Task row */}
              <motion.div
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#0d0d0d] transition-colors"
                onClick={() => toggle(task.id)}
                layout
              >
                <div className="shrink-0">
                  <StatusIcon status={task.status} size={15} />
                </div>
                <span
                  className={`flex-1 text-sm font-mono ${
                    task.status === "completed" ? "text-[#555] line-through" :
                    task.status === "in-progress" ? "text-white" : "text-[#444]"
                  }`}
                >
                  {task.name}
                </span>
                <StatusBadge status={task.status} />
              </motion.div>

              {/* Subtasks */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="overflow-hidden"
                  >
                    <div className="relative ml-3 pl-4 border-l border-dashed border-[#1a1a1a] mt-0.5 mb-1 flex flex-col gap-0.5">
                      {task.subtasks.map((sub) => (
                        <motion.div
                          key={sub.id}
                          layout
                          className="flex items-center gap-2 px-2 py-1 rounded"
                        >
                          <div className="shrink-0">
                            <StatusIcon status={sub.status} size={12} />
                          </div>
                          <span
                            className={`text-xs font-mono ${
                              sub.status === "completed" ? "text-[#444] line-through" :
                              sub.status === "in-progress" ? "text-[#888]" : "text-[#333]"
                            }`}
                          >
                            {sub.title}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </LayoutGroup>
    </div>
  );
}
