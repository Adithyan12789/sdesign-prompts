import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign in · RenderVault',
  description: 'Sign in to your RenderVault architectural library account.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
