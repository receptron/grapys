import { useState, useEffect, useRef } from "react";
import type { ParamData, ApplicationData } from "../utils/gui/type";
import { useNodeUpdate } from "../hooks/useNodeUpdate";

interface NodeComputedParamProps {
  param: ParamData;
  appData: ApplicationData;
  nodeIndex: number;
  onFocus: () => void;
  onBlur: () => void;
}

const NodeComputedParam: React.FC<NodeComputedParamProps> = ({ param, appData, nodeIndex, onFocus, onBlur }) => {
  const [inputValue, setInputValue] = useState(appData.params?.[param.name] ?? "");
  const [booleanValue, setBooleanValue] = useState(appData.params?.[param.name] === true ? "true" : "false");
  const [textAreaValue, setTextAreaValue] = useState(String(appData.params?.[param.name] ?? ""));
  const [rows, setRows] = useState(3);
  const { updateNodeParam } = useNodeUpdate();

  const inputRef = useRef(null);
  const textareaRef = useRef(null);
  const selectRef = useRef(null);

  useEffect(() => {
    const updateValue = appData.params?.[param.name];

    switch (param.type) {
      case "text":
      case "data":
        setTextAreaValue(typeof updateValue === "object" ? JSON.stringify(updateValue, null, 2) : (updateValue ?? ""));
        break;
      case "string":
      case "int":
      case "float":
        setInputValue(String(updateValue ?? ""));
        break;
      case "boolean":
        setBooleanValue(updateValue ? "true" : "false");
        break;
      default:
        break;
    }
  }, [appData, param.name, param.type]);

  const handleFocus = () => {
    setRows(10);
    onFocus();
  };

  const handleBlur = () => {
    setRows(3);
    onBlur();
    updateNodeParam(nodeIndex, param.name, textAreaValue);
  };

  return (
    <div>
      {param.type && <label className="text-xs text-gray-300">{param.name}</label>}
      {param.type === "string" && (
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-md border border-gray-300 p-1 text-black"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => updateNodeParam(nodeIndex, param.name, inputValue)}
        />
      )}
      {(param.type === "text" || param.type === "data") && (
        <textarea
          ref={textareaRef}
          rows={rows}
          className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
        ></textarea>
      )}
      {(param.type === "int" || param.type === "float") && (
        <input
          ref={inputRef}
          type="number"
          className="w-full rounded-md border border-gray-300 p-1 text-black"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => updateNodeParam(nodeIndex, param.name, Number(inputValue))}
        />
      )}
      {param.type === "boolean" && (
        <select
          ref={selectRef}
          className="rounded-md border border-gray-300"
          value={booleanValue}
          onChange={(e) => {
            setBooleanValue(e.target.value);
            updateNodeParam(nodeIndex, param.name, e.target.value === "true");
          }}
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )}
    </div>
  );
};

export default NodeComputedParam;
