import Link from 'next/link';

export default function HomeNews() {
  return (
    <div className="the-big-news-post">
      <h4>Welcome to Universalis!</h4>
      <p>
        Universalis is a market board data site with crowd sourced information, based on mogboard.
        It can aggregate market board information from multiple sources, so if you want to help out,
        please check out our contributing page.
      </p>
      <p>Thank you, and enjoy your stay!</p>

      <Link href="/contribute">
        <a>Contribute to market board data</a>
      </Link>
    </div>
  );
}
