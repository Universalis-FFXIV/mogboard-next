import { Trans } from '@lingui/macro';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import useSettings from '../../hooks/useSettings';

const Account: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  const [settings] = useSettings();

  const user = {
    name: sessionData?.user.name,
    avatar: sessionData?.user.image,
    email: sessionData?.user.email,
    sso: sessionData?.user.sso,
  };

  const title = 'My Account - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';

  const AccountHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (sessionStatus === 'loading') {
    return <AccountHead />;
  }

  const hasSession = sessionStatus === 'authenticated';
  return (
    <>
      <AccountHead />
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

export default Account;
