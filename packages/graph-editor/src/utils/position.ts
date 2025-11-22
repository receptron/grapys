import type { GUINodeData, NodePositionData } from "../types";

/**
 * Check if event is TouchEvent
 */
const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return "touches" in event;
};

/**
 * Get client position from mouse or touch event
 */
export const getClientPos = (event: MouseEvent | TouchEvent) => {
  const clientX = isTouch(event) ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch(event) ? event.touches[0].clientY : event.clientY;
  return { clientX, clientY };
};

/**
 * Round number to 2 decimal places
 */
const round = (data: number) => {
  return Math.round(data * 100) / 100;
};

/**
 * Calculate node size and port positions
 */
export const getNodeSize = (nodeDom: HTMLElement | null, inputDoms: HTMLElement[], outputDoms: HTMLElement[]) => {
  if (!nodeDom) {
    return { width: 0, height: 0, outputCenters: [], inputCenters: [] };
  }
  const rect = nodeDom.getBoundingClientRect();
  const parentTop = rect.top;

  const getCenterHeight = (el: HTMLElement) => {
    const oRect = el.getBoundingClientRect();
    return round(oRect.top - parentTop + oRect.height / 2);
  };

  return {
    width: round(rect.width),
    height: round(rect.height),
    inputCenters: inputDoms.map(getCenterHeight),
    outputCenters: outputDoms.map(getCenterHeight),
  };
};

/**
 * Get transform style for node positioning
 */
export const getTransformStyle = (nodeData: GUINodeData, isDragging: boolean) => {
  return {
    transform: `translate(${nodeData.position.x}px, ${nodeData.position.y}px)`,
    zIndex: isDragging ? 1000 : "auto",
  };
};
