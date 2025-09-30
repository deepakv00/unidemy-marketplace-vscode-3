"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, Search, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLocation } from '@/lib/location-context'
import { INDIAN_CITIES, INTERNATIONAL_CITIES, normalizeCityName, getCurrentLocation } from '@/lib/location-utils'

interface LocationSelectorProps {
  onLocationSelect?: (location: string) => void
  showCurrentLocation?: boolean
  placeholder?: string
  className?: string
  onClose?: () => void
  scope?: 'global' | 'local'
}

export function LocationSelector({ 
  onLocationSelect, 
  showCurrentLocation = true, 
  placeholder = "Select your location",
  className = "",
  onClose,
  scope = 'global'
}: LocationSelectorProps) {
  const { 
    userLocation, 
    isLoading, 
    error, 
    setUserLocation, 
    detectCurrentLocation, 
    clearLocation,
    availableCities 
  } = useLocation()
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Filter cities based on search query
  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 50) // Limit to 50 results for performance

  const handleCurrentLocationClick = async () => {
    setShowSuggestions(false)
    if (scope === 'global') {
      await detectCurrentLocation()
    } else {
      const loc = await getCurrentLocation()
      if (loc?.city) {
        const normalized = normalizeCityName(loc.city)
        setSelectedLocation(normalized)
        setSearchQuery(normalized)
        onLocationSelect?.(normalized)
      }
    }
  }

  const handleCitySelect = (city: string) => {
    const normalized = normalizeCityName(city)
    setSelectedLocation(normalized)
    setSearchQuery(normalized)
    setShowSuggestions(false)
    
    const newLocation = {
      city: normalized,
      coordinates: undefined // Manual selection doesn't have coordinates
    }
    
    if (scope === 'global') {
      setUserLocation(newLocation)
    }
    onLocationSelect?.(normalized)
  }

  const handleClearLocation = () => {
    clearLocation()
    setSelectedLocation('')
    setSearchQuery('')
    onLocationSelect?.('')
  }

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    setShowSuggestions(true)
  }

  const displayLocation = (scope === 'global' ? userLocation?.city : selectedLocation) || selectedLocation || placeholder

  return (
    <div className={`relative ${className}`}>
      <Card className="w-full relative">
        <CardHeader className="pb-3 pr-10">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Location
          </CardTitle>
          {onClose && (
            <button
              type="button"
              aria-label="Close location selector"
              onClick={onClose}
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center shadow"
            >
              ×
            </button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Display (only in global scope) */}
          {scope === 'global' && userLocation?.city && (
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {userLocation.city}
                  {userLocation.state && `, ${userLocation.state}`}
                  {userLocation.country && `, ${userLocation.country}`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Current Location Button */}
          {showCurrentLocation && (scope === 'global' ? !userLocation : true) && (
            <Button
              variant="outline"
              onClick={handleCurrentLocationClick}
              disabled={isLoading}
              className="w-full"
            >
              <Navigation className="h-4 w-4 mr-2" />
              {isLoading ? 'Detecting...' : 'Use Current Location'}
            </Button>
          )}

          {/* Manual Location Selection */}
          <div className="space-y-2">
            <Label htmlFor="city-search" className="text-sm font-medium">
              Or select your city manually:
            </Label>
            <div className="relative">
              <Input
                id="city-search"
                type="text"
                placeholder="Search for your city..."
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="pr-8"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              
              {/* City Suggestions */}
              {showSuggestions && searchQuery && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {filteredCities.length > 0 ? (
                    filteredCities.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleCitySelect(city)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{city}</span>
                          <Badge 
                            variant={INDIAN_CITIES.includes(city) ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {INDIAN_CITIES.includes(city) ? "India" : "International"}
                          </Badge>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No cities found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick City Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Popular Cities:</Label>
            <div className="flex flex-wrap gap-2">
              {['Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  size="sm"
                  onClick={() => handleCitySelect(city)}
                  className="text-xs"
                >
                  {city}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  )
}

// Compact version for header/navigation
export function LocationSelectorCompact({ 
  className = "", 
  onLocationSelect 
}: { 
  className?: string
  onLocationSelect?: (location: string) => void 
}) {
  const { userLocation, detectCurrentLocation, isLoading, clearLocation } = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false)
    }
    if (isDropdownOpen) {
      window.addEventListener('keydown', onKey)
    }
    return () => window.removeEventListener('keydown', onKey)
  }, [isDropdownOpen])

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2"
      >
        <MapPin className="h-4 w-4" />
        <span className="hidden sm:inline">
          {userLocation?.city || 'Select Location'}
        </span>
      </Button>

      {isDropdownOpen && (
        <>
          <div className="absolute right-0 top-full mt-2 w-80 z-[60] max-h-[70vh] overflow-y-auto">
            <LocationSelector 
              onClose={() => setIsDropdownOpen(false)}
              onLocationSelect={(location) => {
                onLocationSelect?.(location)
                setIsDropdownOpen(false)
              }} 
            />
          </div>
          <div 
            className="fixed inset-0 z-[55]" 
            onClick={() => setIsDropdownOpen(false)}
          />
        </>
      )}
    </div>
  )
}
