export type FileSizeUnit = "B" | "KB" | "MB" | "GB" | "TB";

const UNIT_MAP: Record<FileSizeUnit, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4,
};

const UNITS = Object.keys(UNIT_MAP) as FileSizeUnit[];

/**
 * Formats a file size from a given unit into the most appropriate unit.
 *
 * @param value File size value.
 * @param inputUnit Unit of the provided value.
 * @param decimals Number of decimal places.
 * @returns Human-readable size string (e.g. "1.5 GB").
 */
export function formatFileSize(
  value: number,
  inputUnit: FileSizeUnit = "B",
  decimals = 2,
): string {
  let bytes = value * UNIT_MAP[inputUnit];
  let unitIndex = 0;

  while (unitIndex < UNITS.length - 1 && bytes >= 1024) {
    bytes /= 1024;
    unitIndex++;
  }

  return `${parseFloat(bytes.toFixed(decimals))} ${UNITS[unitIndex]}`;
}

/**
 * Formats a file size provided in bytes into a human-readable string.
 *
 * @param bytes File size in bytes.
 * @param decimals Number of decimal places.
 * @returns Human-readable size string (e.g. "1.5 MB").
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";

  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const unit = UNITS[unitIndex]!;
  const value = bytes / UNIT_MAP[unit];

  return `${parseFloat(value.toFixed(decimals))} ${unit}`;
}
