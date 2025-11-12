"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, ChevronDown, Check, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { translateText } from "@/lib/translation"
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"

const ALL_LANGUAGE_OPTIONS = [
  { label: "French", value: "fr" },
  { label: "English", value: "en" },
  { label: "Luxembourgish", value: "lb" },
  { label: "German", value: "de" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Italian", value: "it" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Romanian", value: "ro" },
]

const SOURCE_PRIMARY_LANGUAGE_VALUES = ["fr", "en", "lb"] as const
const TARGET_PRIMARY_LANGUAGE_VALUES = ["lb", "fr", "en"] as const
const LANGUAGE_LOOKUP = Object.fromEntries(
  ALL_LANGUAGE_OPTIONS.map((language) => [language.value, language])
) as Record<string, (typeof ALL_LANGUAGE_OPTIONS)[number]>

const SOURCE_PRIMARY_LANGUAGE_TABS = SOURCE_PRIMARY_LANGUAGE_VALUES.map(
  (value) => LANGUAGE_LOOKUP[value]
).filter(Boolean)
const TARGET_PRIMARY_LANGUAGE_TABS = TARGET_PRIMARY_LANGUAGE_VALUES.map(
  (value) => LANGUAGE_LOOKUP[value]
).filter(Boolean)
const SOURCE_ADDITIONAL_LANGUAGE_OPTIONS = ALL_LANGUAGE_OPTIONS.filter(
  (language) =>
    !SOURCE_PRIMARY_LANGUAGE_VALUES.includes(
      language.value as (typeof SOURCE_PRIMARY_LANGUAGE_VALUES)[number]
    )
)
const TARGET_ADDITIONAL_LANGUAGE_OPTIONS = ALL_LANGUAGE_OPTIONS.filter(
  (language) =>
    !TARGET_PRIMARY_LANGUAGE_VALUES.includes(
      language.value as (typeof TARGET_PRIMARY_LANGUAGE_VALUES)[number]
    )
)
const HIDDEN_TAB_VALUE = "other"
const DEFAULT_SOURCE_LANGUAGE = SOURCE_PRIMARY_LANGUAGE_TABS[0]?.value ?? ""
const DEFAULT_TARGET_LANGUAGE = TARGET_PRIMARY_LANGUAGE_TABS[0]?.value ?? ""
const CHARACTER_LIMIT = 5000

export function TranslatePage() {
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.translate

  const [inputLanguage, setInputLanguage] = useState(DEFAULT_SOURCE_LANGUAGE)
  const [outputLanguage, setOutputLanguage] = useState(DEFAULT_TARGET_LANGUAGE)
  const [activeSourceTab, setActiveSourceTab] = useState(
    DEFAULT_SOURCE_LANGUAGE &&
      SOURCE_PRIMARY_LANGUAGE_VALUES.includes(
        DEFAULT_SOURCE_LANGUAGE as (typeof SOURCE_PRIMARY_LANGUAGE_VALUES)[number]
      )
      ? DEFAULT_SOURCE_LANGUAGE
      : HIDDEN_TAB_VALUE
  )
  const [activeTargetTab, setActiveTargetTab] = useState(
    DEFAULT_TARGET_LANGUAGE &&
      TARGET_PRIMARY_LANGUAGE_VALUES.includes(
        DEFAULT_TARGET_LANGUAGE as (typeof TARGET_PRIMARY_LANGUAGE_VALUES)[number]
      )
      ? DEFAULT_TARGET_LANGUAGE
      : HIDDEN_TAB_VALUE
  )
  const [sourceLanguageSearchTerm, setSourceLanguageSearchTerm] = useState("")
  const [targetLanguageSearchTerm, setTargetLanguageSearchTerm] = useState("")
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [selectedVoice] = useState<string | null>(null)
  const audioObjectUrlRef = useRef<string | null>(null)
  const lastPronouncedHashRef = useRef<string | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const resetPronunciationState = () => {
    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current)
      audioObjectUrlRef.current = null
    }
    setAudioUrl(null)
    setAudioError(null)
    lastPronouncedHashRef.current = null
  }

  useEffect(() => {
    return () => {
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current)
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
      }
    }
  }, [])

  useEffect(() => {
    setIsAudioPlaying(false)
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }
    setIsAudioPlaying(false)
  }, [audioUrl])

  const hashPronunciationRequest = (text: string) => {
    const normalized = `${outputLanguage}|${selectedVoice ?? "default"}|${text}`
    let hash = 0

    for (let index = 0; index < normalized.length; index += 1) {
      hash = (hash << 5) - hash + normalized.charCodeAt(index)
      hash |= 0
    }

    return hash.toString()
  }

  const handleGeneratePronunciation = async () => {
    const trimmedTranslation = translation.trim()
    if (!trimmedTranslation || !outputLanguage || isGeneratingAudio) {
      return
    }

    const nextHash = hashPronunciationRequest(trimmedTranslation)
    if (lastPronouncedHashRef.current === nextHash && audioUrl) {
      console.log("[pronounce] Using cached audio for current translation")
      return
    }

    setIsGeneratingAudio(true)
    setAudioError(null)

    try {
      const response = await fetch("/api/pronounce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: trimmedTranslation,
          languageCode: outputLanguage,
          voiceId: selectedVoice ?? undefined,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        const message = errorPayload?.error ?? "Unable to generate pronunciation right now."
        throw new Error(message)
      }

      const audioBlob = await response.blob()
      const objectUrl = URL.createObjectURL(audioBlob)

      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current)
      }

      audioObjectUrlRef.current = objectUrl
      setAudioUrl(objectUrl)
      lastPronouncedHashRef.current = nextHash
      console.log("[pronounce] Audio generated")
    } catch (err) {
      console.error("[pronounce] Generation failed", err)
      const message =
        err instanceof Error && err.message ? err.message : "Unable to generate pronunciation."
      setAudioError(message)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handlePronunciationButtonClick = () => {
    if (isGeneratingAudio) return

    if (audioUrl && audioPlayerRef.current) {
      if (isAudioPlaying) {
        audioPlayerRef.current.pause()
      } else {
        void audioPlayerRef.current.play().catch(() => setIsAudioPlaying(false))
      }
      return
    }

    void handleGeneratePronunciation()
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(t.enterTextBeforeTranslation)
      console.log("[translate] blocked: empty input")
      return
    }

    if (!inputLanguage) {
      setError(t.selectLanguageRequired)
      console.log("[translate] blocked: no source language selected")
      return
    }

    resetPronunciationState()
    setIsLoading(true)
    setError(null)
    setTranslation("")
    console.log("[translate] sending request", {
      sourceLanguage: inputLanguage,
      targetLanguage: outputLanguage,
      sourceLanguageLabel: sourceLanguageDisplayName,
      targetLanguageLabel: targetLanguageDisplayName,
      textLength: inputText.trim().length,
    })

    try {
      const { translation } = await translateText(
        {
        text: inputText.trim(),
        sourceLanguage: inputLanguage,
          targetLanguage: outputLanguage,
          sourceLanguageLabel: sourceLanguageDisplayName,
          targetLanguageLabel: targetLanguageDisplayName,
        },
        {
          onDelta: (chunk) => {
            setTranslation((prev) => prev + chunk)
          },
        }
      )
      setTranslation(translation)
      console.log("[translate] success", { translationLength: translation.length })
    } catch (err) {
      console.error("Translation failed", err)
      if (err instanceof Error && err.message) {
        setError(err.message)
      } else {
      setError(t.unableToTranslate)
      }
    } finally {
      setIsLoading(false)
      console.log("[translate] request finished")
    }
  }

  const handleSourceLanguageSelect = (value: string) => {
    if (value === HIDDEN_TAB_VALUE) return
    setInputLanguage(value)
    if (
      SOURCE_PRIMARY_LANGUAGE_VALUES.includes(
        value as (typeof SOURCE_PRIMARY_LANGUAGE_VALUES)[number]
      )
    ) {
      setActiveSourceTab(value)
    } else {
      setActiveSourceTab(HIDDEN_TAB_VALUE)
    }
    setSourceLanguageSearchTerm("")
  }

  const handleSourceTabChange = (value: string) => {
    if (value === HIDDEN_TAB_VALUE) {
      setActiveSourceTab(HIDDEN_TAB_VALUE)
      return
    }
    handleSourceLanguageSelect(value)
  }

  const handleTargetLanguageSelect = (value: string) => {
    if (value === HIDDEN_TAB_VALUE) return
    setOutputLanguage(value)
    if (
      TARGET_PRIMARY_LANGUAGE_VALUES.includes(
        value as (typeof TARGET_PRIMARY_LANGUAGE_VALUES)[number]
      )
    ) {
      setActiveTargetTab(value)
    } else {
      setActiveTargetTab(HIDDEN_TAB_VALUE)
    }
    setTargetLanguageSearchTerm("")
  }

  const handleTargetTabChange = (value: string) => {
    if (value === HIDDEN_TAB_VALUE) {
      setActiveTargetTab(HIDDEN_TAB_VALUE)
      return
    }
    handleTargetLanguageSelect(value)
  }

  const sourceCurrentLanguageLabel =
    ALL_LANGUAGE_OPTIONS.find((language) => language.value === inputLanguage)?.label ?? ""
  const targetCurrentLanguageLabel =
    ALL_LANGUAGE_OPTIONS.find((language) => language.value === outputLanguage)?.label ?? ""
  const sourceLanguageDisplayName =
    sourceCurrentLanguageLabel || inputLanguage?.toUpperCase() || "Source"
  const targetLanguageDisplayName =
    targetCurrentLanguageLabel || outputLanguage?.toUpperCase() || "Target"
  const isSourceAdditionalLanguageSelected = SOURCE_ADDITIONAL_LANGUAGE_OPTIONS.some(
    (language) => language.value === inputLanguage
  )
  const isTargetAdditionalLanguageSelected = TARGET_ADDITIONAL_LANGUAGE_OPTIONS.some(
    (language) => language.value === outputLanguage
  )
  const sourceDropdownButtonLabel = isSourceAdditionalLanguageSelected
    ? sourceCurrentLanguageLabel
    : "More languages"
  const targetDropdownButtonLabel = isTargetAdditionalLanguageSelected
    ? targetCurrentLanguageLabel
    : "More languages"
  const sourceNormalizedSearch = sourceLanguageSearchTerm.trim().toLowerCase()
  const targetNormalizedSearch = targetLanguageSearchTerm.trim().toLowerCase()
  const filteredSourceAdditionalLanguageOptions = SOURCE_ADDITIONAL_LANGUAGE_OPTIONS.filter(
    (language) =>
      language.label.toLowerCase().includes(sourceNormalizedSearch) ||
      language.value.toLowerCase().includes(sourceNormalizedSearch)
  )
  const filteredTargetAdditionalLanguageOptions = TARGET_ADDITIONAL_LANGUAGE_OPTIONS.filter(
    (language) =>
      language.label.toLowerCase().includes(targetNormalizedSearch) ||
      language.value.toLowerCase().includes(targetNormalizedSearch)
  )

  const characterCount = `${inputText.length} / ${CHARACTER_LIMIT}`


  return (
    <div className="container mx-auto p-6 max-w-7xl h-[calc(100vh-4rem)] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden mb-6">
        <div className="flex flex-col gap-3 h-full">
          <Tabs
            value={activeSourceTab}
            onValueChange={handleSourceTabChange}
            className="flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <TabsList>
                {SOURCE_PRIMARY_LANGUAGE_TABS.map((language) => (
                  <TabsTrigger key={language.value} value={language.value}>
                {language.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger value={HIDDEN_TAB_VALUE} className="hidden" aria-hidden="true">
                  Other
                </TabsTrigger>
              </TabsList>

              <DropdownMenu
                onOpenChange={(open) => {
                  if (!open) {
                    setSourceLanguageSearchTerm("")
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{sourceDropdownButtonLabel}</span>
                    <ChevronDown className="h-4 w-4" />
          </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[220px] p-2"
                  onEscapeKeyDown={() => setSourceLanguageSearchTerm("")}
                >
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Search languages
                  </DropdownMenuLabel>
                  <div className="mt-1">
                    <Input
                      placeholder="Search..."
                      value={sourceLanguageSearchTerm}
                      onChange={(event) => setSourceLanguageSearchTerm(event.target.value)}
                      className="h-8"
                      autoFocus
                    />
        </div>
                  <DropdownMenuSeparator />
                  {filteredSourceAdditionalLanguageOptions.length > 0 ? (
                    filteredSourceAdditionalLanguageOptions.map((language) => {
                      const isActive = language.value === inputLanguage
                      return (
                        <DropdownMenuItem
                          key={language.value}
                          onSelect={() => handleSourceLanguageSelect(language.value)}
                        >
                          <span>{language.label}</span>
                          {isActive && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                      )
                    })
                  ) : (
                    <DropdownMenuItem disabled>
                      <span>No languages found</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
      </div>
          </Tabs>

          <div className="flex flex-col border border-input rounded-lg bg-background p-4 flex-1">
          <Textarea
            value={inputText}
            onChange={(event) =>
              setInputText(event.target.value.slice(0, CHARACTER_LIMIT))
            }
              placeholder="Enter any text in any language"
              className="flex-1 min-h-[180px] resize-none border-0 bg-transparent p-0 text-base leading-relaxed focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0 shadow-none"
            maxLength={CHARACTER_LIMIT}
          />
            <div className="mt-4 flex items-center justify-end">
              <span className="text-xs text-muted-foreground">{characterCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 h-full">
          <Tabs
            value={activeTargetTab}
            onValueChange={handleTargetTabChange}
            className="flex-shrink-0"
          >
            <div className="flex items-center gap-3">
              <TabsList>
                {TARGET_PRIMARY_LANGUAGE_TABS.map((language) => (
                  <TabsTrigger key={language.value} value={language.value}>
                    {language.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger value={HIDDEN_TAB_VALUE} className="hidden" aria-hidden="true">
                  Other
                </TabsTrigger>
              </TabsList>

              <DropdownMenu
                onOpenChange={(open) => {
                  if (!open) {
                    setTargetLanguageSearchTerm("")
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
            <Button
                    variant="outline"
                    className="inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <span>{targetDropdownButtonLabel}</span>
                    <ChevronDown className="h-4 w-4" />
            </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[220px] p-2"
                  onEscapeKeyDown={() => setTargetLanguageSearchTerm("")}
                >
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Search languages
                  </DropdownMenuLabel>
                  <div className="mt-1">
                    <Input
                      placeholder="Search..."
                      value={targetLanguageSearchTerm}
                      onChange={(event) => setTargetLanguageSearchTerm(event.target.value)}
                      className="h-8"
                      autoFocus
                    />
                  </div>
                  <DropdownMenuSeparator />
                  {filteredTargetAdditionalLanguageOptions.length > 0 ? (
                    filteredTargetAdditionalLanguageOptions.map((language) => {
                      const isActive = language.value === outputLanguage
                      return (
                        <DropdownMenuItem
                          key={language.value}
                          onSelect={() => handleTargetLanguageSelect(language.value)}
                        >
                          <span>{language.label}</span>
                          {isActive && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                      )
                    })
                  ) : (
                    <DropdownMenuItem disabled>
                      <span>No languages found</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
          </Tabs>

          <div className="flex flex-col border border-input rounded-lg bg-muted/30 p-4 flex-1">
            <div className="flex-1 min-h-[240px] rounded-md text-sm overflow-y-auto">
              <audio
                ref={audioPlayerRef}
                src={audioUrl ?? undefined}
                onPlay={() => setIsAudioPlaying(true)}
                onPause={() => setIsAudioPlaying(false)}
                onEnded={() => setIsAudioPlaying(false)}
                className="hidden"
              />
              {translation ? (
                <p className="whitespace-pre-wrap text-foreground/80">
                  {translation}{" "}
                  <button
                    type="button"
                    onClick={handlePronunciationButtonClick}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#4c1d95] hover:text-[#a855f7] transition-colors disabled:opacity-60"
                    disabled={isGeneratingAudio}
                    aria-busy={isGeneratingAudio}
                  >
                    {isGeneratingAudio ? (
                      <>
                        [<span>Generating pronunciation</span>
                        <Loader2 className="h-4 w-4 animate-spin" />]
                      </>
                    ) : audioUrl ? (
                      <>
                        [<span>{isAudioPlaying ? "Pause pronunciation" : "Listen to pronunciation"}</span>
                        {isAudioPlaying ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        )}]
                      </>
                    ) : (
                      <>
                        [<span>Generate pronunciation</span>
                        <Volume2 className="h-4 w-4" />]
                      </>
                    )}
                  </button>
                </p>
              ) : (
                <span className="text-muted-foreground">
                  {t.translationWillAppear}
                </span>
              )}
              {audioError && (
                <p className="mt-2 text-sm text-red-600">
                  {audioError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-center flex-shrink-0">
        <Button
          size="lg"
          className="px-10 py-3 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim() || !inputLanguage || !outputLanguage}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.translating}
            </>
          ) : (
            "Translate"
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
