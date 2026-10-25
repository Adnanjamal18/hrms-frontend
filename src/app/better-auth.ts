import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_API_BASE_URL ||"https://hrms-backend-latest-chv2.onrender.com" // the base url of your auth server
})
