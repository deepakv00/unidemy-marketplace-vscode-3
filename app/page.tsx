import Hero from "@/hero"
import FeaturedCategories from "@/featured-categories"
import FeaturedListings from "@/featured-listings"
import RecentlyDonatedSection from "@/recently-donated-section"
import MovingOutDealsSection from "@/moving-out-deals-section"
import ScrollManager from "@/scroll-manager"

export default function HomePage() {
  return (
    <>
      <ScrollManager />
      <Hero />
      <FeaturedCategories />
      <FeaturedListings />
      <RecentlyDonatedSection />
      <MovingOutDealsSection />
    </>
  )
}
