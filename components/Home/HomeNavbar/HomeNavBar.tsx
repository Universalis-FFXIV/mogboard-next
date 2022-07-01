import { Trans } from '@lingui/macro';
import Image from 'next/image';
import { UserList } from '../../../types/universalis/user';
import LoggedIn from '../../LoggedIn/LoggedIn';
import LoggedOut from '../../LoggedOut/LoggedOut';

interface HomeNavBarProps {
  lists: UserList[];
  onListSelected: (id: string) => void;
  hasSession: boolean;
}

export default function HomeNavbar({ hasSession, lists, onListSelected }: HomeNavBarProps) {
  return (
    <div className="home-nav">
      <LoggedOut hasSession={hasSession}>
        <section className="tac">
          <strong>
            <Trans>Logged-out</Trans>
          </strong>
        </section>
        <p className="text-gray">
          <Trans>
            Lists, Alerts, Market activity and retainer links will show here when you are logged
            into the site.
          </Trans>
        </p>
      </LoggedOut>
      <LoggedIn hasSession={hasSession}>
        <h3>
          <span className="list-icon">
            <Image src="/i/svg/th-list-light.svg" alt="" height={16} width={16} />
          </span>
          <Trans>Lists</Trans>
        </h3>
        <div>
          {lists.length === 0 && (
            <button type="button" className="btn-disabled">
              <span className="text-gray">
                <Trans>You have no lists.</Trans>
              </span>
            </button>
          )}
          {lists.map((list) => (
            <button key={list.id} type="button" onClick={() => onListSelected(list.id)}>
              {list.name}
            </button>
          ))}
        </div>
      </LoggedIn>
    </div>
  );
}
