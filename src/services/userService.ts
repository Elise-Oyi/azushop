import { FirestoreRepo } from "../repo/firestore.repo.js";
import { type User } from "../models/user.model.js";
import Collection from "../config/collections.js";
import { db, isFirebaseInitialized } from "../config/firebase.js";

let userRepo: FirestoreRepo<User> | null = null;

// Only initialize if Firebase is available
if (db && isFirebaseInitialized) {
  userRepo = new FirestoreRepo<User>(Collection.azushopUser);
}

export const userService = {
  async createUser(data: Partial<User>) {
    if (!userRepo) {
      throw new Error("Firebase not initialized");
    }
    return userRepo.create(data);
  },

  async findByEmail(email: string) {
    if (!userRepo) {
      throw new Error("Firebase not initialized");
    }
    return userRepo.getByField("email", email);
  },
  
  async findByUserId(userId: string) {
    if (!userRepo) {
      throw new Error("Firebase not initialized");
    }
    return userRepo.getByField("userId", userId);
  },

  async updateUser(id: string, data: Partial<User>) {
    if (!userRepo) {
      throw new Error("Firebase not initialized");
    }
    return userRepo.update(id, data);
  }
};
