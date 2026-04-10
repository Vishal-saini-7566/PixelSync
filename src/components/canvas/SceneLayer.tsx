"use client";

import React, { useRef } from "react";
import { Layer, Rect, Ellipse, Transformer } from "react-konva";
import Konva from "konva";
import type { CanvasObject } from "@/store/useCanvasStore";
import { useOthers, getUserColor } from "@/liveblocks/config";

interface SceneLayerProps {
  objects: CanvasObject[]; selectedIds: string[];
  onSelect: (id: string, multiSelect: boolean) => void;
  onObjectChange: (id: string, patch: Partial<CanvasObject>) => void;
  onDragStart: (obj: CanvasObject) => void;
}

export function SceneLayer({ objects, selectedIds, onSelect, onObjectChange, onDragStart }: SceneLayerProps) {
  const layerRef = useRef<Konva.Layer>(null);
  const others = useOthers();

  return (
    <Layer ref={layerRef}>
      {objects.filter(o => o.visible).map((obj) => (
        <React.Fragment key={obj.id}>
          {obj.type === "rect" && <Rect id={obj.id} x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill={obj.fill} draggable={!obj.locked} onClick={(e) => onSelect(obj.id, e.evt.shiftKey)} onDragStart={() => onDragStart(obj)} onTransformEnd={(e) => { onObjectChange(obj.id, { x: e.target.x(), y: e.target.y(), width: e.target.width() * e.target.scaleX(), height: e.target.height() * e.target.scaleY(), rotation: e.target.rotation() }); e.target.setAttrs({ scaleX: 1, scaleY: 1 }); }} />}
          {obj.type === "ellipse" && <Ellipse id={obj.id} x={obj.x + obj.width/2} y={obj.y + obj.height/2} radiusX={obj.width/2} radiusY={obj.height/2} fill={obj.fill} draggable={!obj.locked} onClick={(e) => onSelect(obj.id, e.evt.shiftKey)} onDragStart={() => onDragStart(obj)} />}
        </React.Fragment>
      ))}
      {others.map(({ connectionId, presence }) => presence.selectedIds?.map(id => {
        const obj = objects.find(o => o.id === id);
        return obj ? <Rect key={`${connectionId}-${id}`} x={obj.x} y={obj.y} width={obj.width} height={obj.height} stroke={getUserColor(connectionId)} strokeWidth={2} dash={[4, 4]} listening={false} /> : null;
      }))}
      <Transformer ref={(node) => node?.nodes(selectedIds.map(id => layerRef.current?.findOne(`#${id}`)).filter(Boolean) as Konva.Node[])} />
    </Layer>
  );
}