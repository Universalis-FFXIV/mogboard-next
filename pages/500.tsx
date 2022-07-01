import { Trans } from '@lingui/macro';
import Image from 'next/image';

export default function Error() {
  return (
    <div className="error-page">
      <div style={{ marginBottom: 25 }}>
        <Image src="/i/game/patch_titan.png" alt="" height={160} width={160} />
      </div>
      <h2>
        <Trans>Something went wrong!</Trans>
      </h2>

      <p>
        <Trans>If you continue to run into this issue, please jump on the discord for help!</Trans>
      </p>
    </div>
  );
}
