import React, { useState, useMemo } from "react";
import type { EdgeData2 } from "../utils/gui/type";
import { convEdgePath } from "../utils/utils/gui";
import { edgeColors } from "../utils/utils/classUtils";

interface EdgeProps {
  sourceData: EdgeData2;
  targetData: EdgeData2;
  isConnectable?: boolean;
  index?: number;
  openEdgeMenu?: (event: React.MouseEvent, edgeIndex: number) => void;
}

const Edge: React.FC<EdgeProps> = ({ sourceData, targetData, isConnectable = true, index, openEdgeMenu }) => {
  const [isHover, setIsHover] = useState(false);

  const edgePath = useMemo(() => {
    return convEdgePath(sourceData.index, sourceData?.data?.position ?? {}, targetData.index, targetData?.data?.position ?? {});
  }, [sourceData, targetData]);

  return (
    <path
      d={edgePath}
      className="pointer-events-auto"
      stroke={isConnectable ? (isHover ? edgeColors.hover : edgeColors.edge) : edgeColors.notConnectable}
      fill="none"
      strokeWidth={isHover ? 4 : 2}
      onDoubleClick={(e) => openEdgeMenu && openEdgeMenu(e, index ?? 0)}
      onMouseOver={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    />
  );
};

export default Edge;
