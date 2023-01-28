import { t, Trans } from '@lingui/macro';
import Link from 'next/link';
import React, { useCallback, useMemo } from 'react';
import { useState, useRef } from 'react';
import { sprintf } from 'sprintf-js';
import { PHPObject } from '../../../db/PHPObject';
import useAlerts from '../../../hooks/useAlerts';
import useWorlds from '../../../hooks/useWorlds';
import {
  Comparison,
  ComparisonType,
  TriggerFilter,
  TriggerMapper,
  TriggerReducer,
  UserAlert,
  UserAlertTrigger,
  UserList,
  UserListCustomType,
} from '../../../types/universalis/user';
import LoggedIn from '../../LoggedIn/LoggedIn';
import { useModalCover } from '../../UniversalisLayout/components/ModalCover/ModalCover';
import { usePopup } from '../../UniversalisLayout/components/Popup/Popup';
import cloneDeep from 'lodash.clonedeep';

export type ListsDispatchAction =
  | { type: 'updateAllLists'; lists: UserList[] }
  | { type: 'createList'; list: UserList }
  | { type: 'addItem'; listId: string; itemId: number }
  | { type: 'removeItem'; listId: string; itemId: number };

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

interface AlertsModalProps {
  isOpen: boolean;
  close: () => void;
}

function AlertsModal({ isOpen, close }: AlertsModalProps) {
  const { data: alerts } = useAlerts();
  const { data: worlds, isLoading: isLoadingWorlds } = useWorlds();

  const alertBuilders = useAlertBuilders(alerts);

  if (worlds == null || isLoadingWorlds) {
    return <></>;
  }

  return (
    <div className={`modal list_modal ${isOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={close}>
        <i className="xiv-NavigationClose"></i>
      </button>
      <div className="modal_row">
        <div className="modal_form_row_1">
          <h1>
            <Trans>Alerts</Trans>
          </h1>
        </div>
        <form className="modal_form create_list_form">
          <p>
            <Trans>Current alerts for this item: {alertBuilders.size()}</Trans>
          </p>
          {alertBuilders.toArray().map((alert, i) => (
            <div key={i}>
              {worlds[alert.world()].name}
              {alert.filters.length > 0 &&
                alert.filters.map((filter) => (
                  <React.Fragment key={filter}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        alert.removeFilter(filter);
                      }}
                    >
                      Remove
                    </button>
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
              <select
                value={alert.mapper}
                onChange={(e) => alert.setMapper(e.target.value as TriggerMapper)}
              >
                <option value="pricePerUnit">Unit price</option>
              </select>
              <select
                value={alert.reducer}
                onChange={(e) => alert.setReducer(e.target.value as TriggerReducer)}
              >
                <option value="min">Min</option>
                <option value="max">Max</option>
                <option value="mean">Mean</option>
              </select>
              <select
                value={alert.comparisonType()}
                onChange={(e) =>
                  alert.setComparison(e.target.value as ComparisonType, alert.comparisonTarget())
                }
              >
                <option value="lt">Less than</option>
                <option value="gt">Greater than</option>
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
              <br />
              <input
                type="text"
                value={alert.transports.discordWebhook ?? ''}
                onChange={(e) => {
                  alert.addTransport('discordWebhook', e.target.value);
                }}
              ></input>
            </div>
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

interface ListsModalProps {
  lists: UserList[];
  dispatch: (action: ListsDispatchAction) => void;
  itemId: number;
  isOpen: boolean;
  close: () => void;
}

function ListsModal({ lists, dispatch, itemId, isOpen, close }: ListsModalProps) {
  const { setPopup } = usePopup();

  const [updatingList, setUpdatingList] = useState(false);

  const [addListName, setAddListName] = useState('');
  const [addingList, setAddingList] = useState(false);

  const standardLists = lists.filter((list) => list.customType === UserListCustomType.Default);

  const toggleList = (listId: string, itemId: number) => {
    if (updatingList) {
      return;
    }

    const list = lists.find((list) => list.id === listId)!;
    const addingItem = !list.items.includes(itemId);

    setUpdatingList(true);
    fetch(`/api/web/lists/${listId}`, {
      method: 'PUT',
      body: JSON.stringify({ item: { action: addingItem ? 'add' : 'remove', itemId } }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        dispatch({ type: addingItem ? 'addItem' : 'removeItem', listId, itemId });
      })
      .catch((err) =>
        setPopup({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : `${err}`,
          isOpen: true,
        })
      )
      .finally(() => setUpdatingList(false));
  };

  const addList = (name: string, itemId: number) => {
    if (addingList) {
      return;
    }

    setAddingList(true);
    fetch('/api/web/lists', {
      method: 'POST',
      body: JSON.stringify({ name, items: [itemId] }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        dispatch({ type: 'createList', list: await res.json() });
      })
      .catch((err) =>
        setPopup({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : `${err}`,
          isOpen: true,
        })
      )
      .finally(() => setAddingList(false));
  };

  return (
    <div className={`modal list_modal ${isOpen ? 'open' : ''}`}>
      <button type="button" className="modal_close_button" onClick={close}>
        <i className="xiv-NavigationClose"></i>
      </button>
      <div className="modal_row">
        <div className="modal_form_row_1">
          <h1>
            <Trans>Add to list</Trans>
          </h1>
        </div>
        <form className="modal_form create_list_form">
          <p>
            <Trans>Option 1) Create a new list:</Trans>
          </p>
          {standardLists.length < 12 ? (
            <div>
              <input
                name="list_name"
                id="list_name"
                type="text"
                placeholder="Name"
                className="full"
                value={addListName}
                onChange={(e) => setAddListName(e.target.value)}
              />
              <br />
              <br />
              <div className="modal_form_end">
                <button
                  type="submit"
                  className="btn-green btn_create_list"
                  onClick={(e) => {
                    e.preventDefault();
                    addList(addListName, itemId);
                  }}
                >
                  <Trans>Add to list</Trans>
                </button>
              </div>
            </div>
          ) : (
            <p>
              <Trans>You have reached the maximum of 12 lists. You cannot create any more.</Trans>
            </p>
          )}
          <br />
          <p>
            <Trans>Option 2) Use an existing list:</Trans>
          </p>
          <div className="user_lists">
            {standardLists.map((list) => (
              <button
                key={list.id}
                type="button"
                className={`user_list_existing_button ${
                  list.items.includes(itemId) ? 'user_list_inlist' : ''
                }`}
                onClick={() => toggleList(list.id, itemId)}
              >
                <strong>
                  <Trans>Items:</Trans> {list.items.length}
                </strong>{' '}
                {list.name}
                <span
                  dangerouslySetInnerHTML={{
                    __html: list.items.includes(itemId)
                      ? sprintf(t`<span>%s</span>`, t`REMOVE`)
                      : '',
                  }}
                ></span>
              </button>
            ))}
            {standardLists.length === 0 && (
              <div
                className="user_no_lists"
                dangerouslySetInnerHTML={{
                  __html: t`You have no lists! <br> Create one by entering in a new name above.`,
                }}
              ></div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface FaveButtonProps {
  lists: UserList[];
  itemId: number;
}

function FaveButton({ lists, itemId }: FaveButtonProps) {
  const { setPopup } = usePopup();

  const [faves, setFaves] = useState(
    lists.find((list) => list.customType === UserListCustomType.Favourites)?.items
  );
  const favourite = faves != null && faves.includes(itemId);

  const updatingFavesRef = useRef<HTMLButtonElement>(null);
  const [updatingFaves, setUpdatingFaves] = useState(false);
  const toggleFave = () => {
    if (updatingFaves) {
      return;
    }

    const items = new PHPObject();
    items.push(...(faves ?? []));
    if (favourite) {
      items.splice(items.indexOf(itemId), 1);
    } else {
      items.unshift(itemId);
    }

    setUpdatingFaves(true);
    fetch('/api/web/lists/faves', {
      method: 'PUT',
      body: JSON.stringify({ items }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = res.headers.get('Content-Type')?.includes('application/json')
            ? (await res.json()).message
            : await res.text();
          throw new Error(body);
        }

        setFaves(items);
      })
      .catch((err) =>
        setPopup({
          type: 'error',
          title: 'Error',
          message: err instanceof Error ? err.message : `${err}`,
          isOpen: true,
        })
      )
      .finally(() => setUpdatingFaves(false));
  };

  return (
    <button
      ref={updatingFavesRef}
      className={`btn_addto_fave ${updatingFaves ? 'loading_interaction' : ''} ${
        favourite ? 'on' : ''
      }`}
      style={
        updatingFaves
          ? {
              minWidth: updatingFavesRef.current?.offsetWidth,
              minHeight: updatingFavesRef.current?.offsetHeight,
              display: 'inline-block',
            }
          : undefined
      }
      disabled={updatingFaves}
      onClick={toggleFave}
    >
      <span>
        {updatingFaves ? <>&nbsp;</> : favourite ? <Trans>Faved</Trans> : <Trans>Favourite</Trans>}
      </span>
    </button>
  );
}

interface MarketNavProps {
  hasSession: boolean;
  lists: UserList[];
  dispatch: (action: ListsDispatchAction) => void;
  itemId: number;
}

export default function MarketNav({ hasSession, lists, dispatch, itemId }: MarketNavProps) {
  const { setModalCover } = useModalCover();

  const [listsModalOpen, setListsModalOpen] = useState(false);
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  const openListsModal = useCallback(() => {
    fetch(`/api/web/lists`)
      .then((res) => res.json())
      .then((lists: UserList[]) => dispatch({ type: 'updateAllLists', lists }))
      .catch(console.error);

    setModalCover({ isOpen: true });
    setListsModalOpen(true);
  }, [dispatch, setModalCover, setListsModalOpen]);

  const closeListsModal = useCallback(() => {
    setModalCover({ isOpen: false });
    setListsModalOpen(false);
  }, [setModalCover, setListsModalOpen]);

  const openAlertsModal = useCallback(() => {
    setModalCover({ isOpen: true });
    setAlertsModalOpen(true);
  }, [setModalCover, setAlertsModalOpen]);

  const closeAlertsModal = useCallback(() => {
    setModalCover({ isOpen: false });
    setAlertsModalOpen(false);
  }, [setModalCover, setAlertsModalOpen]);

  return (
    <div className="box box_lists">
      <div className="box_form">
        <div className="box_flex form">
          <a
            href={`https://www.garlandtools.org/db/#item/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn_gt">
              <Trans>Show on GarlandTools</Trans>
            </button>
          </a>
          <a
            href={`https://ffxivteamcraft.com/db/en/item/${itemId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button type="button" className="btn btn_gt">
              <Trans>Show on Teamcraft</Trans>
            </button>
          </a>
          <LoggedIn hasSession={hasSession}>
            <button className="btn_addto_list" style={{ marginRight: 4 }} onClick={openListsModal}>
              <Trans>Lists</Trans>
            </button>
            <FaveButton lists={lists} itemId={itemId} />
            <button className="btn_addto_list" style={{ marginLeft: 4 }} onClick={openAlertsModal}>
              <Trans>Alerts</Trans>
            </button>
          </LoggedIn>
        </div>
      </div>
      <LoggedIn hasSession={hasSession}>
        <ListsModal
          lists={lists}
          dispatch={dispatch}
          itemId={itemId}
          isOpen={listsModalOpen}
          close={closeListsModal}
        />
        <AlertsModal isOpen={alertsModalOpen} close={closeAlertsModal} />
      </LoggedIn>
    </div>
  );
}
