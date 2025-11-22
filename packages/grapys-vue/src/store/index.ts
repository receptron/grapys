/**
 * Main store export
 * Now uses vue-flow core store with GraphAI plugin via adapter
 * Maintains backward compatibility with existing components
 */

export { useStore, useStoreAdapter } from "./storeAdapter";

// Re-export types for backward compatibility
export type {
  GUINodeData,
  GUIEdgeData,
  GUINodeDataRecord,
  UpdateStaticValue,
  UpdateNodePositionData,
  HistoryData,
  HistoryPayload,
  GUILoopData,
} from "../utils/gui/type";
