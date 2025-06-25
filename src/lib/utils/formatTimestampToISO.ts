export function formatUnixTimestampToISO(timestamp: number) {
  const date = new Date(timestamp * 1000);
  const iso = date.toISOString().slice(0, 19);
  const ms = date.getMilliseconds().toString().padStart(3, '0');
  return `${iso}.${ms}000Z`;
}
