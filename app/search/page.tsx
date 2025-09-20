"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getAllProducts, searchProducts } from "@/lib/api/products"
import { getCategories } from "@/lib/api/categories"
import { createClient } from "@/lib/supabase-client"
import type { Database } from "@/lib/supabase"
import ProductCard from "@/product-card"

type Product = Database['public']['Tables']['products']['Row'] & {
  users: {
    id: string
    name: string
    rating: number
    verified: boolean
    avatar?: string
  }
}

const SearchPage = () => {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceRange, setPriceRange] = useState("all")

  // Load products and categories
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          searchQuery.trim() ? searchProducts(searchQuery) : getAllProducts(),
          getCategories()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading search data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [searchQuery])

  // Search and filter products
  const filteredProducts = useMemo(() => {
    if (!products) return []

    let filtered = products

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((product: Product) => product.category === categoryFilter)
    }

    // Apply price range filter
    if (priceRange !== "all") {
      filtered = filtered.filter((product: Product) => {
        switch (priceRange) {
          case "free":
            return product.price === 0
          case "under-100":
            return product.price > 0 && product.price < 100
          case "100-500":
            return product.price >= 100 && product.price <= 500
          case "500-1000":
            return product.price >= 500 && product.price <= 1000
          case "over-1000":
            return product.price > 1000
          default:
            return true
        }
      })
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "newest":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [products, categoryFilter, priceRange, sortBy])

  // Get categories for filter dropdown
  const availableCategories = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
    }))
  }, [categories])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const results = searchQuery.trim() ? await searchProducts(searchQuery) : await getAllProducts()
      setProducts(results)
    } catch (error) {
      console.error('Error searching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Search Products"}
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl">
              <Input
                type="text"
                placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 h-12 text-lg"
              />
              <Button type="submit" size="sm" className="absolute right-2 top-2 h-8 px-3">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under-100">Under ₹100</SelectItem>
                  <SelectItem value="100-500">₹100 - ₹500</SelectItem>
                  <SelectItem value="500-1000">₹500 - ₹1,000</SelectItem>
                  <SelectItem value="over-1000">Over ₹1,000</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              {/* Results Count */}
              <span className="text-sm text-gray-600 dark:text-gray-400">{filteredProducts.length} results found</span>

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
          </div>

          {/* Active Filters */}
          {(categoryFilter !== "all" || priceRange !== "all" || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                  Search: "{searchQuery}" ×
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter("all")}>
                  Category: {availableCategories.find((c) => c.value === categoryFilter)?.label} ×
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setPriceRange("all")}>
                  Price: {priceRange.replace("-", " - ₹")} ×
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
            }
          >
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {searchQuery ? `No results found for "${searchQuery}"` : "No products found"}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {searchQuery
                ? "Try adjusting your search terms or filters"
                : "Try different search terms or browse categories"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setPriceRange("all")
                }}
              >
                Clear All Filters
              </Button>
              <Button onClick={() => (window.location.href = "/")}>Browse All Products</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchPage
