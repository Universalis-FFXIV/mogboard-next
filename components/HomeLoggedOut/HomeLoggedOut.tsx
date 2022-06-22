import Image from 'next/image';
import { signIn } from 'next-auth/react';

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
      <a className="btn-login" onClick={() => signIn('discord')}>
        Login via <strong>Discord</strong>
      </a>
    </div>
  );
}
