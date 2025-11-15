"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/LocaleProvider";

type LanguageOption = {
  label: string;
  value: string;
};

type ChatInputBarProps = {
  isSubmitting?: boolean;
  onSubmitPrompt: (prompt: string) => Promise<void> | void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  selectedTurnCount: number;
  onTurnCountChange: (turnCount: number) => void;
  languageOptions: LanguageOption[];
  turnCountOptions: number[];
};

export default function ChatInputBar({
  isSubmitting,
  onSubmitPrompt,
  selectedLanguage,
  onLanguageChange,
  selectedTurnCount,
  onTurnCountChange,
  languageOptions,
  turnCountOptions,
}: ChatInputBarProps) {
  const { t } = useLocale();
  const [value, setValue] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedValue = value.trim();
    if (!trimmedValue || isSubmitting) return;

    try {
      await onSubmitPrompt(trimmedValue);
      setValue("");
    } catch (error) {
      console.error("[chat input] Submission failed", error);
    }
  }

  const isButtonDisabled = !value.trim() || Boolean(isSubmitting);

  return (
    <div className="w-full max-w-3xl rounded-3xl border border-black/25 bg-muted/60 p-3 shadow-2xl shadow-black/20 backdrop-blur">
      <form
        onSubmit={handleSubmit}
        className="group flex items-center gap-3 rounded-2xl border border-transparent bg-muted/0 px-4 py-3 transition-all focus-within:border-transparent focus-within:bg-muted/10"
      >
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t.dialogueChatInputPlaceholder}
          className="flex-1 border-none bg-transparent text-base shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          aria-label="Dialogue prompt"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          size="icon"
          disabled={isButtonDisabled}
          className="h-9 w-9 rounded-full p-0"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-6 w-6" />}
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-4 pl-4 text-xs text-muted-foreground">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-left font-semibold transition hover:border-border hover:bg-background/60"
              disabled={isSubmitting}
            >
              <span className="uppercase tracking-wide text-[11px] text-muted-foreground">{t.dialogueLanguageLabel}</span>
              <span className="text-foreground">
                {languageOptions.find((option) => option.value === selectedLanguage)?.label ??
                  selectedLanguage.toUpperCase()}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {languageOptions.map((option) => (
              <DropdownMenuItem key={option.value} onSelect={() => onLanguageChange(option.value)}>
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-1 text-left font-semibold transition hover:border-border hover:bg-background/60"
              disabled={isSubmitting}
            >
              <span className="uppercase tracking-wide text-[11px] text-muted-foreground">{t.dialogueTurnCountLabel}</span>
              <span className="text-foreground">{selectedTurnCount}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {turnCountOptions.map((option) => (
              <DropdownMenuItem key={option} onSelect={() => onTurnCountChange(option)}>
                {option} {t.dialogueTurns}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
