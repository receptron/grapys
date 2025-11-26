import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Blank from "../views/Blank.vue";
import Home from "../views/Home.vue";
import LandingPage from "../views/LandingPage.vue";
import MinimalExample from "../views/MinimalExample.vue";
import SimpleExample from "../views/SimpleExample.vue";
import InteractiveExample from "../views/InteractiveExample.vue";
import StyledExample from "../views/StyledExample.vue";
import ValidationExample from "../views/ValidationExample.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    component: LandingPage,
  },
  {
    path: "/old-home",
    component: Home,
  },
  {
    path: "/minimal",
    name: "MinimalExample",
    component: MinimalExample,
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
    path: "/styled",
    name: "StyledExample",
    component: StyledExample,
  },
  {
    path: "/validation",
    name: "ValidationExample",
    component: ValidationExample,
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
