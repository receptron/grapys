/**
 * Node styling configuration system
 *
 * This module provides a flexible way to customize node colors and styles.
 * You can either:
 * 1. Use the default styles (no configuration needed)
 * 2. Provide a simple object mapping node types to Tailwind classes
 * 3. Provide custom functions for full control
 */

import type { NodeStyleFn, NodeOutputStyleFn, NodeInputStyleFn } from "./classUtils";

/**
 * Simple object-based color configuration
 * Maps node types to Tailwind CSS class names
 */
export type NodeColorConfig = {
  [nodeType: string]: {
    // Main node body background color
    main?: string;
    // Node header background color
    header?: string;
    // Main color when node is highlighted (near drag operation)
    mainHighlight?: string;
    // Header color when node is highlighted
    headerHighlight?: string;
  };
};

/**
 * Advanced function-based style configuration
 * For cases where simple color mapping is not enough
 */
export type NodeStyleConfig = {
  nodeMainClass?: NodeStyleFn;
  nodeHeaderClass?: NodeStyleFn;
  nodeOutputClass?: NodeOutputStyleFn;
  nodeInputClass?: NodeInputStyleFn;
};

/**
 * Combined configuration - use either colors (simple) or functions (advanced)
 */
export type NodeStyleOptions = {
  // Simple approach: object-based color mapping
  colors?: NodeColorConfig;
  // Advanced approach: custom style functions
  functions?: NodeStyleConfig;
};

/**
 * Default color configuration
 * Can be used as a starting point for customization
 */
export const defaultNodeColors: NodeColorConfig = {
  // Default fallback for any node type
  default: {
    main: "bg-blue-400",
    header: "bg-blue-500",
    mainHighlight: "bg-blue-200",
    headerHighlight: "bg-blue-300",
  },
};

/**
 * Create style functions from color configuration object
 */
export const createStyleFunctionsFromColors = (colors: NodeColorConfig): NodeStyleConfig => {
  const getColors = (nodeType: string) => {
    return colors[nodeType] || colors.default || defaultNodeColors.default;
  };

  return {
    nodeMainClass: (expectNearNode, nodeData) => {
      const nodeColors = getColors(nodeData.type);
      return expectNearNode ? (nodeColors.mainHighlight || nodeColors.main || "") : (nodeColors.main || "");
    },
    nodeHeaderClass: (expectNearNode, nodeData) => {
      const nodeColors = getColors(nodeData.type);
      return expectNearNode ? (nodeColors.headerHighlight || nodeColors.header || "") : (nodeColors.header || "");
    },
    nodeOutputClass: (expectNearNode, __nodeData, isConnectable = true) => {
      // Red when not connectable, green otherwise
      return expectNearNode ? (isConnectable ? "bg-green-200" : "bg-red-600") : "bg-green-500";
    },
    nodeInputClass: (expectNearNode, __nodeData, input, isConnectable = true) => {
      // Special styling for mapTo inputs
      if (input.mapTo) {
        return expectNearNode ? (isConnectable ? "bg-red-200" : "bg-red-700") : "bg-red-400";
      }
      // Red when not connectable, blue otherwise
      return expectNearNode ? (isConnectable ? "bg-blue-200" : "bg-red-600") : "bg-blue-500";
    },
  };
};

/**
 * Resolve style configuration to actual functions
 */
export const resolveStyleConfig = (options?: NodeStyleOptions): NodeStyleConfig => {
  // If custom functions provided, use them
  if (options?.functions) {
    return options.functions;
  }

  // If color config provided, convert to functions
  if (options?.colors) {
    return createStyleFunctionsFromColors(options.colors);
  }

  // Otherwise use default
  return createStyleFunctionsFromColors(defaultNodeColors);
};

/**
 * Vue provide/inject key for node styles
 */
export const NODE_STYLE_KEY = Symbol("nodeStyles");
