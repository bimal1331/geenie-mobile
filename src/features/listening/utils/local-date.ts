export function getLocalDateKey(value: Date) {
  const offset = value.getTimezoneOffset() * 60_000;

  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
}
