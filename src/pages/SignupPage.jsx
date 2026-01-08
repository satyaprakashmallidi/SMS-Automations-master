import { SignupForm } from '../components/auth/SignupForm'
import { AuthLayout } from '../components/auth/AuthLayout'

export default function SignupPage() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your 14-day free trial today"
    >
      <SignupForm />
    </AuthLayout>
  )
}
