export const googleSignin = (callback?: () => void, errorCallback?: (error: Error) => void) => () => {
  try {
    callback?.();
    console.info("[Mock] googleSignin invoked");
  } catch (error) {
    if (error instanceof Error) {
      errorCallback?.(error);
    }
  }
};

