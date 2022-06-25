import { Trans } from '@lingui/macro';
import { Fragment, PropsWithChildren, useState } from 'react';
import GameCityIcon from '../GameCityIcon/GameCityIcon';
import GameMateria from '../GameMateria/GameMateria';
import Tooltip from '../Tooltip/Tooltip';

interface ListingsTableProps {
  market: any;
  crossWorld: boolean;
  includeDiff: boolean;
  start?: number;
  end?: number;
}

interface ListingsTableHeaderProps {
  onSelected: () => void;
  className?: string;
}

type ListingRow = {
  n: number;
  hq: boolean;
  materia: JSX.Element[];
  pricePerUnit: number;
  quantity: number;
  total: number;
  retainerName: string;
  retainerCity: number;
  creatorName: string;
} & ({ average: number; diff: number } | { average: null; diff: null }) &
  ({ crossWorld: true; world: string } | { crossWorld: false; world: null });

enum SortDirection {
  None,
  Ascending,
  Descending,
}

type FilterListingKeys<T> = {
  [K in keyof ListingRow]: ListingRow[K] extends T ? K : never;
}[keyof ListingRow];

type ListingNumericKey = FilterListingKeys<number | null>;

type ListingArrayKey = FilterListingKeys<Array<any>>;

type ListingBooleanKey = FilterListingKeys<boolean>;

type ListingStringKey = FilterListingKeys<string | null>;

type ListingSortFunction = (direction: SortDirection) => (a: ListingRow, b: ListingRow) => number;

type ListingSortFactory<T extends keyof ListingRow> = (key: T) => ListingSortFunction;

type ListingSortState<T extends keyof ListingRow = keyof ListingRow> = {
  key: T;
  direction: SortDirection;
  fn: ListingSortFunction;
};

type ListingSortStateFactory<T extends keyof ListingRow> = (key: T) => ListingSortState<T>;

function matchSort<T>(
  direction: SortDirection,
  { none, asc, desc }: { none: () => T; asc: () => T; desc: () => T }
): T {
  switch (direction) {
    case SortDirection.None:
      return none();
    case SortDirection.Ascending:
      return asc();
    case SortDirection.Descending:
      return desc();
  }
}

function cycleDirections(initial: SortDirection) {
  return matchSort(initial, {
    none: () => SortDirection.Descending,
    asc: () => SortDirection.None,
    desc: () => SortDirection.Ascending,
  });
}

function updateDirection<T extends keyof ListingRow>(currentState: ListingSortState, key: T) {
  let direction = currentState.direction;
  if (currentState.key !== key) {
    direction = SortDirection.None;
  }

  return cycleDirections(direction);
}

function createPartialSort<T extends keyof ListingRow>(currentState: ListingSortState, key: T) {
  const nextDirection = updateDirection(currentState, key);
  return {
    key: key,
    direction: nextDirection,
  };
}

const intSort: ListingSortFactory<ListingNumericKey> = (k) => (direction) => (a, b) => {
  return matchSort(direction, {
    none: () => 0,
    asc: () => (a[k] ?? 0) - (b[k] ?? 0),
    desc: () => (b[k] ?? 0) - (a[k] ?? 0),
  });
};

const arrayLengthSort: ListingSortFactory<ListingArrayKey> = (k) => (direction) => (a, b) => {
  return matchSort(direction, {
    none: () => 0,
    asc: () => a[k].length - b[k].length,
    desc: () => b[k].length - a[k].length,
  });
};

const boolSort: ListingSortFactory<ListingBooleanKey> = (k) => (direction) => (a, b) => {
  const an = a[k] ? 1 : 0;
  const bn = b[k] ? 1 : 0;
  return matchSort(direction, {
    none: () => 0,
    asc: () => an - bn,
    desc: () => bn - an,
  });
};

const stringSort: ListingSortFactory<ListingStringKey> = (k) => (direction) => (a, b) => {
  return matchSort(direction, {
    none: () => 0,
    asc: () => (a[k] ?? '').localeCompare(b[k] ?? ''),
    desc: () => (b[k] ?? '').localeCompare(a[k] ?? ''),
  });
};

function ListingsTableHeader({
  onSelected,
  className,
  children,
}: PropsWithChildren<ListingsTableHeaderProps>) {
  return (
    <th className={`${className} sort`} onClick={onSelected}>
      {children}
    </th>
  );
}

function ListingsTableRow({ listing }: { listing: ListingRow }) {
  return (
    <tr>
      <td className="price-num tac">{listing.n}</td>
      {listing.crossWorld && (
        <td className="price-server">
          <strong>{listing.world}</strong>
        </td>
      )}
      <td className="price-hq">
        {listing.hq && <img src="/i/game/hq.png" alt="High-Quality" height={14} width={14} />}
      </td>
      <td className="materia">
        {listing.materia.length > 0 && (
          <Tooltip label={<>{listing.materia}</>} placement="right">
            <span>
              <i className="xiv-ItemCategory_Materia"></i>x{listing.materia.length}
            </span>
          </Tooltip>
        )}
      </td>
      <td className="price-current">{listing.pricePerUnit.toLocaleString()}</td>
      <td className="price-qty">{listing.quantity.toLocaleString()}</td>
      <td className="price-total">{listing.total.toLocaleString()}</td>
      {listing.diff && (
        <td
          className={`price-diff ${
            listing.diff >= 20 ? 'price-diff-bad' : listing.diff < -10 ? 'price-diff-good' : ''
          }`}
        >
          <Tooltip
            label={
              <div style={{ textAlign: 'center' }}>
                This listing is {listing.diff > 0 ? '+' : ''}
                {listing.diff == 0 ? '-' : Math.round(listing.diff) + '%'}{' '}
                {listing.diff > 0 ? 'more' : 'less'} than the current <br />
                <strong>Avg. Price Per Unit</strong>: {listing.hq ? '(HQ)' : '(NQ)'}{' '}
                {Math.round(listing.average).toLocaleString()}
              </div>
            }
          >
            <span style={{ width: '100%' }}>{Math.round(listing.diff).toLocaleString()}%</span>
          </Tooltip>
        </td>
      )}
      <td className="price-retainer">
        {listing.retainerName}
        <GameCityIcon
          className="price-city-flag"
          city={listing.retainerCity}
          height={20}
          width={20}
        />
      </td>
      <td className="price-creator">{listing.creatorName}</td>
    </tr>
  );
}

export default function ListingsTable({
  market,
  crossWorld,
  includeDiff,
  start,
  end,
}: ListingsTableProps) {
  const { currentAveragePriceNQ, currentAveragePriceHQ } = market;
  const listingRows: ListingRow[] = (market.listings as any[])
    .slice(start, end)
    .map((listing: any, i: number) => {
      const avgForQuality = includeDiff
        ? listing.hq
          ? currentAveragePriceHQ
          : currentAveragePriceNQ
        : null;
      const diff = (listing.pricePerUnit / avgForQuality) * 100 - 100;
      return {
        n: i + 1,
        hq: listing.hq,
        materia: listing.materia.map((m: { materiaID: number; slotID: number }, i: number) => (
          <Fragment key={i}>
            <GameMateria materiaId={m.materiaID} slotId={m.slotID} />
            <br />
          </Fragment>
        )),
        pricePerUnit: listing.pricePerUnit,
        quantity: listing.quantity,
        total: listing.total,
        retainerName: listing.retainerName,
        retainerCity: listing.retainerCity,
        creatorName: listing.creatorName ? listing.creatorName : '?',
        crossWorld: crossWorld,
        world: crossWorld ? listing.worldName : null,
        average: avgForQuality,
        diff: avgForQuality != null ? diff : null,
      };
    });

  const [sort, setSort] = useState<ListingSortState>({
    key: 'n',
    direction: SortDirection.None,
    fn: intSort('n'),
  });

  const createIntSort: ListingSortStateFactory<ListingNumericKey> = (key) => {
    return { ...createPartialSort(sort, key), fn: intSort(key) };
  };

  const createArrayLengthSort: ListingSortStateFactory<ListingArrayKey> = (key) => {
    return { ...createPartialSort(sort, key), fn: arrayLengthSort(key) };
  };

  const createBoolSort: ListingSortStateFactory<ListingBooleanKey> = (key) => {
    return { ...createPartialSort(sort, key), fn: boolSort(key) };
  };

  const createStringSort: ListingSortStateFactory<ListingStringKey> = (key) => {
    return { ...createPartialSort(sort, key), fn: stringSort(key) };
  };

  listingRows.sort(sort.fn(sort.direction));

  return (
    <div className="table product_table">
      <table className="table-sortable">
        <thead>
          <tr>
            {market.listings.length > 0 ? (
              <>
                <ListingsTableHeader className="tac" onSelected={() => setSort(createIntSort('n'))}>
                  <Trans>#</Trans>
                </ListingsTableHeader>
                {crossWorld && (
                  <ListingsTableHeader onSelected={() => setSort(createStringSort('world'))}>
                    <Trans>Server</Trans>
                  </ListingsTableHeader>
                )}
                <ListingsTableHeader onSelected={() => setSort(createBoolSort('hq'))}>
                  <Trans>HQ</Trans>
                </ListingsTableHeader>
                <ListingsTableHeader onSelected={() => setSort(createArrayLengthSort('materia'))}>
                  <Trans>Mat</Trans>
                </ListingsTableHeader>
                <ListingsTableHeader onSelected={() => setSort(createIntSort('pricePerUnit'))}>
                  <Trans>Price</Trans>
                </ListingsTableHeader>
                <ListingsTableHeader onSelected={() => setSort(createIntSort('quantity'))}>
                  <Trans>QTY</Trans>
                </ListingsTableHeader>
                <ListingsTableHeader onSelected={() => setSort(createIntSort('total'))}>
                  <Trans>Total</Trans>
                </ListingsTableHeader>
                {includeDiff && (
                  <ListingsTableHeader onSelected={() => setSort(createIntSort('diff'))}>
                    <Trans>%Diff</Trans>
                  </ListingsTableHeader>
                )}
                <ListingsTableHeader onSelected={() => setSort(createStringSort('retainerName'))}>
                  <Trans>Retainer</Trans>
                </ListingsTableHeader>
                <ListingsTableHeader onSelected={() => setSort(createStringSort('creatorName'))}>
                  <Trans>Creator</Trans>
                </ListingsTableHeader>
              </>
            ) : (
              <th>
                <Trans>No Listings</Trans>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {listingRows.map((listing, i) => (
            <ListingsTableRow key={i} listing={listing} />
          ))}
          {market.listings.length === 0 && (
            <tr>
              <td>
                <Trans>There are no listings for this item, check back later!</Trans>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
