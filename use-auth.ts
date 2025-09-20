"use client"

import { useApp } from "@/store"

export function useAuth() {
  const { state, dispatch } = useApp()

  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    dispatch,
  }
}
