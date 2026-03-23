export function formatBostonTime(value: string | null | undefined) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function fiveMinutesAgoIso() {
  return new Date(Date.now() - 5 * 60 * 1000).toISOString()
}

export function tenMinutesAgoIso() {
  return new Date(Date.now() - 10 * 60 * 1000).toISOString()
}
