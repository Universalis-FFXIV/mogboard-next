import { Trans } from '@lingui/macro';
import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import Image from 'next/image';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
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

const Account: NextPage<AccountProps> = ({ hasSession, user }) => {
  const [settings] = useSettings();
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
      <AccountLayout section="account" hasSession={hasSession}>
        <h1>
          <Trans>Account</Trans>
        </h1>
        <table>
          <tbody>
            <tr>
              <td width="10%">
                {user.avatar && (
                  <div className="user_avatar">
                    <Image
                      src={user.avatar}
                      alt="Profile Image"
                      className="user_avatar"
                      height={64}
                      width={64}
                    />
                  </div>
                )}
              </td>
              <td>
                <h3>{user.name}</h3>
                <span style={{ textTransform: 'capitalize' }}>{user.sso}</span> - {user.email} -{' '}
                <Trans>Timezone:</Trans> {settings['mogboard_timezone']}
              </td>
            </tr>
          </tbody>
        </table>
      </AccountLayout>
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
