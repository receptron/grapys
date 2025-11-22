import { Position, NewEdgeStartEventData, NewEdgeData, ClosestNodeData, GUINearestData, GUINodeDataRecord, GUIEdgeData } from "../types";
import { ref, computed } from "vue";
import { edgeStartEventData, edgeUpdateEventData, edgeEndEventData, pickNearestNode, pickNearestConnect, isEdgeConnectable } from "../utils";

export interface UseNewEdgeOptions {
  nodes: GUINodeDataRecord;
  edges: GUIEdgeData[];
  onEdgeCreate?: (edge: GUIEdgeData) => void;
  validateEdge?: (edge: GUIEdgeData | null, edges: GUIEdgeData[]) => boolean;
}

export const useNewEdge = (options: UseNewEdgeOptions) => {
  const svgRef = ref();
  const newEdgeData = ref<NewEdgeData | null>(null);
  const mouseCurrentPosition = ref<Position>({ x: 0, y: 0 });
  const targetNode = ref<string>("");

  const onNewEdgeStart = (data: NewEdgeStartEventData) => {
    targetNode.value = data.nodeId;
    const nodeData = options.nodes[data.nodeId];
    if (!nodeData) return;

    const { mousePosition, startEdgeData } = edgeStartEventData(data, svgRef.value, nodeData);
    mouseCurrentPosition.value = mousePosition;
    newEdgeData.value = startEdgeData;
  };

  const onNewEdge = (data: Position) => {
    if (newEdgeData.value) {
      const { mousePosition, updateEdgeData } = edgeUpdateEventData(data, svgRef.value, newEdgeData.value);
      mouseCurrentPosition.value = mousePosition;
      newEdgeData.value = updateEdgeData;
    }
  };

  const onNewEdgeEnd = () => {
    if (expectEdge.value && edgeConnectable.value) {
      if (options.onEdgeCreate) {
        options.onEdgeCreate(expectEdge.value);
      }
    }
    newEdgeData.value = null;
  };

  const expectEdge = computed(() => {
    if (!nearestData.value || !newEdgeData.value) return null;
    return edgeEndEventData(newEdgeData.value, nearestData.value);
  });

  const nearestNode = computed<ClosestNodeData | null>(() => {
    const nodesList = Object.values(options.nodes);
    if (!nodesList.length) return null;

    return pickNearestNode(nodesList, targetNode.value, mouseCurrentPosition.value);
  });

  const nearestConnect = computed(() => {
    if (!newEdgeData.value || !nearestNode.value) return;

    return pickNearestConnect(nearestNode.value, newEdgeData.value, mouseCurrentPosition.value);
  });

  const nearestData = computed<GUINearestData | undefined>(() => {
    if (!nearestNode.value || !nearestConnect.value || !newEdgeData.value) return;
    return {
      nodeId: nearestNode.value.node.nodeId,
      index: nearestConnect.value.index,
      direction: newEdgeData.value.direction,
    };
  });

  const edgeConnectable = computed(() => {
    // Use custom validation if provided, otherwise use default
    if (options.validateEdge) {
      return options.validateEdge(expectEdge.value, options.edges);
    }
    return isEdgeConnectable(expectEdge.value, options.edges);
  });

  return {
    svgRef,
    newEdgeData,
    onNewEdgeStart,
    onNewEdge,
    onNewEdgeEnd,
    nearestData,
    expectEdge,
    edgeConnectable,
  };
};
