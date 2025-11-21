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

		// Authentication disabled - all login attempts fail
		return NextResponse.json(
			{ error: "Invalid email or password" },
			{ status: 401 },
		);
	} catch {
		return NextResponse.json({ error: "Invalid request" }, { status: 400 });
	}
}
