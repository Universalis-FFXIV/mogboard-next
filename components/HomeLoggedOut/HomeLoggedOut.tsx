import Image from 'next/image';

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
      <a href="/account/login/discord" className="btn-login">
        <span>
          Login via <strong>Discord</strong>
        </span>
      </a>
    </div>
  );
}
