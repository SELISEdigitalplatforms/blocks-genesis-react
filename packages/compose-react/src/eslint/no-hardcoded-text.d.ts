export declare const HARDCODED_TEXT_MESSAGE: string;
export declare const hardcodedTextSelectors: ReadonlyArray<{
  selector: string;
  message: string;
}>;
export declare const noHardcodedTextRule: [
  "error",
  ...Array<{ selector: string; message: string }>,
];
export declare const hardcodedTextExemptFiles: ReadonlyArray<string>;
