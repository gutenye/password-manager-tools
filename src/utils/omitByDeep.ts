type Predicate<T, K extends keyof T> = (value: T[K], key: K) => boolean

export function omitByDeep<T>(
  obj: T,
  predicate: Predicate<T, keyof T>,
): Partial<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      omitByDeep(item, predicate),
    ) as unknown as Partial<T>
  } else if (obj !== null && typeof obj === 'object') {
    const result: Partial<T> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key]
        if (!predicate(value, key)) {
          ;(result as Record<string, unknown>)[key] = omitByDeep(
            value as T,
            predicate,
          )
        }
      }
    }
    return result
  }
  return obj
}
