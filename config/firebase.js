import admin from "firebase-admin";
import { readFileSync } from "fs";
import { resolve } from "path";

let initialized = false;

export const initFirebase = () => {
  if (initialized) return admin;

  try {
    const path = resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        "./firebase-service-account.json"
    );
    const serviceAccount = JSON.parse(readFileSync(path, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log("✅ Firebase Admin initialized");
    return admin;
  } catch (error) {
    console.error("❌ Firebase init failed:", error.message);
    console.error("   Place firebase-service-account.json in apps/api/");
    return null;
  }
};

export default admin;