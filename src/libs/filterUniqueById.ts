export function filterUniqueById<T extends { id: string }>(items: T[]): T[] {
  const uniqueItems = new Map<string, T>()
  for (const item of items) {
    uniqueItems.set(item.id, item)
  }
  return Array.from(uniqueItems.values())
}
