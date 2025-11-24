/*
  Utility functions for styling nodes with Tailwind CSS.
  These provide default styling but can be fully customized by the application.

  To customize styling:
  1. Create your own style functions following the same signature
  2. Pass them to NodeBase component or override globally

  Note: When using dynamic Tailwind classes, ensure they are included in your
  Tailwind configuration's safelist or used elsewhere in your code.
*/

import { GUINodeData, InputOutputData } from "./type";

export type NodeStyleFn = (expectNearNode: boolean, nodeData: GUINodeData) => string;
export type NodeOutputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable?: boolean) => string;
export type NodeInputStyleFn = (expectNearNode: boolean, nodeData: GUINodeData, input: InputOutputData, isConnectable?: boolean) => string;

/**
 * Default node body/main background color
 * Override this for custom node type colors
 */
export const nodeMainClass: NodeStyleFn = (expectNearNode, __nodeData) => {
  // Default: blue for all node types
  return expectNearNode ? "bg-blue-200" : "bg-blue-400";
};

/**
 * Default node header background color
 * Override this for custom node type colors
 */
export const nodeHeaderClass: NodeStyleFn = (expectNearNode, __nodeData) => {
  // Default: blue for all node types
  return expectNearNode ? "bg-blue-300" : "bg-blue-500";
};

/**
 * Default output port color
 * Override this for custom styling
 */
export const nodeOutputClass: NodeOutputStyleFn = (expectNearNode, nodeData, isConnectable = true) => {
  // Red when not connectable, green otherwise
  return expectNearNode ? (isConnectable ? "bg-green-200" : "bg-red-600") : "bg-green-500";
};

/**
 * Default input port color
 * Override this for custom styling
 */
export const nodeInputClass: NodeInputStyleFn = (expectNearNode, nodeData, input, isConnectable = true) => {
  // Special styling for mapTo inputs
  if (input.mapTo) {
    return expectNearNode ? (isConnectable ? "bg-red-200" : "bg-red-700") : "bg-red-400";
  }
  // Red when not connectable, blue otherwise
  return expectNearNode ? (isConnectable ? "bg-blue-200" : "bg-red-600") : "bg-blue-500";
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

//
export const edgeColors = {
  edge: "red",
  hover: "blue",
  notConnectable: "pink",
};

export const staticNodeOptions = [
  { value: "text", name: "Text" },
  { value: "number", name: "Number" },
  { value: "data", name: "Data(JSON format array or object)" },
  { value: "boolean", name: "Boolean" },
];
