"use client"

import * as React from "react"
import { Globe, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter, usePathname } from 'next/navigation';

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt-BR", name: "Português (BR)", flag: "🇧🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
]

export function LanguageSwitcher() {
  const { toast } = useToast()
  // This is a placeholder for a real i18n routing setup.
  // In a real app, you'd likely use a library like 'next-intl'
  // and the locale would be part of the URL.

  const handleLanguageChange = (locale: string) => {
    const language = languages.find(l => l.code === locale);
    if (language) {
      toast({
        title: `Language changed to ${language.name}!`,
        description: `${language.flag} The page would now be displayed in the selected language. (Functionality pending full i18n implementation)`,
      });
    }
  };
  
  const currentLocale = 'pt-BR'; // Mock current locale

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="bg-background/50">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onSelect={() => handleLanguageChange(lang.code)}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
            {currentLocale === lang.code && <Check className="ml-auto h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
