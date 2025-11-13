import type { App } from "vue";
import { getCurrentInstance } from "vue";

export const useStoryApp = (): App => {
  const instance = getCurrentInstance();

  if (!instance) {
    throw new Error("useStoryApp must be called from within a story setup context.");
  }

  return instance.appContext.app;
};

