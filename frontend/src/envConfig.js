export const envConfig = () => {
  return import.meta.env.VITE_BACKEND_URL;
};

export const envConfigFrontend = () => {
  return import.meta.env.VITE_FRONTEND_URL;
};
