import { auth, DEV_EMAIL } from "@/lib/auth";

/**
 * Helper function that always returns a session for dev email in development mode
 * This bypasses the need for actual session cookies when using memory adapter
 */
export async function getDevSession(headers: Headers) {
	const timestamp = new Date().toISOString();
	console.log(`[${timestamp}] [getDevSession] Starting session check...`);
	
	// Check for sign-out flag in dev mode
	if (process.env.NODE_ENV === "development") {
		const cookieHeader = headers.get("cookie") || "";
		// Check for a special cookie that indicates user has signed out
		if (cookieHeader.includes("neiom-dev-signed-out=true")) {
			console.log(`[${timestamp}] [getDevSession] Dev mode: sign-out flag detected, returning null`);
			return null;
		}
	}
	
	// Try to get the real session first
	console.log(`[${timestamp}] [getDevSession] Attempting to get real session from auth.api.getSession...`);
	const session = await auth.api.getSession({ headers });
	
	if (session) {
		console.log(`[${timestamp}] [getDevSession] Real session found! User: ${session.user?.email || 'unknown'}`);
		return session;
	}

	console.log(`[${timestamp}] [getDevSession] No real session found`);

	// In development mode, always return a mock session for the dev email (unless signed out)
	if (process.env.NODE_ENV === "development") {
		console.log(`[${timestamp}] [getDevSession] Development mode detected, creating mock session for: ${DEV_EMAIL}`);
		const mockSession = {
			user: {
				id: "dev-user-id",
				email: DEV_EMAIL,
				name: "Development User",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			session: {
				id: "dev-session-id",
				userId: "dev-user-id",
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
				token: "dev-token",
			},
		};
		console.log(`[${timestamp}] [getDevSession] Mock session created successfully`);
		return mockSession;
	}

	console.log(`[${timestamp}] [getDevSession] Production mode - returning null (no session)`);
	return null;
}

