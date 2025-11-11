"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Volume2 } from "lucide-react"
import { useLocale } from "@/components/LocaleProvider"
import { getNestedTranslations } from "@/lib/i18n"

const VOICE_OPTIONS = [
  { value: "male1", label: "Male Voice 1" },
  { value: "male2", label: "Male Voice 2" },
  { value: "female1", label: "Female Voice 1" },
  { value: "female2", label: "Female Voice 2" },
  { value: "child", label: "Child Voice" },
]

const ACCENT_OPTIONS = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-AU", label: "English (Australian)" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "lb", label: "Luxembourgish" },
]

const FORMAT_OPTIONS = [
  { value: "mp3", label: "MP3 (recommended)" },
  { value: "wav", label: "WAV (high quality)" },
  { value: "ogg", label: "OGG" },
  { value: "aac", label: "AAC" },
]

const SAMPLE_RATE_OPTIONS = [
  { value: "16000", label: "16 kHz (Standard)" },
  { value: "22050", label: "22 kHz (Good)" },
  { value: "44100", label: "44.1 kHz (CD Quality)" },
  { value: "48000", label: "48 kHz (Professional)" },
]

export default function Homepage() {
  const { locale } = useLocale()
  const t = getNestedTranslations(locale).pages.dashboard.demo
  const [text, setText] = useState("")
  const maxLength = 1000

  const [voice, setVoice] = useState("female1")
  const [accent, setAccent] = useState("lb")
  const [rate, setRate] = useState(1.0)
  const [pitch, setPitch] = useState(0)
  const [volume, setVolume] = useState(80)
  const [format, setFormat] = useState("mp3")
  const [sampleRate, setSampleRate] = useState("22050")
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoDownload, setAutoDownload] = useState(false)

  const resetToDefaults = () => {
    setVoice("female1")
    setAccent("en-US")
    setRate(1.0)
    setPitch(0)
    setVolume(80)
    setFormat("mp3")
    setSampleRate("22050")
    setAutoPlay(false)
    setAutoDownload(false)
  }

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
          <form onSubmit={onSubmit} className="flex-1 min-h-0 flex flex-col gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{t.introTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {t.introDescription}
              </p>
            </div>
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
          <div className="settings-panel h-full overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">{t.settings.title}</h2>
                <p className="text-sm text-muted-foreground">{t.settings.subtitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.settings.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="voice">{t.settings.voice.label}</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger id="voice">
                    <SelectValue placeholder={t.settings.voice.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {VOICE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.settings.voice.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent">{t.settings.accent.label}</Label>
                <Select value={accent} onValueChange={setAccent}>
                  <SelectTrigger id="accent">
                    <SelectValue placeholder={t.settings.accent.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.settings.accent.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rate">{t.settings.rate.label}</Label>
                  <span className="text-sm font-medium">{rate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="rate"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[rate]}
                  onValueChange={(value) => setRate(Number(value[0]))}
                />
                <p className="text-xs text-muted-foreground">
                  {t.settings.rate.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pitch">{t.settings.pitch.label}</Label>
                  <span className="text-sm font-medium">
                    {pitch > 0 ? `+${pitch}` : pitch}
                  </span>
                </div>
                <Slider
                  id="pitch"
                  min={-10}
                  max={10}
                  step={1}
                  value={[pitch]}
                  onValueChange={(value) => setPitch(Math.round(value[0]))}
                />
                <p className="text-xs text-muted-foreground">
                  {t.settings.pitch.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="volume" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    {t.settings.volume.label}
                  </Label>
                  <span className="text-sm font-medium">{volume}%</span>
                </div>
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={5}
                  value={[volume]}
                  onValueChange={(value) => setVolume(Math.round(value[0]))}
                />
                <p className="text-xs text-muted-foreground">
                  {t.settings.volume.description}
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="format">{t.settings.format.label}</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id="format">
                    <SelectValue placeholder={t.settings.format.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.settings.format.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleRate">{t.settings.sampleRate.label}</Label>
                <Select value={sampleRate} onValueChange={setSampleRate}>
                  <SelectTrigger id="sampleRate">
                    <SelectValue placeholder={t.settings.sampleRate.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_RATE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t.settings.sampleRate.description}
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoPlay">{t.settings.autoPlay.label}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.autoPlay.description}
                  </p>
                </div>
                <Switch
                  id="autoPlay"
                  checked={autoPlay}
                  onCheckedChange={setAutoPlay}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoDownload">{t.settings.autoDownload.label}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.autoDownload.description}
                  </p>
                </div>
                <Switch
                  id="autoDownload"
                  checked={autoDownload}
                  onCheckedChange={setAutoDownload}
                />
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full" onClick={resetToDefaults}>
                  {t.settings.reset}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
