"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import ChatInputBar from "@/components/(app)/ChatInputBar";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignmentPayload,
  WordTiming,
  buildWordTimingsFromAlignment,
} from "@/lib/dialogue-highlighting";
import { buildHighlightRanges, HighlightRange } from "@/lib/audio-highlighting";
import { buildTranscriptFromEntries, parseDialogueEntries } from "@/lib/dialogue-text";
import { cn } from "@/lib/utils";
import { Loader2, Volume2 } from "lucide-react";

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

type DialogueAudioResponseBody = {
  audioBase64?: string;
  alignment?: AlignmentPayload;
  normalizedAlignment?: AlignmentPayload;
  transcript?: string;
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
  const animationFrameRef = useRef<number | null>(null);

  const [generatedDialogue, setGeneratedDialogue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGE_OPTIONS[0]?.value ?? "en");
  const [turnCount, setTurnCount] = useState(TURN_COUNT_OPTIONS[0]);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioTranscript, setAudioTranscript] = useState("");
  const [wordTimings, setWordTimings] = useState<WordTiming[]>([]);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [shouldAutoplayAudio, setShouldAutoplayAudio] = useState(false);

  const dialogueEntries = useMemo(() => parseDialogueEntries(generatedDialogue), [generatedDialogue]);
  const localTranscript = useMemo(
    () => buildTranscriptFromEntries(dialogueEntries),
    [dialogueEntries]
  );
  const trimmedDialogue = generatedDialogue.trim();
  const hasDialogue = Boolean(trimmedDialogue);
  const isAudioInSync = Boolean(
    audioTranscript && localTranscript && audioTranscript === localTranscript
  );
  const highlightRanges = useMemo<HighlightRange[]>(() => {
    if (
      !audioUrl ||
      !isAudioInSync ||
      !wordTimings.length ||
      dialogueEntries.length === 0
    ) {
      return [];
    }

    const ranges = buildHighlightRanges({
      script: generatedDialogue,
      dialogueEntries,
      wordTimings,
    });

    console.log("[dialogue highlighting] Computed highlight ranges", {
      rangeCount: ranges.length,
      dialogueEntryCount: dialogueEntries.length,
      isAudioInSync,
      hasWordTimings: wordTimings.length > 0,
      rangesDetail: ranges.map((range) => ({
        ...range,
        text: generatedDialogue.slice(range.start, range.end),
      })),
    });

    return ranges;
  }, [audioUrl, dialogueEntries, generatedDialogue, isAudioInSync, wordTimings]);
  const highlightEnabled = Boolean(
    audioUrl && isAudioInSync && wordTimings.length > 0 && highlightRanges.length > 0
  );

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

  const resetAudioState = useCallback(() => {
    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current);
      audioObjectUrlRef.current = null;
    }
    setAudioUrl(null);
    setAudioTranscript("");
    setWordTimings([]);
    setActiveWordIndex(null);
    setIsAudioPlaying(false);
    setAudioError(null);
    setShouldAutoplayAudio(false);
  }, []);

  const handlePromptSubmit = useCallback(
    async (prompt: string) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt) return;

      activeRequestRef.current?.abort();
      const controller = new AbortController();
      activeRequestRef.current = controller;

      setError(null);
      setIsGenerating(true);
      resetAudioState();
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
    [resetAudioState, selectedLanguage, turnCount]
  );

  const handleGenerateAudio = useCallback(async () => {
    const script = generatedDialogue.trim();
    if (!script || isGeneratingAudio) {
      return;
    }

    setIsGeneratingAudio(true);
    setAudioError(null);
    console.log("[dialogue audio] Sending script to API:\n", script);

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

      console.log("[dialogue audio] Payload received from API", {
        hasAudio: Boolean(payload.audioBase64),
        transcriptLength: payload.transcript?.length ?? 0,
        alignmentCharacters: payload.alignment?.characters?.length ?? 0,
        normalizedAlignmentCharacters: payload.normalizedAlignment?.characters?.length ?? 0,
      });
      if (payload) {
        const { audioBase64, ...rest } = payload;
        console.log("[dialogue audio] Full payload (excluding audio data)", rest);
      }

      const blob = base64ToBlob(payload.audioBase64);
      const objectUrl = URL.createObjectURL(blob);
      audioObjectUrlRef.current = objectUrl;
      setShouldAutoplayAudio(true);
      setAudioUrl(objectUrl);
      setIsAudioPlaying(false);

      const alignmentPayload = payload.normalizedAlignment ?? payload.alignment ?? null;
      const { transcript, timings } = buildWordTimingsFromAlignment(alignmentPayload);

      setAudioTranscript(payload.transcript ?? transcript);
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

  const handleDialogueAudioButtonClick = useCallback(() => {
    if (isGeneratingAudio || isGenerating) {
      return;
    }

    if (!audioUrl || !isAudioInSync) {
      void handleGenerateAudio();
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isAudioPlaying) {
      audio.pause();
      return;
    }

    audio
      .play()
      .then(() => {
        setIsAudioPlaying(true);
      })
      .catch(() => {
        setIsAudioPlaying(false);
      });
  }, [audioUrl, handleGenerateAudio, isAudioInSync, isAudioPlaying, isGenerating, isGeneratingAudio]);

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
      setIsAudioPlaying(false);
    };

    const handlePlay = () => setIsAudioPlaying(true);
    const handlePause = () => setIsAudioPlaying(false);

    audioElement.addEventListener("timeupdate", handleTimeUpdate);
    audioElement.addEventListener("seeking", handleTimeUpdate);
    audioElement.addEventListener("ended", handleEnded);
    audioElement.addEventListener("play", handlePlay);
    audioElement.addEventListener("pause", handlePause);

    return () => {
      audioElement.removeEventListener("timeupdate", handleTimeUpdate);
      audioElement.removeEventListener("seeking", handleTimeUpdate);
      audioElement.removeEventListener("ended", handleEnded);
      audioElement.removeEventListener("play", handlePlay);
      audioElement.removeEventListener("pause", handlePause);
    };
  }, [audioUrl, wordTimings]);

  useEffect(() => {
    if (!audioUrl || !shouldAutoplayAudio || !isAudioInSync) {
      return;
    }

    let cancelled = false;
    let rafId: number | null = null;

    const attemptAutoplay = () => {
      if (cancelled) return;
      const audioElement = audioRef.current;
      if (!audioElement) {
        rafId = requestAnimationFrame(attemptAutoplay);
        return;
      }
      audioElement.currentTime = 0;

      audioElement
        .play()
        .then(() => {
          if (!cancelled) {
            setIsAudioPlaying(true);
          }
        })
        .catch((error) => {
          if (!cancelled) {
            console.warn("[dialogue audio] Autoplay failed", error);
            setIsAudioPlaying(false);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setShouldAutoplayAudio(false);
          }
        });
    };

    attemptAutoplay();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [audioUrl, isAudioInSync, shouldAutoplayAudio]);

  useEffect(() => {
    const stopTracking = () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    if (!isAudioPlaying || !wordTimings.length) {
      stopTracking();
      return;
    }

    const tick = () => {
      const audioElement = audioRef.current;
      if (!audioElement) {
        stopTracking();
        return;
      }

      setActiveWordIndex(findActiveWordIndex(audioElement.currentTime, wordTimings));
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return stopTracking;
  }, [isAudioPlaying, wordTimings]);

  useEffect(() => {
    if (!highlightEnabled) {
      return;
    }

    const textarea = textareaRef.current;
    const overlay = highlightOverlayRef.current;

    if (!textarea || !overlay) {
      return;
    }

    const syncScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    };

    syncScroll();
    textarea.addEventListener("scroll", syncScroll);
    return () => {
      textarea.removeEventListener("scroll", syncScroll);
    };
  }, [highlightEnabled]);

  const renderHighlightedDialogue = () => {
    if (!highlightEnabled || !highlightRanges.length) {
      return null;
    }

    const fragments: Array<{ text: string; active: boolean }> = [];
    let cursor = 0;

    highlightRanges.forEach((range) => {
      const start = Math.max(0, Math.min(range.start, generatedDialogue.length));
      const end = Math.max(start, Math.min(range.end, generatedDialogue.length));

      if (start > cursor) {
        fragments.push({
          text: generatedDialogue.slice(cursor, start),
          active: false,
        });
      }

      fragments.push({
        text: generatedDialogue.slice(start, end),
        active: range.wordIndex === activeWordIndex,
      });
      cursor = end;
    });

    if (cursor < generatedDialogue.length) {
      fragments.push({
        text: generatedDialogue.slice(cursor),
        active: false,
      });
    }

    return (
      <div className="whitespace-pre-wrap text-2xl leading-relaxed text-foreground">
        {fragments.map((fragment, index) => (
          <span
            key={index}
            className={cn(
              "transition-colors",
              fragment.active ? "font-semibold text-purple-700" : "text-foreground"
            )}
          >
            {fragment.text}
          </span>
        ))}
      </div>
    );
  };

  const renderAudioControls = () => (
    <div className="flex flex-col items-center gap-2 text-center">
      <button
        type="button"
        onClick={handleDialogueAudioButtonClick}
        disabled={isGeneratingAudio || isGenerating}
        aria-busy={isGeneratingAudio}
        className="inline-flex items-center gap-2 text-lg font-semibold text-[#6b21a8] transition-colors hover:text-[#a855f7] disabled:opacity-60"
      >
        [
        <span>
          {isGeneratingAudio
            ? "Generating dialogue audio"
            : audioUrl && isAudioInSync
              ? isAudioPlaying
                ? "Pause dialogue audio"
                : "Play dialogue audio"
              : "Generate dialogue audio"}
        </span>
        {isGeneratingAudio ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
        ]
      </button>
      {audioUrl && (
        <>
          <audio ref={audioRef} src={audioUrl ?? undefined} className="hidden" preload="metadata" />
          {!isAudioInSync && (
            <p className="mt-2 text-xs text-amber-600">
              The dialogue changed since this audio was generated. Generate again to sync highlights.
            </p>
          )}
        </>
      )}
      {audioError && <p className="mt-2 text-sm text-red-600" role="alert">{audioError}</p>}
    </div>
  );

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
            className="pointer-events-none absolute inset-0 overflow-auto px-4 py-4"
            aria-hidden="true"
          >
            {renderHighlightedDialogue()}
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center px-6">
        <div className="pointer-events-auto flex w-full flex-col items-center justify-center gap-3">
          {hasDialogue && <div className="flex justify-center">{renderAudioControls()}</div>}
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
