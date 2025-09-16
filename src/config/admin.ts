// import admin from "firebase-admin";

// const serviceAccount =
//   process.env.NODE_ENV === "development"
//     ? require("./serviceAccount.json")
//     : JSON.parse(process.env.SERVICE_ACCOUNT as string);
// //require("/etc/secrets/amazintrips-firebase.json"); - for render deployment

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: process.env.STORAGE_BUCKET,
// });

// export const bucket = admin.storage().bucket();

// export default admin;


import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccountEnv = process.env.SERVICE_ACCOUNT;
const serviceAccountPath = path.join(__dirname, "serviceAccount.json");

let serviceAccount;

try {
  // Try to load from local file first (for development)
  if (fs.existsSync(serviceAccountPath)) {
    console.log("🔧 Loading Firebase credentials from serviceAccount.json");
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } 
  // Fallback to environment variable
  else if (serviceAccountEnv) {
    console.log("🔧 Loading Firebase credentials from SERVICE_ACCOUNT env var");
    serviceAccount = JSON.parse(serviceAccountEnv);
  }
  // Last fallback - throw error
  else {
    throw new Error("No Firebase credentials found! Please provide either serviceAccount.json file or SERVICE_ACCOUNT environment variable.");
  }
} catch (error: any) {
  console.error("❌ Failed to load Firebase credentials:", error.message);
  throw new Error("Invalid Firebase service account credentials!");
}

// Validate service account structure
if (!serviceAccount?.project_id || !serviceAccount?.client_email || !serviceAccount?.private_key) {
  throw new Error("Invalid service account: missing required fields (project_id, client_email, private_key)");
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
    databaseURL: `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`
  });
  
  console.log("✅ Firebase Admin SDK initialized successfully");
  console.log(`🔥 Connected to project: ${serviceAccount.project_id}`);
}

export const bucket = admin.storage().bucket();
export default admin;
