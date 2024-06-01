import { GetServerSideProps } from 'next';

const RobotsTxt = () => {
  return null;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const robotText = `
User-agent: Googlebot
Disallow: /nogooglebot/

User-agent: *
Allow: /

Sitemap: https://universalis.app/sitemap.xml
  `;

  res.setHeader('Content-Type', 'text/plain');
  res.write(robotText);
  res.end();

  return {
    props: {},
  };
};

export default RobotsTxt;
