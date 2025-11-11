import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/simple-auth";

const DEV_SIGN_OUT_COOKIE = "neiom-dev-signed-out";

export async function POST() {
	const response = NextResponse.json({ success: true });

	response.cookies.set({
		name: SESSION_COOKIE_NAME,
		value: "",
		httpOnly: true,
		maxAge: 0,
		path: "/",
	});

	response.cookies.set({
		name: DEV_SIGN_OUT_COOKIE,
		value: "true",
		maxAge: 60 * 60 * 24,
		path: "/",
		httpOnly: false,
	});

	return response;
}
