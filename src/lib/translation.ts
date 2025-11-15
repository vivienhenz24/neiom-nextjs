/**
 * Placeholder translation helper. This simulates what the future translation
 * service will look like but keeps everything synchronous and predictable
 * for now so that the UI can be wired up end-to-end.
 */
type TranslationRequest = {
	text: string;
	sourceLanguage: string;
	targetLanguage: string;
	sourceLanguageLabel?: string;
	targetLanguageLabel?: string;
};

type TranslationResponse = {
	translation: string;
};

type TranslateTextOptions = {
	onDelta?: (chunk: string) => void;
};

export async function translateText(
	payload: TranslationRequest,
	options?: TranslateTextOptions,
): Promise<TranslationResponse> {

	const response = await fetch("/api/translate", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		let message = "Unable to translate text.";
		try {
			const data = await response.json();
			if (typeof data?.error === "string") {
				message = data.error;
			}
		} catch {
			// ignore JSON parsing errors and fallback to default message
		}
		throw new Error(message);
	}

	if (!response.body) {
		throw new Error("Translation response did not include a body.");
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let translation = "";

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		const chunk = decoder.decode(value, { stream: true });
		if (chunk) {
			translation += chunk;
			options?.onDelta?.(chunk);
		}
	}

	const finalChunk = decoder.decode();
	if (finalChunk) {
		translation += finalChunk;
		options?.onDelta?.(finalChunk);
	}

	translation = translation.trim();

	return { translation };
}
