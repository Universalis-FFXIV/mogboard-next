import { Trans } from '@lingui/macro';
import Link from 'next/link';
import cloneDeep from 'lodash.clonedeep';
import WorldOption from '../../../WorldOption/WorldOption';
import styles from './AlertsModal.module.scss';
import useAlerts from '../../../../hooks/useAlerts';
import useWorlds from '../../../../hooks/useWorlds';
import {
  Comparison,
  ComparisonType,
  TriggerFilter,
  TriggerMapper,
  TriggerReducer,
  UserAlert,
  UserAlertTrigger,
} from '../../../../types/universalis/user';
import React, { useState, useMemo, useRef } from 'react';
import { usePopup } from '../../../UniversalisLayout/components/Popup/Popup';
import { World } from '../../../../types/game/World';
import { useSWRConfig } from 'swr';

interface TriggerTransports {
  discordWebhook: string | null;
}

class AlertBuilder implements UserAlertTrigger {
  public filters: TriggerFilter[];
  public mapper: TriggerMapper;
  public reducer: TriggerReducer;
  public comparison: Comparison;

  public transports: TriggerTransports;

  public readonly alert: UserAlert;

  constructor(alert: UserAlert, readonly notifyChange: () => void) {
    this.alert = cloneDeep(alert);

    this.filters = this.alert.trigger.filters;
    this.mapper = this.alert.trigger.mapper;
    this.reducer = this.alert.trigger.reducer;
    this.comparison = this.alert.trigger.comparison;

    this.transports = { discordWebhook: alert.discordWebhook };
  }

  addTransport<K extends keyof TriggerTransports>(
    type: K,
    transport: NonNullable<TriggerTransports[K]>
  ) {
    this.transports[type] = transport;
    this.notifyChange();
  }

  removeTransport<K extends keyof TriggerTransports>(type: K) {
    this.transports[type] = null;
    this.notifyChange();
  }

  setWorld(worldId: number) {
    this.alert.worldId = worldId;
    this.notifyChange();
  }

  world() {
    return this.alert.worldId;
  }

  addFilter(filter: TriggerFilter, notifyChange: boolean = true) {
    this.filters.push(filter);
    if (notifyChange) {
      this.notifyChange();
    }
  }

  removeFilter(filter: TriggerFilter, notifyChange: boolean = true) {
    const idx = this.filters.indexOf(filter);
    if (idx !== -1) {
      this.filters.splice(idx, 1);
      if (notifyChange) {
        this.notifyChange();
      }
    }
  }

  getRemainingFilters() {
    const filters = this.filters;
    const allFilters: TriggerFilter[] = ['hq'];
    return allFilters.filter((f) => !filters.includes(f));
  }

  formatFilter(filter: TriggerFilter) {
    switch (filter) {
      case 'hq':
        return 'HQ';
      default:
        // Ensure all cases have been handled
        (((x) => x) as (x: never) => never)(filter);
    }
  }

  setMapper(mapper: TriggerMapper) {
    this.mapper = mapper;
    this.notifyChange();
  }

  setReducer(reducer: TriggerReducer) {
    this.reducer = reducer;
    this.notifyChange();
  }

  setComparison<K extends ComparisonType>(type: K, value: number) {
    if (type === 'lt') {
      this.comparison = { lt: { target: value } };
    } else {
      this.comparison = { gt: { target: value } };
    }
  }

  comparisonType(): ComparisonType {
    if ('lt' in this.comparison) {
      return 'lt';
    } else {
      return 'gt';
    }
  }

  comparisonTarget(): number {
    if ('lt' in this.comparison) {
      return this.comparison.lt.target;
    } else {
      return this.comparison.gt.target;
    }
  }

  async save() {
    return await fetch(`/api/web/alerts/${this.alert.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        itemId: this.alert.itemId,
        worldId: this.alert.worldId,
        discordWebhook: this.transports.discordWebhook,
        triggerVersion: 0,
        trigger: {
          filters: this.filters,
          mapper: this.mapper,
          reducer: this.reducer,
          comparison: this.comparison,
        },
      } as Omit<UserAlert, 'id' | 'userId'>),
      headers: { 'Content-Type': 'application/json' },
    }).then(async (res) => {
      if (!res.ok) {
        const body = res.headers.get('Content-Type')?.includes('application/json')
          ? (await res.json()).message
          : await res.text();
        throw new Error(body);
      }

      return res;
    });
  }

  notifyChanges() {
    this.notifyChange();
  }
}

class AlertBuilderCollection {
  constructor(readonly builders: Record<UserAlert['id'], AlertBuilder>) {}

  size() {
    return Object.keys(this.builders).length;
  }

  toArray() {
    return Object.keys(this.builders).map((k) => this.builders[k]);
  }
}

function useAlertBuilders(alerts: UserAlert[] | void): AlertBuilderCollection {
  const [, notifyChange] = useState(false);
  return useMemo(() => {
    const alertBuilders =
      alerts == null
        ? {}
        : alerts.reduce(
            (agg, next) => ({
              ...agg,
              [next.id]: new AlertBuilder(next, () => notifyChange((last) => !last)),
            }),
            {}
          );
    const collection = new AlertBuilderCollection(alertBuilders);
    return collection;
  }, [alerts, notifyChange]);
}

interface SaveButtonProps {
  onSave: () => Promise<void>;
}

function SaveButton({ onSave }: SaveButtonProps) {
  const { setPopup } = usePopup();

  const savingRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => {
    if (saving) {
      return;
    }

    setSaving(true);
    onSave()
      .then(() => {
        setSaved(true);
      })
      .catch((err) => {
        setPopup({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : `${err}`,
          isOpen: true,
        });
        setSaved(false);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <button
      ref={savingRef}
      className={`${styles.btnSave} ${saving ? 'loading_interaction' : ''} ${
        saved ? styles.on : ''
      }`}
      style={
        saving
          ? {
              minWidth: savingRef.current?.offsetWidth,
              minHeight: savingRef.current?.offsetHeight,
              display: 'inline-block',
            }
          : undefined
      }
      disabled={saving}
      onClick={save}
    >
      <span>{saving ? <>&nbsp;</> : saved ? <Trans>Saved</Trans> : <Trans>Save</Trans>}</span>
    </button>
  );
}

interface AlertFormProps {
  alert: AlertBuilder;
  worlds: Record<number, World>;
  worldIds: Record<string, number>;
  onSave: () => Promise<void>;
}

function AlertForm({ alert, worlds, worldIds, onSave }: AlertFormProps) {
  return (
    <>
      <table>
        <colgroup>
          <col width="20%" />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>World</Trans>
              </strong>
            </td>
            <td>
              <WorldOption
                value={worlds[alert.world()].name}
                setValue={(world) => {
                  console.log(world);
                  alert.setWorld(worldIds[world]);
                }}
              />
            </td>
          </tr>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>Filter to</Trans>
              </strong>
            </td>
            <td>
              {alert.filters.length > 0 &&
                alert.filters.map((filter, j) => (
                  <React.Fragment key={filter}>
                    <select
                      onChange={(e) => {
                        alert.addFilter(e.target.value as TriggerFilter, false);
                        alert.removeFilter(filter, false);
                        alert.notifyChanges();
                      }}
                    >
                      <option value={filter}>{alert.formatFilter(filter)}</option>
                      {alert.getRemainingFilters().map((f, k) => (
                        <option key={k} value={f}>
                          {alert.formatFilter(f)}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert.removeFilter(filter);
                      }}
                      className={styles.alertEditorRemoveFilter}
                    >
                      <Trans>Remove</Trans>
                    </button>
                    {j !== alert.filters.length - 1 && <br />}
                  </React.Fragment>
                ))}
              {alert.getRemainingFilters().length > 0 && (
                <select value="" onChange={(e) => alert.addFilter(e.target.value as TriggerFilter)}>
                  <option disabled value="">
                    <Trans>Filter...</Trans>
                  </option>
                  {alert.getRemainingFilters().map((f, j) => (
                    <option key={j} value={f}>
                      {alert.formatFilter(f)}
                    </option>
                  ))}
                </select>
              )}
            </td>
          </tr>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>Using</Trans>
              </strong>
            </td>
            <td>
              <select
                value={alert.mapper}
                onChange={(e) => alert.setMapper(e.target.value as TriggerMapper)}
              >
                <option value="pricePerUnit">
                  <Trans>Unit price</Trans>
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>Calculate</Trans>
              </strong>
            </td>
            <td>
              <select
                value={alert.reducer}
                onChange={(e) => alert.setReducer(e.target.value as TriggerReducer)}
              >
                <option value="min">
                  <Trans>Minimum</Trans>
                </option>
                <option value="max">
                  <Trans>Maximum</Trans>
                </option>
                <option value="mean">
                  <Trans>Average</Trans>
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>Compare</Trans>
              </strong>
            </td>
            <td>
              <select
                value={alert.comparisonType()}
                onChange={(e) =>
                  alert.setComparison(e.target.value as ComparisonType, alert.comparisonTarget())
                }
                className={styles.alertEditorComparison}
              >
                <option value="lt">
                  <Trans>Less than</Trans>
                </option>
                <option value="gt">
                  <Trans>Greater than</Trans>
                </option>
              </select>
              <input
                type="text"
                value={alert.comparisonTarget()}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    alert.setComparison(alert.comparisonType(), parseInt(e.target.value));
                  }
                }}
              ></input>
            </td>
          </tr>
          <tr>
            <td className={styles.alertEditorLabel}>
              <strong>
                <Trans>Discord Webhook</Trans>
              </strong>
            </td>
            <td>
              <input
                type="text"
                value={alert.transports.discordWebhook ?? ''}
                onChange={(e) => {
                  alert.addTransport('discordWebhook', e.target.value);
                }}
                className={styles.alertEditorWebhook}
              ></input>
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <SaveButton onSave={onSave} />
      </div>
    </>
  );
}

interface AlertsModalProps {
  itemId: number;
  homeWorldId: number;
  isOpen: boolean;
  close: () => void;
}

export default function AlertsModal({ isOpen, close, itemId, homeWorldId }: AlertsModalProps) {
  const { cache } = useSWRConfig();
  const { data: alerts } = useAlerts();
  const { data: worlds, isLoading: isLoadingWorlds } = useWorlds();

  const alertBuilders = useAlertBuilders(alerts);

  const [, notifyChange] = useState(false);
  const [newAlert, setNewAlert] = useState<AlertBuilder | null>(null);

  if (worlds == null || isLoadingWorlds) {
    return <></>;
  }

  const worldIds = Object.keys(worlds).reduce<Record<string, number>>(
    (agg, next) => ({ ...agg, [worlds[parseInt(next)].name]: parseInt(next) }),
    {}
  );

  const createAlert = (alert: AlertBuilder) =>
    fetch('/api/web/alerts', {
      method: 'POST',
      body: JSON.stringify({
        itemId: alert.alert.itemId,
        worldId: alert.alert.worldId,
        discordWebhook: alert.transports.discordWebhook,
        triggerVersion: alert.alert.triggerVersion,
        trigger: alert.alert.trigger,
      } as Omit<UserAlert, 'id' | 'userId'>),
      headers: { 'Content-Type': 'application/json' },
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
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={close}>
        <i className="xiv-NavigationClose"></i>
      </button>
      <div className="modal_row">
        <div className="modal_form_row_1">
          <h1>
            <Trans>Alerts</Trans>
          </h1>
        </div>
        <form className="modal_form">
          <p>
            <Trans>Current alerts for this item: {alertBuilders.size()}</Trans>
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              setNewAlert(
                new AlertBuilder(
                  {
                    id: '',
                    userId: '',
                    itemId: itemId,
                    worldId: homeWorldId,
                    discordWebhook: null,
                    triggerVersion: 0,
                    trigger: {
                      filters: [],
                      mapper: 'pricePerUnit',
                      reducer: 'min',
                      comparison: {
                        lt: {
                          target: 0,
                        },
                      },
                    },
                  },
                  () => notifyChange((last) => !last)
                )
              );
              cache.delete('/api/web/alerts');
            }}
          >
            New Alert
          </button>
          {newAlert && (
            <AlertForm
              alert={newAlert}
              worlds={worlds}
              worldIds={worldIds}
              onSave={async () => {
                await createAlert(newAlert);
                setNewAlert(null);
              }}
            />
          )}
          {alertBuilders.toArray().map((alert, i) => (
            <details key={i} className={styles.alertDetails}>
              <summary>Alert {i + 1}</summary>
              <AlertForm
                alert={alert}
                worlds={worlds}
                worldIds={worldIds}
                onSave={async () => {
                  await alert.save();
                }}
              />
            </details>
          ))}
          <p>
            <Trans>
              You can view all of your alerts on the <Link href="/account/alerts">Alerts</Link>{' '}
              page.
            </Trans>
          </p>
        </form>
      </div>
    </div>
  );
}
