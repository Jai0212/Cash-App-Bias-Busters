// Mocking import.meta.env for Jest
Object.defineProperty(global, "import", {
  value: {
    meta: {
      env: {
        VITE_BACKEND_URL:
          process.env.VITE_BACKEND_URL || "http://localhost:5000",
      },
    },
  },
});
