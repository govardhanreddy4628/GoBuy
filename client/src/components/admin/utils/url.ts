const URL = import.meta.env.VITE_BACKEND_URL_PRODUCTION || import.meta.env.VITE_BACKEND_URL_LOCAL || "http://localhost:8080";

export default URL;