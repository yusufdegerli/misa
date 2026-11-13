/** Today's date as YYYY-MM-DD in the shop's time zone (Istanbul), not the server's UTC. */
export function todayInIstanbul(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
