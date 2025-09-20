"use client"

import type React from "react"
import { getAllProducts } from "@/products"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

// Types
export interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  image: string
  category: string
  condition: string
  location: string
  timeAgo: string
  seller: {
    name: string
    rating: number
    verified: boolean
  }
  description?: string
  specifications?: Record<string, string>
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  phone?: string
  location?: string
  memberSince?: string
}

export type CartItem = Product & { quantity: number }

interface AppState {
  user: User | null
  wishlist: Product[]
  cart: CartItem[]
  isAuthenticated: boolean
  products: Product[]
}

type AppAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_TO_WISHLIST"; payload: Product }
  | { type: "REMOVE_FROM_WISHLIST"; payload: number }
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "REMOVE_FROM_CART"; payload: number }
  | { type: "UPDATE_CART_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "MOVE_TO_CART"; payload: CartItem }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: number }

const initialState: AppState = {
  user: null,
  wishlist: [],
  cart: [],
  isAuthenticated: false,
  products: [],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        wishlist: [],
        cart: [],
      }
    case "ADD_TO_WISHLIST":
      console.log("[v0] Adding to wishlist:", action.payload)
      if (state.wishlist.find((item) => item.id === action.payload.id)) {
        console.log("[v0] Item already in wishlist")
        return state
      }
      const newWishlistState = {
        ...state,
        wishlist: [...state.wishlist, action.payload],
      }
      console.log("[v0] New wishlist state:", newWishlistState.wishlist)
      return newWishlistState
    case "REMOVE_FROM_WISHLIST":
      console.log("[v0] Removing from wishlist:", action.payload)
      return {
        ...state,
        wishlist: state.wishlist.filter((item) => item.id !== action.payload),
      }
    case "ADD_TO_CART": {
      const item = action.payload
      const existing = state.cart.find((p) => p.id === item.id)
      return {
        ...state,
        cart: existing
          ? state.cart.map((p) => (p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p))
          : [...state.cart, item],
      }
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((p) => p.id !== action.payload) }
    case "UPDATE_CART_QUANTITY":
      return {
        ...state,
        cart: state.cart.map((p) => (p.id === action.payload.id ? { ...p, quantity: action.payload.quantity } : p)),
      }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "MOVE_TO_CART": {
      const newWishlist = state.wishlist.filter((w) => w.id !== action.payload.id)
      const existing = state.cart.find((p) => p.id === action.payload.id)
      return {
        ...state,
        wishlist: newWishlist,
        cart: existing
          ? state.cart.map((p) =>
              p.id === action.payload.id ? { ...p, quantity: p.quantity + action.payload.quantity } : p,
            )
          : [...state.cart, action.payload],
      }
    }
    case "ADD_PRODUCT":
      console.log("[v0] Adding product to store:", action.payload.title, "Category:", action.payload.category)
      return {
        ...state,
        products: [...(state.products || []), action.payload],
      }
    case "SET_PRODUCTS":
      console.log("[v0] Setting all products:", action.payload.length)
      action.payload.forEach((product) => {
        console.log("[v0] Product:", product.title, "Category:", product.category)
      })
      return {
        ...state,
        products: action.payload,
      }
    case "UPDATE_PRODUCT":
      console.log("[v0] Updating product:", action.payload.title)
      return {
        ...state,
        products: state.products.map((product) => (product.id === action.payload.id ? action.payload : product)),
      }
    case "DELETE_PRODUCT":
      console.log("[v0] Deleting product with ID:", action.payload)
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
        wishlist: state.wishlist.filter((item) => item.id !== action.payload),
        cart: state.cart.filter((item) => item.id !== action.payload),
      }
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  useEffect(() => {
    console.log("[v0] Loading products from products.ts")
    const allProducts = getAllProducts()
    console.log("[v0] Found products:", allProducts.length)

    dispatch({ type: "SET_PRODUCTS", payload: allProducts })

    const savedState = localStorage.getItem("unidemy-state")
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState)
        if (parsedState.user) {
          dispatch({ type: "LOGIN", payload: parsedState.user })
        }
        parsedState.wishlist?.forEach((item: Product) => {
          dispatch({ type: "ADD_TO_WISHLIST", payload: item })
        })
        if (parsedState.cart) {
          parsedState.cart.forEach((item: CartItem) => dispatch({ type: "ADD_TO_CART", payload: item }))
        }
      } catch (error) {
        console.error("[v0] Error loading saved state:", error)
      }
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("unidemy-state", JSON.stringify(state))
    } catch (error) {
      console.error("[v0] Error saving state:", error)
    }
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
