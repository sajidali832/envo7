"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button 
      variant="outline"
      size="lg"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-full sm:w-auto text-lg py-6 px-8"
    >
      <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="ml-4">{theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
