"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Grid, List, Heart, MapPin, Clock, Star, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { getProductsByCategory } from "@/lib/products"
import { useApp, type Product } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const { state, dispatch } = useApp()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const categoryProducts = getProductsByCategory(params.slug)
    setProducts(categoryProducts)
    setLikedItems(state.wishlist.map((item) => item.id))
  }, [params.slug, state.wishlist])

  const toggleLike = (product: Product) => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      })
      router.push("/auth/login", { scroll: false })
      return
    }

    const isLiked = likedItems.includes(product.id)
    if (isLiked) {
      dispatch({ type: "REMOVE_FROM_WISHLIST", payload: product.id })
      setLikedItems((prev) => prev.filter((id) => id !== product.id))
      toast({
        title: "Removed from wishlist",
        description: `${product.title} has been removed from your wishlist.`,
      })
    } else {
      dispatch({ type: "ADD_TO_WISHLIST", payload: product })
      setLikedItems((prev) => [...prev, product.id])
      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      })
    }
  }

  const categoryName = params.slug.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const priceInRange = product.price >= priceRange[0] && product.price <= priceRange[1]
      const conditionMatch = selectedConditions.length === 0 || selectedConditions.includes(product.condition)
      return priceInRange && conditionMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "oldest":
          return a.id - b.id
        default: // newest
          return b.id - a.id
      }
    })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">{categoryName}</h1>
          <p className="text-gray-600 dark:text-gray-300">{filteredProducts.length} items found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Filters</h3>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Price Range</label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={2000} step={50} className="mb-3" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Condition */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Condition</label>
                  <div className="space-y-2">
                    {["New", "Like New", "Excellent", "Good", "Fair"].map((condition) => (
                      <div key={condition} className="flex items-center space-x-2">
                        <Checkbox
                          id={condition}
                          checked={selectedConditions.includes(condition)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedConditions([...selectedConditions, condition])
                            } else {
                              setSelectedConditions(selectedConditions.filter((c) => c !== condition))
                            }
                          }}
                        />
                        <label htmlFor={condition} className="text-sm">
                          {condition}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Location</label>
                  <Input placeholder="Enter city or zip code" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden bg-transparent">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your search results</SheetDescription>
                    </SheetHeader>
                    {/* Mobile filter content - same as desktop */}
                    <div className="mt-6 space-y-6">
                      {/* Price Range */}
                      <div>
                        <label className="block text-sm font-medium mb-3">Price Range</label>
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={2000}
                          step={50}
                          className="mb-3"
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>${priceRange[0]}</span>
                          <span>${priceRange[1]}</span>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Listings Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`relative ${viewMode === "list" ? "flex" : ""}`}>
                    <div className={`relative ${viewMode === "list" ? "w-48 h-32" : "h-64"} overflow-hidden`}>
                      <Link href={`/listing/${product.id}`} scroll={false}>
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                        onClick={() => toggleLike(product)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            likedItems.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                          }`}
                        />
                      </Button>
                    </div>

                    <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {product.condition}
                        </Badge>
                      </div>

                      <Link href={`/listing/${product.id}`} scroll={false}>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>

                      <div className="flex items-center mb-3">
                        <span className="text-2xl font-bold text-green-600">${product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ${product.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                        {product.location}
                        <Clock className="h-4 w-4 ml-3 mr-1" />
                        {product.timeAgo}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center mr-2">
                            <span className="text-white text-xs font-semibold">{product.seller.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.seller.name}
                              {product.seller.verified && (
                                <Badge variant="secondary" className="ml-1 text-xs">
                                  ✓
                                </Badge>
                              )}
                            </p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-500">{product.seller.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/listing/${product.id}`} scroll={false}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <h2 className="text-xl font-semibold mb-2">No products found</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Try adjusting your filters or browse other categories.
                  </p>
                  <Link href="/" scroll={false}>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Browse All Products
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="flex justify-center mt-12">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button variant="default">1</Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
