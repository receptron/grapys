import { GraphData } from "graphai";
export const graphChat: GraphData = {
  nodes: {},
  metadata: {
    data: {
      nodes: [
        {
          type: "static",
          nodeId: "messages",
          position: {
            x: 198,
            y: 24,
            width: 143.99,
            height: 264.28,
            inputCenters: [55.95],
            outputCenters: [35.97],
          },
          data: {
            value: [],
            staticNodeType: "data",
          },
        },
        {
          type: "computed",
          nodeId: "userInput",
          position: {
            x: 440,
            y: 35,
            width: 143.99,
            height: 183.88,
            inputCenters: [91.93],
            outputCenters: [55.95, 71.94],
          },
          data: {
            params: {
              message: "You:",
              isResult: true,
            },
            guiAgentId: "eventAgent",
          },
        },
        {
          type: "computed",
          nodeId: "llm",
          position: {
            x: 58,
            y: 348,
            width: 143.99,
            height: 616.55,
            inputCenters: [139.9, 155.89, 171.88, 187.86],
            outputCenters: [55.95, 71.94, 87.93, 103.92, 119.91],
          },
          data: {
            params: {
              forWeb: true,
              stream: true,
              isResult: true,
              model: "llama3",
              baseURL: "http://127.0.0.1:11434/v1",
            },
            guiAgentId: "openAIAgent",
          },
        },
        {
          type: "computed",
          nodeId: "reducer",
          position: {
            x: 300,
            y: 350,
            width: 143.99,
            height: 151.88,
            inputCenters: [75.94, 91.93, 107.92],
            outputCenters: [55.95],
          },
          data: {
            guiAgentId: "pushAgent",
          },
        },
      ],
      edges: [
        {
          source: {
            nodeId: "reducer",
            index: 0,
          },
          target: {
            nodeId: "messages",
            index: 0,
          },
          type: "edge",
        },
        {
          source: {
            nodeId: "messages",
            index: 0,
          },
          target: {
            nodeId: "llm",
            index: 0,
          },
          type: "edge",
        },
        {
          source: {
            nodeId: "userInput",
            index: 0,
          },
          target: {
            nodeId: "llm",
            index: 1,
          },
          type: "edge",
        },
        {
          source: {
            nodeId: "messages",
            index: 0,
          },
          target: {
            nodeId: "reducer",
            index: 0,
          },
          type: "edge",
        },
        {
          source: {
            nodeId: "userInput",
            index: 1,
          },
          target: {
            nodeId: "reducer",
            index: 2,
          },
          type: "edge",
        },
        {
          source: {
            nodeId: "llm",
            index: 0,
          },
          target: {
            nodeId: "reducer",
            index: 2,
          },
          type: "edge",
        },
      ],
      loop: {
        loopType: "while",
        while: ":continue",
      },
    },
  },
};
