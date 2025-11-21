import {
	SESSION_COOKIE_NAME,
	SimpleUser,
	getDefaultUser,
	verifySessionValue,
} from "@/lib/simple-auth";

const DEV_SIGN_OUT_COOKIE = "neiom-dev-signed-out=true";

export type SimpleSession = {
	user: SimpleUser;
};

function readCookie(cookieHeader: string, name: string) {
	const target = `${name}=`;
	const cookie = cookieHeader
		.split(";")
		.map((part) => part.trim())
		.find((part) => part.startsWith(target));

	return cookie ? decodeURIComponent(cookie.slice(target.length)) : null;
}

export async function getSession(headers: Headers): Promise<SimpleSession | null> {
	const cookieHeader = headers.get("cookie") ?? "";
	const sessionCookie = readCookie(cookieHeader, SESSION_COOKIE_NAME);

	if (sessionCookie) {
		const user = verifySessionValue(sessionCookie);
		if (user) {
			return { user };
		}
	}

	// Development fallback disabled - authentication required
	// if (process.env.NODE_ENV === "development") {
	// 	const signedOut = cookieHeader.includes(DEV_SIGN_OUT_COOKIE);
	// 	if (!signedOut) {
	// 		const fallbackUser = getDefaultUser();
	// 		if (fallbackUser) {
	// 			return { user: fallbackUser };
	// 		}
	// 	}
	// }

	return null;
}
