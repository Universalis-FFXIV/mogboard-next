import { Trans } from '@lingui/macro';
import Link from 'next/link';

const UniversalisFooter = () => {
  return (
    <footer>
      <small>
        <div>
          Universalis v2, <Trans>based on</Trans> Mogboard v2.2
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <Link href="/about">
            <a className="btn-menu">
              <Trans>About</Trans>
            </a>
          </Link>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <Link href="/docs">
            <a className="btn-menu">
              <Trans>API Documentation</Trans>
            </a>
          </Link>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <Link href="https://github.com/Universalis-FFXIV/Universalis">
            <a className="btn-menu">
              <Trans>GitHub</Trans>
            </a>
          </Link>
          &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
          <Link href="https://discord.gg/JcMvMxD">
            <a className="btn-menu">
              <Trans>Discord</Trans>
            </a>
          </Link>
        </div>
        <div>
          <Trans>FINAL FANTASY XIV © 2010 - 2020 SQUARE ENIX CO., LTD. All Rights Reserved.</Trans>
        </div>
      </small>
    </footer>
  );
};

export default UniversalisFooter;
