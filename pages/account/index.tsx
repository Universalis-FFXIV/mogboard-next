import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import LoggedIn from '../../components/LoggedIn/LoggedIn';
import LoggedOut from '../../components/LoggedOut/LoggedOut';
import { authOptions } from '../api/auth/[...nextauth]';

interface AccountProps {
  hasSession: boolean;
}

const Account: NextPage<AccountProps> = ({ hasSession }) => {
  const title = 'My Account - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';
  return (
    <>
      <Head>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="description" content={description} />
        <title>{title}</title>
      </Head>
      <LoggedIn hasSession={hasSession}>
        <div className="account">
          <div>
            <Link href="/account">
              <a className="active">
                <Trans>Account</Trans>
              </a>
            </Link>
            <Link href="/account/characters">
              <a>
                <Trans>Characters</Trans>
              </a>
            </Link>
            <Link href="/account/lists">
              <a>
                <Trans>Lists</Trans>
              </a>
            </Link>
            <hr />
            <a className="logout" onClick={() => signOut({ callbackUrl: '/' })}>
              <Trans>Logout</Trans>
            </a>
          </div>
          <div></div>
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
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx, authOptions);
  const hasSession = !!session;
  return { props: { hasSession } };
}

export default Account;
