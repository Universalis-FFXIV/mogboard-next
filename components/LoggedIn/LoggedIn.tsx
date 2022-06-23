import { PropsWithChildren } from 'react';

interface LoggedInProps {
  hasSession: boolean;
}

export default function LoggedIn({ hasSession, children }: PropsWithChildren<LoggedInProps>) {
  if (!hasSession) {
    return <></>;
  }

  return <>{children}</>;
}
