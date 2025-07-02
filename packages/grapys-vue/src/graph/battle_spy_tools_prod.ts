import { GraphData } from "graphai";
import { battleAPIBaseURL } from "../config/project";
export const graphChat: GraphData = {
  version: 0.5,
  nodes: {
    gameid: {
      value: "123aaa",
    },
    bot: {
      agent: "copyAgent",
      params: {
        isResult: true,
      },
      inputs: {
        message: {
          role: "bot",
          content: ":spy.board",
        },
      },
      isResult: true,
    },
    spy: {
      agent: "vanillaFetchAgent",
      params: {},
      inputs: {
        url: battleAPIBaseURL + "/${:gameid}/spymaster_state",
      },
      isResult: false,
    },
    llm: {
      agent: "openAIAgent",
      params: {
        stream: true,
        isResult: true,
        temperature: 0.7,
      },
      inputs: {
        prompt: ":merge.array",
        tools: ":toolsData",
      },
      isResult: true,
    },
    merge: {
      agent: "copyAgent",
      params: {},
      inputs: {
        array: [":prompt", ":json.text"],
      },
      isResult: false,
    },
    prompt: {
      value: "You are the red team.\nGive hints for the code names from the given JSON data.",
    },
    message: {
      agent: "copyAgent",
      params: {
        isResult: true,
      },
      inputs: {
        message: {
          role: "bot",
          content: ":llm.text",
        },
      },
      isResult: true,
    },
    json: {
      agent: "jsonParserAgent",
      params: {},
      inputs: {
        data: ":spy.board",
      },
      isResult: false,
    },
    toolsBot: {
      agent: "copyAgent",
      params: {
        isResult: true,
      },
      inputs: {
        message: {
          role: "bot",
          content: ":arg.hint",
        },
      },
      isResult: true,
    },
    toolsData: {
      value: [
        {
          type: "function",
          function: {
            name: "spyHint",
            description: "post spy hint",
            parameters: {
              type: "object",
              properties: {
                hint: {
                  type: "string",
                  description: "hint message",
                },
                guess_count: {
                  type: "number",
                  description: "number of guess",
                },
              },
              required: ["hint", "guess_count"],
            },
          },
        },
      ],
    },
    arg: {
      agent: "copyAgent",
      params: {
        namedKey: "arguments",
      },
      inputs: {
        arguments: ":llm.tool.arguments",
      },
      isResult: false,
    },
    submit: {
      agent: "vanillaFetchAgent",
      params: {},
      inputs: {
        url: battleAPIBaseURL + "/${:gameid}/submit_hint",
        body: {
          hint: ":arg.hint",
          guess_count: ":arg.guess_count",
        },
      },
      isResult: false,
    },
  },
  metadata: {
    data: {
      nodes: [
        {
          data: {
            value: "123aaa",
            staticNodeType: "text",
          },
          nodeId: "gameid",
          type: "static",
          position: {
            x: 25.983502015446106,
            y: 151.29806604095972,
            width: 144,
            height: 243,
            inputCenters: [56],
            outputCenters: [36],
          },
        },
        {
          data: {
            agent: "copyAgent",
            guiAgentId: "dataToChatBotAgent",
            params: {
              isResult: true,
            },
          },
          nodeId: "bot",
          type: "computed",
          position: {
            x: 289.81203211878244,
            y: 714.920187424845,
            width: 144,
            height: 168,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
        {
          data: {
            agent: "vanillaFetchAgent",
            guiAgentId: "spyMasterAgent",
            params: {},
          },
          nodeId: "spy",
          type: "computed",
          position: {
            x: 45.01068422496144,
            y: 539.7067886578145,
            width: 144,
            height: 120,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
        {
          data: {
            agent: "openAIAgent",
            guiAgentId: "openAIAgent",
            params: {
              stream: true,
              isResult: true,
              temperature: 0.7,
            },
          },
          nodeId: "llm",
          type: "computed",
          position: {
            x: 651.9245138430258,
            y: 305.53342756634777,
            width: 144,
            height: 636,
            inputCenters: [156, 172, 188, 204],
            outputCenters: [56, 72, 88, 104, 120, 136],
          },
        },
        {
          data: {
            agent: "copyAgent",
            guiAgentId: "itemToArrayAgent",
            params: {},
          },
          nodeId: "merge",
          type: "computed",
          position: {
            x: 456.34420354120834,
            y: 428.63439085065426,
            width: 144,
            height: 168,
            inputCenters: [76, 92, 108, 124],
            outputCenters: [56],
          },
        },
        {
          data: {
            value: "You are the red team.\nGive hints for the code names from the given JSON data.",
            staticNodeType: "text",
          },
          nodeId: "prompt",
          type: "static",
          position: {
            x: 221.79657459639623,
            y: 240.25551654363744,
            width: 144,
            height: 243,
            inputCenters: [56],
            outputCenters: [36],
          },
        },
        {
          data: {
            agent: "copyAgent",
            guiAgentId: "dataToChatBotAgent",
            params: {
              isResult: true,
            },
          },
          nodeId: "message",
          type: "computed",
          position: {
            x: 829.2313530368328,
            y: 229.07262572529368,
            width: 144,
            height: 168,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
        {
          data: {
            agent: "jsonParserAgent",
            guiAgentId: "dataToJsonString",
            params: {},
          },
          nodeId: "json",
          type: "computed",
          position: {
            x: 233.57405458719063,
            y: 519.3930946463338,
            width: 144,
            height: 120,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
        {
          data: {
            agent: "copyAgent",
            guiAgentId: "dataToChatBotAgent",
            params: {
              isResult: true,
            },
          },
          nodeId: "toolsBot",
          type: "computed",
          position: {
            x: 979.2916891280795,
            y: 679.137032070028,
            width: 144,
            height: 168,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
        {
          data: {
            value: [
              {
                type: "function",
                function: {
                  name: "spyHint",
                  description: "post spy hint",
                  parameters: {
                    type: "object",
                    properties: {
                      hint: {
                        type: "string",
                        description: "hint message",
                      },
                      guess_count: {
                        type: "number",
                        description: "number of guess",
                      },
                    },
                    required: ["hint", "guess_count"],
                  },
                },
              },
            ],
            staticNodeType: "data",
          },
          nodeId: "toolsData",
          type: "static",
          position: {
            x: 454.50456560391444,
            y: 618.6718665921711,
            width: 144,
            height: 267,
            inputCenters: [56],
            outputCenters: [36],
          },
        },
        {
          data: {
            agent: "copyAgent",
            guiAgentId: "arguments2hintPost",
            params: {
              namedKey: "arguments",
            },
          },
          nodeId: "arg",
          type: "computed",
          position: {
            x: 838.1263516798331,
            y: 500.00622874524447,
            width: 144,
            height: 136,
            inputCenters: [92],
            outputCenters: [56, 72],
          },
        },
        {
          data: {
            agent: "vanillaFetchAgent",
            guiAgentId: "submitHintAgent",
            params: {},
          },
          nodeId: "submit",
          type: "computed",
          position: {
            x: 1114.7906895487015,
            y: 129.06052192260245,
            width: 144,
            height: 136,
            inputCenters: [60, 76, 92],
            outputCenters: [],
          },
        },
      ],
      edges: [
        {
          type: "edge",
          source: {
            nodeId: "gameid",
            index: 0,
          },
          target: {
            nodeId: "spy",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "spy",
            index: 0,
          },
          target: {
            nodeId: "bot",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "llm",
            index: 2,
          },
          target: {
            nodeId: "message",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "spy",
            index: 0,
          },
          target: {
            nodeId: "json",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "merge",
            index: 0,
          },
          target: {
            nodeId: "llm",
            index: 1,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "toolsData",
            index: 0,
          },
          target: {
            nodeId: "llm",
            index: 3,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "llm",
            index: 3,
          },
          target: {
            nodeId: "arg",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "arg",
            index: 0,
          },
          target: {
            nodeId: "toolsBot",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "arg",
            index: 0,
          },
          target: {
            nodeId: "submit",
            index: 1,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "arg",
            index: 1,
          },
          target: {
            nodeId: "submit",
            index: 2,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "gameid",
            index: 0,
          },
          target: {
            nodeId: "submit",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "json",
            index: 0,
          },
          target: {
            nodeId: "merge",
            index: 1,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "prompt",
            index: 0,
          },
          target: {
            nodeId: "merge",
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
        bot_message: ".bot.message",
        llm_message: ".llm.message",
        llm_messages: ".llm.messages",
        llm_text: ".llm.text",
        llm_tool: ".llm.tool",
        llm_tool_calls: ".llm.tool_calls",
        llm_metadata: ".llm.metadata",
        message_message: ".message.message",
        toolsBot_message: ".toolsBot.message",
      },
      outputs: [
        {
          name: "bot_message",
        },
        {
          name: "llm_message",
          type: "message",
        },
        {
          name: "llm_messages",
        },
        {
          name: "llm_text",
          type: "text",
        },
        {
          name: "llm_tool",
          type: "data",
        },
        {
          name: "llm_tool_calls",
          type: "array",
        },
        {
          name: "llm_metadata",
          type: "data",
        },
        {
          name: "message_message",
        },
        {
          name: "toolsBot_message",
        },
      ],
    },
  },
};
