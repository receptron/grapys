import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Blank from "../views/Blank.vue";
import Home from "../views/Home.vue";
import SimpleExample from "../views/SimpleExample.vue";
import InteractiveExample from "../views/InteractiveExample.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/simple",
    name: "SimpleExample",
    component: SimpleExample,
  },
  {
    path: "/interactive",
    name: "InteractiveExample",
    component: InteractiveExample,
  },
  {
    path: "/:page(.*)",
    name: "NotFoundPage",
    component: Blank,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
