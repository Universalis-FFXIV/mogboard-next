import { UserList } from '../../types/universalis/user';
import LoggedIn from '../LoggedIn/LoggedIn';
import LoggedOut from '../LoggedOut/LoggedOut';

interface HomeNavBarProps {
  lists: UserList[];
  hasSession: boolean;
}

export default function HomeNavbar({ hasSession, lists }: HomeNavBarProps) {
  return (
    <div className="home-nav">
      <LoggedOut hasSession={hasSession}>
        <section className="tac">
          <strong>Logged-out</strong>
        </section>
        <p className="text-gray">
          Lists, Alerts, Market activity and retainer links will show here when you are logged into
          the site.
        </p>
      </LoggedOut>
      <LoggedIn hasSession={hasSession}>
        <h3>
          <img src="/i/svg/th-list-light.svg" alt="" />
          Lists
        </h3>
        <div>
          {lists.length === 0 && (
            <button type="button" className="btn-disabled">
              <span className="text-gray">You have no lists.</span>
            </button>
          )}
          {lists.map((list) => (
            <button key={list.id} type="button">
              {list.name}
            </button>
          ))}
        </div>
      </LoggedIn>
    </div>
  );
}
