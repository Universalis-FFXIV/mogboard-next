import { GetServerSidePropsContext, NextPage } from 'next';
import { getServerSession } from 'next-auth';
import Head from 'next/head';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import { authOptions } from '../api/auth/[...nextauth]';

interface ListsProps {
  hasSession: boolean;
}

const Lists: NextPage<ListsProps> = ({ hasSession }) => {
  const title = 'Lists - Universalis';
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
      <AccountLayout section="lists" hasSession={hasSession}></AccountLayout>
    </>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const session = await getServerSession(ctx, authOptions);
  const hasSession = !!session;

  return {
    props: {
      hasSession,
    },
  };
}

export default Lists;
