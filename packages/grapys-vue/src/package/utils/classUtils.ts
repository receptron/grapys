/*
  This is a utility function for dynamically specifying colors using Tailwind CSS.
  You need to add the generated class names to the safelist, but since Tailwind v4 does not support this method, you should manually include these classes in a non-intrusive part of your code to ensure they are not purged.
*/

import { GUINodeData, InputOutputData } from "./type";

export const nodeMainClass = (expectNearNode: boolean, nodeData: GUINodeData) => {
  if (nodeData.type === "computed") {
    return expectNearNode ? "bg-blue-200" : "bg-blue-400";
  }
  return expectNearNode ? "bg-red-200" : "bg-red-400";
};

export const nodeHeaderClass = (expectNearNode: boolean, nodeData: GUINodeData) => {
  if (nodeData.type === "computed") {
    return expectNearNode ? "bg-blue-300" : "bg-blue-500";
  }
  return expectNearNode ? "bg-red-300" : "bg-red-500";
};

export const nodeOutputClass = (expectNearNode: boolean, nodeData: GUINodeData, isConnectable: boolean = true) => {
  if (nodeData.type === "computed") {
    return expectNearNode ? (isConnectable ? "bg-green-200" : "bg-red-600") : "bg-green-500";
  }
  return expectNearNode ? (isConnectable ? "bg-yellow-200" : "bg-red-600") : "bg-yellow-500";
};

export const nodeInputClass = (expectNearNode: boolean, nodeData: GUINodeData, input: InputOutputData, isConnectable: boolean = true) => {
  if (nodeData.type === "computed") {
    if (input.mapTo) {
      return expectNearNode ? (isConnectable ? "bg-red-200" : "bg-red-700") : "bg-red-400";
    }
    return expectNearNode ? (isConnectable ? "bg-blue-200" : "bg-red-600") : "bg-blue-500";
  }
  return expectNearNode ? (isConnectable ? "bg-violet-200" : "bg-red-600") : "bg-violet-500";
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
