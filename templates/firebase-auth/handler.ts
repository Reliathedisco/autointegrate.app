import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export const firebaseInit = () => {
  const app = initializeApp({
    apiKey: process.env.FIREBASE_API_KEY!,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.FIREBASE_PROJECT_ID!,
  });

  return getAuth(app);
};

export const exampleLogin = async (email: string, password: string) => {
  const auth = firebaseInit();
  return signInWithEmailAndPassword(auth, email, password);
};

