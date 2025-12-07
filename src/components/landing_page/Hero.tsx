"use client"

import Link from "next/link";
import ExampleItem from "./Examples";
import { useLocale } from "@/components/LocaleProvider";
import { useState, useCallback } from "react";

export default function Hero() {
  const { t } = useLocale();
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 60000); // 60 second timeout

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audio');
      }

      setAudioUrl(data.audioUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGenerating);
    } finally {
      setIsGenerating(false);
    }
  }, [text, t.errorGenerating]);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-0 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full mt-0 sm:-mt-32 lg:-mt-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 sm:mb-8 text-black">
              {t.heroTitle}
            </h1>
            <div className="text-base sm:text-lg lg:text-xl text-black leading-relaxed mb-8 sm:mb-10">
              {t.heroDescription.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h3 key={index} className="font-normal text-base sm:text-lg mb-2 mt-4">
                      {line.replace(/\*\*/g, '')}
                    </h3>
                  );
                } else if (line.startsWith('• ')) {
                  return (
                    <div key={index} className="ml-4 mb-1">
                      <span className="text-black">•</span> {line.substring(2)}
                    </div>
                  );
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  );
                }
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href="/contact"
                className="w-full sm:w-auto text-center px-6 py-3 sm:px-6 sm:py-3 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-base sm:text-base font-normal"
              >
                {t.contact}
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto text-center px-6 py-3 sm:px-6 sm:py-3 bg-white text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-base sm:text-base font-normal"
              >
                {t.login}
              </Link>
            </div>
          </div>

          {/* Right Column - TTS Demo */}
          <div className="w-full">
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] p-6">
              <h3 className="text-xl sm:text-2xl font-normal mb-4 text-black">
                {t.tryItOut}
              </h3>
              
              {/* Model Weights Link */}
              <div className="mb-4">
                <a 
                  href="https://huggingface.co/vivienhenz/fish-speech-luxembourgish"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-black hover:underline"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                    <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
                  </svg>
                  {t.modelWeights}
                </a>
              </div>

              {/* Text Input */}
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setError(null);
                }}
                placeholder={t.enterText}
                className="w-full px-4 py-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 resize-none text-black placeholder-gray-400"
                rows={4}
                disabled={isGenerating}
              />

              {/* Error Message */}
              {error && (
                <div className="mt-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full mt-4 px-6 py-3 bg-white text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 font-normal disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
              >
                {isGenerating ? t.generating : t.generateAudio}
              </button>

              {/* Audio Player */}
              {audioUrl && (
                <div className="mt-6 p-4 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                    controlsList="nodownload"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
