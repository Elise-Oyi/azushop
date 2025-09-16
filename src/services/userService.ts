import { FirestoreRepo } from "../repo/firestore.repo.ts";
import { type User } from "../models/user.model.ts";
import Collection from "../config/collections.ts";
import { db, isFirebaseInitialized } from "../config/firebase.ts";

let userRepo: FirestoreRepo<User> | null = null;

// Only initialize if Firebase is available
if (db && isFirebaseInitialized) {
  userRepo = new FirestoreRepo<User>(Collection.azushopUser);
}

export const userService = {
  async createUser(data: Partial<User>) {
    if (!userRepo) {
      console.log("🚧 Mock: Creating user", data);
      return { id: "mock-id", ...data };
    }
    return userRepo.create(data);
  },

  async findByEmail(email: string) {
    if (!userRepo) {
      console.log("🚧 Mock: Finding user by email", email);
      return null; // Simulate user not found for now
    }
    return userRepo.getByField("email", email);
  },
  
  async updateUser(id: string, data: Partial<User>) {
    if (!userRepo) {
      console.log("🚧 Mock: Updating user", id, data);
      return { id, ...data };
    }
    return userRepo.update(id, data);
  }
};
