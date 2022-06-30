import { Trans } from '@lingui/macro';
import Link from 'next/link';

export default function HomeNews() {
  return (
    <div className="the-big-news-post">
      <h4>
        <Trans>Welcome to Universalis!</Trans>
      </h4>
      <p>
        <Trans>
          Universalis is a market board data site with crowd sourced information, based on mogboard.
          It can aggregate market board information from multiple sources, so if you want to help
          out, please check out our contributing page.
        </Trans>
      </p>
      <p>
        <Trans>Thank you, and enjoy your stay!</Trans>
      </p>

      <Link href="/contribute">
        <a>
          <Trans>Contribute to market board data</Trans>
        </a>
      </Link>
    </div>
  );
}
