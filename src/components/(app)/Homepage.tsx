"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import ChatInputBar from "@/components/(app)/ChatInputBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlignmentPayload, buildWordTimings, WordTiming } from "@/lib/dialogue-highlighting";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const MAX_DIALOGUE_LENGTH = 5000;
const TURN_COUNT_OPTIONS = [6, 8, 10, 12];
const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
];
const SPEAKER_A_NAME = "Speaker A";
const SPEAKER_B_NAME = "Speaker B";
const WHITESPACE_SEGMENT = /^\s+$/;

type DialogueAudioResponseBody = {
  audioBase64?: string;
  alignment?: AlignmentPayload;
  normalizedAlignment?: AlignmentPayload;
  error?: string;
};

const base64ToBlob = (audioBase64: string, mimeType = "audio/mpeg") => {
  const binary = atob(audioBase64);
  const buffer = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    buffer[index] = binary.charCodeAt(index);
  }
  return new Blob([buffer], { type: mimeType });
};

const findActiveWordIndex = (currentTime: number, timings: WordTiming[]) => {
  if (!timings.length) return null;
  for (let index = 0; index < timings.length; index += 1) {
    const entry = timings[index];
    if (currentTime >= entry.startTime && currentTime <= entry.endTime + 0.05) {
      return index;
    }
  }

  if (currentTime > timings[timings.length - 1].endTime) {
    return timings.length - 1;
  }

  return null;
};

export default function Homepage() {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const highlightOverlayRef = useRef<HTMLDivElement | null>(null);

  const [generatedDialogue, setGeneratedDialogue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0]?.value ?? "en");
  const [turnCount, setTurnCount] = useState(TURN_COUNT_OPTIONS[0]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioScriptSnapshot, setAudioScriptSnapshot] = useState("");
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      activeRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isGenerating && generatedDialogue && textareaRef.current) {
      textareaRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [generatedDialogue, isGenerating]);

  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) return;

      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;

      setError(null);
      setIsGenerating(true);
      setGeneratedDialogue("");

      try {
        const response = await fetch("/api/dialogue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmedPrompt,
            speakerA: SPEAKER_A_NAME,
            speakerB: SPEAKER_B_NAME,
            speakerALanguage: selectedLanguage,
            speakerBLanguage: selectedLanguage,
            turnCount,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          const message = payload?.error ?? "Unable to generate dialogue.";
          throw new Error(message);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Streaming response is not available.");
        }

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: isDone } = await reader.read();
          done = isDone;

          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            setGeneratedDialogue((prev) => {
              const nextValue = prev + chunk;
              return nextValue.slice(0, MAX_DIALOGUE_LENGTH);
            });
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") {
          console.log("[dialogue] Previous request aborted");
          return;
        }

        console.error("[dialogue] Generation failed", err);
        const message =
          err instanceof Error && err.message ? err.message : "Something went wrong.";
        setError(message);
      } finally {
        if (activeRequestRef.current === controller) {
          activeRequestRef.current = null;
        }
        setIsGenerating(false);
      }
    },
    [selectedLanguage, turnCount]
  );

  const handleGenerateAudio = useCallback(async () => {
    const script = generatedDialogue.trim();
    if (!script || isGeneratingAudio) {
      return;
    }

    setIsGeneratingAudio(true);
    setAudioError(null);

    try {
      const response = await fetch("/api/dialogue/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          language: selectedLanguage,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as DialogueAudioResponseBody;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to generate dialogue audio.");
      }

      if (!payload?.audioBase64) {
        throw new Error("The audio response did not include any audio data.");
      }

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
      }

      const blob = base64ToBlob(payload.audioBase64);
      const objectUrl = URL.createObjectURL(blob);
      audioObjectUrlRef.current = objectUrl;
      setAudioUrl(objectUrl);
      setAudioScriptSnapshot(script);

      const timings = buildWordTimings(script, payload.alignment ?? payload.normalizedAlignment);
      setWordTimings(timings);
      setActiveWordIndex(null);
    } catch (err) {
      console.error("[dialogue audio] Generation failed", err);
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Unable to generate dialogue audio right now.";
      setAudioError(message);
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [generatedDialogue, isGeneratingAudio, selectedLanguage]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) {
      return;
    }

    const handleTimeUpdate = () => {
      if (!wordTimings.length) return;
      const nextIndex = findActiveWordIndex(audioElement.currentTime, wordTimings);
      setActiveWordIndex(nextIndex);
    };

    const handleEnded = () => {
      setActiveWordIndex(null);
    };

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("seeking", handleTimeUpdate);
    audioElement.addEventListener("ended", handleEnded);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("seeking", handleTimeUpdate);
      audioElement.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, wordTimings]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = highlightOverlayRef.current;
    const highlightActive =
      Boolean(audioUrl) && audioScriptSnapshot === generatedDialogue && wordTimings.length > 0;

    if (!highlightActive || !textarea || !overlay) {
      return;
    }

    const syncScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener("scroll", syncScroll);
    return () => {
      textarea.removeEventListener("scroll", syncScroll);
    };
  }, [audioUrl, audioScriptSnapshot, generatedDialogue, wordTimings.length]);

  const trimmedDialogue = generatedDialogue.trim();
  const hasDialogue = Boolean(trimmedDialogue);
  const isAudioInSync = Boolean(audioUrl && audioScriptSnapshot === generatedDialogue);
  const highlightEnabled = Boolean(isAudioInSync && wordTimings.length > 0);

  const renderDialogueSegments = (
    text: string,
    timings: WordTiming[],
    activeIndex: number | null
  ) => {
    if (!text) {
      return (
        <span className="text-muted-foreground">
          Describe the dialogue scenario or paste your script...
        </span>
      );
    }

    const segments = text.split(/(\s+)/);
    let wordPointer = 0;

    return segments.map((segment, index) => {
      if (!segment) return null;
      if (WHITESPACE_SEGMENT.test(segment)) {
        return (
          <span key={`space-${index}`} className="whitespace-pre-wrap">
            {segment}
          </span>
        );
      }

      const isActive = wordPointer === activeIndex;
      wordPointer += 1;
      return (
        <span
          key={`word-${index}`}
          className={cn("transition-colors", isActive && "font-semibold text-purple-700")}
        >
          {segment}
        </span>
      );
    });
  };

  return (
    <div className="relative box-border h-[calc(100vh-4rem)] overflow-hidden px-6 pb-32 pt-8">
      <div className="relative h-full w-full">
        <Textarea
          ref={textareaRef}
          value={generatedDialogue}
          onChange={(event) => setGeneratedDialogue(event.target.value.slice(0, MAX_DIALOGUE_LENGTH))}
          readOnly={isGenerating}
          placeholder="Describe the dialogue scenario or paste your script..."
          className={cn(
            "h-full w-full resize-none border-none bg-transparent px-4 py-4 text-2xl leading-relaxed caret-black focus-visible:border-border focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
            highlightEnabled && "text-transparent caret-purple-600"
          )}
        />
        {highlightEnabled && (
          <div
            ref={highlightOverlayRef}
            className="pointer-events-none absolute inset-0 overflow-auto px-4 py-4 text-2xl leading-relaxed text-foreground/90"
            aria-hidden="true"
          >
            {renderDialogueSegments(generatedDialogue, wordTimings, activeWordIndex)}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-6">
        <div className="pointer-events-auto flex w-full flex-col items-center justify-center gap-3">
          {hasDialogue && (
            <div className="w-full max-w-3xl rounded-3xl border border-black/25 bg-muted/60 p-4 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dialogue audio</p>
                    <p className="text-xs text-muted-foreground">
                      Generate ElevenLabs audio with word-level timing
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleGenerateAudio}
                    disabled={isGeneratingAudio || isGenerating || !hasDialogue}
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating audio...
                      </>
                    ) : (
                      "Generate Dialogue Audio"
                    )}
                  </Button>
                </div>
                {audioUrl && (
                  <>
                    <audio ref={audioRef} controls src={audioUrl} className="w-full" />
                    {!isAudioInSync && (
                      <p className="text-xs text-amber-600">
                        The dialogue has changed since this audio was generated. Regenerate to sync
                        the highlights.
                      </p>
                    )}
                  </>
                )}
                {audioError && (
                  <p className="text-xs text-red-600" role="alert">
                    {audioError}
                  </p>
                )}
              </div>
            </div>
          )}

          <ChatInputBar
            isSubmitting={isGenerating}
            onSubmitPrompt={handlePromptSubmit}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            selectedTurnCount={turnCount}
            onTurnCountChange={setTurnCount}
            languageOptions={LANGUAGE_OPTIONS}
            turnCountOptions={TURN_COUNT_OPTIONS}
          />
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
