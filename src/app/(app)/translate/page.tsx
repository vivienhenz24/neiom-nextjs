"use client"

import { useState } from "react"
import { Mic, Volume2, Copy, ArrowLeftRight, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { translateText } from "@/lib/translation"

const LANGUAGE_OPTIONS = [
  { label: "Detect language", value: "detect" },
  { label: "French", value: "fr" },
  { label: "English", value: "en" },
  { label: "Luxembourgish", value: "lb" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Romanian", value: "ro" },
]

const QUICK_LANGUAGE_TABS = [
  { label: "French", value: "fr" },
  { label: "English", value: "en" },
  { label: "Luxembourgish", value: "lb" },
  { label: "Spanish", value: "es" },
  { label: "German", value: "de" },
  { label: "Portuguese", value: "pt" },
]

const TARGET_LANGUAGE = "lb"
const TARGET_LANGUAGE_LABEL = "Luxembourgish"
const CHARACTER_LIMIT = 5000

export default function TranslatePage() {
  const [inputLanguage, setInputLanguage] = useState("detect")
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("Enter text before requesting a translation.")
      return
    }

    setIsTranslating(true)
    setError(null)
    setCopyMessage(null)

    try {
      const { translation } = await translateText({
        text: inputText.trim(),
        sourceLanguage: inputLanguage,
        targetLanguage: TARGET_LANGUAGE,
      })
      setTranslation(translation)
    } catch (err) {
      console.error("Translation failed", err)
      setError("Unable to translate right now. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handlePronunciation = () => {
    if (!translation) return
    console.log("Play pronunciation placeholder for:", translation)
  }

  const handleCopy = async () => {
    if (!translation) return

    try {
      await navigator.clipboard.writeText(translation)
      setCopyMessage("Copied to clipboard")
      setTimeout(() => setCopyMessage(null), 2000)
    } catch {
      setCopyMessage("Copy failed")
      setTimeout(() => setCopyMessage(null), 2000)
    }
  }

  const handleQuickLanguageSelect = (value: string) => {
    setInputLanguage(value)
  }

  const handleMicInput = () => {
    console.log("Voice input coming soon")
  }

  const characterCount = `${inputText.length} / ${CHARACTER_LIMIT}`

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
      {/* Language Bar */}
      <div className="rounded-2xl border border-border bg-background/90 p-4 md:p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-3">
            <Select value={inputLanguage} onValueChange={setInputLanguage}>
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Detect language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2 text-sm">
              {QUICK_LANGUAGE_TABS.map((language) => {
                const isActive = inputLanguage === language.value
                return (
                  <Button
                    key={language.value}
                    variant="ghost"
                    size="sm"
                    className={isActive ? "underline underline-offset-4" : ""}
                    onClick={() => handleQuickLanguageSelect(language.value)}
                  >
                    {language.label}
                  </Button>
                )
              })}
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                More…
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <ArrowLeftRight className="h-5 w-5 opacity-40" aria-hidden="true" />
            <div className="flex items-center gap-2 rounded-full border px-4 py-2 text-foreground/80">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span className="font-medium">{TARGET_LANGUAGE_LABEL}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Input Panel */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <Textarea
            value={inputText}
            onChange={(event) =>
              setInputText(event.target.value.slice(0, CHARACTER_LIMIT))
            }
            placeholder="Enter text to translate..."
            className="min-h-[260px] resize-none border-0 p-0 text-base leading-relaxed focus-visible:ring-0"
          />
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicInput}
              title="Speak"
            >
              <Mic className="h-5 w-5" />
            </Button>
            <span>{characterCount}</span>
          </div>
        </section>

        {/* Output Panel */}
        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm">
          <div className="min-h-[260px] whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
            {translation ? (
              translation
            ) : (
              <span className="text-muted-foreground">Translation will appear here...</span>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Listen to pronunciation"
              onClick={handlePronunciation}
              disabled={!translation}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Copy translation"
              onClick={handleCopy}
              disabled={!translation}
            >
              <Copy className="h-5 w-5" />
            </Button>
            {copyMessage && (
              <span className="text-xs text-muted-foreground">{copyMessage}</span>
            )}
          </div>
        </section>
      </div>

      {/* Translate Button */}
      <div className="flex flex-col items-center gap-2">
        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !inputText.trim()}
          size="lg"
          className="w-full md:w-auto px-10"
        >
          {isTranslating ? "Translating..." : "Translate to Luxembourgish"}
        </Button>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  )
}
