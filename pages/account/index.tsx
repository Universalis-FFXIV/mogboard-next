import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession, User } from 'next-auth';
import { signIn, signOut } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import LoggedIn from '../../components/LoggedIn/LoggedIn';
import LoggedOut from '../../components/LoggedOut/LoggedOut';
import useSettings from '../../hooks/useSettings';
import { authOptions } from '../api/auth/[...nextauth]';

interface UserSimple {
  name?: string;
  avatar?: string;
  email?: string;
  sso?: string;
}

interface AccountProps {
  hasSession: boolean;
  user: UserSimple;
}

interface AccountMainProps {
  avatar: string;
  name: string;
  email: string;
  sso: string;
}

function AccountMain({ avatar, name, email, sso }: AccountMainProps) {
  const [settings] = useSettings();
  return (
    <>
      <h1>
        <Trans>Account</Trans>
      </h1>
      <table>
        <tbody>
          <tr>
            <td width="10%">
              <img
                src={avatar}
                className="user_avatar"
                alt="Profile Image"
                height={64}
                width={64}
              />
            </td>
            <td>
              <h3>{name}</h3>
              <span style={{ textTransform: 'capitalize' }}>{sso}</span> - {email} -{' '}
              <Trans>Timezone:</Trans> {settings['mogboard_timezone']}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

const Account: NextPage<AccountProps> = ({ hasSession, user }) => {
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
          <div>
            <AccountMain
              name={user.name ?? ''}
              avatar={user.avatar ?? ''}
              email={user.email ?? ''}
              sso={user.sso ?? ''}
            />
          </div>
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
  return {
    props: {
      hasSession,
      user: {
        name: session?.user.name,
        avatar: session?.user.image,
        email: session?.user.email,
        sso: session?.user.sso,
      },
    },
  };
}

export default Account;
