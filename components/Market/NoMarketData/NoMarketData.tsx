import { t, Trans } from '@lingui/macro';
import { sprintf } from 'sprintf-js';

export default function NoMarketData({ worldName }: { worldName: string }) {
  return (
    <div className="item-no-data">
      <h2 className="text-highlight">
        <Trans>Sorry, no market data!</Trans>
      </h2>
      <p
        dangerouslySetInnerHTML={{
          __html: sprintf(
            t`Universalis could not find any market data for this item on the server <strong>%s</strong>.`,
            worldName
          ),
        }}
      ></p>
      <p>
        <Trans>There can be a few reasons for this, here are some:</Trans>
      </p>
      <ul>
        <li
          dangerouslySetInnerHTML={{ __html: sprintf(t`%s is a brand new server`, worldName) }}
        ></li>
        <li>
          <Trans>No one has contributed any information about this item yet</Trans>
        </li>
        <li>
          <Trans>Something broke</Trans>
        </li>
      </ul>
      <span
        dangerouslySetInnerHTML={{
          __html: sprintf(
            t`If it is that last one, be sure to jump on <a href="%s">Discord</a> and let us know!`,
            'https://discord.gg/JcMvMxD'
          ),
        }}
      ></span>
    </div>
  );
}
