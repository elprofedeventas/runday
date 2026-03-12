// ============================================================
// RunDay — Storage local
// Guarda el perfil del usuario en localStorage
// No hay auth por ahora — el user_id es el identificador
// ============================================================

const KEY_USER = 'runday_user'

export const storage = {

  getUser: () => {
    try {
      const raw = localStorage.getItem(KEY_USER)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  setUser: (user) => {
    localStorage.setItem(KEY_USER, JSON.stringify(user))
  },

  clearUser: () => {
    localStorage.removeItem(KEY_USER)
  },

  // Genera un user_id único si no existe
  getOrCreateUserId: () => {
    const user = storage.getUser()
    if (user?.user_id) return user.user_id
    const id = 'USR_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7).toUpperCase()
    return id
  }
}
