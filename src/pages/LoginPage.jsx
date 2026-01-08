import { LoginForm } from '../components/auth/LoginForm'
import { AuthLayout } from '../components/auth/AuthLayout'

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Enter your details to access your account"
    >
      <LoginForm />
    </AuthLayout>
  )
}
