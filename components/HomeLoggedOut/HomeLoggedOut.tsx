import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { t, Trans } from '@lingui/macro';

export default function HomeLoggedOut() {
  const discord = t`Login via <strong>Discord</strong>`;
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
      <strong>
        <Trans>Become a member!</Trans>
      </strong>
      <br />
      <p>
        <Trans>
          Create alerts, make lists, add your retainers and get a personalised home page feed!
        </Trans>
      </p>
      <br />
      <br />
      <a
        className="btn-login"
        onClick={() => signIn('discord')}
        dangerouslySetInnerHTML={{ __html: discord }}
      ></a>
    </div>
  );
}
