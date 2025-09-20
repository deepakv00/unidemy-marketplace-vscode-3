"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Star,
  Shield,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useApp, type Product } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { getProductById } from "@/lib/products"

export default function ListingPage({ params }: { params: { id: string } }) {
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const router = useRouter()
  const [listing, setListing] = useState<Product | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const productId = Number.parseInt(params.id)
    const product = getProductById(productId)

    if (product) {
      setListing(product)
      setIsLiked(state.wishlist.some((item) => item.id === product.id))
    }
  }, [params.id, state.wishlist])

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/" scroll={false}>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = [listing.image, listing.image, listing.image, listing.image] // Mock multiple images

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToWishlist = () => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your favorites.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    if (isLiked) {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: listing.id })
      setIsLiked(false)
      toast({
        title: "Removed from favorites",
        description: `${listing.title} has been removed from your favorites.`,
      })
    } else {
      dispatch({ type: "ADD_TO_WISHLIST", payload: listing })
      setIsLiked(true)
      toast({
        title: "Added to favorites",
        description: `${listing.title} has been added to your favorites.`,
      })
    }
  }

  const handleContactSeller = () => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact sellers.",
        variant: "destructive",
      })
      router.push("/auth/login", { scroll: false })
      return
    }

    // Redirect to messages with seller info
    router.push(`/messages?seller=${encodeURIComponent(listing.seller.name)}&product=${listing.id}`, { scroll: false })
  }

  const handleCallSeller = () => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view contact details.",
        variant: "destructive",
      })
      router.push("/auth/login", { scroll: false })
      return
    }

    toast({
      title: "Contact Number",
      description: "Call +91 98765 43210 to speak with the seller directly.",
    })
  }

  // Get special badge for product
  const getSpecialBadge = () => {
    if (listing.category === "donate-giveaway") {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-4 py-2">FREE</Badge>
    }
    if (listing.category === "moving-out") {
      return (
        <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold text-lg px-4 py-2 animate-pulse">
          URGENT
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/" className="hover:text-blue-600" scroll={false}>
              Home
            </Link>
            <span>/</span>
            <Link href={`/category/${listing.category}`} className="hover:text-blue-600" scroll={false}>
              {listing.category === "donate-giveaway"
                ? "Donate/Giveaway"
                : listing.category === "moving-out"
                  ? "Moving Out"
                  : listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}
            </Link>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{listing.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative">
                <div className="relative h-96 md:h-[500px]">
                  <Image
                    src={images[currentImageIndex] || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />

                  {/* Special badges */}
                  <div className="absolute top-4 left-4">{getSpecialBadge()}</div>

                  {/* Navigation Arrows */}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 p-0"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full h-10 w-10 p-0"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                <div className="flex space-x-2 p-4 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            {listing.specifications && (
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(listing.specifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800"
                      >
                        <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                        <span className="text-gray-900 dark:text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {listing.category === "donate-giveaway"
                        ? "Donate/Giveaway"
                        : listing.category === "moving-out"
                          ? "Moving Out"
                          : listing.category}
                    </Badge>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{listing.title}</h1>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleAddToWishlist} className="p-2 bg-transparent">
                      <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center mb-4">
                  {listing.category === "donate-giveaway" ? (
                    <span className="text-4xl font-bold text-green-600">FREE</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-green-600">₹{listing.price.toLocaleString()}</span>
                      {listing.originalPrice && (
                        <span className="text-lg text-gray-500 line-through ml-3">
                          ₹{listing.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  {listing.timeAgo}
                  <Eye className="h-4 w-4 ml-4 mr-1" />
                  234 views
                </div>

                <div className="flex items-center mb-6">
                  <Badge variant="outline" className="mr-2">
                    {listing.condition}
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Seller
                  </Badge>
                </div>

                {/* Special category notices */}
                {listing.category === "donate-giveaway" && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Free Item - Donation/Giveaway
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      This item is being given away for free. Please be respectful and only request if you truly need
                      it.
                    </p>
                  </div>
                )}

                {listing.category === "moving-out" && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Urgent Sale - Moving Out</h3>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      Seller needs to move quickly! This item is priced to sell fast and may not be available for long.
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleContactSeller}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {listing.category === "donate-giveaway" ? "Request Item" : "Chat with Seller"}
                  </Button>
                  <Button
                    onClick={handleCallSeller}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-green-50 hover:border-green-300"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Call Seller
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Quick Message */}
                <div>
                  <label className="block text-sm font-medium mb-2">Send a Message</label>
                  <Textarea
                    placeholder={
                      listing.category === "donate-giveaway"
                        ? "Hi! I'm interested in this free item. Is it still available?"
                        : "Hi! Is this item still available?"
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button variant="outline" className="w-full bg-transparent" onClick={handleContactSeller}>
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder.svg" alt={listing.seller.name} />
                    <AvatarFallback>{listing.seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-lg">{listing.seller.name}</h3>
                      {listing.seller.verified && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center mb-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{listing.seller.rating}</span>
                      <span className="text-gray-500 ml-1">(127 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Member since 2019</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Usually responds within 1 hour</p>
                  </div>
                </div>
                <Link href={`/seller/${encodeURIComponent(listing.seller.name)}`} scroll={false}>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All Ads by This Seller
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
