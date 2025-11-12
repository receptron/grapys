import type { Meta, StoryObj } from "@storybook/vue3";
import { toRef, watch } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import type { User } from "firebase/auth";

import Layout from "./Layout.vue";
import { useFirebaseStore } from "../store/firebase";

const meta: Meta<typeof Layout> = {
  title: "Components/Layout",
  component: Layout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    authState: {
      control: "select",
      options: ["loading", "signedOut", "signedIn"],
      description: "Mocked Firebase authentication state for the story.",
    },
  } as any,
  args: {
    authState: "loading",
  } as any,
};

export default meta;

type Story = StoryObj<typeof meta>;

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        component: {
          template:
            '<div class="mx-auto max-w-3xl p-6 text-left text-slate-800">\n              <h2 class="text-xl font-semibold">Workspace</h2>\n              <p class="mt-2 text-sm text-slate-600">This content is rendered once the layout unlocks the router view.</p>\n            </div>',
        },
      },
    ],
  });

export const FirebaseStates: Story = {
  render: (args, { app }) => {
    const pinia = createPinia();
    app.use(pinia);
    setActivePinia(pinia);

    const router = makeRouter();
    app.use(router);
    router.push("/");

    return {
      components: { Layout },
      setup() {
        const firebaseStore = useFirebaseStore();
        const authState = toRef(args as { authState: string }, "authState");

        const applyAuthState = (state: string) => {
          if (state === "signedIn") {
            const mockUser = { displayName: "Storybook User" } as User;
            firebaseStore.setFirebaseUser(mockUser);
            return;
          }

          if (state === "signedOut") {
            firebaseStore.setFirebaseUser(undefined);
            return;
          }

          firebaseStore.setFirebaseUser(null);
        };

        watch(authState, (state) => applyAuthState(state), { immediate: true });

        return {};
      },
      template: "<Layout />",
    };
  },
};

