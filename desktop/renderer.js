const $ = id => document.getElementById(id);
  let project = '', rubro = '', people = new Set(), prio = false;
  const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

  function renderChips(el, list, isOn, attr) {
    el.innerHTML = list.map(n => `<button type="button" class="chip ${isOn(n) ? 'on' : ''}" ${attr}="${esc(n)}">${esc(n)}</button>`).join('');
  }
  let lists = { projects: [], people: [], rubros: [] };
  function drawLists() {
    renderChips($('projects'), lists.projects, n => n === project, 'data-p');
    $('projects').insertAdjacentHTML('beforeend', '<button type="button" class="chip dash" data-other="project">+ Otro</button>');
    renderChips($('rubros'), lists.rubros, n => n === rubro, 'data-r');
    $('rubros').insertAdjacentHTML('beforeend', '<button type="button" class="chip dash" data-other="rubro">+ Otros</button>');
    renderChips($('people'), lists.people, n => people.has(n), 'data-n');
    $('people').insertAdjacentHTML('beforeend', '<button type="button" class="chip dash" data-other="person">+ Persona</button>');
  }
  function showInput(id) { const el = $(id); el.style.display = ''; el.focus(); }
  function commitNew(id, list, onAdd) {
    const el = $(id); const name = el.value.trim();
    if (!name) return;
    const existing = list.find(x => x.toLowerCase() === name.toLowerCase());
    const final = existing || name;
    if (!existing) list.push(final);
    onAdd(final);
    el.value = ''; el.style.display = 'none';
    drawLists();
  }
  async function load() {
    const r = await window.api.getLists();
    if (r.error) { $('msg').textContent = r.error; $('go').disabled = true; return; }
    $('go').disabled = false;
    lists = { projects: [...r.projects], people: [...r.people], rubros: [...r.rubros] };
    drawLists();
  }
  $('projects').onclick = e => {
    if (e.target.closest('[data-other]')) return showInput('newProject');
    const b = e.target.closest('[data-p]'); if (!b) return;
    project = project === b.dataset.p ? '' : b.dataset.p; drawLists();
  };
  $('rubros').onclick = e => {
    if (e.target.closest('[data-other]')) return showInput('newRubro');
    const b = e.target.closest('[data-r]'); if (!b) return;
    rubro = rubro === b.dataset.r ? '' : b.dataset.r; drawLists();
  };
  $('people').onclick = e => {
    if (e.target.closest('[data-other]')) return showInput('newPerson');
    const b = e.target.closest('[data-n]'); if (!b) return;
    const n = b.dataset.n; people.has(n) ? people.delete(n) : people.add(n); drawLists();
  };
  $('newProject').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitNew('newProject', lists.projects, n => { project = n; }); } });
  $('newRubro').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitNew('newRubro', lists.rubros, n => { rubro = n; }); } });
  $('newPerson').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); commitNew('newPerson', lists.people, n => people.add(n)); } });
  function reset() {
    $('text').value = ''; $('date').value = ''; $('time').value = ''; project = ''; rubro = ''; people = new Set(); prio = false; $('shop').value = '';
    $('prio').classList.remove('on'); $('msg').textContent = ''; $('msg').className = 'msg';
    $('newProject').style.display = 'none'; $('newRubro').style.display = 'none'; $('newPerson').style.display = 'none';
  }
  async function submit() {
    if ($('newProject').value.trim()) commitNew('newProject', lists.projects, n => { project = n; });
    if ($('newRubro').value.trim()) commitNew('newRubro', lists.rubros, n => { rubro = n; });
    if ($('newPerson').value.trim()) commitNew('newPerson', lists.people, n => people.add(n));
    if (!$('text').value.trim()) { $('msg').textContent = 'Escribe la tarea.'; return; }
    $('go').disabled = true;
    const r = await window.api.addTask({ text: $('text').value, project, rubro, shopping: $('shop').value.split('\n').map(x => x.trim()).filter(Boolean), assignees: [...people], dueDate: $('date').value, dueTime: $('time').value, highPriority: prio });
    $('go').disabled = false;
    if (r.error) { $('msg').className = 'msg'; $('msg').textContent = r.error; return; }
    $('msg').className = 'msg ok'; $('msg').textContent = '✓ Añadida';
    setTimeout(() => { reset(); window.api.hide(); load(); }, 500);
  }
  $('go').onclick = submit;
  $('prio').onclick = () => { prio = !prio; $('prio').classList.toggle('on', prio); };
  $('web').onclick = () => window.api.openWeb();
  $('text').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } else if (e.key === 'Escape') window.api.hide(); });
  window.api.onShown(() => { load(); $('text').focus(); });
  load();
