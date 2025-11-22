import type { Position, GUINodeData, GUIEdgeData, ClosestNodeData, NewEdgeData } from "../types";

/**
 * Find the nearest node to the mouse position
 */
export const pickNearestNode = (nodes: GUINodeData[], __targetNode: string, mouseCurrentPosition: Position) => {
  return nodes.reduce((closest: null | ClosestNodeData, node) => {
    const mouseX = mouseCurrentPosition.x;
    const mouseY = mouseCurrentPosition.y;

    const { x, y, width, height } = node.position;

    const closestX = Math.max(x, Math.min(mouseX, x + (width ?? 0)));
    const closestY = Math.max(y, Math.min(mouseY, y + (height ?? 0)));

    const distance = Math.sqrt((closestX - mouseX) ** 2 + (closestY - mouseY) ** 2);

    if (!closest || distance < closest.distance) {
      return { node, distance };
    }

    return closest;
  }, null);
};

/**
 * Find the nearest connection point (input or output port) on a node
 */
export const pickNearestConnect = (nearestNode: ClosestNodeData, newEdgeData: NewEdgeData, mouseCurrentPosition: Position) => {
  const nodePos = nearestNode.node.position;
  const { inputCenters, outputCenters } = nodePos;

  const isOutput = newEdgeData.direction === "outbound";
  const centers = (isOutput ? inputCenters : outputCenters) ?? [];

  return centers.reduce((closest: null | { index: number; distance: number }, center: number, index: number) => {
    const nodeX = nodePos.x + (isOutput ? 0 : (nodePos?.width ?? 0));
    const nodeY = nodePos.y + center;
    const mouseX = mouseCurrentPosition.x;
    const mouseY = mouseCurrentPosition.y;

    const distance = Math.sqrt((nodeX - mouseX) ** 2 + (nodeY - mouseY) ** 2);

    if (!closest || distance < closest.distance) {
      return { index, distance };
    }

    return closest;
  }, null);
};

/**
 * Check if two edges are the same
 */
const sameEdge = (edge1: GUIEdgeData, edge2: GUIEdgeData) => {
  return (
    edge1.source.nodeId === edge2.source.nodeId &&
    edge1.source.index === edge2.source.index &&
    edge1.target.nodeId === edge2.target.nodeId &&
    edge1.target.index === edge2.target.index
  );
};

/**
 * Check if two edges have the same target
 */
const sameTargetEdge = (edge1: GUIEdgeData, edge2: GUIEdgeData) => {
  return edge1.target.nodeId === edge2.target.nodeId && edge1.target.index === edge2.target.index;
};

/**
 * Basic edge validation (can be overridden by plugins)
 * This is a simple version without GraphAI-specific logic
 */
export const isEdgeConnectable = (expectEdge: GUIEdgeData | null, edges: GUIEdgeData[]): boolean => {
  if (!expectEdge) {
    return false;
  }

  // Cannot connect to self
  if (expectEdge.target.nodeId === expectEdge.source.nodeId) {
    return false;
  }

  // Cannot create duplicate edges
  if (edges.find((edge) => sameEdge(edge, expectEdge))) {
    return false;
  }

  // By default, only allow one edge per target port (plugins can override this)
  const existingEdges = edges.filter((edge) => sameTargetEdge(edge, expectEdge));

  return existingEdges.length === 0;
};
