import { Trans } from '@lingui/macro';
import { PropsWithChildren, Suspense } from 'react';
import SortTable from '../../SortTable/SortTable';
import Tooltip from '../../Tooltip/Tooltip';
import Image from 'next/image';
import ago from 's-ago';
import { DataCenter } from '../../../types/game/DataCenter';
import {
  formatPercentDiffSimple,
  getPercentDiffLabelClass,
  PercentDiffTooltipBody,
  Quality,
  shouldDisplayDiffTooltopEver,
} from '../utils';

interface SalesTableProps {
  sales: any[];
  averageHq: number;
  averageNq: number;
  crossWorld: boolean;
  includeDiff: boolean;
  start?: number;
  end?: number;
  crossDc?: boolean;
  dcs?: DataCenter[];
}

interface SalesTableHeaderProps {
  onSelected: () => void;
  className?: string;
}

interface SaleRow {
  n: number;
  hq: boolean;
  pricePerUnit: number;
  quantity: number;
  total: number;
  buyerName: string;
  timestamp: number;
  average: number | null | undefined;
  diff: number | null | undefined;
  crossWorld: boolean | null | undefined;
  world: string | null | undefined;
  crossDc: boolean | null | undefined;
  dc: string | null | undefined;
}

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
  return (
    <tr>
      <td className="price-num tac">{sale.n}</td>
      {(sale.crossWorld || sale.crossDc) && (
        <td className="price-server">
          <strong>{sale.world}</strong>
        </td>
      )}
      {sale.crossDc && (
        <td className="price-server">
          <strong>{sale.dc}</strong>
        </td>
      )}
      <td className="price-hq">
        {sale.hq && <Image src="/i/game/hq.png" alt="High-Quality" height={14} width={14} />}
      </td>
      <td className="price-current">{sale.pricePerUnit.toLocaleString()}</td>
      <td className="price-qty">{sale.quantity.toLocaleString()}</td>
      <td className="price-total">{sale.total.toLocaleString()}</td>
      {sale.diff != null && (
        <td className={`price-diff ${getPercentDiffLabelClass(sale.diff)}`}>
          <Tooltip
            enabled={shouldDisplayDiffTooltopEver(sale.diff)}
            label={
              <div style={{ textAlign: 'center' }}>
                <PercentDiffTooltipBody
                  diff={sale.diff}
                  nounSingular="sale"
                  price={sale.pricePerUnit}
                  referencePrice={sale.average!}
                  quality={sale.hq ? Quality.HighQuality : Quality.NormalQuality}
                />
              </div>
            }
          >
            <span style={{ width: '100%' }}>{formatPercentDiffSimple(sale.diff)}</span>
          </Tooltip>
        </td>
      )}
      <td className="price-buyer">{sale.buyerName}</td>
      <td className="price-date">
        <Suspense>{ago(new Date(sale.timestamp * 1000))}</Suspense>
      </td>
    </tr>
  );
}

export default function SalesTable({
  sales,
  averageHq,
  averageNq,
  crossWorld,
  crossDc,
  dcs,
  includeDiff,
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
        crossDc,
        dc: crossDc ? dcs?.find((dc) => dc.worlds.some((w) => w.id === sale.worldID))?.name : null,
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
              {(crossWorld || crossDc) && (
                <SalesTableHeader onSelected={() => ctx.stringSort('world')}>
                  <Trans>Server</Trans>
                </SalesTableHeader>
              )}
              {crossDc && (
                <SalesTableHeader onSelected={() => ctx.stringSort('dc')}>
                  <Trans>Data Center</Trans>
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
