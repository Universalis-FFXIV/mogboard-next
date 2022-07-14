import { Trans } from '@lingui/macro';
import RelativeTime from '@yaireo/relative-time';
import { PropsWithChildren, Suspense } from 'react';
import SortTable from '../SortTable/SortTable';
import Tooltip from '../Tooltip/Tooltip';
import Image from 'next/image';
import { Language } from '../../types/universalis/lang';

interface SalesTableProps {
  sales: any[];
  averageHq: number;
  averageNq: number;
  crossWorld: boolean;
  includeDiff: boolean;
  lang: Language;
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

function SalesTableRow({ sale, lang }: { sale: SaleRow; lang: Language }) {
  let relativeTime: RelativeTime;
  try {
    relativeTime = new RelativeTime();
  } catch (err) {
    console.error(err);
    return <tr />;
  }

  return (
    <tr>
      <td className="price-num tac">{sale.n}</td>
      {sale.crossWorld && (
        <td className="price-server">
          <strong>{sale.world}</strong>
        </td>
      )}
      <td className="price-hq">
        {sale.hq && <Image src="/i/game/hq.png" alt="High-Quality" height={14} width={14} />}
      </td>
      <td className="price-current">{sale.pricePerUnit.toLocaleString()}</td>
      <td className="price-qty">{sale.quantity.toLocaleString()}</td>
      <td className="price-total">{sale.total.toLocaleString()}</td>
      {sale.diff != null && (
        <td
          className={`price-diff ${
            Math.ceil(sale.diff) >= 20
              ? 'price-diff-bad'
              : Math.ceil(sale.diff) < -10
              ? 'price-diff-good'
              : ''
          }`}
        >
          <Tooltip
            label={
              <div style={{ textAlign: 'center' }}>
                This listing is {sale.diff > 0 ? '+' : ''}
                {sale.diff === 0 ? '-' : Math.round(sale.diff).toLocaleString() + '%'}{' '}
                {sale.diff > 0 ? 'more' : 'less'} than the current <br />
                <strong>Avg. Price Per Unit</strong>: {sale.hq ? '(HQ)' : '(NQ)'}{' '}
                {Math.round(sale.average).toLocaleString()}
              </div>
            }
          >
            <span style={{ width: '100%' }}>
              {sale.diff == 0
                ? '-'
                : (sale.diff > 0 ? '+' : '') + Math.ceil(sale.diff).toLocaleString() + '%'}
            </span>
          </Tooltip>
        </td>
      )}
      <td className="price-buyer">{sale.buyerName}</td>
      <td className="price-date">
        <Suspense>{relativeTime.from(new Date(sale.timestamp * 1000))}</Suspense>
      </td>
    </tr>
  );
}

export default function SalesTable({
  sales,
  averageHq,
  averageNq,
  crossWorld,
  includeDiff,
  lang,
  start,
  end,
}: SalesTableProps) {
  const saleRows: SaleRow[] = sales
    .sort((a, b) => b.timestamp - a.timestamp)
    .map((sale, i) => {
      const avgForQuality: any = includeDiff ? (sale.hq ? averageHq : averageNq) : null;
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
        diff: avgForQuality != null ? (sale.pricePerUnit / avgForQuality) * 100 - 100 : null,
      };
    });
  return (
    <div className="table product_table">
      <SortTable
        className="table-sortable"
        rows={saleRows}
        start={start}
        end={end}
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
        {(sale) => <SalesTableRow sale={sale} lang={lang} />}
      </SortTable>
    </div>
  );
}
