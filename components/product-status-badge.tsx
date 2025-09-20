import { Badge } from "@/components/ui/badge"
import { Package, Clock, XCircle, FileText, CheckCircle } from "lucide-react"

interface ProductStatusBadgeProps {
  status: string
  className?: string
}

export function ProductStatusBadge({ status, className = "" }: ProductStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "in_stock":
        return {
          label: "In Stock",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        }
      case "on_hold":
        return {
          label: "On Hold",
          icon: Clock,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
        }
      case "out_of_stock":
        return {
          label: "Out of Stock",
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
        }
      case "draft":
        return {
          label: "Draft",
          icon: FileText,
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        }
      case "sold":
        return {
          label: "Sold",
          icon: Package,
          className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
        }
      case "active": // Legacy support
        return {
          label: "Active",
          icon: CheckCircle,
          className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        }
      default:
        return {
          label: "Unknown",
          icon: Package,
          className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.className} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
