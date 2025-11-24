import { useLocalStore } from "../store/index";
import type { UpdateStaticValue, UpdateAgentValue } from "../utils/gui/type";

/**
 * Application-specific node update operations
 * Built on top of the generic store API
 */
export const useNodeUpdate = () => {
  const updateNodeAt = useLocalStore((state) => state.updateNodeAt);
  const updateNodesAndEdges = useLocalStore((state) => state.updateNodesAndEdges);
  const nodes = useLocalStore((state) => state.nodes());

  const updateNodeParam = (positionIndex: number, key: string, value: unknown) => {
    updateNodeAt(
      positionIndex,
      (node) => {
        const newNode = {
          ...node,
          data: {
            ...node.data,
            params: node.data.params ? { ...node.data.params } : {},
          },
        };

        if (value === "" || value === undefined || (value === null && newNode.data.params && newNode.data.params[key] !== undefined)) {
          // delete operation
          const { [key]: __, ...updatedParams } = newNode.data.params || {};
          newNode.data.params = updatedParams;
        } else {
          // upsert
          newNode.data.params = { ...(newNode.data.params || {}), [key]: value };
        }

        return newNode;
      },
      "updateParams",
      true,
    );
  };

  const updateStaticNodeValue = (positionIndex: number, value: UpdateStaticValue | UpdateAgentValue, saveHistory: boolean) => {
    updateNodeAt(
      positionIndex,
      (node) => ({
        ...node,
        data: { ...node.data, ...value },
      }),
      "updateStaticValue",
      saveHistory,
    );
  };

  const updateNestedGraph = (positionIndex: number, value: Record<string, unknown>) => {
    const targetNodeId = nodes[positionIndex].nodeId;

    updateNodesAndEdges(
      (nodes) => {
        const newNodes = [...nodes];
        const node = newNodes[positionIndex];
        newNodes[positionIndex] = {
          ...node,
          data: { ...node.data, ...value },
        };
        return newNodes;
      },
      (edges) =>
        edges.filter((edge) => {
          return edge.source.nodeId !== targetNodeId && edge.target.nodeId !== targetNodeId;
        }),
      "NestedGraph",
      true,
    );
  };

  return {
    updateNodeParam,
    updateStaticNodeValue,
    updateNestedGraph,
  };
};
