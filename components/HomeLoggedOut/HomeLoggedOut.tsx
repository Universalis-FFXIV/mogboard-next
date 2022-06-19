import Image from 'next/image';
import Link from 'next/link';

export default function HomeLoggedOut() {
  return (
    <div className="home-logged-out">
      <div>
        <Image
          src="/i/brand/universalis/universalis_bodge.png"
          height={42}
          width={237.983}
          alt=""
        />
      </div>
      <br />
      <strong>Become a member!</strong>
      <br />
      <p>Create alerts, make lists, add your retainers and get a personalised home page feed!</p>
      <br />
      <br />
      <Link href="/account/login/discord">
        <a className="btn-login">
          Login via <strong>Discord</strong>
        </a>
      </Link>
    </div>
  );
}
