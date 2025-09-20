"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Package, Eye, TrendingUp, User, LogOut, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/lib/store"
import { getProductsBySeller } from "@/lib/products"
import type { Product } from "@/lib/store"
import Image from "next/image"

export default function DashboardPage() {
  const { state, dispatch } = useApp()
  const [userListings, setUserListings] = useState<Product[]>([])

  useEffect(() => {
    if (state.user) {
      const listings = getProductsBySeller(state.user.name)
      setUserListings(listings)
    }
  }, [state.user])

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sign in to access dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You need to be signed in to access your seller dashboard.
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">U</span>
              </div>
              <span className="font-bold text-lg">Unidemy Global</span>
            </div>

            <nav className="space-y-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-600">
                  <Package className="h-4 w-4 mr-3" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/sell">
                <Button variant="ghost" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-3" />
                  Post Ad
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Button>
              </Link>
              <Link href="/wishlist">
                <Button variant="ghost" className="w-full justify-start">
                  <Package className="h-4 w-4 mr-3" />
                  Favorites
                </Button>
              </Link>
            </nav>

            <div className="mt-auto pt-8">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {state.user?.name}!</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your listings and track your activity</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="bg-transparent">
                <Package className="h-4 w-4 mr-2" />
                Browse Marketplace
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Ads</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{userListings.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {userListings.reduce((total, listing) => total + 234, 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Favorites</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{state.wishlist.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Listings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Listings</CardTitle>
              <Link href="/sell">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Ad
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {userListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userListings.map((listing) => (
                    <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <Image
                            src={listing.image || "/placeholder.svg"}
                            alt={listing.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full bg-white/90">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full bg-white/90">
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {listing.condition}
                            </Badge>
                            <span className="text-xs text-gray-500">234 views</span>
                          </div>
                          <Link href={`/listing/${listing.id}`}>
                            <h3 className="font-semibold text-sm mb-2 text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-2">
                              {listing.title}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">₹{listing.price.toLocaleString()}</span>
                            <span className="text-xs text-gray-500">{listing.timeAgo}</span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No ads posted yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Start selling by creating your first ad</p>
                  <Link href="/sell">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      Post Your First Ad
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
