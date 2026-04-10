"use client";

import React, { Suspense } from "react";
import { RoomProvider } from "@/liveblocks/config";
import { LiveList } from "@liveblocks/client";
import { Canvas } from "@/components/canvas/Canvas";

function CanvasLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
    </div>
  );
}

export default function Page() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <RoomProvider
        id="pixelsync-demo-room"
        initialPresence={{ cursor: null, name: "Anonymous", color: "#3B82F6", selectedIds: [] }}
        initialStorage={{ objects: new LiveList([]) }}
      >
        <Suspense fallback={<CanvasLoading />}>
          <Canvas />
        </Suspense>
      </RoomProvider>
    </main>
  );
}