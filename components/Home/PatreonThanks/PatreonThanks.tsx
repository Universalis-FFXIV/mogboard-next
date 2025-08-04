import { Trans } from '@lingui/macro';
import usePatreonSubscriber from '../../../hooks/usePatreonSubscriber';

export default function PatreonThanks() {
  const { data, error } = usePatreonSubscriber();

  if (error || !data?.subscriber) {
    return null; // Don't show anything if there's an error or no subscriber
  }

  return (
    <div
      className="patreon-thanks"
      style={{
        textAlign: 'center',
        fontSize: '0.9em',
        lineHeight: '1.4',
        opacity: 0.9,
        marginBottom: '20px',
      }}
    >
      <div>
        <Trans>Special thanks to</Trans>{' '}
        <span style={{ fontWeight: 'bold' }}>{data.subscriber.name}</span>{' '}
        <Trans>and all of our other Patreon supporters!</Trans>
      </div>
    </div>
  );
}
