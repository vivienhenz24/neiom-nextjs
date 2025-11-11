/**
 * Placeholder translation helper. This simulates what the future translation
 * service will look like but keeps everything synchronous and predictable
 * for now so that the UI can be wired up end-to-end.
 */
type TranslationRequest = {
	text: string;
	sourceLanguage: string;
	targetLanguage: string;
};

type TranslationResponse = {
	translation: string;
};

export async function translateText({
	text,
	sourceLanguage,
	targetLanguage,
}: TranslationRequest): Promise<TranslationResponse> {
	console.log("[translateText] Request received:", {
		sourceLanguage,
		targetLanguage,
		textLength: text.length,
	});

	// Simulate a network round-trip
	await new Promise((resolve) => setTimeout(resolve, 800));

	// Simple mock translation that indicates the target language and mirrors the input.
	const mockTranslation = text
		? `(${targetLanguage.toUpperCase()}) ${text}`
		: "No text provided.";

	return {
		translation: mockTranslation,
	};
}
