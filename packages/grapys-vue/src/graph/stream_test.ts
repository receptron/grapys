export const graphData = {
  nodes: {},

  metadata: {
    data: {
      nodes: [
        {
          data: {
            value: "this is streaming test",
            staticNodeType: "text",
          },
          nodeId: "test",
          type: "static",
          position: {
            x: 30.664060347566476,
            y: 113.92399307959997,
            width: 143.99,
            height: 224.3,
            inputCenters: [55.95],
            outputCenters: [35.97],
          },
        },
        {
          data: {
            agent: "streamMockAgent",
            guiAgentId: "streamMockAgent",
            params: {
              stream: true,
              isResult: true,
            },
          },
          nodeId: "stream",
          type: "computed",
          position: {
            x: 655.2569383567242,
            y: 19.570546630608703,
            width: 143.99,
            height: 314.05,
            inputCenters: [75.94],
            outputCenters: [55.95],
          },
        },
        {
          data: {
            value: "hello world.",
            staticNodeType: "text",
          },
          nodeId: "test2",
          type: "static",
          position: {
            x: 30.805477466806792,
            y: 365.58810297237505,
            width: 143.99,
            height: 224.3,
            inputCenters: [55.95],
            outputCenters: [35.97],
          },
        },
        {
          data: {
            value: "pen pineapple apple pen.",
            staticNodeType: "text",
          },
          nodeId: "test3",
          type: "static",
          position: {
            x: 46.20569295832968,
            y: 647.2047178164688,
            width: 143.99,
            height: 224.3,
            inputCenters: [55.95],
            outputCenters: [35.97],
          },
        },
        {
          data: {
            agent: "streamMockAgent",
            guiAgentId: "streamMockAgent",
            params: {
              stream: true,
              isResult: true,
            },
          },
          nodeId: "stream2",
          type: "computed",
          position: {
            x: 375.6919781212091,
            y: 324.4295405050342,
            width: 143.99,
            height: 314.05,
            inputCenters: [75.94],
            outputCenters: [55.95],
          },
        },
        {
          data: {
            agent: "streamMockAgent",
            guiAgentId: "streamMockAgent",
            params: {
              stream: true,
              isResult: true,
            },
          },
          nodeId: "stream3",
          type: "computed",
          position: {
            x: 426.5374377798934,
            y: 690.6786483375371,
            width: 143.99,
            height: 314.05,
            inputCenters: [75.94],
            outputCenters: [55.95],
          },
        },
        {
          data: {
            agent: "sleeperAgent",
            guiAgentId: "sleeperAgent",
            params: {
              duration: 2000,
            },
          },
          nodeId: "sleep",
          type: "computed",
          position: {
            x: 353.287059378207,
            y: 102.91873273093196,
            width: 143.99,
            height: 176.99,
            inputCenters: [75.94, 91.93],
            outputCenters: [55.95],
          },
        },
      ],
      edges: [
        {
          type: "edge",
          source: {
            nodeId: "test2",
            index: 0,
          },
          target: {
            nodeId: "stream2",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "test3",
            index: 0,
          },
          target: {
            nodeId: "stream3",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "test",
            index: 0,
          },
          target: {
            nodeId: "sleep",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "sleep",
            index: 0,
          },
          target: {
            nodeId: "stream",
            index: 0,
            direction: "outbound",
          },
        },
      ],
      loop: {
        loopType: "none",
      },
    },
    forNested: {
      output: {
        stream_message: ".stream.message",
        stream2_message: ".stream2.message",
        stream3_message: ".stream3.message",
      },
      outputs: [
        {
          name: "stream_message",
        },
        {
          name: "stream2_message",
        },
        {
          name: "stream3_message",
        },
      ],
    },
  },
};
