"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Grid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useApp, type Product } from "@/store"
import ProductCard from "@/product-card"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const { state } = useApp()

  useEffect(() => {
    if (query && state.products) {
      // Search through all products in the global state
      const searchResults = state.products.filter(
        (product: Product) =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase()) ||
          product.seller.name.toLowerCase().includes(query.toLowerCase()),
      )

      // Apply filters
      let filtered = searchResults.filter((product) => {
        const priceInRange = product.price >= priceRange[0] && product.price <= priceRange[1]
        const conditionMatch = selectedConditions.length === 0 || selectedConditions.includes(product.condition)
        return priceInRange && conditionMatch
      })

      // Sort products
      filtered = filtered.sort((a, b) => {
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

      setFilteredProducts(filtered)
    } else {
      setFilteredProducts([])
    }
  }, [query, state.products, priceRange, selectedConditions, sortBy])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{filteredProducts.length} items found</p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-2">No results found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try searching with different keywords or browse our categories.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-80 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Filters</h3>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-3">Price Range</label>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100000}
                      step={1000}
                      className="mb-3"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₹{priceRange[0].toLocaleString()}</span>
                      <span>₹{priceRange[1].toLocaleString()}</span>
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
                    <Input placeholder="Enter city or area" />
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
                      <div className="mt-6 space-y-6">
                        <div>
                          <label className="block text-sm font-medium mb-3">Price Range</label>
                          <Slider
                            value={priceRange}
                            onValueChange={setPriceRange}
                            max={100000}
                            step={1000}
                            className="mb-3"
                          />
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>₹{priceRange[0].toLocaleString()}</span>
                            <span>₹{priceRange[1].toLocaleString()}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-3">Condition</label>
                          <div className="space-y-2">
                            {["New", "Like New", "Excellent", "Good", "Fair"].map((condition) => (
                              <div key={condition} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`mobile-${condition}`}
                                  checked={selectedConditions.includes(condition)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedConditions([...selectedConditions, condition])
                                    } else {
                                      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
                                    }
                                  }}
                                />
                                <label htmlFor={`mobile-${condition}`} className="text-sm">
                                  {condition}
                                </label>
                              </div>
                            ))}
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

              {/* Products Grid */}
              <div
                className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
