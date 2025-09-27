import axios from 'axios'
import { createContext, useContext } from 'react'

const baseURL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') + '/api'

const instance = axios.create({ baseURL })

export function attachToken(getToken) {
  instance.interceptors.request.use(config => {
    const t = getToken?.()
    if (t) config.headers.Authorization = `Bearer ${t}`
    return config
  })
}

export default instance
