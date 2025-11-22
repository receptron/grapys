import { inject, provide, type InjectionKey, type ComputedRef } from "vue";
import type { GUINearestData, NodePosition, NewEdgeEvent } from "../utils/gui/type";

export interface NodeContext {
  nearestData: GUINearestData | undefined;
  isConnectable: boolean;
  updatePosition: (nodeIndex: number, position: NodePosition) => void;
  savePosition: () => void;
  onNewEdgeStart: (event: NewEdgeEvent) => void;
  onNewEdge: (event: { x: number; y: number }) => void;
  onNewEdgeEnd: () => void;
  onNodeDragStart: () => void;
  onNodeDragEnd: () => void;
}

export const NodeContextKey: InjectionKey<ComputedRef<NodeContext>> = Symbol("NodeContext");

export const provideNodeContext = (context: ComputedRef<NodeContext>) => {
  provide(NodeContextKey, context);
};

export const useNodeContext = () => {
  const context = inject(NodeContextKey);
  if (!context) {
    throw new Error("useNodeContext must be used within a NodeContext provider");
  }
  return context;
};
