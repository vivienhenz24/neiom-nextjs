import { NextResponse } from "next/server";

import {
	SESSION_COOKIE_NAME,
	SESSION_MAX_AGE_SECONDS,
	createSessionValue,
	validateCredentials,
} from "@/lib/simple-auth";

export async function POST(request: Request) {
	try {
		const { email, password } = (await request.json()) as {
			email?: string;
			password?: string;
		};

		if (typeof email !== "string" || typeof password !== "string") {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const user = validateCredentials(email, password);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or password" },
				{ status: 401 },
			);
		}

		const response = NextResponse.json({ success: true });
		response.cookies.set({
			name: SESSION_COOKIE_NAME,
			value: createSessionValue(user.email),
			httpOnly: true,
			maxAge: SESSION_MAX_AGE_SECONDS,
			path: "/",
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
		});
		response.cookies.set({
			name: "neiom-dev-signed-out",
			value: "",
			path: "/",
			maxAge: 0,
		});

		return response;
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
