import { FC, useEffect, useMemo, useRef } from "react";

import Node from "./Node";
import Edge from "./Edge";
import Loop from "./Loop";

import AddNode from "./AddNode";
import ContextEdgeMenu from "./ContextEdgeMenu";
import ContextNodeMenu from "./ContextNodeMenu";

import GraphRunner from "./GraphRunner";
import TemplateGraph from "./TemplateGraph";
import JsonViewer from "./JsonViewer";

// import { EdgeData, NodePosition, UpdateStaticValue } from "../utils/gui/type";

import { graphChat } from "../graph/chat_tinyswallow";

import { useNewEdge } from "../composable/gui";
import { graphToGUIData, handleDownload } from "../utils/gui/utils";
import { guiEdgeData2edgeData } from "../utils/utils/gui";
import { GraphData, sleep } from "graphai";
import { useLocalStore, node2Record, toGraph } from "../store/index";

const GUI: FC = () => {
  const nodes = useLocalStore((state) => state.nodes());
  const edges = useLocalStore((state) => state.edges());
  const currentData = useLocalStore((state) => state.currentData);
  const nodeRecords = useMemo(() => node2Record(nodes), [nodes]);
  const edgeDataList = useMemo(() => guiEdgeData2edgeData(edges, nodeRecords), [edges, nodeRecords]);

  const undo = useLocalStore((state) => state.undo);
  const redo = useLocalStore((state) => state.redo);
  const undoable = useLocalStore((state) => state.undoable());
  const redoable = useLocalStore((state) => state.redoable());

  const loadData = useLocalStore((state) => state.loadData);

  const contextNodeMenuRef = useRef<{ openMenu: (event: MouseEvent, rect: DOMRect, nodeIndex: number) => void; closeMenu: () => void } | null>(null);
  const contextEdgeMenuRef = useRef<{ openMenu: (event: MouseEvent, rect: DOMRect, edgeIndex: number) => void; closeMenu: () => void } | null>(null);

  const resetGraph = useLocalStore((state) => state.reset);
  const newGraphData = toGraph(currentData);

  const initData = useLocalStore((state) => state.initData);
  const updateNodePosition = useLocalStore((state) => state.updateNodePosition);
  const onSavePosition = useLocalStore((state) => state.saveNodePositionData);

  const updateGraph = (graph: GraphData) => {
    const { rawEdge, rawNode, loop } = graphToGUIData(graph);
    initData(rawNode, rawEdge, { loop });
  };
  useEffect(() => {
    (async () => {
      updateGraph(graphChat);
      await sleep(1);
      onSavePosition();
    })();
  }, []);

  const { svgRef, newEdgeData, onNewEdgeStart, onNewEdge, onNewEdgeEnd, nearestData, edgeConnectable } = useNewEdge();

  const openEdgeMenu = (event: React.MouseEvent, edgeIndex: number) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      contextEdgeMenuRef.current?.openMenu(event.nativeEvent, rect, edgeIndex);
    }
  };

  const closeMenu = () => {
    contextNodeMenuRef.current?.closeMenu();
    contextEdgeMenuRef.current?.closeMenu();
  };

  const openNodeMenu = (event: React.MouseEvent, nodeIndex: number) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      contextNodeMenuRef.current?.openMenu(event.nativeEvent, rect, nodeIndex);
    }
  };

  const save = () => {
    const dataStr = JSON.stringify(newGraphData);
    window.localStorage.setItem("GRAPHAIGUI", dataStr);
  };

  const load = () => {
    const data = window.localStorage.getItem("GRAPHAIGUI");
    try {
      if (data) {
        const graphData = JSON.parse(data);
        loadData(graphData.metadata.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setGraph = async (graph: GraphData) => {
    resetGraph({ loop: { loopType: "none" } });
    await sleep(1);
    updateGraph(graph);
    await sleep(1);
    onSavePosition();
  };

  return (
    <div>
      <div className="flex h-screen w-full">
        <aside className="w-48 p-4 text-center">
          <h2 className="text-lg font-bold">Menu</h2>
          <AddNode />
          <hr />
          <button
            onClick={undo}
            className={`m-1 cursor-pointer items-center rounded-full px-4 py-2 font-bold text-white ${undoable ? "bg-sky-500 hover:bg-sky-700" : "bg-sky-200"}`}
          >
            Undo
          </button>
          <button
            onClick={redo}
            className={`m-1 cursor-pointer items-center rounded-full px-4 py-2 font-bold text-white ${redoable ? "bg-sky-500 hover:bg-sky-700" : "bg-sky-200"}`}
          >
            Redo
          </button>
          <hr />
          <div>
            <button onClick={() => resetGraph({ loop: { loopType: "none" } })} className="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">
              Clear Graph
            </button>
          </div>
          <hr />
          <div>
            <button onClick={save} className="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">
              Save Graph
            </button>
          </div>
          <div>
            <button onClick={load} className="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white">
              Load Graph
            </button>
          </div>
          <div>
            <button
              onClick={() => handleDownload(newGraphData)}
              className="m-1 cursor-pointer items-center rounded-full bg-sky-500 px-4 py-2 font-bold text-white"
            >
              Download
            </button>
          </div>
          <hr />
          <TemplateGraph onSetGraph={setGraph} />
        </aside>
        <main className="relative flex-1">
          <div className="relative h-[100vh] overflow-hidden rounded-md border-4 border-gray-200" onClick={closeMenu}>
            <svg x="0" y="0" className="absolute h-[100%] w-full" ref={svgRef}>
              {edgeDataList.map((edge, index) => (
                <Edge
                  key={`edge-${edge.source}-${edge.target}-${index}`}
                  sourceData={edge.source}
                  targetData={edge.target}
                  index={index}
                  openEdgeMenu={openEdgeMenu}
                />
              ))}
              {newEdgeData && <Edge sourceData={newEdgeData.source} targetData={newEdgeData.target} isConnectable={edgeConnectable} />}{" "}
            </svg>
            <Loop />
            {nodes.map((node, index) => (
              <Node
                key={`${node.nodeId}-${index}`}
                nodeIndex={index}
                nodeData={node}
                nearestData={nearestData}
                onUpdatePosition={(pos) => updateNodePosition(index, pos)}
                onSavePosition={onSavePosition}
                onNewEdgeStart={onNewEdgeStart}
                onNewEdge={onNewEdge}
                onNewEdgeEnd={onNewEdgeEnd}
                onOpenNodeMenu={(e) => openNodeMenu(e, index)}
              />
            ))}
            <ContextNodeMenu ref={contextNodeMenuRef} />
            <ContextEdgeMenu ref={contextEdgeMenuRef} />
            <div className="justify-top pointer-events-none absolute top-0 right-0 z-10 flex flex-row items-start space-x-4 pt-4 pr-4 pb-4">
              <JsonViewer jsonData={newGraphData} />
              <GraphRunner graphData={newGraphData} />
            </div>
          </div>
        </main>
      </div>
      <div className="bg-red-200 bg-red-300 bg-red-400 bg-red-500"></div>
      <div className="bg-green-200 bg-green-300 bg-green-400 bg-green-500"></div>
      <div className="bg-blue-200 bg-blue-300 bg-blue-400 bg-blue-500"></div>
      <div className="bg-yellow-200 bg-yellow-300 bg-yellow-400 bg-yellow-500"></div>
      <div className="bg-violet-200 bg-violet-500"></div>
    </div>
  );
};

export default GUI;
