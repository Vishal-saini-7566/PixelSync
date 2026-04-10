"use client";

import React from "react";
import { Layer, Rect, Ellipse } from "react-konva";
import type { CanvasObject } from "@/store/useCanvasStore";

export function DraftLayer({ draftObject }: { draftObject: CanvasObject | null }) {
  if (!draftObject) return null;
  const commonProps = { x: draftObject.x, y: draftObject.y, width: draftObject.width, height: draftObject.height, opacity: 0.7, fill: draftObject.fill, stroke: "#3B82F6", strokeWidth: 2, listening: false };

  return (
    <Layer listening={false}>
      {draftObject.type === "rect" && <Rect {...commonProps} />}
      {draftObject.type === "ellipse" && <Ellipse {...commonProps} radiusX={draftObject.width / 2} radiusY={draftObject.height / 2} x={draftObject.x + draftObject.width / 2} y={draftObject.y + draftObject.height / 2} />}
    </Layer>
  );
}