"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"

export default function Homepage() {
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.demo
  const [text, setText] = useState("")
  const maxLength = 1000

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    // TODO: handle your submit action (e.g., call API, route, etc.)
    console.log("Submitted prompt:", text)
  }

  const onClear = () => setText("")

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row h-[calc(100vh-4rem-3.5rem)] md:h-[calc(100vh-4rem-3.5rem)]">
        {/* Left Pane: Prompt/Input (fills entire left half) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="pb-4">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
          </div>
          <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col gap-3">
            <div className="flex-1 min-h-0 flex flex-col gap-2">
              <div>
                <Label htmlFor="prompt">{t.promptLabel}</Label>
              </div>
              <div className="flex-1 min-h-0">
                <Textarea
                  id="prompt"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.promptPlaceholder}
                  maxLength={maxLength}
                  className="h-full w-full min-h-0 flex-1 resize-none overflow-y-auto"
                />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {text.length} / {maxLength}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={!text.trim()}>{t.submit}</Button>
              <Button type="button" variant="outline" onClick={onClear} disabled={!text}>{t.clear}</Button>
            </div>
          </form>
        </div>

        {/* Divider (visible on md+ only) */}
        <div className="hidden md:block w-px bg-border mx-4" aria-hidden="true" />

        {/* Right Pane: Settings/Parameters (fills entire right half) */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="pb-4">
            <h2 className="text-2xl font-semibold">{t.settings.title}</h2>
            <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            {/* Placeholder for future interactive controls */}
            <div className="text-sm text-muted-foreground">
              {t.settings.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
