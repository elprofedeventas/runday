import { useState, useEffect } from 'react'
import { storage } from '../utils/storage'

export function useUser() {
  const [user, setUserState] = useState(() => storage.getUser())

  const setUser = (data) => {
    storage.setUser(data)
    setUserState(data)
  }

  const clearUser = () => {
    storage.clearUser()
    setUserState(null)
  }

  const hasCompletedOnboarding = Boolean(user?.user_id && user?.nivel && user?.objetivo)

  return { user, setUser, clearUser, hasCompletedOnboarding }
}
