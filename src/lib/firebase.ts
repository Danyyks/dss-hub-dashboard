import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * O app só usa a nuvem real quando as chaves do Firebase estão preenchidas.
 * Sem elas, roda em MODO DEMO (localStorage + login fake) para testar o visual.
 */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (isFirebaseConfigured) {
  app = initializeApp(config);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };

/** E-mails autorizados a entrar (allowlist). */
export const allowedEmails: string[] = String(
  import.meta.env.VITE_ALLOWED_EMAILS ?? "",
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);
