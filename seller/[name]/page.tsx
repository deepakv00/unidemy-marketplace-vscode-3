"use client"

import { useState, useEffect } from "react"
import { Star, MapPin, Calendar, MessageCircle, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductCard from "@/components/product-card"
import { getProductsBySeller } from "@/lib/products"
import { useApp, type Product } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SellerProfilePage({ params }: { params: { name: string } }) {
  const [sellerProducts, setSellerProducts] = useState<Product[]>([])
  const { state } = useApp()
  const { toast } = useToast()
  const router = useRouter()
  const sellerName = decodeURIComponent(params.name)

  useEffect(() => {
    const products = getProductsBySeller(sellerName)
    setSellerProducts(products)
  }, [sellerName])

  const handleContactSeller = () => {
    if (!state.isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to contact sellers.",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    router.push(`/messages?seller=${encodeURIComponent(sellerName)}`)
  }

  // Mock seller data - in a real app, this would come from an API
  const seller = {
    name: sellerName,
    rating: 4.8,
    verified: true,
    memberSince: "2019",
    location: "New York, NY",
    responseTime: "Usually responds within 1 hour",
    totalSales: 127,
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Passionate about technology and always looking to upgrade. I take great care of my items and provide detailed descriptions. Fast shipping and excellent customer service guaranteed!",
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seller Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={seller.avatar || "/placeholder.svg"} alt={seller.name} />
                    <AvatarFallback className="text-2xl">{seller.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center mb-2">
                    <h1 className="text-2xl font-bold">{seller.name}</h1>
                    {seller.verified && (
                      <Badge variant="secondary" className="ml-2">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{seller.rating}</span>
                    <span className="text-gray-500 ml-1">({seller.totalSales} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{seller.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>Member since {seller.memberSince}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{seller.responseTime}</div>
                </div>

                <Button
                  onClick={handleContactSeller}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Seller
                </Button>

                {seller.bio && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{seller.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="listings">Listings ({sellerProducts.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({seller.totalSales})</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                {sellerProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sellerProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">This seller hasn't posted any items for sale.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {/* Mock reviews */}
                  {[1, 2, 3].map((review) => (
                    <Card key={review}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>U{review}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-medium">User {review}</span>
                              <div className="flex items-center ml-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">2 days ago</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Great seller! Item was exactly as described and shipped quickly. Would definitely buy from
                              again.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
