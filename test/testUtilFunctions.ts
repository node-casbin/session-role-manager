export function getCurrentTime(): string {
  const now = new Date();
  return now.getTime().toString();
}

export function getAfterCurrentTime(): string {
  const now = new Date();
  return (now.getTime() + 1).toString();
}

export function getOneHourAgo(): string {
  const now = new Date();
  return (now.getTime() - 60 * 60 * 1000).toString();
}

export function getInOneHour(): string {
  const now = new Date();
  return (now.getTime() + 60 * 60 * 1000).toString();
}

export function getAfterOneHour(): string {
  const now = new Date();
  return (now.getTime() + 60 * 60 * 1000 + 1).toString();
}
