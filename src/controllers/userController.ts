import type { Request, Response } from "express";

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
    // TODO: fetch from Firestore
    const users = [
      { id: "1", name: "Liz", email: "liz@example.com" },
      { id: "2", name: "Ken", email: "ken@example.com" },
    ];

    res.success("Users fetched successfully", users);
  } catch (err) {
    res.error("Failed to fetch users", 500);
  }
};
