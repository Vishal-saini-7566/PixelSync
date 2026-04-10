"use client";

import React from "react";
import type { CanvasObject } from "@/store/useCanvasStore";

interface LayersPanelProps {
  objects: CanvasObject[]; selectedIds: string[];
  onSelect: (id: string, multiSelect: boolean) => void;
  onToggleVisible: (id: string) => void; onToggleLock: (id: string) => void;
  onReorder: (id: string, direction: "up" | "down") => void; onDelete: (id: string) => void;
}

export function LayersPanel({ objects, selectedIds, onSelect, onToggleVisible, onToggleLock, onReorder, onDelete }: LayersPanelProps) {
  const reversed = [...objects].reverse();

  return (
    <div className="absolute right-4 top-4 z-40 flex w-56 flex-col rounded-2xl border border-white/10 bg-zinc-900/90 shadow-2xl backdrop-blur-xl overflow-hidden text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs font-semibold uppercase text-zinc-500">Layers</div>
      <div className="flex-1 overflow-y-auto p-1.5 max-h-[calc(100vh-160px)] scrollbar-thin">
        {reversed.map((obj) => (
          <div key={obj.id} onClick={(e) => onSelect(obj.id, e.shiftKey)} className={`group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors ${selectedIds.includes(obj.id) ? "bg-blue-500/20 text-blue-300" : "hover:bg-zinc-800"}`}>
            <span className="flex-1 truncate text-xs">{obj.name}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button onClick={(e) => { e.stopPropagation(); onReorder(obj.id, "up"); }} className="hover:text-blue-400">↑</button>
              <button onClick={(e) => { e.stopPropagation(); onReorder(obj.id, "down"); }} className="hover:text-blue-400">↓</button>
              <button onClick={(e) => { e.stopPropagation(); onDelete(obj.id); }} className="hover:text-red-400 text-lg leading-none">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}