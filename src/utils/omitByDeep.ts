type Predicate<T> = (value: T, key: string) => boolean

export function omitByDeep<T>(obj: T, predicate: Predicate<any>): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => omitByDeep(item, predicate)) as unknown as T
  } else if (obj !== null && typeof obj === 'object') {
    const result: any = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (!predicate((obj as any)[key], key)) {
          result[key] = omitByDeep((obj as any)[key], predicate)
        }
      }
    }
    return result
  }
  return obj
}
