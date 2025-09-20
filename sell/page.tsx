"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApp } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { addProduct } from "@/lib/products"
import Link from "next/link"

export default function SellPage() {
  const { state } = useApp()
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    condition: "",
    location: "",
    images: [] as string[],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // In a real app, you would upload these to a server
      // For now, we'll just create placeholder URLs
      const newImages = Array.from(files).map(
        (file, index) => `/placeholder.svg?height=300&width=400&text=Image${index + 1}`,
      )
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 8), // Max 8 images
      }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category || !formData.condition) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    // For donate/giveaway category, price should be 0
    if (formData.category === "donate-giveaway" && formData.price !== "0") {
      setFormData((prev) => ({ ...prev, price: "0" }))
    }

    // For other categories, price is required
    if (formData.category !== "donate-giveaway" && !formData.price) {
      toast({
        title: "Missing information",
        description: "Please enter a price for your item.",
        variant: "destructive",
      })
      return
    }

    if (!state.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create listings.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the product
      const newProduct = addProduct({
        title: formData.title,
        description: formData.description,
        price: formData.category === "donate-giveaway" ? 0 : Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        condition: formData.condition,
        location: formData.location || "New York, NY",
        image: formData.images[0] || "/placeholder.svg?height=300&width=400",
        seller: {
          name: state.user.name,
          rating: 4.8,
          verified: true,
        },
        timeAgo: "Just now",
        specifications: {
          Condition: formData.condition,
          Category: formData.category,
        },
      })

      toast({
        title: "Listing created successfully!",
        description:
          formData.category === "donate-giveaway"
            ? "Your donation has been listed and will help someone in need!"
            : "Your item has been listed and is now live on the marketplace.",
      })

      // Redirect to the new product page
      router.push(`/listing/${newProduct.id}`)
    } catch (error) {
      toast({
        title: "Error creating listing",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to sell</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to create listings.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold ml-4">Create New Listing</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="What are you selling or giving away?"
                      maxLength={100}
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your item in detail..."
                      rows={6}
                      maxLength={1000}
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="vehicles">Vehicles</SelectItem>
                          <SelectItem value="home-garden">Home & Garden</SelectItem>
                          <SelectItem value="fashion">Fashion</SelectItem>
                          <SelectItem value="gaming">Gaming</SelectItem>
                          <SelectItem value="books">Books</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="baby-kids">Baby & Kids</SelectItem>
                          <SelectItem value="donate-giveaway">Donate/Giveaway</SelectItem>
                          <SelectItem value="moving-out">Moving Out</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="condition">Condition *</Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value) => handleInputChange("condition", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Like New">Like New</SelectItem>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, State"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Photos</CardTitle>
                  <p className="text-sm text-gray-600">Add up to 8 photos. The first photo will be your main image.</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}

                    {formData.images.length < 8 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Add Photo</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.category === "donate-giveaway" ? (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">FREE ITEM</h3>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        This item will be listed as free for donation/giveaway
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange("price", e.target.value)}
                            placeholder="0.00"
                            className="pl-8"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            id="originalPrice"
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) => handleInputChange("originalPrice", e.target.value)}
                            placeholder="0.00"
                            className="pl-8"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Show original price to highlight savings</p>
                      </div>
                    </>
                  )}

                  {/* Special category notices */}
                  {formData.category === "moving-out" && (
                    <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">URGENT SALE</h3>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        This item will be marked as urgent and featured in Moving Out Deals
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center relative">
                      {formData.images.length > 0 ? (
                        <img
                          src={formData.images[0] || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}

                      {/* Special badges preview */}
                      {formData.category === "donate-giveaway" && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">FREE</span>
                        </div>
                      )}
                      {formData.category === "moving-out" && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                            URGENT
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold mb-1">{formData.title || "Item title"}</h3>
                    <p className="text-green-600 font-bold mb-2">
                      {formData.category === "donate-giveaway" ? "FREE" : `$${formData.price || "0.00"}`}
                      {formData.originalPrice && formData.category !== "donate-giveaway" && (
                        <span className="text-gray-500 line-through ml-2 text-sm">${formData.originalPrice}</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">{formData.location || "Location"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting
                  ? "Creating Listing..."
                  : formData.category === "donate-giveaway"
                    ? "List for Donation"
                    : "Create Listing"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
