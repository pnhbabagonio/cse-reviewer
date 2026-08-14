import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, register, isLoading } = useAuthStore()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError(null)
    setFieldErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (mode === 'login') {
      const result = await login(form.email, form.password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
      }
    } else {
      const result = await register(
        form.username,
        form.email,
        form.password,
        form.passwordConfirmation
      )
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error)
        if (result.errors) setFieldErrors(result.errors)
      }
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError(null)
    setFieldErrors({})
    setForm({
      username: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    })
  }

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <div className="card space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy dark:text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login'
              ? 'Log in to sync your progress and compete on the leaderboard'
              : 'Register to save your progress and join the rankings'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <button
            onClick={() => switchMode()}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-white dark:bg-gray-800 text-navy dark:text-white shadow'
                : 'text-gray-500'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => switchMode()}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'register'
                ? 'bg-white dark:bg-gray-800 text-navy dark:text-white shadow'
                : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-gold"
                placeholder="juan_delacruz"
              />
              {fieldErrors.username && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.username[0]}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-gold"
              placeholder="you@example.com"
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.email[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-gold pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-500 mt-1">{fieldErrors.password[0]}</p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="passwordConfirmation"
                value={form.passwordConfirmation}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-gold"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-navy text-white font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : mode === 'login' ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={switchMode} className="text-gold font-medium hover:underline">
            {mode === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  )
}