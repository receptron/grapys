import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { User } from "firebase/auth";

export const useFirebaseStore = defineStore("firebase", () => {
  // null is loading, undefined means not user.
  const firebaseUser = ref<User | null | undefined>(null);

  const setFirebaseUser = (user: User | null | undefined) => {
    firebaseUser.value = user;
  };
  const isSignedIn = computed(() => {
    if (firebaseUser.value === null) {
      return null;
    }
    return Boolean(firebaseUser.value);
  });

  return {
    setFirebaseUser,
    firebaseUser,
    isSignedIn,
  };
});
