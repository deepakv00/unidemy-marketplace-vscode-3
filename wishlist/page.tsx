"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Trash2, ArrowLeft, MessageCircle, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

export default function WishlistPage() {
  const { state, dispatch } = useApp()
  const { toast } = useToast()

  const removeFromWishlist = (id: number) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: id })
    toast({
      title: "Removed from wishlist",
      description: "Item has been removed from your wishlist.",
    })
  }

  const contactSeller = (product: any) => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact sellers.",
        variant: "destructive",
      })
      return
    }

    // Redirect to messages with seller info
    window.location.href = `/messages?seller=${encodeURIComponent(product.seller.name)}&product=${product.id}`

    toast({
      title: "Redirecting to messages",
      description: `Starting conversation with ${product.seller.name}.`,
    })
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to access your wishlist.</p>
            <div className="space-y-3">
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" className="w-full bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Save items you love by clicking the heart icon on any product.
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">My Wishlist ({state.wishlist.length})</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {state.wishlist.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl"
            >
              <div className="relative">
                <Link href={`/listing/${item.id}`}>
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromWishlist(item.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Link href={`/listing/${item.id}`}>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>

                  <div className="flex items-center mb-3">
                    {item.category === "donate-giveaway" ? (
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          FREE
                        </span>
                        <Gift className="h-5 w-5 ml-2 text-green-600" />
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ₹{item.price.toLocaleString()}
                        </span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2 bg-gray-100 px-2 py-1 rounded">
                            ₹{item.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{item.location}</p>

                  <div className="space-y-2">
                    <Button
                      onClick={() => contactSeller(item)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      size="sm"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Seller
                    </Button>
                    <Link href={`/listing/${item.id}`}>
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t mt-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 -mx-4 px-4 pb-2 rounded-b-xl">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-lg">
                        <span className="text-white text-xs font-bold">{item.seller.name.charAt(0)}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">{item.seller.name}</span>
                        {item.seller.verified && (
                          <Badge
                            variant="secondary"
                            className="ml-2 text-xs bg-green-100 text-green-800 border-green-200"
                          >
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
