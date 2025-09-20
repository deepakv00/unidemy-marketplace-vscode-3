import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AppProvider } from "@/store"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/header"
import Footer from "@/footer"
import { AuthProvider } from "@/lib/auth-context"   // ⬅️ Import AuthProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Unidemy Global Marketplace - Buy & Sell Everything",
  description:
    "The world's largest local marketplace. Buy and sell everything from electronics to furniture in your neighborhood.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-auto">
      <body className={`${inter.className} scroll-auto`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </AuthProvider>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
