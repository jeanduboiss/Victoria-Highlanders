import { LoginForm } from './_components/login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl text-white font-bold tracking-tight">Welcome back</h1>
        <p className="text-white/60 text-sm">
          Please Enter your Account details
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
