import type { Request, Response } from "express";
import { FirestoreRepo } from "../repo/firestore.repo.ts";
import Collection from "../config/collections.ts";

const userService = new FirestoreRepo<{ name: string; email: string }>(Collection.azushopUser);

// Example: Register User
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.error("Name and email are required", 400);
    }

    // TODO: save to Firestore
    const newUser = { id: "mockId123", name, email };

    res.success("User registered successfully", newUser);
  } catch (err) {
    res.error("Failed to register user", 500);
  }
};

// Example: Get All Users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const userList = await userService.list({ limit: 10 });
    console.log("Fetched users from Firestore:", userList);

    res.success("Users fetched successfully", userList);
  } catch (err) {
    res.error("Failed to fetch users", 500);
  }
};
