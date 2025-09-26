import app from "./config/app.ts";

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = parseInt(process.env.PORT || '3000', 10);
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 Server also accessible on http://0.0.0.0:${PORT}`);
  });
}

// Export for Vercel
export default app;
