// Location utilities for geolocation and city detection

export interface LocationData {
  latitude: number
  longitude: number
  city: string
  state?: string
  country?: string
  address?: string
}

export interface UserLocation {
  city: string
  state?: string
  country?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Common Indian cities for dropdown selection
export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi',
  'Srinagar', 'Aurangabad', 'Navi Mumbai', 'Solapur', 'Vijayawada', 'Kolhapur', 'Amritsar', 'Noida', 'Ranchi', 'Howrah',
  'Coimbatore', 'Raipur', 'Jabalpur', 'Gwalior', 'Chandigarh', 'Tiruchirappalli', 'Mysore', 'Bhubaneswar', 'Kochi', 'Bhavnagar',
  'Salem', 'Warangal', 'Guntur', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Sangli', 'Malegaon', 'Ulhasnagar',
  'Jalgaon', 'Latur', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani', 'Jalna', 'Bhusawal', 'Panvel', 'Satara',
  'Beed', 'Yavatmal', 'Kamptee', 'Gondia', 'Barshi', 'Achalpur', 'Osmanabad', 'Nandurbar', 'Wardha', 'Udgir',
  'Aurangabad', 'Amalner', 'Akot', 'Pandharpur', 'Shrirampur', 'Parli', 'Pathardi', 'Sinnar', 'Shirur', 'Malkapur',
  'Chalisgaon', 'Pachora', 'Bhiwandi', 'Ichalkaranji', 'Jalgaon', 'Latur', 'Ahmadnagar', 'Dhule', 'Ichalkaranji', 'Parbhani'
]

// International cities for broader support
export const INTERNATIONAL_CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington',
  'Boston', 'El Paso', 'Nashville', 'Detroit', 'Oklahoma City', 'Portland', 'Las Vegas', 'Memphis', 'Louisville', 'Baltimore',
  'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno', 'Sacramento', 'Mesa', 'Kansas City', 'Atlanta', 'Long Beach', 'Colorado Springs',
  'Raleigh', 'Miami', 'Virginia Beach', 'Omaha', 'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa', 'New Orleans'
]

export const ALL_CITIES = [...INDIAN_CITIES, ...INTERNATIONAL_CITIES].sort()

// Get current location using browser geolocation API
export async function getCurrentLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.')
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Use reverse geocoding to get city name
          const cityData = await reverseGeocode(latitude, longitude)
          
          resolve({
            latitude,
            longitude,
            city: cityData.city,
            state: cityData.state,
            country: cityData.country,
            address: cityData.address
          })
        } catch (error) {
          console.error('Error getting location data:', error)
          resolve(null)
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

// Reverse geocoding using a free service (you might want to use Google Maps API for production)
async function reverseGeocode(latitude: number, longitude: number): Promise<{
  city: string
  state?: string
  country?: string
  address?: string
}> {
  try {
    // Using OpenStreetMap Nominatim API (free)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Unidemy-Marketplace/1.0'
        }
      }
    )
    
    const data = await response.json()
    
    if (data && data.address) {
      const address = data.address
      return {
        city: address.city || address.town || address.village || address.suburb || 'Unknown City',
        state: address.state,
        country: address.country,
        address: data.display_name
      }
    }
    
    // Fallback to coordinates if reverse geocoding fails
    return {
      city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      country: 'Unknown'
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error)
    return {
      city: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      country: 'Unknown'
    }
  }
}

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  return distance
}

// Parse location string to extract city
export function parseLocationString(location: string): string {
  if (!location) return ''
  
  // Common patterns: "City, State", "City", "City, Country"
  const parts = location.split(',').map(part => part.trim())
  return parts[0] || location
}

// Check if two locations are the same city
export function isSameCity(location1: string, location2: string): boolean {
  if (!location1 || !location2) return false
  
  const city1 = parseLocationString(location1).toLowerCase()
  const city2 = parseLocationString(location2).toLowerCase()
  
  return city1 === city2
}

// Get nearby cities (for expanding search radius)
export function getNearbyCities(city: string): string[] {
  // This is a simplified implementation
  // In a real app, you'd have a proper database of cities with coordinates
  const cityLower = city.toLowerCase()
  
  // Some common nearby city mappings
  const nearbyMappings: Record<string, string[]> = {
    'mumbai': ['thane', 'navi mumbai', 'kalyan', 'pune'],
    'delhi': ['gurgaon', 'noida', 'faridabad', 'ghaziabad'],
    'bangalore': ['mysore', 'hosur', 'tumkur'],
    'chennai': ['vellore', 'tirupati', 'pondicherry'],
    'kolkata': ['howrah', 'durgapur', 'asansol'],
    'hyderabad': ['secunderabad', 'warangal', 'nizamabad'],
    'pune': ['mumbai', 'nashik', 'aurangabad'],
    'ahmedabad': ['gandhinagar', 'vadodara', 'surat'],
    'jaipur': ['ajmer', 'kota', 'udaipur'],
    'lucknow': ['kanpur', 'agra', 'varanasi']
  }
  
  return nearbyMappings[cityLower] || []
}

