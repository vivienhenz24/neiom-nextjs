import { createHmac, timingSafeEqual } from "crypto";

export type SimpleUser = {
	email: string;
	name: string;
};

type UserRecord = SimpleUser & {
	password: string;
};

const SIMPLE_AUTH_SECRET =
	process.env.SIMPLE_AUTH_SECRET || "neiom-simple-auth-secret";

export const SESSION_COOKIE_NAME = "neiom_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 day

const RAW_USERS: UserRecord[] = [
	{
		email: "vhenz@college.harvard.edu",
		name: "Vivien Henz",
		password: "123456",
	},
	{
		email: "laura.hencks@inll.lu",
		name: "Laura Hencks",
		password: "123456",
	},
	{
		email: "luc.schmitz@inll.lu",
		name: "Luc Schmitz",
		password: "123456",
	},
];

const USER_MAP = RAW_USERS.reduce<Record<string, UserRecord>>((acc, user) => {
	acc[normalizeEmail(user.email)] = user;
	return acc;
}, {});

const DEFAULT_USER_KEY = RAW_USERS.length ? normalizeEmail(RAW_USERS[0].email) : null;

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function toPublicUser(record?: UserRecord): SimpleUser | null {
	if (!record) {
		return null;
	}

	return {
		email: record.email,
		name: record.name,
	};
}

function sign(value: string) {
	return createHmac("sha256", SIMPLE_AUTH_SECRET).update(value).digest("hex");
}

function secureCompare(signature: string, expectedSignature: string) {
	const provided = Buffer.from(signature, "hex");
	const expected = Buffer.from(expectedSignature, "hex");

	if (provided.length !== expected.length) {
		return false;
	}

	return timingSafeEqual(provided, expected);
}

export function getUserByEmail(email: string) {
	return toPublicUser(USER_MAP[normalizeEmail(email)]);
}

export function getDefaultUser() {
	return DEFAULT_USER_KEY ? toPublicUser(USER_MAP[DEFAULT_USER_KEY]) : null;
}

export function validateCredentials(email: string, password: string) {
	const record = USER_MAP[normalizeEmail(email)];
	if (!record || record.password !== password) {
		return null;
	}

	return toPublicUser(record);
}

export function createSessionValue(email: string) {
	const payload = JSON.stringify({
		email: normalizeEmail(email),
		exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
	});
	const encodedPayload = Buffer.from(payload).toString("base64url");
	const signature = sign(encodedPayload);

	return `${encodedPayload}.${signature}`;
}

export function verifySessionValue(value: string) {
	const [encodedPayload, signature] = value.split(".");
	if (!encodedPayload || !signature) {
		return null;
	}

	const expectedSignature = sign(encodedPayload);
	if (!secureCompare(signature, expectedSignature)) {
		return null;
	}

	try {
		const payload = JSON.parse(
			Buffer.from(encodedPayload, "base64url").toString("utf8"),
		) as {
			email?: string;
			exp?: number;
		};

		if (!payload.email || typeof payload.exp !== "number") {
			return null;
		}

		if (Date.now() > payload.exp) {
			return null;
		}

		return getUserByEmail(payload.email);
	} catch {
		return null;
	}
}
