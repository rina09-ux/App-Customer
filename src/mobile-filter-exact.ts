const MOBILE_BREAKPOINT = 767;

type Option = { label: string; match: string };

type FilterSpec = {
  id: string;
  title: string;
  options: Option[];
  findOriginal: (root: HTMLElement) => HTMLElement | null;
};

function isMobile() { return window.innerWidth <= MOBILE_BREAKPOINT; }
function normalize(text: string) { return text.replace(/\s+/g, ' ').trim(); }
function findButtonByText(root: HTMLElement, text: string) {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find((button) => normalize(button.textContent || '').toLowerCase() === text.toLowerCase()) || null;
}
function findGroupContaining(root: HTMLElement, marker: string, minButtons = 2) {
  const markerNode = Array.from(root.querySelectorAll<HTMLElement>('span,div,p')).find((el) => normalize(el.textContent || '').toLowerCase() === marker.toLowerCase());
  if (!markerNode) return null;
  let current: HTMLElement | null = markerNode.parentElement;
  while (current && current !== root) {
    if (current.querySelectorAll('button').length >= minButtons) return current;
    current = current.parentElement;
  }
  return null;
}
function selectedText(group: HTMLElement, fallback: string) {
  const selected = Array.from(group.querySelectorAll<HTMLButtonElement>('button')).find((button) => {
    const cls = button.className.toString();
    return button.getAttribute('aria-pressed') === 'true' || /bg-(?:slate-900|blue-600|teal-600|emerald-600)/.test(cls);
  });
  return selected ? normalize(selected.textContent || '') : fallback;
}

function makeSingleFilter(spec: FilterSpec, view: HTMLElement) {
  const original = spec.findOriginal(view);
  if (!original || original.dataset.nsMobileFilterEnhanced === 'true') return;
  original.dataset.nsMobileFilterEnhanced = 'true';
  const wrapper = document.createElement('div');
  wrapper.className = 'ns-mobile-inline-filter-host';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ns-mobile-inline-filter-button';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = '<span class="ns-mobile-inline-filter-label"></span><span class="ns-mobile-inline-filter-chevron">⌄</span>';
  const panel = document.createElement('div');
  panel.className = 'ns-mobile-inline-filter-panel';
  panel.setAttribute('hidden', '');
  panel.setAttribute('role', 'menu');
  const title = document.createElement('div');
  title.className = 'ns-mobile-inline-filter-title';
  title.textContent = spec.title;
  panel.appendChild(title);
  spec.options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ns-mobile-inline-filter-option';
    button.textContent = option.label;
    button.addEventListener('click', () => {
      findButtonByText(view, option.match)?.click();
      trigger.querySelector('.ns-mobile-inline-filter-label')!.textContent = option.label === spec.options[0].label ? spec.title : `${spec.title}: ${option.label}`;
      panel.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    });
    panel.appendChild(button);
  });
  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = panel.hasAttribute('hidden');
    if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    trigger.setAttribute('aria-expanded', String(open));
  });
  wrapper.append(trigger, panel);
  original.parentElement?.insertBefore(wrapper, original);
  original.classList.add('ns-mobile-inline-filter-original');
  const refresh = () => {
    const active = selectedText(original, spec.options[0].label);
    trigger.querySelector('.ns-mobile-inline-filter-label')!.textContent = active === spec.options[0].label ? spec.title : `${spec.title}: ${active}`;
  };
  refresh();
}

function makeActionCenterFilter(view: HTMLElement) {
  if (view.dataset.nsMobileActionFilterEnhanced === 'true') return;
  const categoryGroup = findGroupContaining(view, 'Domain:', 5);
  const statusGroup = findGroupContaining(view, 'Status:', 4);
  if (!categoryGroup || !statusGroup) return;

  const categoryHost = makeActionFilterRow(view, categoryGroup, 'Domain');
  const statusHost = makeActionFilterRow(view, statusGroup, 'Status');
  if (!categoryHost || !statusHost) return;
  view.dataset.nsMobileActionFilterEnhanced = 'true';
}

function makeActionFilterRow(view: HTMLElement, sourceGroup: HTMLElement, title: string) {
  if (sourceGroup.dataset.nsMobileActionFilterSource === 'true') return sourceGroup.previousElementSibling as HTMLElement | null;
  sourceGroup.dataset.nsMobileActionFilterSource = 'true';

  const wrapper = document.createElement('div');
  wrapper.className = 'ns-mobile-inline-filter-host ns-mobile-action-filter-row';
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ns-mobile-inline-filter-button';
  trigger.innerHTML = `<span class="ns-mobile-inline-filter-label">${title}</span><span class="ns-mobile-inline-filter-chevron">⌄</span>`;
  trigger.setAttribute('aria-expanded', 'false');

  const panel = document.createElement('div');
  panel.className = 'ns-mobile-inline-filter-panel';
  panel.setAttribute('hidden', '');
  panel.setAttribute('role', 'menu');

  Array.from(sourceGroup.querySelectorAll<HTMLButtonElement>('button')).forEach((sourceButton) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.className = 'ns-mobile-inline-filter-option';
    const label = normalize(sourceButton.textContent || '');
    option.textContent = label;
    option.addEventListener('click', () => {
      sourceButton.click();
      trigger.querySelector('.ns-mobile-inline-filter-label')!.textContent = `${title}: ${label}`;
      panel.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    });
    panel.appendChild(option);
  });

  trigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const open = panel.hasAttribute('hidden');
    if (open) panel.removeAttribute('hidden'); else panel.setAttribute('hidden', '');
    trigger.setAttribute('aria-expanded', String(open));
  });

  wrapper.append(trigger, panel);
  sourceGroup.parentElement?.insertBefore(wrapper, sourceGroup);
  sourceGroup.classList.add('ns-mobile-inline-filter-original');

  const refresh = () => {
    const active = selectedText(sourceGroup, title);
    trigger.querySelector('.ns-mobile-inline-filter-label')!.textContent = active ? `${title}: ${active}` : title;
  };
  refresh();
  return wrapper;
}

const specs: FilterSpec[] = [
  { id: 'overview-severity', title: 'Filter', options: [
    { label: 'Semua', match: 'all' }, { label: 'Critical', match: 'critical' }, { label: 'High', match: 'high' }, { label: 'Medium', match: 'medium' },
  ], findOriginal: (root) => root.querySelector('#cyber-threat-radar .flex.items-center.justify-between.text-xs > .flex.items-center.gap-1') as HTMLElement | null },
  { id: 'risk-severity', title: 'Tingkat Keparahan', options: [
    { label: 'Semua', match: 'all' }, { label: 'Critical', match: 'CRITICAL' }, { label: 'High', match: 'HIGH' }, { label: 'Medium', match: 'MEDIUM' },
  ], findOriginal: (root) => findGroupContaining(root, 'Tingkat Keparahan:', 4) },
  { id: 'marketplace-family', title: 'Semua Layanan', options: [
    { label: 'Semua Layanan', match: 'Semua Layanan' }, { label: 'NusaSec Secure', match: 'NusaSec Secure' }, { label: 'NusaSec Trust', match: 'NusaSec Trust' }, { label: 'NusaSec Quantum', match: 'NusaSec Quantum' }, { label: 'Developer & SDK', match: 'Developer & SDK' },
  ], findOriginal: (root) => {
    const button = findButtonByText(root, 'Semua Layanan');
    return button?.parentElement as HTMLElement | null;
  } },
];

function enhance() {
  if (!isMobile()) return;
  const overview = document.querySelector<HTMLElement>('#overview-dashboard');
  const action = document.querySelector<HTMLElement>('#action-center-view');
  const risk = document.querySelector<HTMLElement>('#risk-exposure-view');
  const marketplace = document.querySelector<HTMLElement>('#marketplace-view');
  if (overview) makeSingleFilter(specs[0], overview);
  if (action) makeActionCenterFilter(action);
  if (risk) makeSingleFilter(specs[1], risk);
  if (marketplace) makeSingleFilter(specs[2], marketplace);
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', (event) => {
    const target = event.target as Node;
    document.querySelectorAll<HTMLElement>('.ns-mobile-inline-filter-panel:not([hidden])').forEach((panel) => {
      if (!panel.parentElement?.contains(target)) panel.setAttribute('hidden', '');
    });
  });
  const observer = new MutationObserver(() => window.setTimeout(enhance, 50));
  const root = document.getElementById('root');
  if (root) observer.observe(root, { childList: true, subtree: true });
  window.addEventListener('resize', enhance);
  window.setTimeout(enhance, 120);
}
