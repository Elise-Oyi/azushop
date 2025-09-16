import type { Request, Response } from "express";
import { AuthRepo } from "../repo/auth.repo.ts";
import { userService } from "../services/userService.ts";

const authRepo = new AuthRepo();

// Register user
export const register = async (req: Request, res: Response) => {
  console.log("🚀 Register endpoint hit!");
  console.log("📦 Request body:", req.body);
  try {
    const { email, password, fullname } = req.body;
    
    // Validate input
    if (!email || !password || !fullname) {
      return res.error("Email, password, and name are required", 400);
    }
    
    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return res.error("User with this email already exists", 409);
    }
    
    // Create user in Firebase Auth
    const userRecord = await authRepo.register(email, password, fullname);
    
    // Create user profile in Firestore
    await userService.createUser({ 
      userId: userRecord.uid,
      email, 
      fullname,
      role: "customer"
    });
    
    // Generate custom token
    const token = await authRepo.generateToken(userRecord.uid);
    
    res.success("User registered successfully", { 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      },
      token 
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'auth/email-already-exists') {
      res.error("Email already in use", 409);
    } else if (error.code === 'auth/invalid-email') {
      res.error("Invalid email format", 400);
    } else if (error.code === 'auth/weak-password') {
      res.error("Password should be at least 6 characters", 400);
    } else {
      res.error("Failed to register user", 500);
    }
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.error("Email and password are required", 400);
    }
    
    // First verify the user exists in our Firestore database
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.error("Invalid email or password", 401);
    }
    
    // Verify password using Firebase Auth
    // Note: This is a workaround since Firebase Admin doesn't have signInWithEmailAndPassword
    // In a real app, you'd do this verification on the client side or use Firebase Auth REST API
    try {
      // For now, we'll use a basic password check
      // In production, you should implement proper password verification
      const firebaseUser = await authRepo.verifyCredentials(email, password);
      
      // Generate custom token using the Firebase UID
      const token = await authRepo.generateToken(firebaseUser.uid);
      
      res.success("Login successful", { 
        user: {
          id: user.id,
          uid: firebaseUser.uid,
          email: user.email,
          fullname: user.fullname,
          role: user.role
        },
        token 
      });
    } catch (authError: any) {
      console.error("Firebase auth error:", authError);
      if (authError.code === 'auth/wrong-password' || authError.code === 'auth/user-not-found') {
        return res.error("Invalid email or password", 401);
      }
      return res.error("Authentication failed", 500);
    }
  } catch (error: any) {
    console.error("Login error:", error);
    res.error("Failed to login", 500);
  }
};

// Update user
export const updateAuthUser = async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const updates = req.body;
    
    if (!uid) {
      return res.error("User ID is required", 400);
    }
    
    // Update in Firebase Auth
    const updated = await authRepo.update(uid, updates);
    
    // If email or name changed, update in Firestore too
    if (updates.email || updates.displayName) {
      await userService.updateUser(uid, {
        ...(updates.email && { email: updates.email }),
        ...(updates.displayName && { name: updates.displayName })
      });
    }
    
    res.success("User updated successfully", { user: updated });
  } catch (error: any) {
    console.error("Update error:", error);
    res.error("Failed to update user", 500);
  }
};
