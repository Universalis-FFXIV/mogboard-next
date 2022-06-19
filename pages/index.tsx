import type { NextPage, NextPageContext } from 'next';
import Head from 'next/head';
import HomeAction from '../components/HomeAction/HomeAction';
import HomeLoggedOut from '../components/HomeLoggedOut/HomeLoggedOut';
import HomeNavbar from '../components/HomeNavbar/HomeNavBar';
import TaxRatesPanel from '../components/TaxRatesPanel/TaxRatesPanel';
import { City } from '../types/game/City';
import { TaxRates } from '../types/universalis/TaxRates';

interface HomeProps {
  taxes: Record<City, number>;
}

const Home: NextPage<HomeProps> = ({ taxes }: HomeProps) => {
  const title = 'Universalis';
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

      <div className="home">
        <HomeNavbar />
        <div>
          <HomeLoggedOut />
        </div>
        <div>
          <HomeAction />
          <h4>Recent Updates</h4>
          <TaxRatesPanel data={taxes} />
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(ctx: NextPageContext) {
  let taxes: Record<City, number>;
  try {
    const resTaxRates = await fetch(`https://universalis.app/api/tax-rates?world=Phoenix`);
    const taxRates: TaxRates = await resTaxRates.json();
    taxes = {
      [City.LimsaLominsa]: taxRates['Limsa Lominsa'],
      [City.Gridania]: taxRates['Gridania'],
      [City.Uldah]: taxRates["Ul'dah"],
      [City.Ishgard]: taxRates['Ishgard'],
      [City.Kugane]: taxRates['Kugane'],
      [City.Crystarium]: taxRates['Crystarium'],
      [City.OldSharlayan]: taxRates['Old Sharlayan'],
    };
  } catch (err) {
    taxes = {
      [City.LimsaLominsa]: 0,
      [City.Gridania]: 0,
      [City.Uldah]: 0,
      [City.Ishgard]: 0,
      [City.Kugane]: 0,
      [City.Crystarium]: 0,
      [City.OldSharlayan]: 0,
    };
  }

  return {
    props: { taxes },
  };
}

export default Home;
