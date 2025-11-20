const tournaments = [
  { id: 't1', title: 'FF Global: Winter Clash', region: 'global', type: 'squad', date: '2026-01-15T14:00:00Z', prize: 50000, image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=1600&auto=format&fit=crop' },
  { id: 't2', title: 'Asia Elite Cup', region: 'asia', type: 'duo', date: '2025-12-12T12:00:00Z', prize: 15000, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop' },
  { id: 't3', title: 'Europe Legends', region: 'europe', type: 'squad', date: '2026-02-02T16:00:00Z', prize: 25000, image: 'https://images.unsplash.com/photo-1508697014387-9d1d3f9e6f52?q=80&w=1600&auto=format&fit=crop' },
  { id: 't4', title: 'Americas Showdown', region: 'americas', type: 'solo', date: '2026-03-20T18:00:00Z', prize: 10000, image: 'https://images.unsplash.com/photo-1603791440384-56cd371ee9a7?q=80&w=1600&auto=format&fit=crop' },
  { id: 't5', title: 'Rising Stars: Open Qualifier', region: 'global', type: 'squad', date: '2025-11-30T10:00:00Z', prize: 5000, image: 'https://images.unsplash.com/photo-1512341689857-198e7d1f050a?q=80&w=1600&auto=format&fit=crop' },
  { id: 't6', title: 'Night Ops Tournament', region: 'asia', type: 'duo', date: '2026-04-10T20:00:00Z', prize: 8000, image: 'https://images.unsplash.com/photo-1540432523512-7f8d68e2f1a2?q=80&w=1600&auto=format&fit=crop' }
];

const el = sel => document.querySelector(sel);
const elAll = sel => Array.from(document.querySelectorAll(sel));

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString(undefined, {dateStyle:'medium', timeStyle:'short'});
}

function renderTournaments(list){
  const grid = el('#tournament-grid');
  grid.innerHTML = '';
  if(!list.length){ el('#no-results').hidden = false; return; }
  el('#no-results').hidden = true;
  list.forEach(t=>{
    const card = document.createElement('article');
    card.className = 'card';
    const bgAttr = t.image ? `style="background-image:url('${t.image}');" class="thumb has-bg"` : 'class="thumb"';
    card.innerHTML = `
      <div ${bgAttr}></div>
      <div class="card-body">
        <div class="meta">${formatDate(t.date)} · ${t.region.toUpperCase()}</div>
        <div class="title">${t.title}</div>
        <div class="meta">Type: ${t.type}</div>
        <div class="badges">
          <div class="badge">Prize: $${t.prize.toLocaleString()}</div>
          <div class="badge">Slots: 128</div>
          <button class="btn btn-primary btn-register" data-id="${t.id}">Register</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  populateTournamentSelect(list);
}

function populateTournamentSelect(list){
  const sel = el('#tournament-select');
  if(!sel) return;
  sel.innerHTML = list.map(t=>`<option value="${t.id}">${t.title} — ${t.region.toUpperCase()} — ${formatDate(t.date)}</option>`).join('');
}

function applyFilters(){
  const q = el('#search').value.trim().toLowerCase();
  const region = el('#filter-region').value;
  const type = el('#filter-type').value;
  const sort = el('#sort-by').value;

  let out = tournaments.filter(t=>{
    const inSearch = [t.title,t.region,t.type,String(t.prize)].join(' ').toLowerCase().includes(q);
    const okRegion = region==='all' || t.region===region;
    const okType = type==='all' || t.type===type;
    return inSearch && okRegion && okType;
  });

  if(sort==='upcoming') out.sort((a,b)=>new Date(a.date)-new Date(b.date));
  else if(sort==='newest') out.sort((a,b)=>new Date(b.date)-new Date(a.date));
  else if(sort==='prize') out.sort((a,b)=>b.prize - a.prize);

  renderTournaments(out);
}

// debounce helper
function debounce(fn,wait=200){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),wait)}}

// modal and registration
function openModal(){
  const modal = el('#modal-register');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  const modal = el('#modal-register');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden','true');
}

function showToast(msg, duration=3000){
  const t = el('#toast');
  t.textContent = msg; t.hidden = false; t.style.opacity = '1';
  setTimeout(()=>{t.hidden = true; t.style.opacity='0';}, duration);
}

function saveRegistration(data){
  const key = 'ffg_registrations';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.push(data);
  localStorage.setItem(key, JSON.stringify(arr));
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderTournaments(tournaments);

  el('#search').addEventListener('input', debounce(applyFilters,250));
  el('#filter-region').addEventListener('change', applyFilters);
  el('#filter-type').addEventListener('change', applyFilters);
  el('#sort-by').addEventListener('change', applyFilters);

  // open register (header)
  el('#open-register').addEventListener('click', ()=>{ openModal(); });

  // delegate register buttons
  document.body.addEventListener('click', (ev)=>{
    const b = ev.target.closest('.btn-register');
    if(!b) return;
    const id = b.dataset.id;
    openModal();
    // select the tournament
    const sel = el('#tournament-select');
    if(sel){
      // try to prioritize the chosen tournament in select
      sel.value = id;
    }
  });

  // modal close handlers
  el('#modal-close').addEventListener('click', closeModal);
  el('#cancel-register').addEventListener('click', closeModal);
  el('#modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  // registration submission
  el('#register-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const data = {
      id: 'r_' + Math.random().toString(36).slice(2,9),
      team: fd.get('team'),
      email: fd.get('email'),
      region: fd.get('region'),
      tournamentId: fd.get('tournamentId'),
      createdAt: new Date().toISOString()
    };
    saveRegistration(data);
    showToast('Registration submitted — check your email for details');
    closeModal();
    ev.target.reset();
  });
});

// Expose applyFilters to console for debugging
window.applyFilters = applyFilters;

/* Image uploader: drag & drop, previews, validation */
const UP = {
  allowed: ['image/jpeg','image/png','image/webp'],
  maxFileBytes: 5 * 1024 * 1024, // 5MB per file
  maxTotalBytes: 25 * 1024 * 1024 // 25MB total (optional)
};

function bytesToSize(bytes){
  if(bytes === 0) return '0 B';
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes)/Math.log(1024));
  return parseFloat((bytes/Math.pow(1024,i)).toFixed(2)) + ' ' + sizes[i];
}

function initUploader(){
  const drop = el('#dropzone');
  const input = el('#file-input');
  const previews = el('#previews');
  const count = el('#selected-count');
  const clearAll = el('#clear-all');
  let files = [];

  function updateCount(){ count.textContent = files.length; }

  function validateFile(f){
    if(!UP.allowed.includes(f.type)) return `Invalid format: ${f.name}`;
    if(f.size > UP.maxFileBytes) return `File too large: ${f.name} (${bytesToSize(f.size)}). Max ${bytesToSize(UP.maxFileBytes)}`;
    const total = files.reduce((s,ff)=>s+ff.file.size,0) + f.size;
    if(total > UP.maxTotalBytes) return `Total upload size exceeded. Remove files or upload smaller images.`;
    return null;
  }

  function makePreview(item){
    const wrap = document.createElement('div');
    wrap.className = 'preview';
    wrap.dataset.id = item.id;
    const img = document.createElement('img'); img.src = item.url; img.alt = item.file.name;
    const meta = document.createElement('div'); meta.className = 'meta';
    const name = document.createElement('div'); name.textContent = item.file.name;
    const right = document.createElement('div');
    const size = document.createElement('span'); size.className = 'size'; size.textContent = bytesToSize(item.file.size);
    const rem = document.createElement('button'); rem.className = 'remove'; rem.title = 'Remove image'; rem.innerHTML = '✕';
    rem.addEventListener('click', ()=>{ removeFile(item.id); });
    right.appendChild(size); right.appendChild(rem);
    meta.appendChild(name); meta.appendChild(right);
    wrap.appendChild(img); wrap.appendChild(meta);

    // assign controls: select tournaments + apply
    const assign = document.createElement('div'); assign.className = 'assign';
    const sel = document.createElement('select'); sel.className = 'assign-select';
    sel.innerHTML = getTournamentOptions();
    // default the select to the 3rd tournament to speed applying to card 3
    try{ sel.value = (tournaments[2] && tournaments[2].id) || ''; }catch(e){ /* ignore */ }
    const applyBtn = document.createElement('button'); applyBtn.className = 'apply'; applyBtn.textContent = 'Apply';
    applyBtn.addEventListener('click', ()=>{
      const tid = sel.value;
      if(!tid){ showToast('Please choose a tournament to apply this image to'); return; }
      applyImageToTournament(item.url, tid);
      wrap.classList.add('applied');
    });
    assign.appendChild(sel); assign.appendChild(applyBtn);
    wrap.appendChild(assign);

    previews.appendChild(wrap);
  }

  function getTournamentOptions(){
    return ['<option value="">— choose tournament —</option>', ...tournaments.map(t=>`<option value="${t.id}">${t.title}</option>` )].join('');
  }

  function applyImageToTournament(imageUrl, tournamentId){
    const t = tournaments.find(x=>x.id===tournamentId);
    if(!t){ showToast('Tournament not found'); return; }
    t.image = imageUrl;
    renderTournaments(tournaments);
    showToast('Image applied to: ' + t.title);
  }

  function applySequential(){
    if(!files.length){ showToast('No uploaded images to apply'); return; }
    const n = Math.min(files.length, tournaments.length);
    for(let i=0;i<n;i++){
      tournaments[i].image = files[i].url;
    }
    renderTournaments(tournaments);
    showToast(`Applied ${n} images to tournaments`);
  }

  function removeFile(id){
    const idx = files.findIndex(x=>x.id===id);
    if(idx===-1) return;
    const item = files[idx];
    URL.revokeObjectURL(item.url);
    files.splice(idx,1);
    const node = previews.querySelector(`.preview[data-id="${id}"]`);
    if(node) node.remove();
    updateCount();
  }

  function clearFiles(){
    files.forEach(f=>URL.revokeObjectURL(f.url));
    files = [];
    previews.innerHTML = '';
    updateCount();
  }

  function handleFilesList(list){
    const arr = Array.from(list);
    for(const f of arr){
      const err = validateFile(f);
      if(err){ showToast(err, 4000); continue; }
      const id = 'img_' + Math.random().toString(36).slice(2,9);
      const url = URL.createObjectURL(f);
      const item = {id, file: f, url};
      files.push(item);
      makePreview(item);
      updateCount();
    }
  }

  // Drag & drop handlers
  ['dragenter','dragover'].forEach(evt=>{
    drop.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); drop.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    drop.addEventListener(evt, (e)=>{ e.preventDefault(); e.stopPropagation(); drop.classList.remove('dragover'); });
  });
  drop.addEventListener('drop', (e)=>{ const dt = e.dataTransfer; if(!dt) return; handleFilesList(dt.files); });

  // Click to open file dialog
  drop.addEventListener('click', ()=> input.click());
  drop.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') input.click(); });

  // File input change
  input.addEventListener('change', (e)=>{ handleFilesList(e.target.files); e.target.value = ''; });

  clearAll.addEventListener('click', clearFiles);

  // apply-all button
  const applyAllBtn = el('#apply-all');
  if(applyAllBtn) applyAllBtn.addEventListener('click', applySequential);

  // expose for debugging
  window._uploader = { getFiles: ()=>files, clear: clearFiles };
}

document.addEventListener('DOMContentLoaded', initUploader);
