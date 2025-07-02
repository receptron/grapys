import { GraphData } from "graphai";
import { battleAPIBaseURL } from "../config/project";
export const graphChat: GraphData = {
  version: 0.5,
  nodes: {
    register: {
      agent: "vanillaFetchAgent",
      params: {
        url: battleAPIBaseURL + "/register",
        method: "POST",
      },
      inputs: {
        body: {
          game_id: ":gameid",
          team: ":team",
        },
      },
      isResult: false,
    },
    gameid: {
      value: "123aaa",
    },
    team: {
      value: "red",
    },
    bot: {
      agent: "copyAgent",
      params: {
        isResult: true,
      },
      inputs: {
        message: {
          role: "bot",
          content: ":register.status",
        },
      },
      isResult: true,
    },
  },
  metadata: {
    data: {
      nodes: [
        {
          data: {
            agent: "vanillaFetchAgent",
            guiAgentId: "gameRegister",
            params: {
              url: battleAPIBaseURL + "/register",
              method: "POST",
            },
          },
          nodeId: "register",
          type: "computed",
          position: {
            x: 264.40842059070985,
            y: 187.36026804684178,
            width: 144,
            height: 136,
            inputCenters: [76, 92],
            outputCenters: [56],
          },
        },
        {
          data: {
            value: "123aaa",
            staticNodeType: "text",
          },
          nodeId: "gameid",
          type: "static",
          position: {
            x: 40.983502015446106,
            y: 185.29806604095972,
            width: 144,
            height: 243,
            inputCenters: [56],
            outputCenters: [36],
          },
        },
        {
          data: {
            value: "red",
            staticNodeType: "text",
          },
          nodeId: "team",
          type: "static",
          position: {
            x: 42.00856458618915,
            y: 453.5002510361081,
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
            x: 513.8120321187824,
            y: 166.92018742484504,
            width: 144,
            height: 168,
            inputCenters: [76],
            outputCenters: [56],
          },
        },
      ],
      edges: [
        {
          type: "edge",
          source: {
            nodeId: "team",
            index: 0,
          },
          target: {
            nodeId: "register",
            index: 1,
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
            nodeId: "register",
            index: 0,
            direction: "outbound",
          },
        },
        {
          type: "edge",
          source: {
            nodeId: "register",
            index: 0,
          },
          target: {
            nodeId: "bot",
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
      },
      outputs: [
        {
          name: "bot_message",
        },
      ],
    },
  },
};
