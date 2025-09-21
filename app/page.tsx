import Hero from "@/hero"
import FeaturedCategories from "@/featured-categories"
import { LocationBasedHomepage } from "@/components/location-based-homepage"
import RecentlyDonatedSection from "@/recently-donated-section"
import MovingOutDealsSection from "@/moving-out-deals-section"
import ScrollManager from "@/scroll-manager"

export default function HomePage() {
  return (
    <>
      <ScrollManager />
      <Hero />
      <FeaturedCategories />
      <div className="container mx-auto px-4 py-8">
        <LocationBasedHomepage />
      </div>
      <RecentlyDonatedSection />
      <MovingOutDealsSection />
    </>
  )
}
