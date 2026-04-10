"use client";

import React from "react";
import type { Tool } from "@/store/useCanvasStore";

interface ToolbarProps {
  activeTool: Tool; onToolChange: (tool: Tool) => void;
  onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean;
}

const TOOLS: { id: Tool; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: "select", label: "Select", shortcut: "V", icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M0 0l6.5 16 2.5-5.5L14.5 16 16 14.5l-5.5-5.5L16 6.5z" /></svg> },
  { id: "hand", label: "Pan", shortcut: "H", icon: <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 0a1 1 0 0 1 1 1v5.268l.802-.802A1 1 0 0 1 11 6v.268l.535-.268A1 1 0 0 1 13 7v5a5 5 0 0 1-10 0V6a1 1 0 0 1 2 0v3h1V1a1 1 0 0 1 1-1z" /></svg> },
  { id: "rect", label: "Rect", shortcut: "R", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><rect x="2" y="3" width="12" height="10" rx="1" /></svg> },
  { id: "ellipse", label: "Ellipse", shortcut: "O", icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><ellipse cx="8" cy="8" rx="6" ry="5" /></svg> },
];

export function Toolbar({ activeTool, onToolChange, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  return (
    <div className="absolute left-1/2 bottom-6 z-40 -translate-x-1/2 flex items-center gap-1 rounded-2xl border border-white/10 bg-zinc-900/90 px-2 py-1.5 shadow-2xl backdrop-blur-xl">
      {TOOLS.map((tool) => (
        <button key={tool.id} onClick={() => onToolChange(tool.id)} className={`group relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${activeTool === tool.id ? "bg-blue-500 text-white" : "text-zinc-400 hover:bg-zinc-800"}`}>
          {tool.icon}
        </button>
      ))}
      <div className="mx-1 h-6 w-px bg-white/10" />
      <button disabled={!canUndo} onClick={onUndo} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 disabled:opacity-30">↩</button>
      <button disabled={!canRedo} onClick={onRedo} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 disabled:opacity-30">↪</button>
    </div>
  );
}