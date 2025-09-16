import type { Request, Response } from "express";

// Test registration without Firebase
export const testRegister = async (req: Request, res: Response) => {
  console.log("🚀 Test Register endpoint hit!");
  console.log("📦 Request body:", req.body);
  
  try {
    const { email, password, fullname } = req.body;
    
    // Validate input
    if (!email || !password || !fullname) {
      return res.error("Email, password, and fullname are required", 400);
    }
    
    // Mock successful registration
    const mockUser = {
      uid: "mock-uid-123",
      email: email,
      fullname: fullname,
      role: "customer"
    };
    
    const mockToken = "mock-token-xyz";
    
    res.success("User registered successfully (MOCK)", { 
      user: mockUser,
      token: mockToken
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.error("Failed to register user", 500);
  }
};

// Test login without Firebase  
export const testLogin = async (req: Request, res: Response) => {
  console.log("🚀 Test Login endpoint hit!");
  console.log("📦 Request body:", req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.error("Email and password are required", 400);
    }
    
    // Mock successful login
    const mockUser = {
      id: "mock-firestore-id",
      uid: "mock-firebase-uid", 
      email: email,
      fullname: "Mock User",
      role: "customer"
    };
    
    const mockToken = "mock-login-token";
    
    res.success("Login successful (MOCK)", {
      user: mockUser,
      token: mockToken
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.error("Failed to login", 500);
  }
};