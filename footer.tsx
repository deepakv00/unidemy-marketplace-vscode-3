import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-xl">Unidemy</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The world's largest local marketplace. Buy and sell everything from electronics to furniture in your
              neighborhood.
            </p>
            <div className="flex space-x-4">
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button size="sm" variant="ghost" className="p-2 hover:bg-gray-800">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  Press
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-6">Popular Categories</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/category/electronics"
                  className="text-gray-300 hover:text-white transition-colors"
                  scroll={false}
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/vehicles"
                  className="text-gray-300 hover:text-white transition-colors"
                  scroll={false}
                >
                  Vehicles
                </Link>
              </li>
              <li>
                <Link
                  href="/category/furniture"
                  className="text-gray-300 hover:text-white transition-colors"
                  scroll={false}
                >
                  Furniture
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fashion"
                  className="text-gray-300 hover:text-white transition-colors"
                  scroll={false}
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/category/gaming"
                  className="text-gray-300 hover:text-white transition-colors"
                  scroll={false}
                >
                  Gaming
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white transition-colors" scroll={false}>
                  View All
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Unidemy Global Marketplace. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors" scroll={false}>
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors" scroll={false}>
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors" scroll={false}>
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
