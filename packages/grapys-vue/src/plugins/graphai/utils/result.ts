const resultsOfInner = (input: unknown, nodes: Record<string, string | string[]>): unknown => {
  if (Array.isArray(input)) {
    return input.map((inp) => resultsOfInner(inp, nodes)).filter((ret) => ret);
  }
  if (isNamedInputs(input)) {
    return resultsOf(input, nodes);
  }
  if (typeof input === "string") {
    const templateMatch = [...input.matchAll(/\${(:[^}]+)}/g)].map((ma) => ma[1]);
    if (templateMatch.length > 0) {
      const results = resultsOfInner(templateMatch, nodes);
      return Array.from(templateMatch.keys()).reduce((tmp, key) => {
        return tmp.replaceAll("${" + templateMatch[key] + "}", "${" + (results as Record<string, string>)[key] + "}");
      }, input);
    }
  }
  return resultOf(input, nodes);
};

export const resultsOf = (inputs: Record<string, unknown>, nodes: Record<string, string | string[]>) => {
  return Object.keys(inputs).reduce((tmp: Record<string, string | string[]>, key) => {
    const input = inputs[key];
    const result = (isNamedInputs(input) ? resultsOf(input, nodes) : resultsOfInner(input, nodes)) as string | string[] | undefined;
    if (result !== undefined) {
      tmp[key] = result;
    }
    return tmp;
  }, {});
};

const resultOf = (source: unknown, nodes: Record<string, string | string[]>) => {
  if (typeof source === "string" && source[0] === ":") {
    const props = source.slice(1).split(".");
    const key = props[0];

    if (nodes && nodes[key]) {
      if (props.length > 1) {
        return [nodes[key], ...props.slice(1)].join(".");
      }
      return nodes[key];
    }
    return;
  }
  return source;
};

export const isObject = (x: unknown): x is Record<string, unknown> => {
  return x !== null && typeof x === "object";
};

const isNamedInputs = (namedInputs: unknown): namedInputs is Record<string, unknown> => {
  return isObject(namedInputs) && !Array.isArray(namedInputs) && Object.keys(namedInputs || {}).length > 0;
};
