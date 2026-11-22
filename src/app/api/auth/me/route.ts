import { ok } from '@/lib/api';
import { getSessionUser } from '@/lib/auth';

export async function GET() { return ok({ user: await getSessionUser() }); }
