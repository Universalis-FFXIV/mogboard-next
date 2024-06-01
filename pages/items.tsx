// pages/items.tsx
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

interface ItemsPageProps {
  items: number[];
}

const ItemList: React.FC<{ items: number[] }> = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          <Link href={`/market/${item}`}>
            <a>Item {item}</a>
          </Link>
        </li>
      ))}
    </ul>
  );
};

const Items: React.FC<ItemsPageProps> = ({ items }) => {
  return (
    <>
      <Head>
        <title>Marketable Items - Universalis</title>
        <meta
          name="description"
          content="List of all marketable items available on Universalis."
        />
      </Head>
      <div className="page">
        <h1>Marketable Items</h1>
        <ItemList items={items} />
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch('https://universalis.app/api/v2/marketable');
  const items: number[] = await response.json();

  return {
    props: {
      items,
    },
  };
};

export default Items;
