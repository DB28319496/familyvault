"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Target,
  CalendarDays,
  StickyNote,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn, getPhaseColor, getPhaseLabel } from "@/lib/utils";
import { useActionItems } from "@/lib/hooks/use-data";
import type { ActionItem } from "@/lib/types";

type Status = "not_started" | "in_progress" | "complete";

const STATUS_CYCLE: Status[] = ["not_started", "in_progress", "complete"];

const STATUS_CONFIG: Record<Status, { label: string; icon: typeof Circle; className: string }> = {
  not_started: { label: "Not Started", icon: Circle, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  in_progress: { label: "In Progress", icon: Clock, className: "bg-amber/15 text-amber" },
  complete: { label: "Complete", icon: CheckCircle2, className: "bg-teal/15 text-teal" },
};

const PHASE_COLORS: Record<number, string> = {
  1: "#B85450",
  2: "#B8922E",
  3: "#3B7D62",
  4: "#456282",
};

const inputClass =
  "bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 w-full";

interface NewItemForm {
  title: string;
  description: string;
  phase: number;
  target_date: string;
  notes: string;
}

const emptyForm: NewItemForm = {
  title: "",
  description: "",
  phase: 1,
  target_date: "",
  notes: "",
};

export default function ActionPlanPage() {
  const { data: items, loading, update, insert, remove } = useActionItems();
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1, 2, 3, 4]));
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<NewItemForm>(emptyForm);
  const [addingItem, setAddingItem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    target_date: string;
    notes: string;
  }>({ title: "", description: "", target_date: "", notes: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const phases = [1, 2, 3, 4] as const;

  const phaseItems = useMemo(() => {
    const map: Record<number, ActionItem[]> = { 1: [], 2: [], 3: [], 4: [] };
    items.forEach((item) => {
      if (map[item.phase]) map[item.phase].push(item);
    });
    return map;
  }, [items]);

  const phaseProgress = useMemo(() => {
    const progress: Record<number, { completed: number; total: number; percent: number }> = {};
    phases.forEach((phase) => {
      const phaseList = phaseItems[phase];
      const completed = phaseList.filter((i) => i.status === "complete").length;
      progress[phase] = {
        completed,
        total: phaseList.length,
        percent: phaseList.length > 0 ? (completed / phaseList.length) * 100 : 0,
      };
    });
    return progress;
  }, [phaseItems]);

  const overallCompleted = items.filter((i) => i.status === "complete").length;
  const overallPercent = items.length > 0 ? (overallCompleted / items.length) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Action Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">Loading...</p>
        </div>
        <Card>
          <div className="h-32 animate-pulse bg-surface-hover rounded" />
        </Card>
      </div>
    );
  }

  const togglePhase = (phase: number) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) next.delete(phase);
      else next.add(phase);
      return next;
    });
  };

  const cycleStatus = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const currentIdx = STATUS_CYCLE.indexOf(item.status as Status);
    const nextStatus = STATUS_CYCLE[(currentIdx + 1) % STATUS_CYCLE.length];
    await update(itemId, {
      status: nextStatus,
      completed_date: nextStatus === "complete" ? new Date().toISOString().split("T")[0] : null,
    });
  };

  const handleAddItem = async () => {
    if (!addForm.title.trim()) return;
    setAddingItem(true);
    try {
      await insert({
        title: addForm.title.trim(),
        description: addForm.description.trim() || null,
        phase: addForm.phase,
        status: "not_started" as const,
        target_date: addForm.target_date || null,
        notes: addForm.notes.trim() || null,
        sort_order: phaseItems[addForm.phase].length,
      });
      setAddForm(emptyForm);
      setShowAddForm(false);
      // Make sure the phase is expanded so user sees the new item
      setExpandedPhases((prev) => new Set([...prev, addForm.phase]));
    } finally {
      setAddingItem(false);
    }
  };

  const startEditing = (item: ActionItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description || "",
      target_date: item.target_date || "",
      notes: item.notes || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const saveEdit = async (itemId: string) => {
    if (!editForm.title.trim()) return;
    setSavingEdit(true);
    try {
      await update(itemId, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        target_date: editForm.target_date || null,
        notes: editForm.notes.trim() || null,
      });
      setEditingId(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      await remove(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Action Plan</h1>
          <p className="text-muted-foreground text-sm mt-1">Your financial roadmap — phase by phase</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <Card>
          <CardTitle>New Action Item</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
              <input
                type="text"
                placeholder="e.g., Set up emergency fund"
                value={addForm.title}
                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
              <input
                type="text"
                placeholder="Optional details..."
                value={addForm.description}
                onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Phase</label>
              <select
                value={addForm.phase}
                onChange={(e) => setAddForm((f) => ({ ...f, phase: Number(e.target.value) }))}
                className={inputClass}
              >
                <option value={1}>Phase 1 — {getPhaseLabel(1)}</option>
                <option value={2}>Phase 2 — {getPhaseLabel(2)}</option>
                <option value={3}>Phase 3 — {getPhaseLabel(3)}</option>
                <option value={4}>Phase 4 — {getPhaseLabel(4)}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
              <input
                type="date"
                value={addForm.target_date}
                onChange={(e) => setAddForm((f) => ({ ...f, target_date: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
              <input
                type="text"
                placeholder="Any additional notes..."
                value={addForm.notes}
                onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleAddItem}
              disabled={!addForm.title.trim() || addingItem}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {addingItem ? "Adding..." : "Add Item"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setAddForm(emptyForm);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Overall progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <CardTitle>Overall Progress</CardTitle>
          <span className="text-sm font-bold text-foreground">
            {overallCompleted}/{items.length} complete
          </span>
        </div>
        <ProgressBar value={overallPercent} color="bg-teal" size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round(overallPercent)}% of your financial plan is complete
        </p>

        {/* Phase summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {phases.map((phase) => (
            <div
              key={phase}
              className="rounded-lg p-3 border border-border"
              style={{ borderLeftWidth: 3, borderLeftColor: PHASE_COLORS[phase] }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: PHASE_COLORS[phase] }}>
                Phase {phase}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{getPhaseLabel(phase)}</p>
              <div className="flex items-center gap-2 mt-2">
                <ProgressBar
                  value={phaseProgress[phase].percent}
                  color={`bg-[${PHASE_COLORS[phase]}]`}
                  size="sm"
                  className="flex-1"
                />
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {phaseProgress[phase].completed}/{phaseProgress[phase].total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline / Phase Sections */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const isExpanded = expandedPhases.has(phase);
          const progress = phaseProgress[phase];
          const color = PHASE_COLORS[phase];

          return (
            <Card key={phase} className="overflow-hidden p-0">
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase)}
                className="w-full flex items-center gap-4 p-5 hover:bg-surface-hover transition text-left"
              >
                {/* Color indicator */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ backgroundColor: color }}
                >
                  {phase}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{getPhaseLabel(phase)}</h2>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      Phase {phase}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <ProgressBar value={progress.percent} size="sm" className="flex-1 max-w-48" />
                    <span className="text-xs text-muted-foreground">
                      {progress.completed}/{progress.total} complete
                    </span>
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
              </button>

              {/* Action items */}
              {isExpanded && (
                <div className="border-t border-border">
                  {phaseItems[phase].length === 0 && (
                    <div className="p-5 text-sm text-muted-foreground text-center">
                      No action items in this phase yet.
                    </div>
                  )}
                  {phaseItems[phase].map((item, idx) => {
                    const status = item.status as Status;
                    const config = STATUS_CONFIG[status];
                    const StatusIcon = config.icon;
                    const isEditing = editingId === item.id;
                    const isDeleting = deletingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "group flex items-start gap-4 p-5",
                          idx < phaseItems[phase].length - 1 && "border-b border-border"
                        )}
                      >
                        {/* Timeline dot */}
                        <div className="relative flex flex-col items-center pt-1">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                status === "complete"
                                  ? "#3B7D62"
                                  : status === "in_progress"
                                  ? "#B8922E"
                                  : `${color}40`,
                            }}
                          />
                          {idx < phaseItems[phase].length - 1 && (
                            <div className="w-px flex-1 bg-border mt-2 min-h-[20px]" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            /* Edit mode */
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Title</label>
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                                <input
                                  type="text"
                                  value={editForm.description}
                                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                                  placeholder="Optional description..."
                                  className={inputClass}
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Target Date</label>
                                  <input
                                    type="date"
                                    value={editForm.target_date}
                                    onChange={(e) => setEditForm((f) => ({ ...f, target_date: e.target.value }))}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
                                  <input
                                    type="text"
                                    value={editForm.notes}
                                    onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                                    placeholder="Optional notes..."
                                    className={inputClass}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => saveEdit(item.id)}
                                  disabled={!editForm.title.trim() || savingEdit}
                                  className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  {savingEdit ? "Saving..." : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View mode */
                            <>
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      "font-medium text-foreground",
                                      status === "complete" && "line-through text-muted-foreground"
                                    )}
                                  >
                                    {item.title}
                                  </p>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {/* Edit button */}
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition"
                                    title="Edit item"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isDeleting}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-coral hover:bg-coral/10 transition disabled:opacity-50"
                                    title="Delete item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Status badge */}
                                  <button
                                    onClick={() => cycleStatus(item.id)}
                                    className={cn(
                                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition hover:opacity-80",
                                      config.className
                                    )}
                                  >
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    {config.label}
                                  </button>
                                </div>
                              </div>

                              {/* Meta row */}
                              <div className="flex items-center gap-4 mt-2">
                                {item.target_date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    <span>
                                      Target:{" "}
                                      {new Date(item.target_date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                                {item.notes && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <StickyNote className="w-3.5 h-3.5" />
                                    <span>{item.notes}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <Card>
        <CardTitle>Status Legend</CardTitle>
        <div className="flex flex-wrap gap-4 mt-3">
          {STATUS_CYCLE.map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.className)}>
                  <Icon className="w-3.5 h-3.5" />
                  {config.label}
                </div>
                <span className="text-xs text-muted-foreground">Click to cycle</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
