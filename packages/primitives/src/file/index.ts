/**
 * Formats bytes into a human-readable file-size string.
 *
 * @param bytes File size in bytes.
 * @returns Human-readable size string (for example, `"1.5 MB"`).
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(2))} ${sizes[index]}`;
};
