import { NestedGraphList } from "../utils/gui/type";
import { GraphData } from "graphai";
import { graphChat as graphChatOpenAI } from "../graph/chat";
import { graphChat as graphChatOllama } from "../graph/chat_ollama";
import { graphChat as graphChatTinySwallow } from "../graph/chat_tinyswallow";
import { graphChat as graphChatAlone } from "../graph/chat_alone";
import { graphData as graphDataReducerPush } from "../graph/reducer_push";
import { graphData as graphDataReducerPop } from "../graph/reducer_pop";
import { graphData as graphDataTools } from "../graph/tools1";
import { graphData as graphDataStreamTest } from "../graph/stream_test";
import { graphData as graphDataStreamTest2 } from "../graph/stream_test2";
import { graphData as graphDataReception } from "../graph/reception";
import { graphData as graphDataBrowserless } from "../graph/browserless";
import { graphData as graphDataImageGenerator } from "../graph/image_generator";
import { graphData as graphDataFetch } from "../graph/fetch";

export const graphs: NestedGraphList = [
  { name: "Chat(WebLLM)", graph: graphChatTinySwallow, id: "pkrDLhdU5zUb77mN" },
  { name: "Chat(Alone)", graph: graphChatAlone, id: "dJ5cw36SevqDkxFN" },
  { name: "Chat(OpenAI)", graph: graphChatOpenAI, id: "VTG5pDThGX5eBJLp" },
  { name: "Chat(Ollama)", graph: graphChatOllama, id: "Wtqyw2nJNsCNAEuZ" },
  { name: "Reducer(push)", graph: graphDataReducerPush, id: "9GAvdvH8fHz9bGQA" },
  { name: "Reducer(pop)", graph: graphDataReducerPop, id: "gxk6gbkvmKU6YcFg" },
  { name: "Tools(co2)", graph: graphDataTools, id: "budDwizRYewqLE9M" },
  { name: "Tools(Reception)", graph: graphDataReception, id: "RR66KrYiBPz6342e" },
  { name: "fetch", graph: graphDataFetch, id: "e6mYntjhLF7Tg6Rb" },
  { name: "Browserless", graph: graphDataBrowserless, id: "GvpPnsQEGNWbq8SJ" },
  { name: "StreamTest", graph: graphDataStreamTest, id: "F554SdJ4YHahiq9s" },
  { name: "StreamTest2", graph: graphDataStreamTest2, id: "4LnRCCjHNcx56r5h" },
  { name: "ImageGenerator", graph: graphDataImageGenerator, id: "Ck2ETL93rwYXtMLv" },
];

export const graphConfigs = {
  openAIAgent: {
    apiKey: import.meta.env.VITE_OPEN_API_KEY,
    forWeb: true,
  },
  openAIImageAgent: {
    apiKey: import.meta.env.VITE_OPEN_API_KEY,
    forWeb: true,
  },
  anthropicAgent: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    forWeb: true,
  },
  geminiAgent: {
    apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY,
    forWeb: true,
  },
  browserlessAgent: {
    apiKey: import.meta.env.VITE_BROWSERLESS_API_TOKEN,
  },
};
