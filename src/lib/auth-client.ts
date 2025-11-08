import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	// Base URL for the auth API
	baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
	// You can pass additional client configuration here
});

