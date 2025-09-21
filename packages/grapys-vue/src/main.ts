import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import "highlight.js/styles/intellij-light.css";
import hljs from "highlight.js/lib/core";
import json from "highlight.js/lib/languages/json";
import hljsVuePlugin from "@highlightjs/vue-plugin";

hljs.registerLanguage("json", json);

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(hljsVuePlugin);
app.mount("#app");
