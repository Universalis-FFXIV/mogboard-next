import { PropsWithChildren } from 'react';
import { useSession } from 'next-auth/react';

export default function LoggedIn({ children }: PropsWithChildren) {
  const { data: session } = useSession();

  if (!session) {
    return <></>;
  }

  return <>{children}</>;
}
