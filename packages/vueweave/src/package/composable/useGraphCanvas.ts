import { computed } from "vue";
import { useFlowStore } from "../store";
import type { NodePositionData, ValidateConnectionFn, GUINodeData, GUIEdgeData } from "../utils/type";

export type UseGraphCanvasOptions = {
  /**
   * Optional custom validation function for edge connections
   * Default: allows one edge per target input
   */
  validateConnection?: ValidateConnectionFn;
  /**
   * Optional callback when node position is saved
   */
  onSavePosition?: () => void;
};

/**
 * Composable that provides common graph canvas operations
 * Hides boilerplate code for typical use cases
 */
export const useGraphCanvas = (options: UseGraphCanvasOptions = {}) => {
  const store = useFlowStore();

  // Computed refs for reactive data
  const nodes = computed(() => store.nodes);
  const edges = computed(() => store.edges);
  const nodeRecords = computed(() => store.nodeRecords);

  // Default position update handler
  const updateNodePosition = (index: number, position: NodePositionData) => {
    store.updateNodePosition(index, position);
  };

  // Default position save handler
  const saveNodePosition = () => {
    store.saveNodePositionData();
    options.onSavePosition?.();
  };

  // Default validation: allow one edge per target input
  const defaultValidateConnection = (expectEdge: GUIEdgeData, existingEdges: GUIEdgeData[]) => {
    // Allow connection if no existing edges to same target
    return existingEdges.length === 0;
  };

  const validateConnection = options.validateConnection || defaultValidateConnection;

  // Initialize graph data
  const initData = (initNodes: GUINodeData[], initEdges: GUIEdgeData[], extra: Record<string, unknown> = {}) => {
    store.initData(initNodes, initEdges, extra);
  };

  // Add a new node
  const pushNode = (node: GUINodeData) => {
    store.pushNode(node);
  };

  return {
    // Reactive state
    nodes,
    edges,
    nodeRecords,
    // Required handlers for GraphCanvasBase
    updateNodePosition,
    saveNodePosition,
    validateConnection,
    // Store operations
    initData,
    pushNode,
    // Direct store access for advanced usage
    store,
  };
};
