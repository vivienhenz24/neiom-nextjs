"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { translateText } from "@/lib/translation"

const INPUT_LANGUAGES = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Romanian", value: "ro" },
]

const TARGET_LANGUAGE = "lb"
const CHARACTER_LIMIT = 1000

export default function TranslatePage() {
  const [sourceLanguage, setSourceLanguage] = useState(INPUT_LANGUAGES[0].value)
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("")
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
        sourceLanguage,
        targetLanguage: TARGET_LANGUAGE,
      })
      setOutputText(translation)
    } catch (err) {
      console.error("Translation failed", err)
      setError("Unable to translate right now. Please try again.")
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCopy = async () => {
    if (!outputText) return

    try {
      await navigator.clipboard.writeText(outputText)
      setCopyMessage("Copied to clipboard")
      setTimeout(() => setCopyMessage(null), 2000)
    } catch {
      setCopyMessage("Copy failed")
      setTimeout(() => setCopyMessage(null), 2000)
    }
  }

  const handleClear = () => {
    setInputText("")
    setOutputText("")
    setError(null)
    setCopyMessage(null)
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem-3.5rem)]">
        {/* Left Pane: Input/Output */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Language selector */}
          <div>
            <Label htmlFor="input-language">Input Language</Label>
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger id="input-language" className="w-full mt-1">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {INPUT_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input area */}
          <div className="flex flex-col">
            <Textarea
              value={inputText}
              onChange={(event) => setInputText(event.target.value.slice(0, CHARACTER_LIMIT))}
              placeholder="Enter text to translate..."
              className="min-h-[180px] resize-none overflow-y-auto p-6"
            />
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>From: {INPUT_LANGUAGES.find((lang) => lang.value === sourceLanguage)?.label}</span>
              <span>
                {inputText.length} / {CHARACTER_LIMIT}
              </span>
            </div>
          </div>

          {/* Translate button */}
          <div className="space-y-2">
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="w-full"
            >
              {isTranslating ? "Translating..." : "Translate to Luxembourgish"}
            </Button>
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Output section */}
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Luxembourgish Translation</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!outputText}
                >
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={!inputText && !outputText}
                >
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex-1 min-h-0 rounded-lg border bg-background p-6 text-sm text-muted-foreground overflow-auto">
              {outputText || (
                <span className="text-muted-foreground/80">Translation will appear here...</span>
              )}
            </div>
            {copyMessage && (
              <p className="mt-2 text-xs text-muted-foreground">{copyMessage}</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-border mx-4" aria-hidden="true" />

        {/* Right Pane: Settings */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="pb-4">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground mt-1">Translation parameters</p>
          </div>
          <div className="flex-1 min-h-0 overflow-auto text-sm text-muted-foreground">
            Additional translation tuning controls will live here. Configure tone,
            domain-specific glossaries, or custom voices once the translation API is connected.
          </div>
        </div>
      </div>
    </div>
  )
}
