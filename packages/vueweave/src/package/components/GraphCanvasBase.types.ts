import type { Ref } from "vue";
import type { GUINodeData, GUIEdgeData } from "../utils/type";
import type { useFlowStore } from "../store";

/**
 * Exposed methods and properties from GraphCanvasBase component
 */
export type GraphCanvasBaseExposed = {
  mainContainer: Ref<HTMLElement | undefined>;
  svgRef: Ref<SVGSVGElement | undefined>;
  openNodeMenu: (event: MouseEvent, nodeIndex: number) => void;
  initData: (nodes: GUINodeData[], edges: GUIEdgeData[], extra: Record<string, unknown>) => void;
  pushNode: (node: GUINodeData) => void;
  store: ReturnType<typeof useFlowStore>;
};
