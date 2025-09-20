"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ProductStatusBadge } from "./product-status-badge"

interface ProductStatusSelectorProps {
  currentStatus: string
  onStatusChange: (status: string) => void
  disabled?: boolean
  showAllStatuses?: boolean // For seller's own listings
}

export function ProductStatusSelector({
  currentStatus,
  onStatusChange,
  disabled = false,
  showAllStatuses = false,
}: ProductStatusSelectorProps) {
  const [open, setOpen] = useState(false)

  const statusOptions = showAllStatuses
    ? [
        { value: "draft", label: "Draft", description: "Not visible to buyers" },
        { value: "active", label: "Active", description: "Available for purchase" },
        { value: "sold", label: "Sold", description: "Item has been sold" },
      ]
    : [
        { value: "active", label: "Active", description: "Available for purchase" },
        { value: "draft", label: "Draft", description: "Not visible to buyers" },
      ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
          disabled={disabled}
        >
          <ProductStatusBadge status={currentStatus} />
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {statusOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onStatusChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${currentStatus === option.value ? "opacity-100" : "opacity-0"}`} />
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
