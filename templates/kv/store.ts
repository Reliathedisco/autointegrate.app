export const kv = new Map<string, any>();

export const setKV = (key: string, value: any) => kv.set(key, value);
export const getKV = (key: string) => kv.get(key);
export const delKV = (key: string) => kv.delete(key);

