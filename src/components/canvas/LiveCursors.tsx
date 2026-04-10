"use client";

import React from "react";
import { useOthers, getUserColor } from "@/liveblocks/config";

export function LiveCursors({ stageScale, stageX, stageY }: { stageScale: number; stageX: number; stageY: number; }) {
  const others = useOthers();
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-50">
      {others.map(({ connectionId, presence }) => {
        if (!presence?.cursor) return null;
        const x = presence.cursor.x * stageScale + stageX;
        const y = presence.cursor.y * stageScale + stageY;
        const color = getUserColor(connectionId);
        return (
          <div key={connectionId} className="absolute transition-transform duration-75" style={{ transform: `translate(${x}px, ${y}px)` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.65 12.36H5.46L5.31 12.49L0.5 16.88L0.5 1.19L11.78 12.36H5.65Z" fill={color} stroke="white" /></svg>
            <div className="ml-4 rounded px-1.5 py-0.5 text-[10px] text-white font-bold" style={{ backgroundColor: color }}>{presence.name || "User"}</div>
          </div>
        );
      })}
    </div>
  );
}