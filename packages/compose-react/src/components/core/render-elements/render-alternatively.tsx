export function RenderAlternatively({
  condition,
  whenTrue,
  whenFalse,
}: {
  condition: boolean;
  whenTrue: React.ReactNode;
  whenFalse: React.ReactNode;
}) {
  return <>{condition ? whenTrue : whenFalse}</>;
}
