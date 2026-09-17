import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Valores públicos do projeto Firebase (config web é pública por design; a proteção
 * real vem das regras do Firestore + allowlist + domínios autorizados). Servem de
 * reserva caso as variáveis de ambiente estejam ausentes ou tenham vindo com lixo
 * de copiar/colar (ex.: quebras de linha ou texto extra grudado no valor).
 */
const RESERVA = {
  apiKey: "AIzaSyDuluneBSHDBxqfdDYHB1LWacb2WW6zQTY",
  authDomain: "dss-hub-863b4.firebaseapp.com",
  projectId: "dss-hub-863b4",
  storageBucket: "dss-hub-863b4.firebasestorage.app",
  messagingSenderId: "671048543752",
  appId: "1:671048543752:web:836c225419026945836bbd",
};

/** Higieniza um valor de ambiente: tira espaços e pega só o primeiro "token"
 * (descarta qualquer coisa colada depois de uma quebra de linha/espaço). */
function limpa(valor: unknown, reserva: string): string {
  const token = String(valor ?? "").trim().split(/\s+/)[0];
  return token || reserva;
}

const config = {
  apiKey: limpa(import.meta.env.VITE_FIREBASE_API_KEY, RESERVA.apiKey),
  authDomain: limpa(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, RESERVA.authDomain),
  projectId: limpa(import.meta.env.VITE_FIREBASE_PROJECT_ID, RESERVA.projectId),
  storageBucket: limpa(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, RESERVA.storageBucket),
  messagingSenderId: limpa(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    RESERVA.messagingSenderId,
  ),
  appId: limpa(import.meta.env.VITE_FIREBASE_APP_ID, RESERVA.appId),
};

/** Com a config pública embutida como reserva, a nuvem está sempre disponível. */
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

/** E-mails autorizados a entrar (allowlist). Robusto contra lixo de colagem:
 * separa por vírgula OU espaço e mantém só o que parece e-mail. */
const emailsBrutos = String(import.meta.env.VITE_ALLOWED_EMAILS ?? "")
  .split(/[\s,]+/)
  .map((e) => e.trim().toLowerCase())
  .filter((e) => e.includes("@"));

const RESERVA_EMAILS = [
  "danyy.jonathan@gmail.com",
  "simonedasilvasantos173@gmail.com",
  "suellengarcia.silva@gmail.com",
];

export const allowedEmails: string[] =
  emailsBrutos.length > 0 ? emailsBrutos : RESERVA_EMAILS;
