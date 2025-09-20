"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Heart, User, Menu, Plus, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase-client"
import { getWishlistCount } from "@/lib/api/wishlist"
import { getUnreadMessageCount } from "@/lib/api/messages"
import { notificationManager } from "@/lib/notification-manager"
import { ThemeToggle } from "@/theme-toggle"

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Vehicles", slug: "vehicles" },
  { name: "Home & Garden", slug: "home-garden" },
  { name: "Fashion", slug: "fashion" },
  { name: "Gaming", slug: "gaming" },
  { name: "Books", slug: "books" },
  { name: "Sports", slug: "sports" },
  { name: "Baby & Kids", slug: "baby-kids" },
  { name: "Donate/Giveaway", slug: "donate-giveaway" },
  { name: "Moving Out", slug: "moving-out" },
]

export default function Header() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load user and notification counts
  useEffect(() => {
    async function loadUserAndCounts() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Load notification counts
          const [wishlistCountData, messagesCountData] = await Promise.all([
            getWishlistCount(user.id),
            getUnreadMessageCount(user.id)
          ])
          
          setWishlistCount(wishlistCountData)
          setUnreadMessagesCount(messagesCountData)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadUserAndCounts()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        // Refresh counts when user logs in
        const [wishlistCountData, messagesCountData] = await Promise.all([
          getWishlistCount(session.user.id),
          getUnreadMessageCount(session.user.id)
        ])
        setWishlistCount(wishlistCountData)
        setUnreadMessagesCount(messagesCountData)
      } else {
        // Clear counts when user logs out
        setWishlistCount(0)
        setUnreadMessagesCount(0)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Refresh notification counts when needed
  const refreshNotificationCounts = async () => {
    if (!user) return
    await notificationManager.refresh(user.id)
  }

  // Set up notification manager subscription
  useEffect(() => {
    if (!user) return

    const unsubscribe = notificationManager.subscribe((counts) => {
      setWishlistCount(counts.wishlist)
      setUnreadMessagesCount(counts.messages)
    })

    // Initial load
    refreshNotificationCounts()

    return unsubscribe
  }, [user])

  // Set up global refresh function for other components to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).refreshNotificationCounts = refreshNotificationCounts
      // Also set up a more robust version that can be called with a delay
      (window as any).refreshNotificationCountsWithDelay = (delay = 100) => {
        if (user) {
          notificationManager.refreshWithDelay(user.id, delay)
        }
      }
    }
  }, [user])

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      // Preserve scroll position
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop

      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }

      // Restore scroll position after navigation
      setTimeout(() => {
        window.scrollTo({ top: currentScroll, behavior: "auto" })
      }, 0)
    },
    [searchQuery, router],
  )

  const handleLogout = useCallback(async () => {
    // Preserve scroll position
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop

    await supabase.auth.signOut()
    router.push("/")

    // Restore scroll position
    setTimeout(() => {
      window.scrollTo({ top: currentScroll, behavior: "auto" })
    }, 0)
  }, [supabase.auth, router])

  const handleNavigation = useCallback(
    (href: string) => {
      // Preserve scroll position
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop

      router.push(href)
      setIsMenuOpen(false)

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: currentScroll, behavior: "auto" })
      }, 0)
    },
    [router],
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 focus-no-scroll">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg hidden sm:block leading-none">Unidemy Global</span>
              <span className="text-xs text-gray-500 hidden sm:block leading-none">Marketplace</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 h-10 focus-no-scroll"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3 focus-no-scroll"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/sell" className="focus-no-scroll">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus-no-scroll">
                    <Plus className="h-4 w-4 mr-2" />
                    Sell
                  </Button>
                </Link>

                <Link href="/messages" className="focus-no-scroll">
                  <Button variant="ghost" size="sm" className="relative focus-no-scroll">
                    <MessageCircle className="h-5 w-5" />
                    {unreadMessagesCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-red-500 hover:bg-red-600 border-2 border-background"
                        variant="destructive"
                      >
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/wishlist" className="focus-no-scroll">
                  <Button variant="ghost" size="sm" className="relative focus-no-scroll">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <Badge 
                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs bg-blue-500 hover:bg-blue-600 border-2 border-background"
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="focus-no-scroll">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.user_metadata?.name || user.email} />
                        <AvatarFallback>{(user.user_metadata?.name || user.email)?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="focus-no-scroll">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="focus-no-scroll">
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="focus-no-scroll">
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login" className="focus-no-scroll">
                  <Button variant="ghost" className="focus-no-scroll">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" className="focus-no-scroll">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus-no-scroll">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden focus-no-scroll">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-12 focus-no-scroll"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3 focus-no-scroll"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {user ? (
                  <>
                    <Button
                      onClick={() => handleNavigation("/sell")}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 focus-no-scroll"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Sell
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/messages")}
                      variant="ghost"
                      className="w-full justify-start focus-no-scroll relative"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Messages
                      {unreadMessagesCount > 0 && (
                        <Badge className="ml-auto h-5 w-5 flex items-center justify-center text-xs bg-red-500" variant="destructive">
                          {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/wishlist")}
                      variant="ghost"
                      className="w-full justify-start focus-no-scroll relative"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Favorites
                      {wishlistCount > 0 && (
                        <Badge className="ml-auto h-5 w-5 flex items-center justify-center text-xs bg-blue-500">
                          {wishlistCount > 99 ? '99+' : wishlistCount}
                        </Badge>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/profile")}
                      variant="ghost"
                      className="w-full justify-start focus-no-scroll"
                    >
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/dashboard")}
                      variant="ghost"
                      className="w-full justify-start focus-no-scroll"
                    >
                      My Listings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start focus-no-scroll" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => handleNavigation("/auth/login")}
                      variant="ghost"
                      className="w-full focus-no-scroll"
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => handleNavigation("/auth/register")}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 focus-no-scroll"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Categories Bar */}
        <div className="hidden md:flex items-center space-x-6 py-3 border-t overflow-x-auto">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors focus-no-scroll whitespace-nowrap"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}
