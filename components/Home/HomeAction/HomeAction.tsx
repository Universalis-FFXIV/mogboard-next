import { Trans } from '@lingui/macro';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeAction() {
  return (
    <div className="home-box patreon-discord">
      <a href="https://discord.gg/JcMvMxD" className="discord" target="_blank" rel="noreferrer">
        <span>
          <img src="/i/brand/discord/logo_white.png" alt="Discord" height={30} width={30.6333} />{' '}
          <Trans>DISCORD</Trans>
        </span>
      </a>
      <Link href="/contribute">
        <a className="contrib">
          <Image src="/i/brand/contribute/logo_name.png" alt="Contribute" layout="fill" />
        </a>
      </Link>
      <a href="https://patreon.com/universalis" className="patreon">
        <Image src="/i/brand/patreon/logo_name.jpg" alt="Patreon" layout="fill" />
      </a>
    </div>
  );
}
