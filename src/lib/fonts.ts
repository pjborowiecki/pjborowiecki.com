import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google"

export const fontDisplay = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
})

export const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
})

export const fontMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  preload: false,
})
