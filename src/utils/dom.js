export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

export function setHTML(element, html) {
  if (element) element.innerHTML = html;
}

export function onClick(selector, handler, root = document) {
  root.addEventListener('click', event => {
    const target = event.target.closest(selector);
    if (target) handler(event, target);
  });
}

export function createIcons() {
  if (window.lucide) window.lucide.createIcons();
}
