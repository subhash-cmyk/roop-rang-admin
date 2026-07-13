import { useState } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('admin@rooprang.com')
  const [password, setPassword] = useState('Admin@123')

  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const r = await authAPI.login({
        email,
        password,
      })

      // backend response se token nikaalo
      const token =
        r?.data?.token ||
        r?.data?.data?.token ||
        r?.data?.accessToken

      if (!token) {
        toast.error('Token not found in login response')
        console.log('Login response:', r?.data)
        return
      }

      // sirf admin_token hi save karo
      localStorage.setItem('admin_token', token)

      toast.success('Welcome Roop Rang Admin')
      nav('/')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f1] to-[#fff0f5] p-4">
      <form
        onSubmit={submit}
        className="bg-white w-full max-w-md rounded-[28px] shadow-xl p-8 border border-[#f3e4c8]"
      >
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#e9c46a] flex items-center justify-center text-white font-bold text-xl"
            style={{ fontFamily: 'Playfair Display' }}
          >
            RR
          </div>

          <h1 className="text-2xl mt-3" style={{ fontFamily: 'Playfair Display' }}>
            Roop Rang Admin
          </h1>

          <p className="text-sm text-gray-500">Luxury Cosmetics Panel</p>
        </div>

        <label className="text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-3 mt-1"
        />

        <label className="text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-4 mt-1"
        />

        <button className="w-full bg-[#D4AF37] text-white py-3 rounded-xl font-medium">
          Sign In
        </button>

        <p className="text-xs text-center mt-4 text-gray-500">
          Demo: admin@rooprang.com / Admin@123
        </p>
      </form>
    </div>
  )
}