"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { Smartphone, Car, Home, Shirt, Gamepad2, Book, Dumbbell, Baby, Heart, Truck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Electronics",
    icon: Smartphone,
    count: "",
    color: "from-blue-500 to-cyan-500",
    href: "/category/electronics",
    description: "Phones, laptops, gadgets and more",
  },
  {
    name: "Vehicles",
    icon: Car,
    count: "",
    color: "from-red-500 to-pink-500",
    href: "/category/vehicles",
    description: "Cars, motorcycles, bikes and parts",
  },
  {
    name: "Home & Garden",
    icon: Home,
    count: "",
    color: "from-green-500 to-emerald-500",
    href: "/category/home-garden",
    description: "Furniture, decor, tools and plants",
  },
  {
    name: "Fashion",
    icon: Shirt,
    count: "",
    color: "from-purple-500 to-violet-500",
    href: "/category/fashion",
    description: "Clothing, shoes, accessories and bags",
  },
  {
    name: "Gaming",
    icon: Gamepad2,
    count: "",
    color: "from-orange-500 to-yellow-500",
    href: "/category/gaming",
    description: "Consoles, games, accessories and PCs",
  },
  {
    name: "Books",
    icon: Book,
    count: "",
    color: "from-indigo-500 to-blue-500",
    href: "/category/books",
    description: "Textbooks, novels, comics and more",
  },
  {
    name: "Sports",
    icon: Dumbbell,
    count: "",
    color: "from-teal-500 to-green-500",
    href: "/category/sports",
    description: "Equipment, gear, fitness and outdoor",
  },
  {
    name: "Baby & Kids",
    icon: Baby,
    count: "",
    color: "from-pink-500 to-rose-500",
    href: "/category/baby-kids",
    description: "Toys, clothes, strollers and gear",
  },
  {
    name: "Donate/Giveaway",
    icon: Heart,
    count: "",
    color: "from-emerald-500 to-green-500",
    href: "/category/donate-giveaway",
    description: "Free items from generous community",
  },
  {
    name: "Moving Out",
    icon: Truck,
    count: "",
    color: "from-red-500 to-orange-500",
    href: "/category/moving-out",
    description: "Quick sales from people relocating",
  },
]

export default function CategoriesPage() {
  const router = useRouter()

  const handleCategoryClick = useCallback(
    (href: string) => {
      // Preserve scroll position
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop

      router.push(href)

      // Restore scroll position
      setTimeout(() => {
        window.scrollTo({ top: currentScroll, behavior: "auto" })
      }, 0)
    },
    [router],
  )

  const handleBackClick = useCallback(() => {
    // Preserve scroll position
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop

    router.back()

    // Restore scroll position
    setTimeout(() => {
      window.scrollTo({ top: currentScroll, behavior: "auto" })
    }, 0)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBackClick} className="mb-4 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">All Categories</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Browse through all available categories to find exactly what you're looking for
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-transparent bg-white dark:bg-gray-800"
                onClick={() => handleCategoryClick(category.href)}
              >
                <CardContent className="p-6">
                  <div
                    className={`w-16 h-16 mb-4 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{category.count}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{category.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Popular Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Popular This Week</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category, index) => {
              const IconComponent = category.icon
              return (
                <Card
                  key={`popular-${index}`}
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => handleCategoryClick(category.href)}
                >
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h4>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
