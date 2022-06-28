import { Trans } from '@lingui/macro';
import { Fragment, PropsWithChildren } from 'react';
import GameCityIcon from '../GameCityIcon/GameCityIcon';
import GameMateria from '../GameMateria/GameMateria';
import SortTable from '../SortTable/SortTable';
import Tooltip from '../Tooltip/Tooltip';

interface ListingsTableProps {
  listings: any[];
  averageNq: number;
  averageHq: number;
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
            Math.ceil(listing.diff) >= 20
              ? 'price-diff-bad'
              : Math.ceil(listing.diff) < -10
              ? 'price-diff-good'
              : ''
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
            <span style={{ width: '100%' }}>
              {listing.diff > 0 ? '+' : ''}
              {Math.ceil(listing.diff).toLocaleString()}%
            </span>
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
  listings,
  averageNq,
  averageHq,
  crossWorld,
  includeDiff,
  start,
  end,
}: ListingsTableProps) {
  const listingRows: ListingRow[] = listings
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit)
    .map((listing, i) => {
      const avgForQuality: any = includeDiff ? (listing.hq ? averageHq : averageNq) : null;
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
        crossWorld,
        world: crossWorld ? listing.worldName : null,
        average: avgForQuality,
        diff: avgForQuality != null ? (listing.pricePerUnit / avgForQuality) * 100 - 100 : null,
      };
    });
  return (
    <div className="table product_table">
      <SortTable
        className="table-sortable"
        rows={listingRows}
        start={start}
        end={end}
        headers={(ctx) =>
          listingRows.length > 0 ? (
            <>
              <ListingsTableHeader className="tac" onSelected={() => ctx.intSort('n')}>
                <Trans>#</Trans>
              </ListingsTableHeader>
              {crossWorld && (
                <ListingsTableHeader onSelected={() => ctx.stringSort('world')}>
                  <Trans>Server</Trans>
                </ListingsTableHeader>
              )}
              <ListingsTableHeader onSelected={() => ctx.boolSort('hq')}>
                <Trans>HQ</Trans>
              </ListingsTableHeader>
              <ListingsTableHeader onSelected={() => ctx.arrayLengthSort('materia')}>
                <Trans>Mat</Trans>
              </ListingsTableHeader>
              <ListingsTableHeader onSelected={() => ctx.intSort('pricePerUnit')}>
                <Trans>Price</Trans>
              </ListingsTableHeader>
              <ListingsTableHeader onSelected={() => ctx.intSort('quantity')}>
                <Trans>QTY</Trans>
              </ListingsTableHeader>
              <ListingsTableHeader onSelected={() => ctx.intSort('total')}>
                <Trans>Total</Trans>
              </ListingsTableHeader>
              {includeDiff && (
                <ListingsTableHeader onSelected={() => ctx.intSort('diff')}>
                  <Trans>%Diff</Trans>
                </ListingsTableHeader>
              )}
              <ListingsTableHeader onSelected={() => ctx.stringSort('retainerName')}>
                <Trans>Retainer</Trans>
              </ListingsTableHeader>
              <ListingsTableHeader onSelected={() => ctx.stringSort('creatorName')}>
                <Trans>Creator</Trans>
              </ListingsTableHeader>
            </>
          ) : (
            <th>
              <Trans>No Listings</Trans>
            </th>
          )
        }
        fallback={
          <tr>
            <td>
              <Trans>There are no listings for this item, check back later!</Trans>
            </td>
          </tr>
        }
      >
        {(listing) => <ListingsTableRow listing={listing} />}
      </SortTable>
    </div>
  );
}
