import { t, Trans } from '@lingui/macro';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSWRConfig } from 'swr';
import AccountLayout from '../../components/AccountLayout/AccountLayout';
import GameIcon from '../../components/GameIcon/GameIcon';
import { getItem, getItemKind, getItemSearchCategory } from '../../data/game';
import useAlerts from '../../hooks/useAlerts';
import useSettings from '../../hooks/useSettings';
import useWorlds from '../../hooks/useWorlds';
import { World } from '../../types/game/World';
import {
  Comparison,
  TriggerFilter,
  TriggerMapper,
  TriggerReducer,
  UserAlert,
} from '../../types/universalis/user';
import styles from './alerts.module.scss';

type ItemId = number;

function formatFilter(filter: TriggerFilter) {
  switch (filter) {
    case 'hq':
      return t`HQ`;
    default:
      return (((x) => x) as (x: never) => never)(filter);
  }
}

function formatMapper(mapper: TriggerMapper) {
  switch (mapper) {
    case 'pricePerUnit':
      return t`Unit price`;
    default:
      return (((x) => x) as (x: never) => never)(mapper);
  }
}

function formatReducer(reducer: TriggerReducer) {
  switch (reducer) {
    case 'min':
      return t`Minimum`;
    case 'max':
      return t`Maximum`;
    case 'mean':
      return t`Average`;
    default:
      return (((x) => x) as (x: never) => never)(reducer);
  }
}

function formatComparison(comparsion: Comparison) {
  if ('lt' in comparsion) {
    return t`Result is less than ${comparsion.lt.target}`;
  } else if ('gt' in comparsion) {
    return t`Result is greater than ${comparsion.gt.target}`;
  } else {
    return (((x) => x) as (x: never) => never)(comparsion);
  }
}

interface AlertPageEntry {
  alert: UserAlert;
  worlds: Record<number, World>;
  onDelete: (alert: UserAlert) => void;
}

function AlertPageEntry({ alert, worlds, onDelete }: AlertPageEntry) {
  const [showWebhook, setShowWebhook] = useState(false);

  return (
    <div key={alert.id} className={`${styles.formStyles} ${styles.alertEntry}`}>
      <table>
        <colgroup>
          <col width="28%" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>World</Trans>
              </strong>
            </td>
            <td>{worlds[alert.worldId].name}</td>
          </tr>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>Filter to</Trans>
              </strong>
            </td>
            <td>
              {alert.trigger.filters.length === 0
                ? t`Any`
                : alert.trigger.filters.map(formatFilter).join(', ')}
            </td>
          </tr>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>Using</Trans>
              </strong>
            </td>
            <td>{formatMapper(alert.trigger.mapper)}</td>
          </tr>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>Calculate</Trans>
              </strong>
            </td>
            <td>{formatReducer(alert.trigger.reducer)}</td>
          </tr>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>Compare</Trans>
              </strong>
            </td>
            <td>{formatComparison(alert.trigger.comparison)}</td>
          </tr>
          <tr>
            <td className={styles.alertFieldLabel}>
              <strong>
                <Trans>Discord Webhook</Trans>
              </strong>
            </td>
            <td>
              <input
                type={showWebhook ? 'text' : 'password'}
                value={alert.discordWebhook ?? ''}
                disabled
              ></input>
              &nbsp;
              <a style={{ fontSize: '12px' }} onClick={() => setShowWebhook((last) => !last)}>
                {showWebhook ? <Trans>Hide</Trans> : <Trans>Show</Trans>}
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="delete-list-block">
        <a className="text-red fr" onClick={() => onDelete(alert)}>
          <Trans>Delete Alert</Trans>
        </a>
      </div>
    </div>
  );
}

const Alerts: NextPage = () => {
  const { mutate } = useSWRConfig();
  const { status: sessionStatus } = useSession();
  const { data: alerts } = useAlerts();
  const { data: worlds } = useWorlds();
  const [settings] = useSettings();
  const [selectedAlertGroup, setSelectedAlertGroup] = useState<number | null>(null);
  const lang = settings['mogboard_language'] || 'en';
  const hasSession = sessionStatus === 'authenticated';

  const title = 'Alerts - Universalis';
  const description =
    'Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.';

  const AccountHead = () => (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="description" content={description} />
      <title>{title}</title>
    </Head>
  );

  if (sessionStatus === 'loading' || alerts == null || worlds == null) {
    return <AccountHead />;
  }

  const alertGroups = alerts.reduce((agg, next) => {
    const group = agg.get(next.itemId);
    if (group != null) {
      group.push(next);
    } else {
      agg.set(next.itemId, [next]);
    }
    return agg;
  }, new Map<ItemId, UserAlert[]>());

  const deleteAlert = (alert: UserAlert) =>
    fetch(`/api/web/alerts/${alert.id}`, {
      method: 'DELETE',
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        return res;
      })
      .then((res) => res.json());

  return (
    <>
      <AccountHead />
      <AccountLayout section="alerts" hasSession={hasSession}>
        <div>
          <h1>
            <Trans>Alerts</Trans>
          </h1>
          <div className="account-panel">
            {[...alertGroups.entries()].map(([itemId, alertGroup]) => {
              const item = getItem(itemId, lang)!;
              return (
                <div key={itemId}>
                  <div className={styles.alertPanel}>
                    <div
                      style={{
                        display: 'flex',
                        lineHeight: '38px',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedAlertGroup(itemId)}
                    >
                      <span style={{ display: 'flex' }}>
                        <GameIcon id={item.iconId} ext="png" size="1x" width={36} height={36} />
                        <span style={{ marginLeft: '24px' }}>
                          {item.levelItem > 1 && <em className="ilv">{item.levelItem}</em>}
                          <Link href="/market/[itemId]" as={`/market/${item.id}`}>
                            <a className={`rarity-${item.rarity}`}>{item.name}</a>
                          </Link>
                        </span>
                      </span>
                      <span>
                        <small>
                          {getItemKind(item.itemKind, lang)?.name} -{' '}
                          {getItemSearchCategory(item.itemSearchCategory, lang)?.name}
                        </small>
                      </span>
                    </div>
                    {selectedAlertGroup === itemId && (
                      <>
                        <hr />
                        {alertGroup.map((alert) => (
                          <div key={alert.id} style={{ maxWidth: '96%', margin: 'auto' }}>
                            <AlertPageEntry
                              alert={alert}
                              worlds={worlds}
                              onDelete={async (alert) => {
                                await deleteAlert(alert);
                                alerts.splice(alerts.indexOf(alert), 1);
                                await mutate('/api/web/alerts', alerts);
                              }}
                            />
                            <hr />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AccountLayout>
    </>
  );
};

export default Alerts;
