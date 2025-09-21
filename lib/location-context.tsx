"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserLocation, getCurrentLocation, INDIAN_CITIES, ALL_CITIES } from './location-utils'

interface LocationContextType {
  userLocation: UserLocation | null
  isLoading: boolean
  error: string | null
  setUserLocation: (location: UserLocation | null) => void
  detectCurrentLocation: () => Promise<void>
  clearLocation: () => void
  availableCities: string[]
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

interface LocationProviderProps {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation')
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation)
        setUserLocation(location)
      } catch (error) {
        console.error('Error parsing saved location:', error)
        localStorage.removeItem('userLocation')
      }
    }
  }, [])

  // Save location to localStorage whenever it changes
  useEffect(() => {
    if (userLocation) {
      localStorage.setItem('userLocation', JSON.stringify(userLocation))
    } else {
      localStorage.removeItem('userLocation')
    }
  }, [userLocation])

  const detectCurrentLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const locationData = await getCurrentLocation()
      
      if (locationData) {
        const newLocation: UserLocation = {
          city: locationData.city,
          state: locationData.state,
          country: locationData.country,
          coordinates: {
            latitude: locationData.latitude,
            longitude: locationData.longitude
          }
        }
        
        setUserLocation(newLocation)
      } else {
        setError('Unable to detect your current location. Please try again or select manually.')
      }
    } catch (error) {
      console.error('Error detecting location:', error)
      setError('Error detecting your location. Please try again or select manually.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocation = () => {
    setUserLocation(null)
    setError(null)
  }

  const availableCities = ALL_CITIES

  const value: LocationContextType = {
    userLocation,
    isLoading,
    error,
    setUserLocation,
    detectCurrentLocation,
    clearLocation,
    availableCities
  }

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

