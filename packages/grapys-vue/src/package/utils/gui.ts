import type { GUINodeData } from "../../utils/gui/type";

const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent => {
  return "touches" in event;
};

const round = (data: number) => {
  return Math.round(data * 100) / 100;
};

export const getClientPos = (event: MouseEvent | TouchEvent) => {
  const clientX = isTouch(event) ? event.touches[0].clientX : event.clientX;
  const clientY = isTouch(event) ? event.touches[0].clientY : event.clientY;
  return { clientX, clientY };
};


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

export const getTransformStyle = (nodeData: GUINodeData, isDragging: boolean) => {
  return {
    transform: `translate(${nodeData?.position?.x ?? 0}px, ${nodeData?.position?.y ?? 0}px)`,
    cursor: isDragging ? "grabbing" : "grab",
  };
};
