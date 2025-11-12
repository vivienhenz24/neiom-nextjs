"use client"

import { useState } from "react"
import { ArrowLeftRight, Loader2, ChevronDown, Check, Volume2 } from "lucide-react"

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

  const handleGeneratePronunciation = () => {
    if (!translation) return
    console.log("Generate pronunciation placeholder for:", translation)
  }

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

    try {
      const { translation } = await translateText({
        text: inputText.trim(),
        sourceLanguage: inputLanguage,
        targetLanguage: outputLanguage,
      })
      setTranslation(translation)
    } catch (err) {
      console.error("Translation failed", err)
      setError(t.unableToTranslate)
    } finally {
      setIsLoading(false)
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
              {translation ? (
                <p className="whitespace-pre-wrap text-foreground/80">
                  {translation}{" "}
                  <button
                    type="button"
                    onClick={handleGeneratePronunciation}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-[#6b21a8] hover:text-[#a855f7] transition-colors"
                  >
                    [
                    Generate Pronunciation<Volume2 className="h-4 w-4" />]
                  </button>
                </p>
              ) : (
                <span className="text-muted-foreground">
                  {t.translationWillAppear}
                </span>
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

