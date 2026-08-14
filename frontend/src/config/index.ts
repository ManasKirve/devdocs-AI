const DEV_API_BASE_URL = 'http://localhost:8000'
const PROD_API_BASE_URL = 'https://devdocs-ai-c462.onrender.com'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '') ||
  (import.meta.env.DEV ? DEV_API_BASE_URL : PROD_API_BASE_URL)
