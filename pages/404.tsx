import { Trans } from '@lingui/macro';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="error-page">
      <div style={{ marginBottom: 25 }}>
        <Image src="/i/game/patch_titan.png" alt="" height={160} width={160} />
      </div>
      <h2>404</h2>
      <p>
        <Trans>Could not find the page you were looking for kupo~!</Trans>
      </p>
    </div>
  );
}
