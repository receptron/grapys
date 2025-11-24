/*
  Utility functions for styling nodes with Tailwind CSS.
  These provide default styling but can be fully customized by the application.

  To customize styling:
  1. Create your own style functions following the same signature
  2. Pass them to NodeBase component or override globally

  Note: When using dynamic Tailwind classes, ensure they are included in your
  Tailwind configuration's safelist or used elsewhere in your code.
*/

import { defaultNodeColors, defaultPortColors, defaultEdgeColors } from "./nodeStyles";
import { GUINodeData } from "./type";

export type NodeStyleFn = (expectNearNode: boolean, nodeData: GUINodeData) => string;
export type NodeOutputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable?: boolean) => string;
export type NodeInputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable?: boolean) => string;

/**
 * Default node body/main background color
 * Override this for custom node type colors
 */
export const nodeMainClass: NodeStyleFn = (expectNearNode, __nodeData) => {
  return (expectNearNode ? defaultNodeColors.default.mainHighlight : defaultNodeColors.default.main) ?? "";
};

/**
 * Default node header background color
 * Override this for custom node type colors
 */
export const nodeHeaderClass: NodeStyleFn = (expectNearNode, __nodeData) => {
  return (expectNearNode ? defaultNodeColors.default.headerHighlight : defaultNodeColors.default.header) ?? "";
};

/**
 * Default output port color
 * Override this for custom styling
 */
export const nodeOutputClass: NodeOutputStyleFn = (expectNearNode, nodeData, isConnectable = true) => {
  const { outputHighlight, notConnectable, output } = defaultPortColors;
  return (expectNearNode ? (isConnectable ? outputHighlight : notConnectable) : output) ?? "";
};

/**
 * Default input port color
 * Override this for custom styling
 */
export const nodeInputClass: NodeInputStyleFn = (expectNearNode, nodeData, isConnectable = true) => {
  const { inputHighlight, notConnectable, input } = defaultPortColors;
  return (expectNearNode ? (isConnectable ? inputHighlight : notConnectable) : input) ?? "";
};

export const buttonColorVariants = {
  primary: {
    default: "bg-sky-500",
    hover: "hover:bg-sky-700",
    disabled: "bg-sky-200",
  },
  danger: {
    default: "bg-red-400",
    hover: "hover:bg-red-500",
    disabled: "bg-red-200",
  },
} as const;

export const buttonRoundedClasses = {
  none: "",
  left: "rounded-l-full",
  right: "rounded-r-full",
  full: "rounded-full",
} as const;

/**
 * Default edge colors
 * Uses defaultEdgeColors from nodeStyles
 */
export const edgeColors = {
  edge: defaultEdgeColors.edge ?? "red",
  hover: defaultEdgeColors.hover ?? "blue",
  notConnectable: defaultEdgeColors.notConnectable ?? "pink",
};

export const staticNodeOptions = [
  { value: "text", name: "Text" },
  { value: "number", name: "Number" },
  { value: "data", name: "Data(JSON format array or object)" },
  { value: "boolean", name: "Boolean" },
];
