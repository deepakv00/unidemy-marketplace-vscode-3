"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocation } from '@/lib/location-context'
import { LocationSelector } from './location-selector'
import FeaturedListings from '@/featured-listings'

export function LocationBasedHomepage() {
  const { userLocation, isLoading, detectCurrentLocation } = useLocation()
  const [showLocationSelector, setShowLocationSelector] = useState(false)

  // Show location selector if no location is set and not currently loading
  useEffect(() => {
    if (!userLocation && !isLoading) {
      setShowLocationSelector(true)
    }
  }, [userLocation, isLoading])

  const handleLocationSet = () => {
    setShowLocationSelector(false)
  }

  const handleSetLocationClick = () => {
    setShowLocationSelector(true)
  }

  return (
    <div className="space-y-8">
      {/* Location Status Card */}
      {userLocation ? (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Showing listings for {userLocation.city}
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {userLocation.state && `${userLocation.state}, `}
                    {userLocation.country}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetLocationClick}
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
                >
                  Change Location
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                  <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Showing listings from all locations
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Set your location to see nearby products
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={detectCurrentLocation}
                  disabled={isLoading}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  {isLoading ? 'Detecting...' : 'Use Current Location'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetLocationClick}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
                >
                  Select Manually
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Selector Modal */}
      {showLocationSelector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Set Your Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LocationSelector onLocationSelect={handleLocationSet} />
          </CardContent>
        </Card>
      )}

      {/* Featured Listings - Location Based */}
      <FeaturedListings />
    </div>
  )
}

