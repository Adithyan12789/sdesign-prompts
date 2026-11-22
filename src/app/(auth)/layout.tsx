import type { Metadata } from 'next';
import AuthSplitLayout from '@/components/auth/AuthSplitLayout';

export const metadata: Metadata = {
  title: {
    template: '%s · RenderVault',
    default: 'Authentication · RenderVault',
  },
  description: 'RenderVault Architectural AI Prompt & Workflow Library',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
