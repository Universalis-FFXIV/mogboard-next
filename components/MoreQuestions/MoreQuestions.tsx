import { t, Trans } from '@lingui/macro';
import { sprintf } from 'sprintf-js';

export default function MoreQuestions() {
  return (
    <div className="page-block">
      <br />
      <br />
      <div className="page-short">
        <h3>
          <Trans>I have more questions!</Trans>
        </h3>
        <p
          dangerouslySetInnerHTML={{
            __html: sprintf(
              t`Hop onto <a href="%s">our Discord</a> and you can
                  ask all your questions.`,
              'https://discord.gg/JcMvMxD'
            ),
          }}
        ></p>
        <p
          dangerouslySetInnerHTML={{
            __html: sprintf(
              t`You can also DM me on Discord: <span class="text-yellow">%s</span> if you prefer :)`,
              'karashiiro'
            ),
          }}
        ></p>
      </div>
      <br />
      <br />
    </div>
  );
}
