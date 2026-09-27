"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";

import type { CalendarLocale } from "../../../lib/locale/calendar-date";
import {
  fillPattern,
  formatByteSize,
  formatProgress,
  progressPercent,
  type ByteUnitWords,
} from "../../../lib/locale/format-number";
import { Button } from "../button/button";
import { Spinner } from "../spinner/spinner";
import styles from "./file-drop.module.css";

export type FileDropVariant = "single" | "multiple";
export type FileDropSize = "comfortable";

export type FileDropVisual =
  | "default"
  | "hover"
  | "focus"
  | "active"
  | "disabled"
  | "loading"
  | "error"
  | "empty"
  | "done";

export type FileDropPhase = "uploading" | "processing" | "done" | "error";
export type FileDropError = "type" | "size" | "failure";

export type FileDropEntry = {
  id: string;
  name: string;
  sizeBytes: number;
  phase: FileDropPhase;
  progress?: number;
  error?: FileDropError;
  thumbnail?: ReactNode;
};

export type FileDropCopy = {
  instruction: string;
  dropInstruction: string;
  browse: string;
  acceptedTypes: string;
  percentPattern: string;
  retry: string;
  replace: string;
  remove: string;
  typeError: string;
  sizeError: string;
  failureError: string;
};

type FileDropProps = {
  variant?: FileDropVariant;
  size?: FileDropSize;
  state?: FileDropVisual;
  locale: CalendarLocale;
  units: ByteUnitWords;
  copy: FileDropCopy;
  accept?: string;
  sizeLimit: number;
  files?: FileDropEntry[];
  disabled?: boolean;
  onChoose?: (files: File[]) => void;
  onRetry?: (id: string) => void;
  onReplace?: (id: string) => void;
  onRemove?: (id: string) => void;
};

const ERROR_KEY: Record<FileDropError, keyof Pick<FileDropCopy, "typeError" | "sizeError" | "failureError">> = {
  type: "typeError",
  size: "sizeError",
  failure: "failureError",
};

export function FileDrop({
  variant = "single",
  size = "comfortable",
  state,
  locale,
  units,
  copy,
  accept,
  sizeLimit,
  files = [],
  disabled = false,
  onChoose,
  onRetry,
  onReplace,
  onRemove,
}: FileDropProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const visual =
    state ??
    (disabled ? "disabled" : dragOver ? "active" : files.length === 0 ? "empty" : "default");
  const limit = formatByteSize(sizeLimit, locale, units);

  function take(list: FileList | null) {
    if (!list || disabled) {
      return;
    }
    const chosen = variant === "single" ? Array.from(list).slice(0, 1) : Array.from(list);
    onChoose?.(chosen);
  }

  function onDrag(event: DragEvent<HTMLDivElement>, over: boolean) {
    event.preventDefault();
    if (!disabled) {
      setDragOver(over);
    }
  }

  return (
    <div className={styles.root} data-variant={variant} data-state={visual} data-density={size}>
      <div
        className={styles.zone}
        data-drag={dragOver ? "true" : "false"}
        onDragEnter={(event) => onDrag(event, true)}
        onDragOver={(event) => onDrag(event, true)}
        onDragLeave={(event) => onDrag(event, false)}
        onDrop={(event) => {
          onDrag(event, false);
          take(event.dataTransfer.files);
        }}
      >
        <p className={styles.instruction}>{dragOver || state === "active" ? copy.dropInstruction : copy.instruction}</p>
        <p className={styles.constraints}>
          <span>{copy.acceptedTypes}</span>
          <span>{limit}</span>
        </p>
        <input
          id={inputId}
          ref={inputRef}
          className={styles.fileInput}
          type="file"
          accept={accept}
          multiple={variant === "multiple"}
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onChange={(event) => {
            take(event.target.files);
            event.target.value = "";
          }}
        />
        <Button disabled={disabled} onClick={() => inputRef.current?.click()}>
          {copy.browse}
        </Button>
      </div>
      {files.length > 0 ? (
        <ul className={styles.list}>
          {files.map((file) => {
            const uploading = file.phase === "uploading" || state === "loading";
            const processing = file.phase === "processing";
            const failed = file.phase === "error" || state === "error";
            const ready = file.phase === "done" || state === "done";
            const percent = progressPercent(file.progress ?? 0);
            return (
              <li key={file.id} className={styles.file} data-phase={file.phase}>
                {ready ? <span className={styles.thumbnail}>{file.thumbnail}</span> : null}
                <span className={styles.name} dir="ltr">
                  {file.name}
                </span>
                <span className={styles.size}>{formatByteSize(file.sizeBytes, locale, units)}</span>
                {uploading ? (
                  <span
                    className={styles.progress}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    aria-valuetext={fillPattern(copy.percentPattern, { value: formatProgress(file.progress ?? 0, locale) })}
                    aria-label={file.name}
                  />
                ) : null}
                {processing ? <Spinner state="loading" /> : null}
                {failed ? (
                  <span className={styles.fileError}>
                    <span>{copy[ERROR_KEY[file.error ?? "failure"]]}</span>
                    <Button variant="quiet" onClick={() => onRetry?.(file.id)}>
                      {copy.retry}
                    </Button>
                  </span>
                ) : null}
                {ready ? (
                  <span className={styles.actions}>
                    <Button variant="quiet" onClick={() => onReplace?.(file.id)}>
                      {copy.replace}
                    </Button>
                    <Button variant="quiet" onClick={() => onRemove?.(file.id)}>
                      {copy.remove}
                    </Button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
