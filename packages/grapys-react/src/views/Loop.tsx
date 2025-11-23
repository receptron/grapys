import { useEffect, useRef } from "react";
import { useLocalStore } from "../store";

import { getLoopWhileSources } from "../utils/gui/utils";
import { LoopDataType, NestedGraphList, GUILoopData } from "../utils/gui/type";

const LoopComponent = () => {
  const nodes = useLocalStore((state) => state.nodes());
  const extra = useLocalStore((state) => state.extra());
  const updateExtra = useLocalStore((state) => state.updateExtra);
  const countRef = useRef<HTMLInputElement | null>(null);

  const loop = (extra.loop ?? { loopType: "none" }) as GUILoopData;

  const nestedGraphs: NestedGraphList = []; // TODO: for nested graph
  const whileSources = getLoopWhileSources(nodes, nestedGraphs);

  const updateLoop = (newLoop: GUILoopData) => {
    updateExtra({ ...extra, loop: newLoop });
  };

  useEffect(() => {
    const handleBlur = () => {
      if (loop.loopType === "count") {
        updateLoop({ loopType: "count", count: Number(loop.count) });
      }
    };
    if (countRef.current) {
      countRef.current.addEventListener("blur", handleBlur);
    }
    return () => {
      if (countRef.current) {
        countRef.current.removeEventListener("blur", handleBlur);
      }
    };
  }, [countRef, loop]);

  return (
    <div className="absolute flex w-36 cursor-grab flex-col rounded-md bg-green-400 text-center text-white select-none">
      <div className="w-full rounded-t-md bg-green-500 py-1 text-center leading-none">Loop</div>
      <div className="my-4 p-2">
        <select
          className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
          onChange={(e) => updateLoop({ ...loop, loopType: e.target.value as LoopDataType })}
          value={loop.loopType}
        >
          <option value="none">None</option>
          <option value="while">While</option>
          <option value="count">Count</option>
        </select>

        {loop.loopType === "while" && (
          <div className="mt-2">
            <select
              className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
              onChange={(e) => updateLoop({ ...loop, while: e.target.value === "true" ? true : e.target.value })}
              value={(loop.while === true ? "true" : loop.while) || whileSources[0]}
            >
              {whileSources.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        )}

        {loop.loopType === "count" && (
          <div className="mt-2">
            <input
              type="number"
              className="w-full rounded-md border border-gray-300 p-1 text-black"
              ref={countRef}
              value={loop.count || "1"}
              onChange={(e) => updateLoop({ ...loop, count: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoopComponent;
