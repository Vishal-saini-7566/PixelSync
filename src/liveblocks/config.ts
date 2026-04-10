import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import type { CanvasObject } from "@/store/useCanvasStore";

export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY ?? "",
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  selectedIds: string[];
};

export type Storage = {
  objects: LiveList<LiveObject<CanvasObject>>;
};

export const {
  RoomProvider, useMyPresence, useOthers, useStorage, useMutation, useHistory, useCanRedo, useCanUndo
} = createRoomContext<Presence, Storage>(client);

export const USER_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A8E6CF", "#C9B1FF"];
export function getUserColor(connectionId: number): string {
  return USER_COLORS[connectionId % USER_COLORS.length];
}