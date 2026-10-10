"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import { fillPattern, formatCount } from "../../../lib/locale/format-number";
import { Button } from "../button/button";
import { Glyph } from "../glyphs";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./data-table.module.css";

export type DataTableVariant = "standard" | "selectable";
export type DataTableSize = "compact" | "comfortable";

export type DataTableVisual =
  | "default"
  | "hover"
  | "focus"
  | "loading"
  | "error"
  | "empty"
  | "selected";

export const PAGE_SIZES = [25, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export type DataTableColumn = {
  key: string;
  caption: string;
  kind: "text" | "identifier" | "number" | "prose";
  sortable?: boolean;
};

export type DataTableRow = {
  id: string;
  cells: Record<string, string>;
  actions?: ReactNode;
};

export type DataTableSort = {
  key: string;
  direction: "ascending" | "descending";
} | null;

export type DataTableEmpty = {
  kind: "first-use" | "no-results";
  content: ReactNode;
};

export type DataTableFailure = {
  message: string;
  requestIdentifier: string;
  retry: string;
  onRetry: () => void;
};

type DataTableProps = {
  variant?: DataTableVariant;
  size?: DataTableSize;
  state?: DataTableVisual;
  locale: CalendarLocale;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  rangePattern: string;
  regionName: string;
  pageSizeCaption: string;
  listEmpty: string;
  previousPage: string;
  nextPage: string;
  selectAllName?: string;
  selectRowName?: string;
  actionsCaption?: string;
  empty?: DataTableEmpty;
  failure?: DataTableFailure;
  bulkActions?: ReactNode;
  status?: string;
  loading?: boolean;
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  selectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
};

function tokenDelay(name: string): number | null {
  if (typeof document === "undefined") {
    return null;
  }
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const match = /^(\d+(?:\.\d+)?)ms$/.exec(raw);
  return match ? Number(match[1]) : null;
}

export function DataTable({
  variant = "standard",
  size,
  state,
  locale,
  columns,
  rows,
  rangePattern,
  regionName,
  pageSizeCaption,
  listEmpty,
  previousPage,
  nextPage,
  selectAllName = "",
  selectRowName = "",
  actionsCaption,
  empty,
  failure,
  bulkActions,
  status,
  loading = false,
  sort: sortProp,
  onSortChange,
  selectedIds = [],
  onSelectedIdsChange,
}: DataTableProps) {
  const pageSizeId = useId();
  const allRef = useRef<HTMLInputElement>(null);
  const [pageSize, setPageSize] = useState<PageSize>(PAGE_SIZES[0]);
  const [page, setPage] = useState(0);
  const [internalSort, setInternalSort] = useState<DataTableSort>(null);
  const [revealed, setRevealed] = useState(false);
  const sort = sortProp !== undefined ? sortProp : internalSort;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  const visible = rows.slice(current * pageSize, current * pageSize + pageSize);
  const total = rows.length;
  const from = total === 0 ? 0 : current * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(total, current * pageSize + visible.length);
  const range = fillPattern(rangePattern, {
    from: formatCount(from, locale),
    to: formatCount(to, locale),
    total: formatCount(total, locale),
  });
  const showLoading = state === "loading" || (loading && revealed && state === undefined);
  const showError = state === "error" || (state === undefined && !showLoading && failure !== undefined);
  const showEmpty = state === "empty" || (state === undefined && !showLoading && !showError && total === 0 && empty !== undefined);
  const visual =
    state ??
    (showLoading ? "loading" : showError ? "error" : showEmpty ? "empty" : selectedIds.length > 0 ? "selected" : "default");
  const selectable = variant === "selectable";
  const span = columns.length + (selectable ? 1 : 0) + (actionsCaption ? 1 : 0);
  const visibleIds = visible.map((row) => row.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const someSelected = visibleIds.some((id) => selectedIds.includes(id));

  useEffect(() => {
    if (!loading || state === "loading") {
      return;
    }
    const ms = tokenDelay("--b2s-delay-loader");
    if (ms === null) {
      return;
    }
    const timer = window.setTimeout(() => setRevealed(true), ms);
    return () => window.clearTimeout(timer);
  }, [loading, state]);

  useEffect(() => {
    if (allRef.current) {
      allRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  function toggleSort(key: string) {
    const currentDirection = sort?.key === key ? sort.direction : undefined;
    const next: DataTableSort =
      currentDirection === "ascending"
        ? { key, direction: "descending" }
        : currentDirection === "descending"
          ? null
          : { key, direction: "ascending" };
    setInternalSort(next);
    onSortChange?.(next);
  }

  function toggleRow(id: string) {
    const next = selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id];
    onSelectedIdsChange?.(next);
  }

  function toggleAll() {
    if (allSelected) {
      onSelectedIdsChange?.(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }
    onSelectedIdsChange?.([...new Set([...selectedIds, ...visibleIds])]);
  }

  function renderCell(row: DataTableRow, column: DataTableColumn) {
    const value = row.cells[column.key] ?? "";
    if (column.kind === "identifier") {
      return (
        <span className={styles.identifier} dir="ltr">
          {value}
        </span>
      );
    }
    if (column.kind === "number") {
      return <span className={styles.number}>{value}</span>;
    }
    if (column.kind === "prose") {
      return (
        <Tooltip text={value}>
          <span tabIndex={0} className={styles.prose}>
            {value}
          </span>
        </Tooltip>
      );
    }
    return value;
  }

  return (
    <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      <div className={styles.scroller} tabIndex={0} role="region" aria-label={regionName}>
        <table className={styles.table} aria-busy={showLoading || undefined}>
          <thead>
            <tr>
              {selectable ? (
                <th scope="col" className={styles.headerSticky}>
                  <span className={styles.checkWrap}>
                    <input
                      ref={allRef}
                      className={styles.check}
                      type="checkbox"
                      aria-label={selectAllName}
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                    <Glyph className={styles.mark} name="check" />
                  </span>
                </th>
              ) : null}
              {columns.map((column, index) => {
                const sorted = column.sortable ? (sort?.key === column.key ? sort.direction : "none") : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={index === 0 && !selectable ? styles.headerSticky : styles.headerCell}
                    aria-sort={sorted}
                  >
                    {column.sortable ? (
                      <Button variant="quiet" onClick={() => toggleSort(column.key)}>
                        {column.caption}
                      </Button>
                    ) : (
                      column.caption
                    )}
                  </th>
                );
              })}
              {actionsCaption ? (
                <th scope="col" className={styles.headerCell}>
                  {actionsCaption}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {showLoading
              ? Array.from({ length: pageSize }, (_, index) => (
                  <tr key={index}>
                    {Array.from({ length: span }, (_, cell) => (
                      <td key={cell} className={styles.cell}>
                        <Skeleton variant="text" state="loading" />
                      </td>
                    ))}
                  </tr>
                ))
              : null}
            {showError && failure ? (
              <tr>
                <td className={styles.cell} colSpan={span}>
                  <p className={styles.message}>{failure.message}</p>
                  <span className={styles.identifier} dir="ltr">
                    {failure.requestIdentifier}
                  </span>
                  <Button onClick={failure.onRetry}>{failure.retry}</Button>
                </td>
              </tr>
            ) : null}
            {showEmpty && empty ? (
              <tr data-empty={empty.kind}>
                <td className={styles.cell} colSpan={span}>
                  {empty.content}
                </td>
              </tr>
            ) : null}
            {!showLoading && !showError && !showEmpty
              ? visible.map((row) => {
                  const selected = selectedIds.includes(row.id);
                  return (
                    <tr key={row.id} className={styles.row} data-selected={selected ? "true" : "false"}>
                      {selectable ? (
                        <td className={styles.stickyCell}>
                          <span className={styles.checkWrap}>
                            <input
                              className={styles.check}
                              type="checkbox"
                              aria-label={selectRowName}
                              checked={selected}
                              onChange={() => toggleRow(row.id)}
                            />
                            <Glyph className={styles.mark} name="check" />
                          </span>
                        </td>
                      ) : null}
                      {columns.map((column, index) => (
                        <td key={column.key} className={index === 0 && !selectable ? styles.stickyCell : styles.cell}>
                          {renderCell(row, column)}
                        </td>
                      ))}
                      {actionsCaption ? <td className={styles.actions}>{row.actions}</td> : null}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
      {selectable && (selectedIds.length > 0 || state === "selected") ? (
        <div className={styles.bulk}>
          <span className={styles.number}>{formatCount(selectedIds.length, locale)}</span>
          {bulkActions}
        </div>
      ) : null}
      <div className={styles.pager}>
        <p className={styles.range}>{range}</p>
        <label className={styles.pageSize} htmlFor={pageSizeId}>
          {pageSizeCaption}
        </label>
        <Select
          id={pageSizeId}
          variant="native"
          size={size}
          options={PAGE_SIZES.map((item) => ({ value: String(item), caption: formatCount(item, locale) }))}
          value={String(pageSize)}
          noResults={listEmpty}
          onValueChange={(next) => {
            const match = PAGE_SIZES.find((item) => String(item) === next);
            if (!match) {
              return;
            }
            setPageSize(match);
            setPage(0);
          }}
        />
        <Button
          variant="quiet"
          accessibleName={previousPage}
          disabled={current === 0}
          iconStart={<Glyph name="previous" />}
          onClick={() => setPage(Math.max(0, current - 1))}
        />
        <Button
          variant="quiet"
          accessibleName={nextPage}
          disabled={current >= pageCount - 1}
          iconStart={<Glyph name="next" />}
          onClick={() => setPage(Math.min(pageCount - 1, current + 1))}
        />
      </div>
      <div className={styles.status} role="status">
        {status ?? range}
      </div>
    </div>
  );
}
