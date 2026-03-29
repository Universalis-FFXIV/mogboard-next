import { useSession } from 'next-auth/react';
import { useCookies } from 'react-cookie';

/**
 * Wraps next-auth's useSession to support a client-side demo mode.
 *
 * When the `demo_loggedin` cookie is set to `'yes'`, this hook reports
 * the session status as `'authenticated'` even if the user has no real
 * session. This is purely a UI override — API routes always check real
 * auth via unstable_getServerSession and will reject unauthenticated
 * requests regardless of this cookie.
 *
 * Data hooks (useAlerts, useLists, etc.) should skip fetching when in
 * demo mode by checking `isDemo` to avoid unnecessary 401s.
 */
export default function useDemoSession() {
  const session = useSession();
  const [cookies] = useCookies(['demo_loggedin']);
  const isDemo = cookies.demo_loggedin === 'yes';

  if (isDemo) {
    return {
      ...session,
      data: session.data ?? ({ user: { name: 'Demo User' } } as any),
      status: 'authenticated' as const,
      isDemo: true,
    };
  }

  return { ...session, isDemo: false };
}
