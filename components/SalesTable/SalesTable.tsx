import { Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { PropsWithChildren } from 'react';
import SortTable from '../SortTable/SortTable';
import Tooltip from '../Tooltip/Tooltip';

interface SalesTableProps {
  market: any;
  crossWorld: boolean;
  includeDiff: boolean;
  start?: number;
  end?: number;
}

interface SalesTableHeaderProps {
  onSelected: () => void;
  className?: string;
}

type SaleRow = {
  n: number;
  hq: boolean;
  pricePerUnit: number;
  quantity: number;
  total: number;
  buyerName: string;
  timestamp: number;
} & ({ average: number; diff: number } | { average: null; diff: null }) &
  ({ crossWorld: true; world: string } | { crossWorld: false; world: null });

function SalesTableHeader({
  onSelected,
  className,
  children,
}: PropsWithChildren<SalesTableHeaderProps>) {
  return (
    <th className={`${className} sort`} onClick={onSelected}>
      {children}
    </th>
  );
}

function SalesTableRow({ sale }: { sale: SaleRow }) {
  const relativeTime = new RelativeTime();
  return (
    <tr>
      <td className="price-num tac">{sale.n}</td>
      {sale.crossWorld && (
        <td className="price-server">
          <strong>{sale.world}</strong>
        </td>
      )}
      <td className="price-hq">
        {sale.hq && <img src="/i/game/hq.png" alt="High-Quality" height={14} width={14} />}
      </td>
      <td className="price-current">{sale.pricePerUnit.toLocaleString()}</td>
      <td className="price-qty">{sale.quantity.toLocaleString()}</td>
      <td className="price-total">{sale.total.toLocaleString()}</td>
      {sale.diff && (
        <td
          className={`price-diff ${
            sale.diff >= 20 ? 'price-diff-bad' : sale.diff < -10 ? 'price-diff-good' : ''
          }`}
        >
          <Tooltip
            label={
              <div style={{ textAlign: 'center' }}>
                This listing is {sale.diff > 0 ? '+' : ''}
                {sale.diff == 0 ? '-' : Math.round(sale.diff) + '%'}{' '}
                {sale.diff > 0 ? 'more' : 'less'} than the current <br />
                <strong>Avg. Price Per Unit</strong>: {sale.hq ? '(HQ)' : '(NQ)'}{' '}
                {Math.round(sale.average).toLocaleString()}
              </div>
            }
          >
            <span style={{ width: '100%' }}>{Math.round(sale.diff).toLocaleString()}%</span>
          </Tooltip>
        </td>
      )}
      <td className="price-buyer">{sale.buyerName}</td>
      <td className="price-date">{relativeTime.from(new Date(sale.timestamp * 1000))}</td>
    </tr>
  );
}

export default function SalesTable({
  market,
  crossWorld,
  includeDiff,
  start,
  end,
}: SalesTableProps) {
  const { averagePriceNQ, averagePriceHQ } = market;
  const saleRows: SaleRow[] = (market.recentHistory as any[])
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(start, end)
    .map((sale, i) => {
      const avgForQuality = includeDiff ? (sale.hq ? averagePriceHQ : averagePriceNQ) : null;
      const diff = (sale.pricePerUnit / avgForQuality) * 100 - 100;
      return {
        n: i + 1,
        hq: sale.hq,
        pricePerUnit: sale.pricePerUnit,
        quantity: sale.quantity,
        total: sale.total,
        buyerName: sale.buyerName,
        timestamp: sale.timestamp,
        crossWorld,
        world: crossWorld ? sale.worldName : null,
        average: avgForQuality,
        diff: avgForQuality != null ? diff : null,
      };
    });
  return (
    <div className="table product_table">
      <SortTable
        className="table-sortable"
        rows={saleRows}
        headers={(ctx) =>
          saleRows.length > 0 ? (
            <>
              <SalesTableHeader className="tac" onSelected={() => ctx.intSort('n')}>
                <Trans>#</Trans>
              </SalesTableHeader>
              {crossWorld && (
                <SalesTableHeader onSelected={() => ctx.stringSort('world')}>
                  <Trans>Server</Trans>
                </SalesTableHeader>
              )}
              <SalesTableHeader onSelected={() => ctx.boolSort('hq')}>
                <Trans>HQ</Trans>
              </SalesTableHeader>
              <SalesTableHeader onSelected={() => ctx.intSort('pricePerUnit')}>
                <Trans>Price</Trans>
              </SalesTableHeader>
              <SalesTableHeader onSelected={() => ctx.intSort('quantity')}>
                <Trans>QTY</Trans>
              </SalesTableHeader>
              <SalesTableHeader onSelected={() => ctx.intSort('total')}>
                <Trans>Total</Trans>
              </SalesTableHeader>
              {includeDiff && (
                <SalesTableHeader onSelected={() => ctx.intSort('diff')}>
                  <Trans>%Diff</Trans>
                </SalesTableHeader>
              )}
              <SalesTableHeader onSelected={() => ctx.stringSort('buyerName')}>
                <Trans>Buyer</Trans>
              </SalesTableHeader>
              <SalesTableHeader onSelected={() => ctx.intSort('timestamp')}>
                <Trans>Date</Trans>
              </SalesTableHeader>
            </>
          ) : (
            <th>
              <Trans>Really rare!?</Trans>
            </th>
          )
        }
        fallback={
          <tr>
            <td>
              <Trans>There is currently no recorded history for this item on Universalis.</Trans>
            </td>
          </tr>
        }
      >
        {(sale) => <SalesTableRow sale={sale} />}
      </SortTable>
    </div>
  );
}
