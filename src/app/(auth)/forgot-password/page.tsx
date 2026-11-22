import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Reset Password · RenderVault',
  description: 'Reset your RenderVault architectural library account password.',
};

export default function ForgotPasswordPage() {
  return <AuthForm mode="forgot-password" />;
}
