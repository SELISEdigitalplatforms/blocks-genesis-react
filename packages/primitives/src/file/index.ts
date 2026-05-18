/**
 * File formatter.
 * @param bytes - The file size in bytes.
 * @returns The formatted file size.
 * @example
 * formatFileSize(1024); // "1 KB"
 * @example
 * formatFileSize(1024 * 1024); // "1 MB"
 * @example
 * formatFileSize(1024 * 1024 * 1024); // "1 GB"
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
