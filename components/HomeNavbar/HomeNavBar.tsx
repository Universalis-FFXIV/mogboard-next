import LoggedIn from '../LoggedIn/LoggedIn';
import LoggedOut from '../LoggedOut/LoggedOut';

export default function HomeNavbar() {
  return (
    <div className="home-nav">
      <LoggedOut>
        <section className="tac">
          <strong>Logged-out</strong>
        </section>
        <p className="text-gray">
          Lists, Alerts, Market activity and retainer links will show here when you are logged into
          the site.
        </p>
      </LoggedOut>
      <LoggedIn>
        <h3>
          <img src="/i/svg/th-list-light.svg" alt="" />
          Lists
        </h3>
        <div>
          <button type="button" className="btn-disabled">
            <span className="text-gray">You have no lists.</span>
          </button>
        </div>
      </LoggedIn>
    </div>
  );
}
