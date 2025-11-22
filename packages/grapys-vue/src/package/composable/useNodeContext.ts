import { inject, type InjectionKey, type ComputedRef } from "vue";
import type { GUINodeData, GUINearestData, NodePosition, NewEdgeStartEventData } from "../../utils/gui/type";

export interface NodeContext {
  nodeData: GUINodeData;
  nodeIndex: number;
  nearestData: GUINearestData | undefined;
  isConnectable: boolean;
  updatePosition: (nodeIndex: number, position: NodePosition) => void;
  savePosition: () => void;
  onNewEdgeStart: (event: NewEdgeStartEventData) => void;
  onNewEdge: (event: { x: number; y: number }) => void;
  onNewEdgeEnd: () => void;
  onNodeDragStart: () => void;
  onNodeDragEnd: () => void;
}

export const NodeContextKey: InjectionKey<ComputedRef<NodeContext>> = Symbol("NodeContext");

export const useNodeContext = () => {
  const context = inject(NodeContextKey);
  if (!context) {
    throw new Error("useNodeContext must be used within NodeContextProvider");
  }
  return context;
};
