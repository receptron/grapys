import type { Component } from "vue";
import type { GUINodeData, GUIEdgeData, EdgeEndPointData, HistoryPayload } from "./index";

/**
 * Plugin interface for extending graph-editor functionality
 */
export interface GraphEditorPlugin {
  /** Plugin name */
  name: string;

  /** Plugin version */
  version: string;

  // Lifecycle hooks
  /** Called when plugin is initialized */
  onInit?(): void;

  /** Called when a node is added */
  onNodeAdd?(node: GUINodeData): void;

  /** Called when a node is updated */
  onNodeUpdate?(nodeId: string, data: Partial<GUINodeData>): void;

  /** Called when a node is deleted */
  onNodeDelete?(nodeId: string): void;

  /** Called when an edge is added */
  onEdgeAdd?(edge: GUIEdgeData): void;

  /** Called when an edge is deleted */
  onEdgeDelete?(edgeId: string): void;

  // Data conversion hooks
  /** Export current graph data to plugin-specific format */
  exportData?(payload: HistoryPayload): unknown;

  /** Import plugin-specific data to graph format */
  importData?(data: unknown): HistoryPayload;

  // Validation hooks
  /** Validate if an edge can be created between source and target */
  validateEdge?(source: EdgeEndPointData, target: EdgeEndPointData, nodes: GUINodeData[], edges: GUIEdgeData[]): boolean;

  /** Validate if a node can be added */
  validateNode?(node: GUINodeData): boolean;

  // UI extension slots
  /** Custom Vue components for node slots */
  nodeSlots?: {
    /** Component rendered in node header */
    header?: Component;
    /** Component rendered in node body */
    body?: Component;
    /** Component rendered in node footer */
    footer?: Component;
  };

  /** Custom context menu items for nodes */
  nodeContextMenuItems?: Array<{
    label: string;
    action: (nodeId: string) => void;
  }>;

  /** Custom context menu items for edges */
  edgeContextMenuItems?: Array<{
    label: string;
    action: (edgeIndex: number) => void;
  }>;

  // Additional plugin-specific properties
  [key: string]: unknown;
}

/**
 * Plugin registry type
 */
export type PluginRegistry = Map<string, GraphEditorPlugin>;
