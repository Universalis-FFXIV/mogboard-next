import Link from 'next/link';
import Tooltip from '../../../Tooltip/Tooltip';
import { useSession, signIn } from 'next-auth/react';
import LoggedOut from '../../../LoggedOut/LoggedOut';
import LoggedIn from '../../../LoggedIn/LoggedIn';
import { Trans } from '@lingui/macro';

interface UniversalisHeaderProps {
  onSettingsClicked: () => void;
  children: JSX.Element;
}

const UniversalisHeader = ({ onSettingsClicked, children }: UniversalisHeaderProps) => {
  const { data: session } = useSession();
  return (
    <header>
      <div>
        <div className="header-home">
          <Link href="/">
            <a className="btn-home">
              <img
                src="/i/universalis/universalis.png"
                alt="Universalis"
                width={41.75}
                height={64}
              />
            </a>
          </Link>
        </div>
        {children}
      </div>
      <div>
        <LoggedOut hasSession={!!session}>
          <a className="btn-login" onClick={() => signIn('discord')}>
            <Trans>Login via Discord</Trans>
          </a>
        </LoggedOut>
        <LoggedIn hasSession={!!session}>
          <div>
            <Link href="/account">
              <a>
                <Trans>My Account</Trans>
              </a>
            </Link>
            &nbsp;
            <span className="username">{session?.user?.name}</span>
          </div>
        </LoggedIn>
        <div>
          <Tooltip label="Site Settings">
            <button className="btn-settings" onClick={onSettingsClicked}>
              <span className="xiv-app_drawer_setting" />
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
};

export default UniversalisHeader;
