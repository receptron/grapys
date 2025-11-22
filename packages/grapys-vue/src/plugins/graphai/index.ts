import type { GraphEditorPlugin, HistoryPayload } from "@receptron/vue-flow";
import type { GraphData } from "graphai";
import { store2graphData } from "./utils/graphDataConverter";
import { graphToGUIData } from "../../utils/gui/utils";
import { agentProfiles } from "./utils/agentProfiles";
import { isEdgeConnectale } from "../../utils/gui/utils";
import type { GUIEdgeData, GUINodeDataRecord, EdgeEndPointData } from "@receptron/vue-flow";
import type { NestedGraphList } from "../../utils/gui/type";

export const createGraphAIPlugin = (nestedGraphs: NestedGraphList): GraphEditorPlugin => {
  return {
    name: "graphai",
    version: "1.0.0",

    onInit() {
      console.log("GraphAI Plugin initialized");
    },

    // Export current graph data to GraphAI format
    exportData(payload: HistoryPayload): GraphData {
      return store2graphData(payload as any, nestedGraphs);
    },

    // Import GraphAI GraphData to GUI format
    importData(graphData: unknown): HistoryPayload {
      const data = graphToGUIData(graphData as GraphData);
      return {
        nodes: data.rawNode,
        edges: data.rawEdge,
        metadata: { loop: data.loop },
      };
    },

    // GraphAI-specific edge validation
    validateEdge(source: EdgeEndPointData, target: EdgeEndPointData, nodes: any[], edges: GUIEdgeData[]): boolean {
      const nodeRecords = nodes.reduce((tmp: GUINodeDataRecord, current) => {
        tmp[current.nodeId] = current;
        return tmp;
      }, {});

      const expectEdge: GUIEdgeData = {
        type: "edge",
        source,
        target,
      };

      return isEdgeConnectale(expectEdge, edges, nodeRecords, nestedGraphs);
    },
  };
};

// Export agent profiles for use in components
export { agentProfiles } from "./utils/agentProfiles";
export { staticNodeParams } from "../../utils/gui/data";
