// Shared pure JavaScript model. The same file is used in labs 4 and 5.
(function (root) {
  'use strict';
  function assertValid(item) {
    const errors = Store.validate(item);
    if (Object.keys(errors).length) {
      const error = new TypeError(Object.values(errors).join(' '));
      error.fields = errors;
      throw error;
    }
  }
  class Store {
    #items = [];
    #nextId = 1;
    constructor(items = []) {
      if (!Array.isArray(items)) throw new TypeError('items must be an array.');
      items.forEach(item => this.add(item));
    }
    static validate(item) {
      if (!item || typeof item !== 'object' || Array.isArray(item))
        return { name: 'Ожидается объект товара.' };
      const { name, price, qty } = item; // Destructuring.
      const errors = {};
      if (typeof name !== 'string' || !name.trim()) errors.name = 'Введите название товара.';
      if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0 || price > 1000000000)
        errors.price = 'Цена должна быть числом больше 0 и не выше 1 000 000 000.';
      if (typeof qty !== 'number' || !Number.isSafeInteger(qty) || qty < 0 || qty > 1000000)
        errors.qty = 'Количество — целое число от 0 до 1 000 000.';
      return errors;
    }
    add(item) {
      assertValid(item);
      const { name, price, qty } = item;
      const saved = { id: this.#nextId++, name: name.trim(), price, qty };
      this.#items.push(saved);
      return { ...saved }; // Spread: callers receive a copy.
    }
    remove(id) {
      const index = this.#items.findIndex(item => item.id === id);
      if (index === -1) return false;
      this.#items.splice(index, 1);
      return true;
    }
    find(id) {
      const item = this.#items.find(item => item.id === id);
      return item ? { ...item } : undefined;
    }
    updateQty(id, qty) {
      const item = this.#items.find(item => item.id === id);
      if (!item) throw new RangeError('Товар не найден.');
      assertValid({ ...item, qty });
      item.qty = qty;
      return { ...item };
    }
    list() { return this.#items.map(item => ({ ...item })); }
    get items() { return this.list(); } // Getter: read as store.items, without ().
    total() {
      // Round prices to minor units before summing.
      return this.#items.reduce((sum, item) => sum + Math.round(item.price * 100) * item.qty, 0) / 100;
    }
  }
  class SortedStore extends Store {
    // Override a method and call the parent implementation through super.
    list() { return super.list().sort((a, b) => a.price - b.price || a.id - b.id); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { Store, SortedStore };
  else { root.Store = Store; root.SortedStore = SortedStore; }
})(typeof globalThis !== 'undefined' ? globalThis : this);
