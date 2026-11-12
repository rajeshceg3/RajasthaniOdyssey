// Quiet chrome + jaali-framed place tokens. UI only: all ids, handlers and storage keys stay.
export function initChrome() {
  const PIN_KEY = 'rajasthaniodyssey-chrome-pin', TOP_ZONE = 120, BOTTOM_ZONE = 150, RETIRE_MS = 2600;
  const header = document.querySelector('header');
  const chapterLabel = document.querySelector('label:has(#chapter)');
  const nav = document.querySelector('nav[aria-label="World controls"]');
  const note = document.querySelector('.world-note');
  const els = [chapterLabel, nav, note].filter(Boolean);
  if (chapterLabel) [...chapterLabel.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'vh'; s.textContent = n.textContent; n.replaceWith(s); } });
  if (!header || !nav) return;

  // Token strip mirrors a select; the select stays in the DOM as the source of truth.
  function tokenStrip(select, cls, label) {
    const strip = document.createElement('div');
    strip.className = 'tokens ' + cls; strip.setAttribute('role', 'radiogroup'); strip.setAttribute('aria-label', label);
    select.classList.add('visually-select'); select.tabIndex = -1; select.setAttribute('aria-hidden', 'true');
    select.insertAdjacentElement('afterend', strip);
    const build = () => {
      strip.replaceChildren(...[...select.options].map(o => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'token'; b.dataset.value = o.value; b.setAttribute('role', 'radio');
        b.textContent = o.text.split(/[,]| in | on | below | beyond | beside /)[0].replace(/^The /, '');
        b.addEventListener('click', () => { select.value = o.value; select.dispatchEvent(new Event('change', { bubbles: true })); sync(); });
        b.addEventListener('keydown', e => {
          if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
          const bs = [...strip.children], i = bs.indexOf(b), n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
          e.preventDefault(); n.click(); n.focus();
        });
        return b;
      }));
      sync();
    };
    const sync = () => [...strip.children].forEach(b => { const on = b.dataset.value === select.value; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
    new MutationObserver(build).observe(select, { childList: true });
    select.addEventListener('change', sync);
    return { build, sync };
  }
  const chap = tokenStrip(document.getElementById('chapter'), 'chapter-tokens', 'Choose a place');
  chap.build();
  const lm = tokenStrip(document.getElementById('landmark'), 'landmark-tokens', 'Look closer');
  lm.build();
  // render() sets chapter value without an event; follow the story counter.
  new MutationObserver(() => { chap.sync(); lm.sync(); }).observe(document.getElementById('position'), { childList: true, characterData: true, subtree: true });

  els.forEach(e => e.classList.add('chrome', 'chrome-on'));
  const hint = document.createElement('button');
  hint.className = 'chrome-hint'; hint.hidden = true; hint.setAttribute('aria-label', 'Show controls');
  hint.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3 L19 12 L12 21 L5 12 Z M12 8 L15.5 12 L12 16 L8.5 12 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';
  document.body.appendChild(hint);
  const pinBtn = document.createElement('button');
  pinBtn.id = 'pin-controls'; pinBtn.type = 'button'; pinBtn.className = 'pin-btn'; pinBtn.textContent = 'Pin'; pinBtn.title = 'Keep controls visible'; pinBtn.setAttribute('aria-pressed', 'false');
  nav.appendChild(pinBtn);
  let pinned = false; try { pinned = localStorage.getItem(PIN_KEY) === '1'; } catch {}
  let chrome = true, focusWithin = false, retireTimer = 0;
  const panelOpen = () => document.getElementById('panel')?.open;
  const apply = () => { const on = chrome || pinned; els.forEach(e => e.classList.toggle('chrome-on', on)); hint.hidden = on; };
  const retireSoon = () => { clearTimeout(retireTimer); retireTimer = setTimeout(() => { if (!focusWithin && !panelOpen()) { chrome = false; apply(); } }, RETIRE_MS); };
  const wake = () => { chrome = true; apply(); retireSoon(); };
  document.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; if (e.clientY < TOP_ZONE || e.clientY > innerHeight - BOTTOM_ZONE) wake(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (panelOpen()) return; focusWithin = false; chrome = false; apply(); } });
  document.addEventListener('focusin', e => { if (els.some(x => x.contains(e.target))) { focusWithin = true; clearTimeout(retireTimer); chrome = true; apply(); } });
  document.addEventListener('focusout', e => { if (!els.some(x => x.contains(e.relatedTarget))) { focusWithin = false; retireSoon(); } });
  hint.addEventListener('click', wake);
  const setPin = next => { pinned = next; try { next ? localStorage.setItem(PIN_KEY, '1') : localStorage.removeItem(PIN_KEY); } catch {} pinBtn.setAttribute('aria-pressed', String(next)); pinBtn.textContent = next ? 'Unpin' : 'Pin'; pinBtn.title = next ? 'Let controls retire' : 'Keep controls visible'; if (next) { chrome = true; apply(); } else retireSoon(); };
  pinBtn.addEventListener('click', () => setPin(!pinned));
  if (pinned) setPin(true);
  retireSoon();
}
