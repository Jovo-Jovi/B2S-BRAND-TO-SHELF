import type { ReactNode } from "react";

import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import { fillPattern, formatCount } from "../../../lib/locale/format-number";
import { Button } from "../../ui/button/button";
import { DataTable, type DataTableColumn, type DataTableRow } from "../../ui/data-table/data-table";
import { Field } from "../../ui/field/field";
import { TextField } from "../../ui/text-field/text-field";
import styles from "./filtered-data-table.module.css";

export type FilterOption = {
  id: string;
  caption: string;
};

type FilteredDataTableProps = {
  locale: CalendarLocale;
  searchCaption: string;
  searchValue: string;
  onSearch: (value: string) => void;
  filters: FilterOption[];
  active: FilterOption[];
  onToggle: (id: string) => void;
  removePattern: string;
  clearFilters: string;
  onClear: () => void;
  resultCaption: string;
  resultCount: number;
  columns: DataTableColumn[];
  rows: DataTableRow[];
  rangePattern: string;
  regionName: string;
  pageSizeCaption: string;
  listEmpty: string;
  previousPage: string;
  nextPage: string;
  actionsCaption: string;
  empty: ReactNode;
  emptyKind: "first-use" | "no-results";
};

export function FilteredDataTable({
  locale,
  searchCaption,
  searchValue,
  onSearch,
  filters,
  active,
  onToggle,
  removePattern,
  clearFilters,
  onClear,
  resultCaption,
  resultCount,
  columns,
  rows,
  rangePattern,
  regionName,
  pageSizeCaption,
  listEmpty,
  previousPage,
  nextPage,
  actionsCaption,
  empty,
  emptyKind,
}: FilteredDataTableProps) {
  const namedRows = rows.map((row) => ({
    ...row,
    actions: row.actions ? <span data-repeated="row-actions">{row.actions}</span> : undefined,
  }));
  return (
    <section className={styles.bar} data-composition="Filtered data table" data-name-group="row-actions">
      <Field caption={searchCaption}>
        <TextField variant="text" value={searchValue} onValueChange={onSearch} />
      </Field>
      <div className={styles.filters}>
        {filters.map((filter) => (
          <Button key={filter.id} type="button" variant="secondary" onClick={() => onToggle(filter.id)}>
            {filter.caption}
          </Button>
        ))}
      </div>
      <div className={styles.chips} data-name-group="filters">
        {active.map((filter) => (
          <span key={filter.id} data-repeated="filters">
            <Button type="button" variant="quiet" onClick={() => onToggle(filter.id)}>
              {fillPattern(removePattern, { name: filter.caption })}
            </Button>
          </span>
        ))}
      </div>
      <Button type="button" variant="quiet" onClick={onClear}>
        {clearFilters}
      </Button>
      <p className={styles.status} role="status">
        <span>{resultCaption}</span>
        <span>{formatCount(resultCount, locale)}</span>
      </p>
      <DataTable
        locale={locale}
        variant="standard"
        columns={columns}
        rows={namedRows}
        rangePattern={rangePattern}
        regionName={regionName}
        pageSizeCaption={pageSizeCaption}
        listEmpty={listEmpty}
        previousPage={previousPage}
        nextPage={nextPage}
        actionsCaption={actionsCaption}
        empty={{ kind: emptyKind, content: empty }}
        status={resultCaption}
      />
    </section>
  );
}
