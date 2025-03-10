import { Position, NewEdgeStartEventData, NewEdgeData, ClosestNodeData, GUINearestData } from "../utils/gui/type";
import { ref, computed } from "vue";
import { useStore } from "../store";
import { edgeStartEventData, edgeUpdateEventData, edgeEndEventData, pickNearestNode, pickNearestConnect, isEdgeConnectale } from "../utils/gui/utils";

export const useNewEdge = () => {
  const store = useStore();

  const svgRef = ref();
  const newEdgeData = ref<NewEdgeData | null>(null);
  const mouseCurrentPosition = ref<Position>({ x: 0, y: 0 });
  const targetNode = ref<string>("");

  const onNewEdgeStart = (data: NewEdgeStartEventData) => {
    targetNode.value = data.nodeId;
    const { mousePosition, startEdgeData } = edgeStartEventData(data, svgRef.value, store.nodeRecords[data.nodeId]);
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
      store.pushEdge(expectEdge.value);
    }
    newEdgeData.value = null;
  };

  const expectEdge = computed(() => {
    if (!nearestData.value || !newEdgeData.value) return null;

    return edgeEndEventData(newEdgeData.value, nearestData.value);
  });

  const nearestNode = computed<ClosestNodeData | null>(() => {
    if (!store.nodes.length) return null;

    return pickNearestNode(store.nodes, targetNode.value, mouseCurrentPosition.value);
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
    return isEdgeConnectale(expectEdge.value, store.edges, store.nodeRecords, store.nestedGraphs);
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
