"use client"

import { useState } from "react"
import { Mic, Volume2, Copy, ArrowLeftRight, Loader2 } from "lucide-react"

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
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"

const LANGUAGE_OPTIONS = [
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
const CHARACTER_LIMIT = 5000

export function TranslatePage() {
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.translate

  const [inputLanguage, setInputLanguage] = useState("")
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(t.enterTextBeforeTranslation)
      return
    }

    if (!inputLanguage) {
      setError(t.selectLanguageRequired)
      return
    }

    setIsLoading(true)
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
      setError(t.unableToTranslate)
    } finally {
      setIsLoading(false)
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
      setCopyMessage(t.copiedToClipboard)
      setTimeout(() => setCopyMessage(null), 2000)
    } catch {
      setCopyMessage(t.copyFailed)
      setTimeout(() => setCopyMessage(null), 2000)
    }
  }

  const handleMicInput = () => {
    console.log("Voice input coming soon")
  }

  const characterCount = `${inputText.length} / ${CHARACTER_LIMIT}`

  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-1">{t.introTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.introDescription}</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <Select value={inputLanguage} onValueChange={setInputLanguage}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder={t.selectLanguagePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGE_OPTIONS.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </Button>
          <span className="text-sm font-medium">{t.luxembourgish}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden mb-4">
        <section className="flex flex-col border border-input rounded-lg bg-background p-4">
          <Textarea
            value={inputText}
            onChange={(event) =>
              setInputText(event.target.value.slice(0, CHARACTER_LIMIT))
            }
            placeholder={t.enterTextPlaceholder}
            className="flex-1 min-h-[180px] resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus-visible:ring-0 focus-visible:outline-none"
            maxLength={CHARACTER_LIMIT}
          />
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMicInput}
              title={t.speak}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <span>{characterCount}</span>
          </div>
        </section>

        <section className="flex flex-col border border-input rounded-lg bg-muted/50 p-4">
          <div className="flex-1 min-h-[180px] rounded-md text-sm overflow-y-auto">
            {translation ? (
              <span className="whitespace-pre-wrap text-foreground/80">
                {translation}
              </span>
            ) : (
              <span className="text-muted-foreground">
                {t.translationWillAppear}
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t.listenToPronunciation}
              onClick={handlePronunciation}
              disabled={!translation}
            >
              <Volume2 className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t.copyTranslation}
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

      <div className="flex justify-center flex-shrink-0">
        <Button
          size="lg"
          className="px-12"
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim() || !inputLanguage}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.translating}
            </>
          ) : (
            t.translateToLuxembourgish
          )}
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-center text-sm text-red-600 flex-shrink-0">
          {error}
        </p>
      )}
    </div>
  )
}

export default TranslatePage

