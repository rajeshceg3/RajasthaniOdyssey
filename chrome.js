// Learner-controlled exploration. Same jaali tokens, one quiet paper panel.
export function initChrome() {
  const header = document.querySelector('header');
  const chapterLabel = document.querySelector('label:has(#chapter)');
  const nav = document.querySelector('nav[aria-label="World controls"]');
  const note = document.querySelector('.world-note');
  if (!header || !nav) return;
  for (const label of [chapterLabel, document.querySelector('label:has(#landmark)')]) {
    if (label) [...label.childNodes].forEach(n => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const text = document.createElement('span'); text.className = 'vh';
        text.textContent = n.textContent; n.replaceWith(text);
      }
    });
  }
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
  const lmLabel = document.querySelector('label:has(#landmark)');
  if (lmLabel) [...lmLabel.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const s = document.createElement('span'); s.className = 'vh'; s.textContent = n.textContent; n.replaceWith(s); } });
  const lm = tokenStrip(document.getElementById('landmark'), 'landmark-tokens', 'Look closer');
  lm.build();
  // render() sets chapter value without an event; follow the story counter.
  new MutationObserver(() => { chap.sync(); lm.sync(); }).observe(document.getElementById('position'), { childList: true, characterData: true, subtree: true });

  const trigger = document.createElement('button');
  trigger.id = 'explore-controls'; trigger.type = 'button';
  trigger.textContent = 'Explore'; trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', 'explore-panel');
  header.appendChild(trigger);
  const drawer = document.createElement('dialog');
  drawer.id = 'explore-panel'; drawer.setAttribute('aria-labelledby', 'explore-title');
  drawer.innerHTML = '<div class="explore-heading"><h2 id="explore-title">Explore Maru</h2><button type="button" id="close-explore">Done</button></div>';
  const section = (title, ...nodes) => {
    const group = document.createElement('section');
    const heading = document.createElement('h3'); heading.textContent = title;
    group.append(heading, ...nodes.filter(Boolean)); drawer.appendChild(group);
  };
  section('Places', chapterLabel, document.querySelector('.scene-nav'));
  section('Look closer', document.querySelector('label:has(#landmark)'));
  section('View & sound', nav, note);
  section('Stories & guide', document.querySelector('.story-actions'), document.querySelector('.disclaimer'));
  document.body.appendChild(drawer);
  let returnFocus = trigger;
  const close = () => drawer.close();
  trigger.addEventListener('click', () => { drawer.showModal(); document.getElementById('close-explore').focus(); });
  document.getElementById('close-explore').addEventListener('click', close);
  drawer.addEventListener('close', () => {
    trigger.setAttribute('aria-expanded', 'false');
    if (!document.getElementById('panel')?.open) returnFocus.focus();
    returnFocus = trigger;
  });
  drawer.addEventListener('click', e => {
    if (e.target.closest('.landmark-tokens .token')) { returnFocus = document.getElementById('discover'); close(); }
  });
  // Close the exploration panel before opening a story dialog, never stack dialogs.
  for (const id of ['photograph', 'guide']) document.getElementById(id).addEventListener('click', close, true);
  trigger.addEventListener('click', () => trigger.setAttribute('aria-expanded', 'true'));
  trigger.setAttribute('aria-expanded', 'false');
  // The scene gets all remaining height as story text wraps at narrow widths.
  const story = document.getElementById('story');
  let previous = 0;
  new ResizeObserver(() => {
    const height = Math.ceil(story.getBoundingClientRect().height);
    if (height === previous) return;
    previous = height; document.documentElement.style.setProperty('--story-height', height + 'px');
    window.dispatchEvent(new Event('resize'));
  }).observe(story);
}
