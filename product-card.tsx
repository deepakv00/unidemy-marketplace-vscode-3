"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Heart, MapPin, Clock, Star, Eye, MessageCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase-client"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/api/wishlist"
import type { Database } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ProductStatusBadge } from "@/components/product-status-badge"

type Product = Database["public"]["Tables"]["products"]["Row"] & {
  users: {
    id: string
    name: string
    rating: number
    verified: boolean
    avatar?: string
  }
}

// Utility function to calculate time ago
function getTimeAgo(dateString: string): string {
  const now = new Date()
  const past = new Date(dateString)
  const diffMs = now.getTime() - past.getTime()

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`
  return "Just now"
}

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
  onWishlistChange?: () => void
  refreshNotifications?: () => void
}

export default function ProductCard({
  product,
  viewMode = "grid",
  onWishlistChange,
  refreshNotifications,
}: ProductCardProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check authentication and wishlist status
  useEffect(() => {
    async function checkUserAndWishlist() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const wishlistStatus = await isInWishlist(user.id, product.id)
          setIsLiked(wishlistStatus)
        }
      } catch (error) {
        console.error("Error checking user/wishlist:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUserAndWishlist()
  }, [product.id])

  const handleAddToWishlist = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add items to your favorites.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      try {
        if (isLiked) {
          const success = await removeFromWishlist(user.id, product.id)
          if (success) {
            setIsLiked(false)
            toast({
              title: "Removed from favorites",
              description: `${product.title} has been removed from your favorites.`,
            })
            onWishlistChange?.()
            refreshNotifications?.()
            // Refresh header notification counts
            if (typeof window !== "undefined" && (window as any).refreshNotificationCounts) {
              ;(window as any).refreshNotificationCounts()
            }
          }
        } else {
          const success = await addToWishlist(user.id, product.id)
          if (success) {
            setIsLiked(true)
            toast({
              title: "Added to favorites",
              description: `${product.title} has been added to your favorites.`,
            })
            onWishlistChange?.()
            refreshNotifications?.()
            // Refresh header notification counts
            if (typeof window !== "undefined" && (window as any).refreshNotificationCounts) {
              ;(window as any).refreshNotificationCounts()
            }
          }
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    },
    [user, isLiked, product, toast, router],
  )

  const handleContactSeller = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Preserve scroll position
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to contact sellers.",
          variant: "destructive",
        })
        router.push("/auth/login")
        return
      }

      router.push(`/messages?seller=${encodeURIComponent(product.users?.name || "Unknown")}&product=${product.id}`)

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: currentScroll, behavior: "auto" })
      }, 0)
    },
    [user, product, toast, router],
  )

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      // Prevent default link behavior that might cause scrolling
      const target = e.target as HTMLElement
      if (target.tagName === "BUTTON" || target.closest("button")) {
        return // Let button handlers manage their own behavior
      }

      // Navigate without scrolling
      router.push(`/listing/${product.id}`)
    },
    [router, product.id],
  )

  // Get special badge for product
  const getSpecialBadge = () => {
    if (product.category === "donate-giveaway") {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold">FREE</Badge>
    }
    if (product.category === "moving-out") {
      return <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold animate-pulse">URGENT</Badge>
    }
    return null
  }

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden prevent-layout-shift ${
        viewMode === "list" ? "flex flex-row" : ""
      }`}
    >
      <div className={`relative ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
        <div
          className={`relative overflow-hidden cursor-pointer ${viewMode === "list" ? "h-32" : "h-64"}`}
          onClick={handleCardClick}
        >
          <Image
            src={product.images?.[0] || "/placeholder.svg"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          <div className="absolute top-3 right-3 flex space-x-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white focus-no-scroll"
              onClick={handleAddToWishlist}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </Button>
          </div>

          {/* Special badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {getSpecialBadge()}
            <ProductStatusBadge status={product.status} />
          </div>
        </div>

        <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
          <div className="flex items-start justify-between mb-3">
            <Badge variant="secondary" className="text-xs">
              {product.category === "donate-giveaway"
                ? "Donate/Giveaway"
                : product.category === "moving-out"
                  ? "Moving Out"
                  : product.category}
            </Badge>
            <div className="flex items-center text-xs text-gray-500">
              <Eye className="h-3 w-3 mr-1" />
              {product.views || 0}
            </div>
          </div>

          <div className="cursor-pointer" onClick={handleCardClick}>
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center mb-3">
            {product.category === "donate-giveaway" ? (
              <span className="text-2xl font-bold text-green-600">FREE</span>
            ) : (
              <>
                <span className="text-2xl font-bold text-green-600">
                  ₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                {product.original_price && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ₹{Number(product.original_price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center mb-3 text-sm text-gray-700">
            <Package className="h-4 w-4 mr-2 text-blue-500" />
            <span className="font-medium">
              {product.quantity !== undefined && product.quantity !== null ? (
                product.status === "out_of_stock" ? (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                ) : product.status === "on_hold" ? (
                  <span className="text-yellow-600 font-bold">On Hold - {product.quantity} available</span>
                ) : product.quantity > 0 ? (
                  `${product.quantity} ${product.quantity === 1 ? "item" : "items"} available`
                ) : (
                  <span className="text-red-500 font-bold">Out of Stock</span>
                )
              ) : (
                "Quantity not specified"
              )}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {product.location}
            <Clock className="h-4 w-4 ml-3 mr-1" />
            {getTimeAgo(product.created_at)}
          </div>

          {/* Action Buttons */}
          <div className="mb-4 space-y-2">
            <Button
              type="button"
              size="sm"
              onClick={handleContactSeller}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus-no-scroll"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {product.category === "donate-giveaway" ? "Request Item" : "Contact Seller"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                router.push(`/listing/${product.id}`)
              }}
              className="w-full bg-transparent focus-no-scroll"
            >
              View Details
            </Button>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-2">
                {product.users?.avatar ? (
                  <Image
                    src={product.users.avatar || "/placeholder.svg"}
                    alt={product.users.name || "User"}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-white text-xs font-semibold">{(product.users?.name || "U").charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.users?.name || "Unknown User"}
                  {product.users?.verified && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="text-xs text-gray-500">{product.users?.rating || 4.0}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
