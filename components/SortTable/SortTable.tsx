import { Fragment, useState } from 'react';

enum SortDirection {
  Ascending,
  Descending,
}

type FilterKeys<TSource, TTarget> = {
  [K in keyof TSource]: TSource[K] extends TTarget ? K : never;
}[keyof TSource];

type FilterObject<TSource, TTarget> = Pick<TSource, FilterKeys<TSource, TTarget>>;

type NumericKey<T> = FilterKeys<T, number | null | undefined>;

type ArrayKey<T> = FilterKeys<T, Array<unknown>>;

type BooleanKey<T> = FilterKeys<T, boolean>;

type StringKey<T> = FilterKeys<T, string | null | undefined>;

type SortFunction<T> = (direction: SortDirection) => (a: T, b: T) => number;

type SortFactory<T, U extends keyof T = keyof T> = (key: U) => SortFunction<T>;

type SortState<T, U extends keyof T = keyof T> = {
  key: U;
  direction: SortDirection;
  fn: SortFunction<T>;
};

type SortStateFactory<T, U extends keyof T = keyof T> = (key: U) => SortState<T>;

function matchSort<T>(direction: SortDirection, { asc, desc }: { asc: () => T; desc: () => T }): T {
  switch (direction) {
    case SortDirection.Ascending:
      return asc();
    case SortDirection.Descending:
      return desc();
  }
}

function cycleDirections(initial: SortDirection) {
  return matchSort(initial, {
    asc: () => SortDirection.Descending,
    desc: () => SortDirection.Ascending,
  });
}

function updateDirection<T, U extends keyof T = keyof T>(
  currentState: Pick<SortState<T>, 'key' | 'direction'>,
  key: U
) {
  let direction = currentState.direction;
  if (currentState.key !== key) {
    direction = SortDirection.Ascending;
  }

  return cycleDirections(direction);
}

function createPartialSort<T, U extends keyof T = keyof T>(
  currentState: Pick<SortState<T>, 'key' | 'direction'> | null,
  key: U
) {
  const nextDirection = updateDirection(
    currentState ?? {
      key,
      direction: SortDirection.Ascending,
    },
    key
  );
  return {
    key: key,
    direction: nextDirection,
  };
}

function intSortFn<T extends FilterObject<T, number>>(k: NumericKey<T>) {
  return (direction: SortDirection) => (a: T, b: T) => {
    const an = a[k] ?? 0;
    const bn = b[k] ?? 0;
    return matchSort(direction, {
      asc: () => an - bn,
      desc: () => bn - an,
    });
  };
}

function arrayLengthSortFn<T extends FilterObject<T, Array<unknown>>>(k: ArrayKey<T>) {
  return (direction: SortDirection) => (a: T, b: T) => {
    const al: Array<unknown> = a[k];
    const bl: Array<unknown> = b[k];
    return matchSort(direction, {
      asc: () => al.length - bl.length,
      desc: () => bl.length - al.length,
    });
  };
}

function boolSortFn<T extends FilterObject<T, boolean>>(k: BooleanKey<T>) {
  return (direction: SortDirection) => (a: T, b: T) => {
    const an = a[k] ? 1 : -1;
    const bn = b[k] ? 1 : -1;
    return matchSort(direction, {
      asc: () => an - bn,
      desc: () => bn - an,
    });
  };
}

function stringSortFn<T extends FilterObject<T, string>>(k: StringKey<T>) {
  return (direction: SortDirection) => (a: T, b: T) => {
    return matchSort(direction, {
      asc: () => (a[k] ?? '').localeCompare(b[k] ?? ''),
      desc: () => (b[k] ?? '').localeCompare(a[k] ?? ''),
    });
  };
}

interface HeaderUtils<T> {
  intSort: (key: NumericKey<T>) => void;
  arrayLengthSort: (key: ArrayKey<T>) => void;
  boolSort: (key: BooleanKey<T>) => void;
  stringSort: (key: StringKey<T>) => void;
}

interface SortTableProps<T> {
  headers: (ctx: HeaderUtils<T>) => JSX.Element;
  children: (row: T) => JSX.Element;
  className?: string;
  fallback: JSX.Element;
  rows: T[];
  start?: number;
  end?: number;
}

export default function SortTable<T>({
  children,
  headers,
  className,
  rows,
  start,
  end,
  fallback,
}: SortTableProps<T>) {
  const intSort: SortFactory<T, NumericKey<T>> = intSortFn;
  const arrayLengthSort: SortFactory<T, ArrayKey<T>> = arrayLengthSortFn;
  const boolSort: SortFactory<T, BooleanKey<T>> = boolSortFn;
  const stringSort: SortFactory<T, StringKey<T>> = stringSortFn;

  const [sort, setSort] = useState<SortState<T> | null>(null);

  const createIntSort: SortStateFactory<T, NumericKey<T>> = (key) => {
    return { ...createPartialSort(sort, key), fn: intSort(key) };
  };

  const createArrayLengthSort: SortStateFactory<T, ArrayKey<T>> = (key) => {
    return { ...createPartialSort(sort, key), fn: arrayLengthSort(key) };
  };

  const createBoolSort: SortStateFactory<T, BooleanKey<T>> = (key) => {
    return { ...createPartialSort(sort, key), fn: boolSort(key) };
  };

  const createStringSort: SortStateFactory<T, StringKey<T>> = (key) => {
    return { ...createPartialSort(sort, key), fn: stringSort(key) };
  };

  if (sort != null) {
    rows.sort(sort.fn(sort.direction));
  }

  return (
    <table className={className}>
      <thead>
        <tr>
          {headers({
            intSort: (key) => setSort(createIntSort(key)),
            arrayLengthSort: (key) => setSort(createArrayLengthSort(key)),
            boolSort: (key) => setSort(createBoolSort(key)),
            stringSort: (key) => setSort(createStringSort(key)),
          })}
        </tr>
      </thead>
      <tbody>
        {rows.slice(start, end).map((row, i) => (
          <Fragment key={i}>{children(row)}</Fragment>
        ))}
        {rows.length === 0 && fallback}
      </tbody>
    </table>
  );
}
