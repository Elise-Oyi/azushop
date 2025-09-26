import admin from "./admin.js";
import config from "./index.js";

let isFirebaseInitialized = false;

try {
  // Check if Firebase admin was initialized successfully
  if (admin.apps.length > 0) {
    isFirebaseInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
    console.log(`🔥 Connected to project: ${config.firebaseConfig.projectId}`);
  }
} catch (error: any) {
  console.error("❌ Firebase initialization failed:", error.message);
  console.error("🚧 Running without Firebase initialization");
}

// Safe exports
export const db = (() => {
  try {
    return admin.firestore();
  } catch (error) {
    console.error("⚠️ Firestore not available - using mock");
    return null;
  }
})();

export const auth = (() => {
  try {
    return admin.auth();
  } catch (error) {
    console.error("⚠️ Auth not available - using mock");  
    return null;
  }
})();

export const bucket = (() => {
  try {
    return admin.storage().bucket();
  } catch (error) {
    console.error("⚠️ Storage not available - using mock");
    return null;
  }
})();

export { isFirebaseInitialized };
