import { Trans } from '@lingui/macro';

export default function HomeGuides() {
  return (
    <div className="home-guides">
      <h4>
        <Trans>Check out the guides!</Trans>
      </h4>

      <p>
        <Trans>
          If you&apos;re new to the site, have a look at the{' '}
          <a href="https://github.com/Universalis-FFXIV/guides/wiki">wiki</a> to read our
          community-contributed guides for making the most of Universalis and the broader ecosystem
          around it.
        </Trans>
      </p>

      <a className="cta" href="https://github.com/Universalis-FFXIV/guides/wiki">
        <Trans>Read the guides here</Trans>
      </a>
    </div>
  );
}
