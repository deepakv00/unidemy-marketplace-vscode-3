"use client"

import React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Heart,
  Share2,
  MapPin,
  Clock,
  Shield,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  Phone,
  Edit,
  Trash2,
  Save,
  X,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocationSelector } from "@/components/location-selector"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase-client"
import { getProductById, updateProductById, deleteProduct, incrementProductViews } from "@/lib/api/products"
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/api/wishlist"
import type { Database } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { ProductStatusSelector } from "@/components/product-status-selector"

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

export default function ListingPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = params instanceof Promise ? React.use(params) : params
  const { id } = resolvedParams

  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listing, setListing] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [message, setMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    condition: "",
    location: "",
    quantity: 1,
    status: "draft",
  })

  useEffect(() => {
    async function loadProductData() {
      try {
        setLoading(true)
        const productId = Number.parseInt(id)

        // Get user session
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setUser(user)

        // Get product details
        const product = await getProductById(productId)
        if (product) {
          setListing(product)
          setEditForm({
            title: product.title,
            description: product.description || "",
            price: product.price,
            category: product.category,
            condition: product.condition,
            location: product.location,
            quantity: product.quantity || 1,
            status: product.status || "in_stock",
          })

          // Increment view count (only if not the owner viewing their own product)
          if (!user || user.id !== product.seller_id) {
            await incrementProductViews(productId)
          }

          // Check if in wishlist
          if (user) {
            const wishlistStatus = await isInWishlist(user.id, product.id)
            setIsLiked(wishlistStatus)
          }
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProductData()
  }, [id])

  const isOwner = listing && user && user.id === listing.seller_id

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading product...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : ["/placeholder.svg"]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleAddToWishlist = async () => {
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
        const success = await removeFromWishlist(user.id, listing.id)
        if (success) {
          setIsLiked(false)
          toast({
            title: "Removed from favorites",
            description: `${listing.title} has been removed from your favorites.`,
          })
        }
      } else {
        const success = await addToWishlist(user.id, listing.id)
        if (success) {
          setIsLiked(true)
          toast({
            title: "Added to favorites",
            description: `${listing.title} has been added to your favorites.`,
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact sellers.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    // Redirect to messages with seller info
    router.push(`/messages?seller=${encodeURIComponent(listing.users?.name || "Seller")}&product=${listing.id}`)
  }

  const handleCallSeller = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view contact details.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    toast({
      title: "Contact Number",
      description: "Contact details would be shown here for verified users.",
    })
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    try {
      const updates = {
        title: editForm.title,
        description: editForm.description,
        price: editForm.price,
        category: editForm.category,
        condition: editForm.condition,
        location: editForm.location,
        quantity: Number.parseInt(editForm.quantity.toString(), 10),
        status:
          editForm.status === "in_stock"
            ? "active"
            : editForm.status === "out_of_stock"
              ? "sold"
              : editForm.status === "on_hold"
                ? "draft"
                : editForm.status,
      }

      // Validate quantity is a positive integer
      if (isNaN(updates.quantity) || updates.quantity < 1 || !Number.isInteger(updates.quantity)) {
        toast({
          title: "Invalid quantity",
          description: "Quantity must be a positive whole number.",
          variant: "destructive",
        })
        return
      }

      console.log("[v0] Updating product with:", updates) // Debug log

      const updatedProduct = await updateProductById(listing.id, updates)

      if (updatedProduct) {
        setListing(updatedProduct)
        setIsEditing(false)
        toast({
          title: "Product updated",
          description: "Your product has been updated successfully.",
        })
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error updating product",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditForm({
      title: listing.title,
      description: listing.description || "",
      price: listing.price,
      category: listing.category,
      condition: listing.condition,
      location: listing.location,
      quantity: listing.quantity || 1,
      status: listing.status || "in_stock",
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        const success = await deleteProduct(listing.id)

        if (success) {
          toast({
            title: "Product deleted",
            description: "Your product has been deleted successfully.",
          })
          router.push("/dashboard")
        } else {
          throw new Error("Failed to delete product")
        }
      } catch (error) {
        console.error("Error deleting product:", error)
        toast({
          title: "Error deleting product",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    }
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
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href={`/category/${listing.category}`} className="hover:text-blue-600">
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

                  {isOwner && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="rounded-full h-10 w-10 p-0 bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelEdit}
                            className="rounded-full h-10 w-10 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleEdit}
                            className="rounded-full h-10 w-10 p-0 bg-white/90 hover:bg-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDelete}
                            className="rounded-full h-10 w-10 p-0 bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}

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
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        rows={6}
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={editForm.quantity}
                          onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                          className="mt-1"
                          min="1"
                          step="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="condition">Condition</Label>
                        <Select
                          value={editForm.condition}
                          onValueChange={(value) => setEditForm({ ...editForm, condition: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Like New">Like New</SelectItem>
                            <SelectItem value="Excellent">Excellent</SelectItem>
                            <SelectItem value="Good">Good</SelectItem>
                            <SelectItem value="Fair">Fair</SelectItem>
                            <SelectItem value="Poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <div className="mt-2">
                        <LocationSelector
                          onLocationSelect={(city) => setEditForm({ ...editForm, location: city })}
                          showCurrentLocation={true}
                          className="w-full"
                          scope="local"
                        />
                      </div>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="Enter your city name"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={editForm.category}
                        onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="vehicles">Vehicles</SelectItem>
                          <SelectItem value="home-garden">Home & Garden</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="donate-giveaway">Donate/Giveaway</SelectItem>
                          <SelectItem value="moving-out">Moving Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <ProductStatusSelector
                        currentStatus={editForm.status}
                        onStatusChange={(status) => setEditForm({ ...editForm, status })}
                        showAllStatuses={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{editForm.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Condition:</span>
                      <span className="text-gray-900 dark:text-white">{editForm.condition}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-gray-900 dark:text-white">{editForm.status}</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{listing.category}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Condition:</span>
                      <span className="text-gray-900 dark:text-white">{listing.condition}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-gray-900 dark:text-white">{listing.status}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  {!isOwner && (
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
                  )}
                </div>

                <div className="flex items-center mb-4">
                  {listing.category === "donate-giveaway" ? (
                    <span className="text-4xl font-bold text-green-600">FREE</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-green-600">
                        ₹{Number(listing.price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                      {listing.original_price && (
                        <span className="text-lg text-gray-500 line-through ml-3">
                          ₹{Number(listing.original_price).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <MapPin className="h-4 w-4 mr-1" />
                  {listing.location}
                  <Clock className="h-4 w-4 ml-4 mr-1" />
                  {getTimeAgo(listing.created_at)}
                  <Eye className="h-4 w-4 ml-4 mr-1" />
                  234 views
                </div>

                <div className="flex items-center mb-4">
                  <Package className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">
                    {listing.quantity > 0 ? (
                      `${listing.quantity} ${listing.quantity === 1 ? "item" : "items"} available`
                    ) : (
                      <span className="text-red-500 font-bold">Out of Stock</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center mb-6">
                  <Badge variant="outline" className="mr-2">
                    {listing.condition}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:border-green-800"
                  >
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

                {isOwner ? (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Product</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      This is your product listing. You can edit or delete it using the buttons above.
                    </p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
