import { Trans } from '@lingui/macro';
import { signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import LoggedIn from '../LoggedIn/LoggedIn';
import LoggedOut from '../LoggedOut/LoggedOut';

interface AccountLayoutProps {
  hasSession: boolean;
  section: 'account' | 'characters' | 'lists' | 'alerts';
}

export default function AccountLayout({
  children,
  hasSession,
  section,
}: PropsWithChildren<AccountLayoutProps>) {
  return (
    <>
      <LoggedIn hasSession={hasSession}>
        <div className="account">
          <div>
            <Link href="/account">
              <a className={section === 'account' ? 'active' : ''}>
                <Trans>Account</Trans>
              </a>
            </Link>
            <Link href="/account/characters">
              <a className={section === 'characters' ? 'active' : ''}>
                <Trans>Characters</Trans>
              </a>
            </Link>
            <Link href="/account/lists">
              <a className={section === 'lists' ? 'active' : ''}>
                <Trans>Lists</Trans>
              </a>
            </Link>
            <Link href="/account/alerts">
              <a className={section === 'alerts' ? 'active' : ''}>
                <Trans>Alerts</Trans>
              </a>
            </Link>
            <hr />
            <a className="logout" onClick={() => signOut({ callbackUrl: '/' })}>
              <Trans>Logout</Trans>
            </a>
          </div>
          <div>{children}</div>
        </div>
      </LoggedIn>
      <LoggedOut hasSession={hasSession}>
        <div className="alert-light" style={{ padding: 50 }}>
          <div className="tac">
            <h2>
              <Trans>Oops!</Trans>
            </h2>
            <p>
              <Trans>You must be logged in to view this area.</Trans>
            </p>
            <p>
              <Trans>
                You can <a onClick={() => signIn('discord')}>login via Discord</a> to get that juicy
                access!
              </Trans>
            </p>
          </div>
        </div>
      </LoggedOut>
    </>
  );
}
