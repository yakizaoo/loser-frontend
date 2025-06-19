// Примитивная "база данных" на localStorage

export const db = {
  get(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  add(key, item) {
    const arr = db.get(key);
    arr.push(item);
    db.set(key, arr);
  },
  remove(key, predicate) {
    const arr = db.get(key);
    db.set(key, arr.filter(i => !predicate(i)));
  },
  clear(key) {
    localStorage.removeItem(key);
  }
};
