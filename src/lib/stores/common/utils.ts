/**
 * mapGenerator creates a map given a list of keys a and a setter closure
 * @param keys : a list of usable keys (string, number or symbol)
 * @param setter : a closure using a key as input and
 * @returns The map for keys and setter result
 */
export function mapGenerator<K extends string | number | symbol, V>(keys: string[], setter: (k: K) => V) : Record<K, V> {
  return keys.reduce(
    (storesMap, key) => {
        const k = key as K;
        storesMap[k] = setter(k);
        return storesMap;
      },
      {} as Record<K, V>
  );
}
