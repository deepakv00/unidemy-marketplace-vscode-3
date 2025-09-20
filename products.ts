import type { Product } from "@/store"

// Mock product database - in a real app, this would be a proper database
const products: Product[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max - Like New",
    price: 1199,
    originalPrice: 1299,
    location: "Manhattan, NY",
    timeAgo: "2 hours ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "John Smith",
      rating: 4.9,
      verified: true,
    },
    category: "electronics",
    condition: "Like New",
    description: "Excellent condition iPhone 15 Pro Max with original box and accessories.",
    specifications: {
      Brand: "Apple",
      Model: "iPhone 15 Pro Max",
      Storage: "256GB",
      Color: "Titanium Blue",
    },
  },
  {
    id: 2,
    title: "2019 Honda Civic - Excellent Condition",
    price: 18500,
    location: "Brooklyn, NY",
    timeAgo: "5 hours ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "Sarah Johnson",
      rating: 4.8,
      verified: true,
    },
    category: "vehicles",
    condition: "Excellent",
    description: "Well-maintained Honda Civic with low mileage and full service history.",
    specifications: {
      Make: "Honda",
      Model: "Civic",
      Year: "2019",
      Mileage: "45,000 miles",
    },
  },
  {
    id: 3,
    title: "Modern Sofa Set - 3 Piece",
    price: 899,
    originalPrice: 1200,
    location: "Queens, NY",
    timeAgo: "1 day ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "Mike Davis",
      rating: 4.7,
      verified: false,
    },
    category: "home-garden",
    condition: "Good",
    description: "Comfortable 3-piece sofa set in excellent condition. Perfect for living room.",
    specifications: {
      Material: "Fabric",
      Color: "Gray",
      Pieces: "3",
      Condition: "Good",
    },
  },
  {
    id: 4,
    title: 'MacBook Pro 16" M3 - Barely Used',
    price: 2299,
    location: "Manhattan, NY",
    timeAgo: "3 hours ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "Emily Chen",
      rating: 5.0,
      verified: true,
    },
    category: "electronics",
    condition: "Like New",
    description: "MacBook Pro 16-inch with M3 chip, barely used with original packaging.",
    specifications: {
      Brand: "Apple",
      Model: "MacBook Pro 16",
      Processor: "M3",
      RAM: "16GB",
    },
  },
  {
    id: 5,
    title: "Designer Handbag Collection",
    price: 450,
    originalPrice: 800,
    location: "Bronx, NY",
    timeAgo: "6 hours ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "Lisa Wang",
      rating: 4.6,
      verified: true,
    },
    category: "fashion",
    condition: "Excellent",
    description: "Authentic designer handbag collection in excellent condition.",
    specifications: {
      Brand: "Various",
      Material: "Leather",
      Condition: "Excellent",
      Pieces: "3",
    },
  },
  {
    id: 6,
    title: "Gaming Setup - Complete Build",
    price: 1599,
    location: "Staten Island, NY",
    timeAgo: "4 hours ago",
    image: "/placeholder.svg?height=300&width=400",
    seller: {
      name: "Alex Rodriguez",
      rating: 4.9,
      verified: true,
    },
    category: "gaming",
    condition: "Like New",
    description: "Complete gaming setup with high-end components and RGB lighting.",
    specifications: {
      CPU: "Intel i7",
      GPU: "RTX 4070",
      RAM: "32GB",
      Storage: "1TB SSD",
    },
  },
  // New Donate/Giveaway products
  {
    id: 7,
    title: "Children's Books Collection - Free to Good Home",
    price: 0,
    location: "Manhattan, NY",
    timeAgo: "1 hour ago",
    image: "/placeholder.svg?height=300&width=400&text=Children+Books",
    seller: {
      name: "Maria Rodriguez",
      rating: 4.8,
      verified: true,
    },
    category: "donate-giveaway",
    condition: "Good",
    description:
      "Collection of 20+ children's books in good condition. Perfect for ages 5-12. Free to a loving family!",
    specifications: {
      Type: "Children's Books",
      Quantity: "20+ books",
      Age: "5-12 years",
      Condition: "Good",
    },
  },
  {
    id: 8,
    title: "Office Chair - Free Pickup",
    price: 0,
    location: "Brooklyn, NY",
    timeAgo: "3 hours ago",
    image: "/placeholder.svg?height=300&width=400&text=Office+Chair",
    seller: {
      name: "David Kim",
      rating: 4.9,
      verified: true,
    },
    category: "donate-giveaway",
    condition: "Fair",
    description: "Ergonomic office chair, some wear but still functional. Free to anyone who can pick it up.",
    specifications: {
      Type: "Office Chair",
      Material: "Mesh/Fabric",
      Condition: "Fair",
      "Pickup Required": "Yes",
    },
  },
  {
    id: 9,
    title: "Kitchen Appliances Set - Moving Donation",
    price: 0,
    location: "Queens, NY",
    timeAgo: "5 hours ago",
    image: "/placeholder.svg?height=300&width=400&text=Kitchen+Set",
    seller: {
      name: "Jennifer Lee",
      rating: 4.7,
      verified: true,
    },
    category: "donate-giveaway",
    condition: "Good",
    description: "Toaster, blender, and coffee maker. All working perfectly. Moving overseas, free to good home.",
    specifications: {
      Items: "Toaster, Blender, Coffee Maker",
      Condition: "Good",
      Reason: "Moving",
      Brand: "Various",
    },
  },
  // New Moving Out/Urgent Sale products
  {
    id: 10,
    title: "Entire Bedroom Set - Must Go This Week!",
    price: 800,
    originalPrice: 2500,
    location: "Manhattan, NY",
    timeAgo: "30 minutes ago",
    image: "/placeholder.svg?height=300&width=400&text=Bedroom+Set",
    seller: {
      name: "Robert Chen",
      rating: 4.8,
      verified: true,
    },
    category: "moving-out",
    condition: "Excellent",
    description:
      "Complete bedroom set including king bed, dresser, nightstands, and mirror. Moving out of state, must sell ASAP!",
    specifications: {
      Items: "Bed, Dresser, 2 Nightstands, Mirror",
      Size: "King",
      Material: "Solid Wood",
      Condition: "Excellent",
    },
  },
  {
    id: 11,
    title: "Living Room Furniture - Quick Sale Needed",
    price: 1200,
    originalPrice: 3000,
    location: "Brooklyn, NY",
    timeAgo: "1 hour ago",
    image: "/placeholder.svg?height=300&width=400&text=Living+Room",
    seller: {
      name: "Amanda Wilson",
      rating: 4.9,
      verified: true,
    },
    category: "moving-out",
    condition: "Like New",
    description: "Sectional sofa, coffee table, TV stand, and side tables. Moving next week, priced to sell fast!",
    specifications: {
      Items: "Sectional, Coffee Table, TV Stand, Side Tables",
      Color: "Gray",
      Material: "Fabric/Wood",
      Condition: "Like New",
    },
  },
  {
    id: 12,
    title: "Home Office Setup - Urgent Sale",
    price: 600,
    originalPrice: 1500,
    location: "Queens, NY",
    timeAgo: "2 hours ago",
    image: "/placeholder.svg?height=300&width=400&text=Office+Setup",
    seller: {
      name: "Michael Brown",
      rating: 4.7,
      verified: true,
    },
    category: "moving-out",
    condition: "Good",
    description: "Desk, chair, filing cabinet, and bookshelf. Perfect for home office. Moving in 3 days!",
    specifications: {
      Items: "Desk, Chair, Filing Cabinet, Bookshelf",
      Material: "Wood/Metal",
      Color: "Black/Brown",
      Condition: "Good",
    },
  },
]

export function getAllProducts(): Product[] {
  return products
}

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category)
}

export function getDonateGiveawayProducts(): Product[] {
  return products.filter((product) => product.category === "donate-giveaway")
}

export function getMovingOutProducts(): Product[] {
  return products.filter((product) => product.category === "moving-out")
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery),
  )
}

export function addProduct(product: Omit<Product, "id">): Product {
  const newProduct: Product = {
    ...product,
    id: Math.max(...products.map((p) => p.id), 0) + 1,
  }
  products.push(newProduct)
  return newProduct
}

export function getProductsBySeller(sellerName: string): Product[] {
  return products.filter((product) => product.seller.name === sellerName)
}
