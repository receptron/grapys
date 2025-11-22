import { useState, useEffect, useRef, useCallback, ChangeEventHandler } from "react";
import type { GUINodeData, UpdateStaticValue, StaticNodeType } from "../utils/gui/type";
import { staticNodeOptions } from "../utils/utils/classUtils";
import { isObject } from "graphai";

interface NodeStaticValueProps {
  nodeData: GUINodeData;
  onFocus: () => void;
  onBlur: () => void;
  onUpdateStaticValue: (value: UpdateStaticValue) => void;
}
/*
  Handle the value of a static node.
  In the form, it is a text field, and nodeData contains the corresponding data.
  If the data is in a valid JSON format, it is stored as data; otherwise, it is saved as text.
  The form value can be changed either by user input or by modifications from history.
  Be careful when making changes and thoroughly test to ensure history functions correctly.
  History is saved on blur, except for boolean values, which are saved on change.
*/

const NodeStaticValue: React.FC<NodeStaticValueProps> = ({ nodeData, onFocus, onBlur, onUpdateStaticValue }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const selectFormRef = useRef(null);

  const [dataType, setDataType] = useState(nodeData.data.staticNodeType ?? "text");
  const [numberValue, setNumberValue] = useState("0");
  const [booleanValue, setBooleanValue] = useState("true");
  const [textAreaValue, setTextAreaValue] = useState<string>(
    nodeData.data.staticNodeType === "data" ? JSON.stringify(nodeData.data.value, null, 2) : ((nodeData.data.value ?? "") as string),
  );
  const [rows, setRows] = useState(3);

  const isValidData = useCallback(() => {
    if (dataType === "data") {
      try {
        JSON.parse(textAreaValue);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }, [textAreaValue, dataType]);

  const handleFocus = (event: FocusEvent) => {
    if (event.target instanceof HTMLTextAreaElement) {
      onFocus && onFocus();
      setRows(10);
    }
  };
  const handleBlur = useCallback(
    (event: FocusEvent) => {
      if (event.target instanceof HTMLTextAreaElement) {
        setRows(3);
        onBlur && onBlur();
        const value = dataType === "data" && isValidData() ? JSON.parse(textAreaValue) : textAreaValue;
        onUpdateStaticValue && onUpdateStaticValue({ value, staticNodeType: dataType });
      }
    },
    [dataType, textAreaValue],
  );

  const handleNumberBlur = useCallback(() => {
    if (dataType === "number") {
      onUpdateStaticValue && onUpdateStaticValue({ value: Number(numberValue), staticNodeType: dataType });
    }
  }, [dataType, numberValue]);

  const handleBooleanChange: ChangeEventHandler<HTMLSelectElement> = useCallback(
    (e) => {
      setBooleanValue(e.target.value);
      onUpdateStaticValue &&
        onUpdateStaticValue({
          value: e.target.value === "true",
          staticNodeType: dataType,
        });
    },
    [dataType, booleanValue],
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.addEventListener("focus", handleFocus);
      textareaRef.current.addEventListener("blur", handleBlur);
    }
    if (inputRef.current) {
      inputRef.current.addEventListener("blur", handleNumberBlur);
    }
    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener("focus", handleFocus);
        textareaRef.current.removeEventListener("blur", handleBlur);
      }
      if (inputRef.current) {
        inputRef.current.removeEventListener("blur", handleNumberBlur);
      }
    };
  }, [handleBlur, handleNumberBlur]);

  useEffect(() => {
    const { staticNodeType, value } = nodeData.data;
    if (staticNodeType) {
      if (staticNodeType !== dataType) {
        setDataType(staticNodeType);
      }
      if (["text", "data"].includes(staticNodeType)) {
        const textData = isObject(value) ? JSON.stringify(value, null, 2) : (value as string);
        if (textAreaValue !== textData) {
          setTextAreaValue(textData);
        }
      }
      if (["boolean"].includes(staticNodeType)) {
        const valueText = value ? "true" : "false";
        if (valueText !== booleanValue) {
          setBooleanValue(valueText);
        }
      }
      if (["number"].includes(staticNodeType)) {
        const valueText = String(value);
        if (valueText !== numberValue) {
          setNumberValue(valueText);
        }
      }
    }
  }, [nodeData.data]);

  return (
    <div>
      <label className="text-xs text-gray-300">Value</label>
      <select
        value={dataType}
        onChange={(e) => setDataType(e.target.value as StaticNodeType)}
        className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
      >
        {staticNodeOptions.map((option, k) => (
          <option key={k} value={option.value}>
            {option.name}
          </option>
        ))}
      </select>
      {["text", "data"].includes(dataType) && (
        <div>
          <textarea
            placeholder="Enter the text"
            className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
            value={textAreaValue}
            onChange={(e) => setTextAreaValue(e.target.value)}
            ref={textareaRef}
            rows={rows}
          />
          {dataType === "data" && <div>{isValidData() ? "valid" : "invalid"}</div>}
        </div>
      )}
      {dataType === "number" && (
        <input
          type="number"
          className="w-full resize-none rounded-md border border-gray-300 p-1 text-black"
          value={numberValue}
          onChange={(e) => setNumberValue(e.target.value)}
          ref={inputRef}
        />
      )}
      {dataType === "boolean" && (
        <select value={booleanValue} onChange={handleBooleanChange} ref={selectFormRef}>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )}
    </div>
  );
};

export default NodeStaticValue;
