 'use strict';
// This is the same Store model as in lab 4; UI only calls its methods.
const store = new Store([
  { name: 'Зубная щётка Soft Care', price: 2500, qty: 2 },
  { name: 'Зубная паста Daily Fresh', price: 3200, qty: 1 },
  { name: 'Зубная нить Dental Floss', price: 1800, qty: 3 }
]);
const panel = document.querySelector('#store-panel');
const list = document.querySelector('#product-list');
const addForm = document.querySelector('#add-form');
const status = document.querySelector('#status');
const money = value => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency: 'KZT', maximumFractionDigits: 2
}).format(value);
// Number('') is 0, so explicitly turn blank input into NaN.
function readNumber(value) { return value.trim() === '' ? NaN : Number(value); }
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // User names are text, never HTML.
  return node;
}
function render() {
  list.replaceChildren();
  for (const item of store.items) {
    const card = element('article', 'product'); card.dataset.id = item.id;
    const top = element('div', 'product-top');
    top.append(element('h3', '', item.name), element('strong', 'subtotal', money(Math.round(item.price * 100) * item.qty / 100)));
    const form = element('form', 'row-form');
    form.dataset.action = 'update'; form.dataset.id = item.id; form.noValidate = true;
    const field = element('div', 'qty-field');
    const label = element('label', '', 'Количество'); label.htmlFor = `qty-${item.id}`;
    const input = element('input');
    Object.assign(input, { id: `qty-${item.id}`, name: 'qty', type: 'number', min: '0', max: '1000000', step: '1', value: item.qty, required: true });
    input.setAttribute('aria-describedby', `error-${item.id}`);
    field.append(label, input);
    const update = element('button', 'update', 'Сохранить'); update.type = 'submit'; update.dataset.action = 'update';
    const remove = element('button', 'remove', 'Удалить'); remove.type = 'submit'; remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `Удалить ${item.name}`);
    const error = element('small', 'error row-error'); error.id = `error-${item.id}`; error.setAttribute('aria-live', 'polite');
    form.append(field, update, remove, error);
    card.append(top, element('p', 'unit-price', `${money(item.price)} / шт.`), form);
    list.append(card);
  }
  if (!store.items.length) list.append(element('p', 'empty', 'Каталог пуст. Добавьте первый товар.'));
  document.querySelector('#count').textContent = `Позиций: ${store.items.length}`;
  document.querySelector('#total').textContent = money(store.total());
}
function showAddErrors(errors) {
  for (const name of ['name', 'price', 'qty']) {
    document.querySelector(`#${name}-error`).textContent = errors[name] || '';
    addForm.elements[name].setAttribute('aria-invalid', String(Boolean(errors[name])));
  }
  const first = Object.keys(errors)[0];
  if (first) addForm.elements[first].focus();
}
// ONE delegated submit listener on the common list/form container.
// submit bubbles: dynamic row forms require no individual listeners.
panel.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const action = event.submitter?.dataset.action || form.dataset.action;
  if (action === 'add') {
    const item = {
      name: form.elements.name.value,
      price: readNumber(form.elements.price.value),
      qty: readNumber(form.elements.qty.value)
    };
    const errors = Store.validate(item);
    showAddErrors(errors);
    if (Object.keys(errors).length) return;
    store.add(item); form.reset(); render();
    status.textContent = `Добавлен товар: ${item.name.trim()}.`; form.elements.name.focus();
  } else if (action === 'remove') {
    store.remove(Number(form.dataset.id)); render(); status.textContent = 'Товар удалён.';
    addForm.elements.name.focus();
  } else if (action === 'update') {
    try {
      store.updateQty(Number(form.dataset.id), readNumber(form.elements.qty.value));
      render(); status.textContent = 'Количество и общая стоимость обновлены.';
      document.querySelector(`#qty-${form.dataset.id}`).focus();
    } catch (error) {
      form.querySelector('.row-error').textContent = error.message;
      form.elements.qty.setAttribute('aria-invalid', 'true'); form.elements.qty.focus();
    }
  }
});
render();
