import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Create account · RenderVault',
  description: 'Join RenderVault to unlock architectural AI prompts, workflows and bundles.',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
