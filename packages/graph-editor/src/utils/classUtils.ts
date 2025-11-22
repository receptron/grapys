/*
  Utility functions for CSS classes (Tailwind CSS compatible)
  Plugin-friendly: allows customization via node.data properties
*/

import type { GUINodeData, PortDefinition } from "../types";

/**
 * Get main node class based on type and nearest state
 */
export const nodeMainClass = (expectNearNode: boolean, nodeData: GUINodeData) => {
  // Custom class from node data
  if (nodeData.data?.customClass) {
    return nodeData.data.customClass as string;
  }

  // Default classes based on type
  if (nodeData.type === "computed") {
    return expectNearNode ? "bg-blue-200" : "bg-blue-400";
  }
  return expectNearNode ? "bg-red-200" : "bg-red-400";
};

/**
 * Get node header class
 */
export const nodeHeaderClass = (expectNearNode: boolean, nodeData: GUINodeData) => {
  // Custom header class from node data
  if (nodeData.data?.customHeaderClass) {
    return nodeData.data.customHeaderClass as string;
  }

  if (nodeData.type === "computed") {
    return expectNearNode ? "bg-blue-300" : "bg-blue-500";
  }
  return expectNearNode ? "bg-red-300" : "bg-red-500";
};

/**
 * Get output port class
 */
export const nodeOutputClass = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable: boolean = true) => {
  if (nodeData.type === "computed") {
    return expectNearNode ? (isConnectable ? "bg-green-200" : "bg-red-600") : "bg-green-500";
  }
  return expectNearNode ? (isConnectable ? "bg-yellow-200" : "bg-red-600") : "bg-yellow-500";
};

/**
 * Get input port class
 */
export const nodeInputClass = (expectNearNode: boolean, nodeData: GUINodeData, input: PortDefinition, isConnectable: boolean = true) => {
  if (nodeData.type === "computed") {
    // Special handling for mapTo property (plugin-specific)
    if ((input as any).mapTo) {
      return expectNearNode ? (isConnectable ? "bg-red-200" : "bg-red-700") : "bg-red-400";
    }
    return expectNearNode ? (isConnectable ? "bg-blue-200" : "bg-red-600") : "bg-blue-500";
  }
  return expectNearNode ? (isConnectable ? "bg-violet-200" : "bg-red-600") : "bg-violet-500";
};

/**
 * Edge colors
 */
export const edgeColors = {
  edge: "red",
  hover: "blue",
  notConnectable: "pink",
};
