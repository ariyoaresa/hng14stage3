export function getHabitSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-'); // replace one or more spaces with a single hyphen
}
