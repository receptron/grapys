import { useEffect, useRef } from "react";
import { useLocalStore } from "../store";

import { agentProfiles } from "../utils/gui/data";

const LoopComponent = () => {
  const nodes = useLocalStore((state) => state.nodes());
  const loop = useLocalStore((state) => state.loop());
  const storeUpdateLoop = useLocalStore((state) => state.updateLoop);
  const countRef = useRef(null);

  const lists = nodes.flatMap((node) => {
    const agent = node.data?.guiAgentId;
    if (agent) {
      const profile = agentProfiles[agent] || { outputs: [] };
      return profile.outputs.map((prop) => `:${node.nodeId}.${prop.name}`);
    }
    return [`:${node.nodeId}`];
  });

  const updateLoop = () => {
    if (loop.loopType === "while") {
      storeUpdateLoop({ loopType: "while", while: loop.while });
    } else if (loop.loopType === "count") {
      storeUpdateLoop({ loopType: "count", count: Number(loop.count) });
    } else {
      storeUpdateLoop({ loopType: "none" });
    }
  };

  useEffect(() => {
    const handleBlur = () => updateLoop();
    if (countRef.current) {
      countRef.current.addEventListener("blur", handleBlur);
    }
    return () => {
      if (countRef.current) {
        countRef.current.removeEventListener("blur", handleBlur);
      }
    };
  }, [countRef]);

  return (
    <div className="absolute flex w-36 cursor-grab flex-col rounded-md bg-green-400 text-center text-white select-none">
      <div className="w-full rounded-t-md bg-green-500 py-1 text-center leading-none">Loop</div>
      <div className="my-4 p-2">
        <select
          className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
          onChange={(e) => storeUpdateLoop({ ...loop, loopType: e.target.value })}
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
              onChange={(e) => storeUpdateLoop({ ...loop, while: e.target.value })}
              value={loop.while || lists[0]}
            >
              {lists.map((item) => (
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
              onChange={(e) => storeUpdateLoop({ ...loop, count: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoopComponent;
