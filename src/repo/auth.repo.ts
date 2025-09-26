import admin from "../config/admin.js";
import config from "../config/index.js";

export class AuthRepo {

    //-- register user
  async register(email: string, password: string, fullname: string) {
    return await admin.auth().createUser({
      email,
      password,
      displayName: fullname,
    });
  }

  //-- login
  async login(uid: string) {
    return admin.auth().createCustomToken(uid);
  }

  //-- generate token
  async generateToken(uid: string) {
    return await admin.auth().createCustomToken(uid);
  }

  //-- update user
  async update(
    uid: string,
    updates: Partial<{ email: string; password: string; displayName: string }>
  ) {
    return admin.auth().updateUser(uid, updates);
  }

  //-- delete user
  async delete(uid: string) {
    return await admin.auth().deleteUser(uid);
  }

  //-- verify credentials using Firebase Auth REST API
  async verifyCredentials(email: string, password: string) {
    try {
      // Use Firebase Auth REST API to verify email/password
      const apiKey = config.firebaseConfig.apiKey;
      if (!apiKey) {
        throw new Error('API_KEY not found in configuration');
      }

      const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw {
          code: data.error?.message || 'auth/invalid-credentials',
          message: data.error?.message || 'Invalid credentials'
        };
      }

      // Get the full user record from Firebase Admin
      const userRecord = await admin.auth().getUser(data.localId);
      return userRecord;
    } catch (error: any) {
      console.error('Credential verification error:', error);
      throw error;
    }
  }
}
