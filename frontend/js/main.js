const LINKS = [
  ['/', 'Home'],
  ['/services', 'Services'],
  ['/work', 'Work'],
  ['/about', 'About'],
  ['/insights', 'Insights'],
  ['/careers', 'Careers']
];

const here = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '') || '/';

function renderChrome() {
  const header = document.getElementById('site-header');
  if (header) {
    header.className = 'site-header';
    header.innerHTML = `<div class="container">
      <a class="logo" href="/">NORD<span>IS</span></a>
      <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
      <nav class="nav">
        ${LINKS.map(([href, label]) => `<a href="${href}"${href === here ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        <a class="btn btn-primary" href="/contact">Contact us</a>
      </nav></div>`;
    const toggle = header.querySelector('.menu-toggle');
    const nav = header.querySelector('.nav');
    toggle.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', String(nav.classList.toggle('open')));
    });
  }
  const footer = document.getElementById('site-footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `<div class="container"><div class="cols">
      <div><strong>Nordis</strong><br>Software and design studio.</div>
      <div>${LINKS.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}<a href="/contact">Contact</a></div>
      </div><small>&copy; ${new Date().getFullYear()} Nordis. All rights reserved.</small></div>`;
  }
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function fill(id, endpoint, render) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(res.status);
    const items = await res.json();
    el.innerHTML = items.map(render).join('');
  } catch {
    el.innerHTML = '<p class="lead">Content could not be loaded right now.</p>';
  }
}

function initLists() {
  const limit = (n) => Number(document.body.dataset.limit) || n;
  fill('services-list', '/api/services', (s) => `<article class="card"><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p></article>`);
  fill('work-list', '/api/case-studies', (c) => `<article class="card"><span class="tag">${esc(c.industry)}</span><h3>${esc(c.client)}</h3><p>${esc(c.summary)}</p><p class="result">${esc(c.result)}</p></article>`);
  fill('posts-list', '/api/posts', (p) => `<article class="card"><span class="tag">${esc(p.date)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></article>`);
  fill('jobs-list', '/api/jobs', (j) => `<article class="card"><span class="tag">${esc(j.type)}</span><h3>${esc(j.title)}</h3><p>${esc(j.location)}</p></article>`);
  fill('team-list', '/api/team', (m) => `<article class="card"><h3>${esc(m.name)}</h3><p>${esc(m.role)}</p></article>`);
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = document.getElementById('form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.querySelectorAll('.error').forEach((n) => (n.textContent = ''));
    status.textContent = 'Sending…';
    status.className = 'status';
    const body = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (res.ok) {
        form.reset();
        status.textContent = 'Thanks, we will be in touch soon.';
        status.className = 'status ok';
      } else {
        for (const [k, v] of Object.entries(json.errors || {})) {
          const el = form.querySelector(`[data-error="${k}"]`);
          if (el) el.textContent = v;
        }
        status.textContent = 'Please fix the highlighted fields.';
        status.className = 'status fail';
      }
    } catch {
      status.textContent = 'Something went wrong. Please try again.';
      status.className = 'status fail';
    }
  });
}

renderChrome();
initLists();
initContactForm();
