import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Blank from "../views/Blank.vue";
import Home from "../views/Home.vue";

const routeChildren: Array<RouteRecordRaw> = [
  {
    path: "",
  },
];

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: Home,
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
