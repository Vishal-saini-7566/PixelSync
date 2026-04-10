"use client";

import React, { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Stage } from "react-konva";
import Konva from "konva";
import { nanoid } from "nanoid";
import { throttle } from "lodash";
import { useCanvasStore, type CanvasObject } from "@/store/useCanvasStore";
import { useMyPresence, useStorage, useMutation, useHistory, useCanRedo, useCanUndo } from "@/liveblocks/config";
import { LiveObject } from "@liveblocks/client";

import { SceneLayer } from "./SceneLayer";
import { DraftLayer } from "./DraftLayer";
import { LiveCursors } from "./LiveCursors";
import { Toolbar } from "@/components/ui/Toolbar";
import { LayersPanel } from "@/components/ui/LayersPanel";

export function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pointerRef = useRef({ isDown: false, startX: 0, startY: 0, mode: "idle" as "idle" | "drawing" | "panning" });

  const {
    objects, selectedIds, draftObject, activeTool, stageScale, stagePosition,
    setObjects, updateObject, removeObject, setDraftObject, setSelectedIds,
    clearSelection, setActiveTool, setStagePosition, reorderObject
  } = useCanvasStore();

  const [, updateMyPresence] = useMyPresence();
  const liveObjects = useStorage((root) => root.objects);
  const history = useHistory();

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const throttledUpdatePresence = useMemo(() => throttle((cursor) => updateMyPresence({ cursor }), 16), [updateMyPresence]);
  useEffect(() => { updateMyPresence({ selectedIds }); }, [selectedIds, updateMyPresence]);
  useEffect(() => { if (liveObjects) setObjects(liveObjects.map((lo) => ({ ...lo.toObject() } as CanvasObject))); }, [liveObjects, setObjects]);

  const addLiveObject = useMutation(({ storage }, obj: CanvasObject) => storage.get("objects").push(new LiveObject(obj)), []);
  const updateLiveObject = useMutation(({ storage }, id: string, patch: Partial<CanvasObject>) => { const item = storage.get("objects").toArray().find((o) => o.get("id") === id); if (item) item.update(patch as any); }, []);
  const removeLiveObject = useMutation(({ storage }, id: string) => { const list = storage.get("objects"); const idx = list.toArray().findIndex((o) => o.get("id") === id); if (idx !== -1) list.delete(idx); }, []);
  const reorderLiveObject = useMutation(({ storage }, id: string, direction: "up" | "down") => { const list = storage.get("objects"); const idx = list.toArray().findIndex((o) => o.get("id") === id); if (idx === -1) return; list.move(idx, direction === "up" ? Math.min(idx + 1, list.length - 1) : Math.max(idx - 1, 0)); }, []);

  const toSceneCoords = useCallback((pos: { x: number; y: number }) => ({ x: (pos.x - stagePosition.x) / stageScale, y: (pos.y - stagePosition.y) / stageScale }), [stagePosition, stageScale]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage || e.evt.button === 2) return;
    const scene = toSceneCoords(stage.getPointerPosition()!);
    pointerRef.current = { isDown: true, startX: scene.x, startY: scene.y, mode: "idle" };

    if (activeTool === "hand") pointerRef.current.mode = "panning";
    else if (activeTool === "select" && e.target === stage) clearSelection();
    else if (["rect", "ellipse"].includes(activeTool)) {
      pointerRef.current.mode = "drawing";
      setDraftObject({ id: nanoid(), type: activeTool as any, x: scene.x, y: scene.y, width: 0, height: 0, rotation: 0, fill: "#3B82F6", stroke: "transparent", strokeWidth: 1, opacity: 1, draggable: true, locked: false, visible: true, name: "Shape" });
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;
    const scene = toSceneCoords(stage.getPointerPosition()!);
    throttledUpdatePresence(scene);

    if (pointerRef.current.isDown && pointerRef.current.mode === "drawing" && draftObject) {
      setDraftObject({ ...draftObject, width: Math.abs(scene.x - pointerRef.current.startX), height: Math.abs(scene.y - pointerRef.current.startY), x: Math.min(scene.x, pointerRef.current.startX), y: Math.min(scene.y, pointerRef.current.startY) });
    } else if (pointerRef.current.isDown && pointerRef.current.mode === "panning") {
      setStagePosition({ x: stagePosition.x + e.evt.movementX, y: stagePosition.y + e.evt.movementY });
    }
  };

  const handleMouseUp = () => {
    if (pointerRef.current.mode === "drawing" && draftObject && draftObject.width > 5) addLiveObject(draftObject);
    setDraftObject(null);
    pointerRef.current.isDown = false;
  };

  return (
    <div className="relative h-screen w-screen bg-zinc-950 overflow-hidden" ref={containerRef}>
      <Stage ref={stageRef} width={dimensions.width} height={dimensions.height} scaleX={stageScale} scaleY={stageScale} x={stagePosition.x} y={stagePosition.y} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} style={{ cursor: activeTool === "hand" ? "grab" : "default" }}>
        <SceneLayer objects={objects} selectedIds={selectedIds} onSelect={(id, multi) => setSelectedIds(multi ? [...selectedIds, id] : [id])} onObjectChange={(id, patch) => { updateObject(id, patch); updateLiveObject(id, patch); }} onDragStart={setDraftObject} />
        <DraftLayer draftObject={draftObject} />
      </Stage>
      <LiveCursors stageScale={stageScale} stageX={stagePosition.x} stageY={stagePosition.y} />
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} onUndo={() => history.undo()} onRedo={() => history.redo()} canUndo={useCanUndo()} canRedo={useCanRedo()} />
      <LayersPanel objects={objects} selectedIds={selectedIds} onSelect={(id) => setSelectedIds([id])} onToggleVisible={(id) => updateLiveObject(id, { visible: !objects.find(o => o.id === id)?.visible })} onToggleLock={(id) => updateLiveObject(id, { locked: !objects.find(o => o.id === id)?.locked })} onReorder={(id, dir) => { reorderObject(id, dir); reorderLiveObject(id, dir); }} onDelete={(id) => { removeLiveObject(id); removeObject(id); }} />
    </div>
  );
}