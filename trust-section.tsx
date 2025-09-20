import { Shield, Award, Users, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const trustFeatures = [
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Your payments and personal information are protected with bank-level security.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Award,
    title: "Verified Sellers",
    description: "All sellers go through our verification process to ensure authenticity.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join millions of satisfied buyers and sellers in our trusted marketplace.",
    color: "from-purple-500 to-violet-500",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Our customer support team is available around the clock to help you.",
    color: "from-orange-500 to-yellow-500",
  },
]

export default function TrustSection() {
  return (
    <section className="py-16 lg:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Choose Unidemy?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            We're committed to providing a safe, secure, and seamless marketplace experience for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-transparent prevent-layout-shift"
              >
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-xl mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
            <Shield className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Trusted by over 10 million users worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
