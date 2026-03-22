export function formatEvent(input: string | null): string | null {
  if (!input) return input;

  const result = input.replace(/_/g, " ");
  return result.charAt(0).toUpperCase() + result.slice(1);
}
