"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Star, Shield, MapPin, Calendar, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useApp, type Product } from "@/store"
import ProductCard from "@/product-card"

export default function SellerPage({ params }: { params: { name: string } }) {
  const { name } = params
  const decodedName = decodeURIComponent(name)
  const { state } = useApp()
  const router = useRouter()
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])

  useEffect(() => {
    if (state.products) {
      const products = state.products.filter((product: Product) => product.seller.name === decodedName)
      setSellerProducts(products)
    }
  }, [state.products, decodedName])

  // Get seller info from first product (since all products have same seller)
  const sellerInfo = sellerProducts[0]?.seller

  if (!sellerInfo && sellerProducts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Seller not found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The seller you're looking for doesn't exist or has no active listings.
            </p>
            <Button onClick={() => router.back()} variant="outline" className="bg-transparent">
              Go Back
            </Button>
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold ml-4">Seller Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seller Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src="/placeholder.svg" alt={sellerInfo?.name} />
                    <AvatarFallback className="text-xl">{sellerInfo?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-2">{sellerInfo?.name}</h2>
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{sellerInfo?.rating}</span>
                    <span className="text-gray-500 ml-1">(127 reviews)</span>
                  </div>
                  {sellerInfo?.verified && (
                    <Badge variant="secondary" className="mb-4">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Seller
                    </Badge>
                  )}
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                    <span>New York, NY</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Member since 2019</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <p className="text-xs text-gray-500 text-center">Usually responds within 1 hour</p>
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{sellerProducts.length}</div>
                      <div className="text-xs text-gray-500">Active Ads</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-xs text-gray-500">Response Rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller's Products */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>All Listings by {sellerInfo?.name}</CardTitle>
                <p className="text-gray-600 dark:text-gray-400">{sellerProducts.length} items available</p>
              </CardHeader>
              <CardContent>
                {sellerProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sellerProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No active listings</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This seller doesn't have any active listings at the moment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
