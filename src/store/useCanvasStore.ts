import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type ShapeType = "rect" | "ellipse" | "text" | "image" | "line";
export interface CanvasObject {
  id: string; type: ShapeType; x: number; y: number; width: number; height: number;
  rotation: number; fill: string; stroke: string; strokeWidth: number; opacity: number;
  draggable: boolean; locked: boolean; visible: boolean; name: string;
  text?: string; fontSize?: number;
}
export type Tool = "select" | "rect" | "ellipse" | "text" | "hand" | "line";

export interface CanvasState {
  objects: CanvasObject[];
  selectedIds: string[];
  draftObject: CanvasObject | null;
  activeTool: Tool;
  stageScale: number;
  stagePosition: { x: number; y: number };
  addObject: (obj: CanvasObject) => void;
  updateObject: (id: string, patch: Partial<CanvasObject>) => void;
  removeObject: (id: string) => void;
  setObjects: (objects: CanvasObject[]) => void;
  reorderObject: (id: string, direction: "up" | "down") => void;
  setDraftObject: (obj: CanvasObject | null) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  setActiveTool: (tool: Tool) => void;
  setStageScale: (scale: number) => void;
  setStagePosition: (pos: { x: number; y: number }) => void;
}

export const useCanvasStore = create<CanvasState>()(
  subscribeWithSelector((set) => ({
    objects: [], selectedIds: [], draftObject: null, activeTool: "select",
    stageScale: 1, stagePosition: { x: 0, y: 0 },
    addObject: (obj) => set((s) => ({ objects: [...s.objects, obj] })),
    updateObject: (id, patch) => set((s) => ({ objects: s.objects.map((o) => (o.id === id ? { ...o, ...patch } : o)) })),
    removeObject: (id) => set((s) => ({ objects: s.objects.filter((o) => o.id !== id), selectedIds: s.selectedIds.filter((sid) => sid !== id) })),
    setObjects: (objects) => set({ objects }),
    reorderObject: (id, direction) => set((s) => {
      const arr = [...s.objects];
      const idx = arr.findIndex((o) => o.id === id);
      if (idx === -1) return s;
      const newIdx = direction === "up" ? Math.min(idx + 1, arr.length - 1) : Math.max(idx - 1, 0);
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return { objects: arr };
    }),
    setDraftObject: (obj) => set({ draftObject: obj }),
    setSelectedIds: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    setActiveTool: (tool) => set({ activeTool: tool, selectedIds: [] }),
    setStageScale: (stageScale) => set({ stageScale }),
    setStagePosition: (stagePosition) => set({ stagePosition }),
  }))
);