"use client";

import { useLayoutEffect, useState, type ReactNode } from "react";

import type en from "../../dictionaries/en.json";
import { BilingualField, type BilingualFieldVisual } from "@/components/ui/bilingual-field/bilingual-field";
import { BrandFrame, type BrandFrameVisual } from "@/components/ui/brand-frame/brand-frame";
import { Button, type ButtonVisual } from "@/components/ui/button/button";
import { Checkbox, type CheckboxVisual } from "@/components/ui/checkbox/checkbox";
import { ColorField, type ColorFieldVisual } from "@/components/ui/color-field/color-field";
import { DataTable, type DataTableVisual } from "@/components/ui/data-table/data-table";
import { byteUnits, dateNames } from "@/components/ui/data-catalog";
import { DateField, type DateFieldCopy, type DateFieldVisual } from "@/components/ui/date-field/date-field";
import { Dialog, type DialogVisual } from "@/components/ui/dialog/dialog";
import { Field, type FieldVisual } from "@/components/ui/field/field";
import { FileDrop, type FileDropCopy, type FileDropVisual } from "@/components/ui/file-drop/file-drop";
import { Glyph } from "@/components/ui/glyphs";
import { Notice, type NoticeVisual } from "@/components/ui/notice/notice";
import { RadioGroup, type RadioGroupVisual } from "@/components/ui/radio-group/radio-group";
import { Select, type SelectVisual } from "@/components/ui/select/select";
import { Skeleton, type SkeletonVisual } from "@/components/ui/skeleton/skeleton";
import { Spinner, type SpinnerVisual } from "@/components/ui/spinner/spinner";
import { StatusBadge, type StatusBadgeVisual } from "@/components/ui/status-badge/status-badge";
import { Switch, type SwitchVisual } from "@/components/ui/switch/switch";
import { Tabs, type TabsVisual } from "@/components/ui/tabs/tabs";
import { TextField, type TextFieldVisual } from "@/components/ui/text-field/text-field";
import { TextLink, type TextLinkVisual } from "@/components/ui/text-link/text-link";
import { Tooltip, type TooltipVisual } from "@/components/ui/tooltip/tooltip";
import { AppShell } from "@/components/shared/app-shell/app-shell";
import { EmptyState } from "@/components/shared/empty-state/empty-state";
import { ErrorState } from "@/components/shared/error-state/error-state";
import { FilteredDataTable } from "@/components/shared/filtered-data-table/filtered-data-table";
import type { ThemeChoice } from "@/components/shared/page-header/page-header";

import { BrandStep } from "./brand-step";
import type { Locale } from "../../dictionaries";

import { GALLERY_COVERAGE, type GalleryTheme } from "./coverage";

type GalleryCopy = (typeof en)["gallery"];
type DataCopy = (typeof en)["data"];

type GalleryProps = {
  locale: Locale;
  theme: GalleryTheme;
  copy: GalleryCopy;
  data: DataCopy;
};

function swatch(digits: string): string {
  return `#${digits}`;
}

const STATE_LABEL: Record<string, keyof GalleryCopy> = {
  default: "stateDefault",
  hover: "stateHover",
  focus: "stateFocus",
  active: "stateActive",
  disabled: "stateDisabled",
  loading: "stateLoading",
  error: "stateError",
  empty: "stateEmpty",
  complete: "stateComplete",
  selected: "stateSelected",
  checked: "stateChecked",
  done: "stateDone",
  incomplete: "stateIncomplete",
};

const PRIMITIVE_LABEL: Record<string, keyof GalleryCopy> = {
  Button: "primitiveButton",
  TextLink: "primitiveTextLink",
  Field: "primitiveField",
  TextField: "primitiveTextField",
  BilingualField: "primitiveBilingualField",
  Select: "primitiveSelect",
  Checkbox: "primitiveCheckbox",
  RadioGroup: "primitiveRadioGroup",
  Switch: "primitiveSwitch",
  Skeleton: "primitiveSkeleton",
  Spinner: "primitiveSpinner",
  Tabs: "primitiveTabs",
  Dialog: "primitiveDialog",
  Notice: "primitiveNotice",
  Tooltip: "primitiveTooltip",
  StatusBadge: "primitiveStatusBadge",
  ColorField: "primitiveColorField",
  BrandFrame: "primitiveBrandFrame",
  DateField: "primitiveDateField",
  FileDrop: "primitiveFileDrop",
  DataTable: "primitiveDataTable",
};

function ThemeAttribute({ theme }: { theme: GalleryTheme }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [theme]);
  return null;
}

function specimen(
  primitive: string,
  state: string,
  locale: Locale,
  copy: GalleryCopy,
  data: DataCopy,
): ReactNode {
  const options = [
    { value: "mint", caption: copy.sampleMint },
    { value: "rose", caption: copy.sampleRose },
  ];
  const names = { en: copy.sampleLocaleEn, ar: copy.sampleLocaleAr };
  const missing = { en: copy.sampleMissingEn, ar: copy.sampleMissingAr };

  switch (primitive) {
    case "Button":
      return (
        <Button
          state={state as ButtonVisual}
          disabled={state === "disabled"}
          loading={state === "loading"}
          iconStart={<Glyph name="previous" />}
        >
          <span data-label="">{copy.sampleVerb}</span>
        </Button>
      );
    case "TextLink":
      return (
        <TextLink href={`/${locale}/gallery`} variant="standalone" state={state as TextLinkVisual}>
          {copy.sampleGuide}
        </TextLink>
      );
    case "Field":
      return (
        <Field
          caption={copy.sampleCaption}
          state={state as FieldVisual}
          help={copy.sampleHelp}
          error={state === "error" ? copy.sampleError : undefined}
          disabled={state === "disabled"}
        >
          <input />
        </Field>
      );
    case "TextField":
      return (
        <Field caption={copy.sampleCaption} error={state === "error" ? copy.sampleError : undefined}>
          <TextField
            variant={state === "default" ? "identifier" : "text"}
            state={state as TextFieldVisual}
            value={state === "empty" ? "" : copy.sampleSku}
            placeholder={copy.samplePlaceholder}
            disabled={state === "disabled"}
            loading={state === "loading"}
            clearAccessibleName={copy.sampleClear}
          />
        </Field>
      );
    case "BilingualField":
      return (
        <BilingualField
          caption={copy.sampleCaption}
          state={state as BilingualFieldVisual}
          defaultLocale={locale}
          values={{
            en: state === "complete" ? copy.sampleMint : "",
            ar: state === "complete" ? copy.sampleMint : "",
          }}
          localeName={names}
          missingText={missing}
          completeText={copy.sampleComplete}
          error={state === "error" ? copy.sampleBilingualError : undefined}
          errorLocale="ar"
          disabled={state === "disabled"}
        />
      );
    case "Select":
      return (
        <Field caption={copy.sampleLine} error={state === "error" ? copy.sampleChoose : undefined}>
          <Select
            state={state as SelectVisual}
            variant={state === "empty" || state === "active" || state === "selected" ? "searchable" : "native"}
            options={options}
            value={state === "selected" ? "mint" : ""}
            noResults={copy.sampleNoResults}
            disabled={state === "disabled"}
            loading={state === "loading"}
          />
        </Field>
      );
    case "Checkbox":
      return (
        <Checkbox
          caption={copy.sampleArchive}
          state={state as CheckboxVisual}
          checked={state === "checked"}
          disabled={state === "disabled"}
          invalid={state === "error"}
        />
      );
    case "RadioGroup":
      return (
        <RadioGroup
          caption={copy.sampleLanguage}
          state={state as RadioGroupVisual}
          options={options}
          value={state === "checked" ? "mint" : ""}
          disabled={state === "disabled"}
          invalid={state === "error"}
        />
      );
    case "Switch":
      return (
        <Switch
          caption={copy.sampleNotifications}
          onText={copy.sampleOn}
          offText={copy.sampleOff}
          state={state as SwitchVisual}
          checked={state === "checked"}
          disabled={state === "disabled"}
          loading={state === "loading"}
          error={state === "error"}
        />
      );
    case "Skeleton":
      return (
        <div aria-busy="true">
          <Skeleton state={state as SkeletonVisual} />
        </div>
      );
    case "Spinner":
      return (
        <div aria-busy="true">
          {copy.sampleWorking}
          <Spinner state={state as SpinnerVisual} />
        </div>
      );
    case "Tabs":
      return (
        <Tabs
          state={state as TabsVisual}
          selectedId="identity"
          tabs={[
            { id: "identity", caption: copy.sampleIdentity, panel: copy.sampleLegal },
            { id: "trading", caption: copy.sampleTrading, panel: copy.sampleTradingBody, disabled: state === "disabled" },
          ]}
        />
      );
    case "Dialog":
      return (
        <Dialog
          open
          variant="standard"
          size="small"
          state={state as DialogVisual}
          title={copy.sampleDialogTitle}
          description={copy.sampleDialogDescription}
          closeCaption={copy.sampleClose}
          onClose={() => undefined}
          failure={
            state === "error"
              ? {
                  title: copy.sampleNotSaved,
                  message: copy.sampleTryAgain,
                  requestIdentifier: copy.sampleRequest,
                  copyCaption: copy.sampleCopy,
                  dismissCaption: copy.sampleDismiss,
                }
              : undefined
          }
          footer={
            <Button type="button" loading={state === "loading"}>
              {copy.sampleKeep}
            </Button>
          }
        >
          {copy.sampleDialogBody}
        </Dialog>
      );
    case "Notice":
      return (
        <Notice
          variant="inline"
          tone={state === "error" ? "danger" : "info"}
          state={state as NoticeVisual}
          title={copy.sampleSaved}
          message={copy.sampleStored}
          icon={<Glyph name="check" />}
          requestIdentifier={state === "error" ? copy.sampleRequest : undefined}
          copyCaption={copy.sampleCopy}
          dismissCaption={copy.sampleDismiss}
        />
      );
    case "Tooltip":
      return (
        <Tooltip text={copy.sampleTooltip} state={state as TooltipVisual}>
          <Button type="button">{copy.sampleName}</Button>
        </Tooltip>
      );
    case "StatusBadge":
      return (
        <StatusBadge
          variant={state === "error" ? "danger" : "success"}
          state={state as StatusBadgeVisual}
          text={copy.sampleReady}
          icon={<Glyph name="check" />}
        />
      );
    case "ColorField":
      return (
        <Field caption={copy.sampleInk}>
          <ColorField
            variant="standard"
            size="comfortable"
            state={state as ColorFieldVisual}
            value={state === "empty" ? "" : swatch("1a1a1a")}
            emptyName={copy.sampleEmptyColour}
            disabled={state === "disabled"}
          />
        </Field>
      );
    case "BrandFrame": {
      const face = { family: copy.samplePreview, weight: "400", italic: false };
      const complete = state !== "incomplete";
      return (
        <BrandFrame
          variant="preview"
          size="comfortable"
          state={state as BrandFrameVisual}
          profile={
            state === "empty" || state === "error"
              ? null
              : {
                  colors: complete
                    ? {
                        primary: swatch("112233"),
                        secondary: swatch("223344"),
                        accent: swatch("334455"),
                        background: swatch("ffffff"),
                        foreground: swatch("1a1a1a"),
                        muted: swatch("545454"),
                        critical: swatch("b3261e"),
                      }
                    : { background: swatch("ffffff") },
                  typefaces: complete
                    ? {
                        "heading-latin": face,
                        "heading-arabic": face,
                        "body-latin": face,
                        "body-arabic": face,
                      }
                    : { "body-latin": face },
                  strings: complete
                    ? [{ field: "brand", locale: "en", value: copy.sampleMint }]
                    : [{ field: "brand", locale: "ar", value: null }],
                }
          }
          previewLocale={locale}
          regionName={complete ? `${copy.sampleRegion} ${copy[STATE_LABEL[state]]}` : null}
          missingRegionName={copy.sampleMissingRegion}
          markers={{
            role: (role) => role,
            localeString: (field, itemLocale) => `${field}/${itemLocale}`,
            typeface: (pair) => pair,
          }}
          emptyMessage={copy.sampleEmptyProfile}
          unresolvedMessage={copy.sampleUnresolved}
          requestIdentifier={copy.sampleRequest}
        >
          {copy.samplePreview}
        </BrandFrame>
      );
    }
    case "DateField": {
      const names = dateNames(locale);
      const dateCopy: DateFieldCopy = {
        months: names.months,
        weekdaysShort: names.weekdaysShort,
        weekdaysFull: names.weekdaysFull,
        dayAccessibleName: names.dayAccessibleName,
        monthHeading: names.monthHeading,
        placeholder: data.datePlaceholder,
        previousMonth: copy.samplePreviousMonth,
        nextMonth: copy.sampleNextMonth,
        openCalendar: copy.sampleOpenCalendar,
        invalid: copy.sampleInvalidDate,
      };
      return (
        <DateField
          locale={locale}
          copy={dateCopy}
          state={state as DateFieldVisual}
          viewYear={2026}
          viewMonth={9}
          accessibleName={copy.sampleCaption}
          value={state === "selected" ? "2026-09-01" : ""}
          disabled={state === "disabled"}
        />
      );
    }
    case "FileDrop": {
      const fileCopy: FileDropCopy = {
        instruction: copy.sampleChooseFile,
        dropInstruction: copy.sampleDrop,
        browse: copy.sampleBrowse,
        acceptedTypes: copy.sampleAccepted,
        percentPattern: data.percent,
        retry: copy.sampleRetry,
        replace: copy.sampleReplace,
        remove: copy.sampleRemove,
        typeError: copy.sampleTypeError,
        sizeError: copy.sampleSizeError,
        failureError: copy.sampleFailure,
      };
      const files =
        state === "loading"
          ? [{ id: "file-1", name: copy.sampleFileName, sizeBytes: 1000, phase: "uploading" as const, progress: 0.5 }]
          : state === "error"
            ? [{ id: "file-1", name: copy.sampleFileName, sizeBytes: 1000, phase: "error" as const, error: "type" as const }]
            : state === "done"
              ? [{ id: "file-1", name: copy.sampleFileName, sizeBytes: 1000, phase: "done" as const }]
              : [];
      return (
        <FileDrop
          locale={locale}
          units={byteUnits(locale)}
          copy={fileCopy}
          state={state as FileDropVisual}
          sizeLimit={1000}
          files={files}
          disabled={state === "disabled"}
        />
      );
    }
    case "DataTable": {
      const rows =
        state === "empty" || state === "loading" || state === "error"
          ? []
          : Array.from({ length: 26 }, (_, index) => ({
              id: `row-${index + 1}`,
              cells: { sku: copy.sampleSku, name: copy.sampleMint },
              actions: (
                <Button variant="quiet" type="button">
                  {copy.sampleEdit}
                </Button>
              ),
            }));
      return (
        <DataTable
          locale={locale}
          variant="selectable"
          state={state as DataTableVisual}
          columns={[
            { key: "sku", caption: copy.sampleSkuCaption, kind: "identifier" },
            { key: "name", caption: copy.sampleNameCaption, kind: "text", sortable: true },
          ]}
          rows={rows}
          rangePattern={copy.range}
          regionName={`${copy.sampleTableRegion} ${copy[STATE_LABEL[state]]}`}
          pageSizeCaption={copy.samplePageSize}
          listEmpty={copy.sampleListEmpty}
          previousPage={copy.samplePreviousPage}
          nextPage={copy.sampleNextPage}
          selectAllName={copy.sampleSelectAll}
          selectRowName={copy.sampleSelectRow}
          actionsCaption={copy.sampleActions}
          empty={{ kind: state === "empty" ? "first-use" : "no-results", content: copy.sampleNothing }}
          failure={{
            message: copy.sampleListFailed,
            requestIdentifier: copy.sampleRequest,
            retry: copy.sampleRetry,
            onRetry: () => undefined,
          }}
          selectedIds={state === "selected" ? ["row-1"] : []}
        />
      );
    }
    default:
      return null;
  }
}

export function Gallery({ locale, theme, copy, data }: GalleryProps) {
  const other: Locale = locale === "en" ? "ar" : "en";
  const [choice, setChoice] = useState<ThemeChoice>(theme);
  const primitives = [...new Set(GALLERY_COVERAGE.map((entry) => entry[0]))];

  return (
    <AppShell
      skip={copy.compositionSkip}
      openNavigation={copy.compositionOpenNavigation}
      closeNavigation={copy.compositionCloseNavigation}
      navigationLabel={copy.compositionNavigation}
      measure="full"
      navigation={[
        { id: "catalog", caption: copy.compositionNavCatalog, href: "#app-main", current: true },
        { id: "samples", caption: copy.compositionNavSamples, href: "#app-main", current: false },
      ]}
      header={{
        theme: choice,
        tenantName: copy.compositionTenant,
        logos: [
          { ground: "light", src: "/gallery/sample-mark-light.svg" },
          { ground: "dark", src: "/gallery/sample-mark-dark.svg" },
        ],
        localeHref: `/${other}/gallery?theme=${theme}`,
        localeCaption: other === "ar" ? copy.localeAr : copy.localeEn,
        themeCaption: copy.themeCaption,
        themeSystem: copy.themeSystem,
        themeLight: copy.themeLight,
        themeDark: copy.themeDark,
        onTheme: (next) => {
          setChoice(next);
          if (next === "system") {
            delete document.documentElement.dataset.theme;
          } else {
            document.documentElement.dataset.theme = next;
          }
        },
        accountCaption: copy.compositionAccount,
        accountOptions: [{ id: "details", caption: copy.compositionAccountItem, onSelect: () => undefined }],
        switcher: {
          memberships: [
            { id: "first", name: copy.compositionTenant, mark: copy.compositionMark },
            { id: "second", name: copy.compositionTenantOther, mark: copy.compositionMark },
          ],
          resolvedId: "first",
          searchCaption: copy.compositionSearchMemberships,
          onSwitch: () => undefined,
        },
      }}
    >
      <ThemeAttribute theme={theme} />
      <h1>{copy.title}</h1>
      <BrandStep locale={locale} copy={copy} otherLocale={other} />
      <FilteredDataTable
        locale={locale}
        searchCaption={copy.sampleCaption}
        searchValue=""
        onSearch={() => undefined}
        filters={[{ id: "mint", caption: copy.compositionFilter }]}
        active={[{ id: "mint", caption: copy.compositionFilter }]}
        onToggle={() => undefined}
        removePattern={copy.compositionRemove}
        clearFilters={copy.compositionClear}
        onClear={() => undefined}
        resultCaption={copy.compositionResultCaption}
        resultCount={2}
        columns={[
          { key: "sku", caption: copy.sampleSkuCaption, kind: "identifier" },
          { key: "name", caption: copy.sampleNameCaption, kind: "text" },
        ]}
        rows={[
          {
            id: "row-mint",
            cells: { sku: copy.sampleSku, name: copy.sampleMint },
            actions: (
              <Button type="button" variant="quiet">
                {copy.sampleMint}
              </Button>
            ),
          },
          {
            id: "row-rose",
            cells: { sku: copy.sampleSku, name: copy.sampleRose },
            actions: (
              <Button type="button" variant="quiet">
                {copy.sampleRose}
              </Button>
            ),
          },
        ]}
        rangePattern={copy.range}
        regionName={copy.sampleTableRegion}
        pageSizeCaption={copy.samplePageSize}
        listEmpty={copy.sampleListEmpty}
        previousPage={copy.samplePreviousPage}
        nextPage={copy.sampleNextPage}
        actionsCaption={copy.sampleActions}
        emptyKind="no-results"
        empty={<p>{copy.sampleNothing}</p>}
      />
      <EmptyState
        title={copy.compositionEmptyTitle}
        description={copy.compositionEmptyBody}
        action={copy.compositionEmptyAction}
        onAction={() => undefined}
      />
      <EmptyState
        title={copy.compositionNoTitle}
        description={copy.compositionNoBody}
        action={copy.compositionNoAction}
        onAction={() => undefined}
      />
      <ErrorState
        title={copy.compositionErrorTitle}
        message={copy.compositionErrorMessage}
        next={copy.compositionErrorNext}
        retry={copy.compositionRetry}
        onRetry={() => undefined}
        requestIdentifier={copy.sampleRequest}
        copyIdentifier={copy.compositionCopy}
      />
      <section data-specimen="welcome">
        <h2>{copy.welcomeTitle}</h2>
        <Field caption={copy.welcomeLanguage}>
          <Select
            variant="native"
            name="default-locale"
            value="en"
            noResults={copy.sampleNoResults}
            options={[
              { value: "en", caption: copy.localeEn },
              { value: "ar", caption: copy.localeAr },
            ]}
          />
        </Field>
        <Field caption={copy.welcomeCurrency}>
          <Select
            variant="native"
            name="base-currency"
            value="primary"
            noResults={copy.sampleNoResults}
            options={[
              { value: "primary", caption: copy.welcomeCurrencyPrimary },
              { value: "secondary", caption: copy.welcomeCurrencySecondary },
            ]}
          />
        </Field>
      </section>
      <section data-specimen="pinned-output">
        <BrandFrame
          variant="preview"
          size="comfortable"
          state="default"
          previewLocale="en"
          regionName={copy.sampleRegion}
          missingRegionName={copy.sampleMissingRegion}
          markers={{
            role: (role) => role,
            localeString: (field, itemLocale) => `${field}/${itemLocale}`,
            typeface: (pair) => pair,
          }}
          emptyMessage={copy.sampleEmptyProfile}
          unresolvedMessage={copy.sampleUnresolved}
          requestIdentifier={copy.sampleRequest}
          profile={{
            colors: {
              primary: swatch("112233"),
              secondary: swatch("223344"),
              accent: swatch("334455"),
              background: swatch("ffffff"),
              foreground: swatch("1a1a1a"),
              muted: swatch("545454"),
              critical: swatch("b3261e"),
            },
            typefaces: {
              "heading-latin": { family: "sans-serif", weight: "400", italic: false },
              "heading-arabic": { family: "sans-serif", weight: "400", italic: false },
              "body-latin": { family: "sans-serif", weight: "400", italic: false },
              "body-arabic": { family: "sans-serif", weight: "400", italic: false },
            },
            strings: [{ field: "brand", locale: "en", value: copy.sampleMint }],
          }}
        >
          <span data-output-mark="lead">Mint</span>
          <span data-output-mark="trail">12</span>
        </BrandFrame>
      </section>
      {primitives.map((primitive) => (
        <section key={primitive}>
          <h2>{copy[PRIMITIVE_LABEL[primitive]]}</h2>
          {GALLERY_COVERAGE.filter((entry) => entry[0] === primitive).map((entry) => (
            <div key={entry[1]} data-primitive={entry[0]} data-state={entry[1]}>
              <p>{copy[STATE_LABEL[entry[1]]]}</p>
              {specimen(entry[0], entry[1], locale, copy, data)}
            </div>
          ))}
        </section>
      ))}
    </AppShell>
  );
}
