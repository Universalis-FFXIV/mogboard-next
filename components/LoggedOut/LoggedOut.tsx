import { PropsWithChildren } from 'react';

interface LoggedOutProps {
  hasSession: boolean;
}

export default function LoggedOut({ hasSession, children }: PropsWithChildren<LoggedOutProps>) {
  if (hasSession) {
    return <></>;
  }

  return <>{children}</>;
}
