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
 * Edge color configuration
 */
export type EdgeColorConfig = {
  // Normal edge color
  edge?: string;
  // Hover edge color
  hover?: string;
  // Not connectable edge color
  notConnectable?: string;
};

/**
 * Port color configuration
 */
export type PortColorConfig = {
  // Input port color
  input?: string;
  // Input port hover/highlight color
  inputHighlight?: string;
  // Output port color
  output?: string;
  // Output port hover/highlight color
  outputHighlight?: string;
  // Not connectable port color
  notConnectable?: string;
};

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
    // Port colors (optional, overrides global port colors for this node type)
    ports?: PortColorConfig;
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
  // Global port colors (can be overridden per node type)
  portColors?: PortColorConfig;
  // Edge colors
  edgeColors?: EdgeColorConfig;
};

/**
 * Default port color configuration
 * Can be used as a starting point for customization
 */
export const defaultPortColors: PortColorConfig = {
  input: "bg-blue-500",
  inputHighlight: "bg-blue-200",
  output: "bg-green-500",
  outputHighlight: "bg-green-200",
  notConnectable: "bg-red-600",
};

/**
 * Default edge color configuration
 * Can be used as a starting point for customization
 */
export const defaultEdgeColors: EdgeColorConfig = {
  edge: "red",
  hover: "blue",
  notConnectable: "pink",
};

/**
 * Default node color configuration
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
export const createStyleFunctionsFromColors = (colors: NodeColorConfig, globalPortColors?: PortColorConfig): NodeStyleConfig => {
  const getColors = (nodeType: string) => {
    return colors[nodeType] || colors.default || defaultNodeColors.default;
  };

  const getPortColors = (nodeType: string): PortColorConfig => {
    const nodeColors = getColors(nodeType);
    return nodeColors.ports || globalPortColors || defaultPortColors;
  };

  return {
    nodeMainClass: (expectNearNode, nodeData) => {
      const nodeColors = getColors(nodeData.type);
      return expectNearNode ? nodeColors.mainHighlight || nodeColors.main || "" : nodeColors.main || "";
    },
    nodeHeaderClass: (expectNearNode, nodeData) => {
      const nodeColors = getColors(nodeData.type);
      return expectNearNode ? nodeColors.headerHighlight || nodeColors.header || "" : nodeColors.header || "";
    },
    nodeOutputClass: (expectNearNode, nodeData, isConnectable = true) => {
      const portColors = getPortColors(nodeData.type);
      const { outputHighlight, notConnectable, output } = defaultPortColors;
      return (expectNearNode ? (isConnectable ? portColors.outputHighlight ?? outputHighlight : portColors.notConnectable ?? notConnectable) : portColors.output ?? output) ?? "";
    },
    nodeInputClass: (expectNearNode, nodeData, isConnectable = true) => {
      const portColors = getPortColors(nodeData.type);
      const { inputHighlight, notConnectable, input } = defaultPortColors;
      return (expectNearNode ? (isConnectable ? portColors.inputHighlight ?? inputHighlight : portColors.notConnectable ?? notConnectable) : portColors.input ?? input) ?? "";
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
    return createStyleFunctionsFromColors(options.colors, options?.portColors);
  }

  // Otherwise use default
  return createStyleFunctionsFromColors(defaultNodeColors, options?.portColors);
};

/**
 * Resolve edge colors with defaults
 */
export const resolveEdgeColors = (options?: NodeStyleOptions): EdgeColorConfig => {
  return {
    edge: options?.edgeColors?.edge || defaultEdgeColors.edge || "red",
    hover: options?.edgeColors?.hover || defaultEdgeColors.hover || "blue",
    notConnectable: options?.edgeColors?.notConnectable || defaultEdgeColors.notConnectable || "pink",
  };
};

/**
 * Vue provide/inject keys
 */
export const NODE_STYLE_KEY = Symbol("nodeStyles");
export const EDGE_COLOR_KEY = Symbol("edgeColors");
