; (() => {
    'use strict';

    // ── Config ─────────────────────────────────────────
    const MODE = {
        driving: { color: '#4285f4', label: 'Drive', icon: 'ph-car' },
        cycling: { color: '#34a853', label: 'Cycle', icon: 'ph-bicycle' },
        walking: { color: '#b88315', label: 'Walk', icon: 'ph-person-simple-walk' },
    };

    const TILES = {
        light: { url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
        satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: '© Esri' },
    };
    const STREET_STYLE = 'https://tiles.openfreemap.org/styles/liberty';
    const STREET_ATTRIBUTION = '<a href="https://openfreemap.org/">OpenFreeMap</a> © <a href="https://openmaptiles.org/">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

    // Keep Leaflet's existing places, routes, and controls over a crisp vector basemap.
    function createStreetLayer(onFallback = () => {}) {
        const raster = () => L.tileLayer(TILES.light.url, { attribution: TILES.light.attr, maxZoom: 19 });
        if (!window.maplibregl || !L.maplibreGL) return raster();
        try {
            const context = document.createElement('canvas').getContext('webgl2');
            if (!context) return raster();
            context.getExtension('WEBGL_lose_context')?.loseContext();
        } catch { return raster(); }

        const vector = L.maplibreGL({ style: STREET_STYLE, attributionControl: { customAttribution: STREET_ATTRIBUTION } });
        const group = L.layerGroup([vector]);
        let loadTimer;
        let fellBack = false;
        let active = false;
        const fallback = () => {
            if (fellBack || !active) return;
            fellBack = true;
            clearTimeout(loadTimer);
            group.removeLayer(vector);
            const fallbackLayer = raster();
            fallbackLayer.on('tileerror', event => group.fire('tileerror', event));
            group.addLayer(fallbackLayer);
            onFallback();
        };
        group.on('add', () => {
            active = true;
            if (fellBack) return;
            const gl = vector.getMaplibreMap();
            gl.once('load', () => clearTimeout(loadTimer));
            gl.once('webglcontextlost', fallback);
            gl.once('error', () => setTimeout(fallback, 0));
            loadTimer = setTimeout(() => { if (!gl.isStyleLoaded()) fallback(); }, 12000);
        });
        group.on('remove', () => { active = false; clearTimeout(loadTimer); });
        return group;
    }

    // ── State ──────────────────────────────────────────
    const S = {
        mode: 'driving',
        origin: null,       // { lat, lng, name }
        dest: null,
        routeLine: null,
        routeShadow: null,
        alternativeLines: [], // lines for inactive routes
        routeBadges: [],      // labels on the map
        originMarker: null,
        destMarker: null,
        userMarker: null,
        markers: [],
        tileKey: 'light',
        dirOpen: false,
        layersOpen: false,
        sidebarOpen: false,
        activeCategories: new Set(), // empty = show all; selecting a category = filter to that category
        ecoMarkers: [],
        allRouteData: {},   // cache route data per mode
        activeRouteIdx: 0,
        ecoGameActive: false,
    };

    let restoringView = false;
    let showLearningGuide;
    let view = 'home';
    function recordView(next, replace = false) {
        view = next;
        document.body.dataset.view = next;
        document.querySelectorAll('[data-site-view]').forEach(button => {
            const active = button.dataset.siteView === (next.startsWith('goal-') ? 'learn' : next);
            if (active) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        if (restoringView) return;
        if (location.hash === '#' + next) return;
        history[replace ? 'replaceState' : 'pushState']({ view: next }, '', location.pathname + '#' + next);
    }

    // ── Helpers ────────────────────────────────────────
    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);
    const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function fmt(m) { return GreenNavigation.distance(m, getSettings().unit); }
    function dur(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h} hr ${m} min` : `${m} min`; }
    function durShort(s) { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m} min`; }

    function toast(msg, type = 'info', ms = 3000) {
        const icons = { success: 'ph-bold ph-check-circle', error: 'ph-bold ph-warning-circle', info: 'ph-bold ph-info' };
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.innerHTML = `<i class="${icons[type] || icons.info}"></i><span>${msg}</span>`;
        $('#toast-container').appendChild(el);
        setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 250); }, ms);
    }

    async function geocode(q, limit = 5) {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=${limit}&addressdetails=1`);
        return r.json();
    }

    async function reverseGeocode(lat, lng) {
        try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
            const d = await r.json();
            return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        } catch { return `${lat.toFixed(5)}, ${lng.toFixed(5)}`; }
    }

    // ── DOM ────────────────────────────────────────────
    const dom = {
        loadingScreen: $('#loading-screen'),
        searchInput: $('#search-input'),
        searchClear: $('#search-clear-btn'),
        searchResults: $('#search-results'),
        directionsBtn: $('#directions-btn'),
        menuBtn: $('#menu-btn'),
        dirPanel: $('#directions-panel'),
        dirBack: $('#dir-back-btn'),
        dirOrigin: $('#dir-origin'),
        dirDest: $('#dir-destination'),
        dirOriginAC: $('#dir-origin-results'),
        dirDestAC: $('#dir-dest-results'),
        dirSwap: $('#dir-swap-btn'),
        modeTabs: $$('.dir-mode-tab'),
        etaDriving: $('#eta-driving'),
        etaCycling: $('#eta-cycling'),
        etaWalking: $('#eta-walking'),
        alternativesList: $('#alternatives-list'),
        routeSummary: $('#route-summary'),
        routeDuration: $('#route-duration'),
        routeDetails: $('#route-details'),
        routeVia: $('#route-via'),
        stepsList: $('#steps-list'),
        dirBottom: $('#dir-bottom-bar'),
        startNavBtn: $('#start-nav-btn'),
        clearRouteBtn: $('#clear-route-btn'),
        totalSpots: $('#total-spots'),
        collectRewardBtn: $('#collect-reward-btn'),
        guideStartGameBtn: $('#guide-start-game-btn'), // The button in the guide section
        gameModal: $('#game-modal'),
        gameStartBtn: $('#game-start-btn'),
        gameTimerBar: $('#game-timer-bar'),
        gameCountdown: $('#game-countdown'),
        gamePhaseLabel: $('#game-phase-label'),
        gameIntroView: $('#game-intro-view'),
        gameResultsView: $('#game-results-view'),
        gameRecallPanel: $('#game-recall-panel'),
        gameRecallInputs: $('#game-recall-inputs'),
        gameSubmitBtn: $('#game-submit-btn'),
        gameFinalScore: $('#game-final-score'),
        gameFeedback: $('#game-feedback'),
        gameReplayBtn: $('#game-replay-btn'),
        gameExitBtn: $('#game-exit-btn'),
        sdgLessonRole: $('#sdg-lesson-role'),
        locateBtn: $('#locate-btn'),
        categoriesList: $('#sidebar-categories-list'),
        sidebarMenu: $('#sidebar-menu'),
        sidebarOverlay: $('#sidebar-overlay'),
        sidebarClose: $('#sidebar-close-btn'),
        landingPage: $('#landing-page'),
        startExploringBtn: $('#start-exploring-btn'),
        layersBtn: $('#layers-btn'),
        layersPanel: $('#layers-panel'),
        layersClose: $('#layers-close-btn'),
        layerCards: $$('.layer-card'),
        zoomIn: $('#zoom-in-btn'),
        zoomOut: $('#zoom-out-btn'),
        infoCard: $('#info-card'),
        featuredCarousel: $('#featured-carousel'),
        infoTitle: $('#info-card-title'),
        infoSub: $('#info-card-subtitle'),
        infoClose: $('#info-card-close'),
        infoDirBtn: $('#info-directions-btn'),
        infoVisitedBtn: $('#info-visited-btn'),
        infoSavedBtn: $('#info-saved-btn'),
        infoShareBtn: $('#info-share-btn'),
        toastContainer: $('#toast-container'),
        settingsBtn: $('#settings-btn'),
        suggestBtn: $('#suggest-btn'),
        suggestModal: $('#suggest-modal'),
        suggestClose: $('#suggest-close-btn'),
        suggestForm: $('#suggest-form'),
        suggestStatus: $('#suggest-status'),
        suggestSubmitBtn: $('#suggest-submit-btn'),
        settingsModal: $('#settings-modal'),
        settingsClose: $('#settings-close-btn'),
        stButtons: $$('.st-btn'),
        stResetData: $('#st-reset-data'),
        myPlacesList: $('#my-places-list'),
        fcClose: $('#fc-close-btn'),
        fcPause: $('#fc-pause-btn'),
        fcShow: $('#fc-show-btn'),
        fcPrev: $('#fc-prev-btn'),
        fcNext: $('#fc-next-btn'),
        eduModal: $('#edu-modal'),
        eduClose: $('#edu-close-btn'),
        eduCloseBottom: $('#edu-close-bottom-btn'),
        sidebarEduBtn: $('#sidebar-edu-btn'),
        landingEduBtn: $('#landing-edu-btn'),
        lpEduScrollBtn: $('#landing-edu-scroll-btn'),
        mapEduBtn: $('#map-edu-btn'),
        infoSdg: $('#info-sdg-container'),
        eduLessons: $('#edu-lessons-container'),
        lpLessons: $('#lp-lessons-container'),
        sdgTrack: $('#sdg-track'),
        lpGoalChallenges: $('#lp-goal-challenges'),
        lpCompleteBtn: $('#lp-complete-btn'),
        sdgModal: $('#sdg-lesson-modal'), // Deprecated but kept for transition
        sdgClose: $('#sdg-lesson-close'),
        sdgComplete: $('#sdg-lesson-complete-btn'),
        lessonPage: $('#lesson-page'),
        lessonBack: $('#lesson-page-back'),
        lpGoalIcon: $('#lp-goal-icon'),
        lpGoalNum: $('#lp-goal-num'),
        lpGoalTitle: $('#lp-goal-title'),
        lpGoalRole: $('#lp-goal-role'),
        lpGoalTargets: $('#lp-goal-targets'),
        lpGoalFact: $('#lp-goal-fact'),
        lpGoalAction: $('#lp-goal-action'),
        lpGoalProgress: $('#lp-goal-progress'),
        lpGoalChallenges: $('#lp-goal-challenges'),
        lpCompleteBtn: $('#lp-complete-btn'),
        searchGoBtn: $('#search-go-btn'),
        searchLocateBtn: $('#search-locate-btn'),
    };

    // ── Retention Engine ───────────────────────────────
    const VISITED_KEY = 'vibemap_visited';
    const SAVED_KEY = 'vibemap_saved';

    function getVisited() { 
        try { 
            return new Set(JSON.parse(localStorage.getItem(VISITED_KEY) || '[]')); 
        } catch(e) { 
            return new Set(); 
        } 
    }
    function isVisited(id) { return getVisited().has(id); }
    function toggleVisited(id) {
        const v = getVisited();
        v.has(id) ? v.delete(id) : v.add(id);
        localStorage.setItem(VISITED_KEY, JSON.stringify([...v]));
        return v.has(id);
    }

    function getSaved() { 
        try { 
            return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); 
        } catch(e) { 
            return new Set(); 
        } 
    }
    function isSaved(id) { return getSaved().has(id); }
    function toggleSaved(id) {
        const s = getSaved();
        s.has(id) ? s.delete(id) : s.add(id);
        localStorage.setItem(SAVED_KEY, JSON.stringify([...s]));
        return s.has(id);
    }

    const CHALLENGES = [
        { text: 'Drink from a public fountain today 💧', category: 'drinking-water' },
        { text: 'Visit a zero-waste shop 🛍️', category: 'zero-waste' },
        { text: 'Try a vegan meal 🌱', category: 'vegan' },
        { text: 'Rent a bike for your next trip 🚲', category: 'bike-rental' },
        { text: 'Check out an eco-certified hotel 🏨', category: 'eco-hotel' },
        { text: 'Plug in at an EV station ⚡', category: 'ev-charging' },
        { text: 'Find something second-hand today 👕', category: 'secondhand' },
        { text: 'Visit a Swisstainable spot 🇨🇭', category: 'swisstainable' },
        { text: 'Try a local eco activity 🎟️', category: 'activity' },
    ];
    function getTodayChallenge() {
        return CHALLENGES[Math.floor(Date.now() / 86400000) % CHALLENGES.length];
    }
    function getChallengeKey() { return 'vibemap_ch_' + new Date().toDateString(); }
    function isChallengeCompleted() { return localStorage.getItem(getChallengeKey()) === '1'; }
    function markChallengeComplete() { localStorage.setItem(getChallengeKey(), '1'); }

    function getEcoLevel(n) {
        if (n >= 25) return { label: 'Forest 🌲🌲', color: '#059669' };
        if (n >= 10) return { label: 'Tree 🌳', color: '#10b981' };
        if (n >= 3) return { label: 'Sapling 🌿', color: '#34d399' };
        return { label: 'Seedling 🌱', color: '#4285f4' };
    }

    function updateEcoScore() {
        const el = document.getElementById('eco-score-widget');
        if (!el) return;
        const count = getVisited().size;
        const total = SUSTAINABLE_LOCATIONS.length;
        const level = getEcoLevel(count);
        const pct = Math.min(100, Math.round(count / total * 100));
        el.innerHTML = `
            <div class="eco-score-level">${level.label}</div>
            <div class="eco-score-count">${count} of ${total} spots visited</div>
            <div class="eco-score-bar"><div class="eco-score-fill" style="width:${pct}%;background:${level.color}"></div></div>
        `;
    }

    function renderDailyChallenge() {
        const el = document.getElementById('daily-challenge-widget');
        if (!el) return;
        const ch = getTodayChallenge();
        const done = isChallengeCompleted();
        el.innerHTML = `
            <div class="challenge-label">⚡ Daily Eco Challenge</div>
            <div class="challenge-text ${done ? 'done' : ''}">${ch.text}</div>
            ${done ? '<div class="challenge-complete-badge">✅ Completed today!</div>' : ''}
        `;
    }

    // ── Streak Engine ──────────────────────────────────
    const STREAK_KEY = 'vibemap_streak_dates';

    function getTodayStr() { return new Date().toDateString(); }

    function getStreakDates() {
        try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '[]'); } catch { return []; }
    }

    function recordVisitToday() {
        const today = getTodayStr();
        const dates = getStreakDates();
        if (!dates.includes(today)) {
            dates.push(today);
            localStorage.setItem(STREAK_KEY, JSON.stringify(dates));
            return true;
        }
        return false;
    }

    function calcStreak() {
        let rawDates = getStreakDates();
        if (!Array.isArray(rawDates)) rawDates = [];
        const validDates = rawDates.filter(d => !isNaN(new Date(d).getTime()));
        const dates = validDates.map(d => new Date(d).setHours(0, 0, 0, 0)).sort((a, b) => b - a);

        if (!dates.length) return 0;
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = today - 86400000;
        
        if (dates[0] !== today && dates[0] !== yesterday) return 0;
        let streak = 1;
        for (let i = 1; i < dates.length; i++) {
            if (dates[i - 1] - dates[i] === 86400000) streak++;
            else break;
        }
        return streak;
    }

    function renderStreak() {
        const el = document.getElementById('streak-widget');
        if (!el) return;
        const streak = calcStreak();
        if (streak === 0) {
            el.innerHTML = `
                <div class="streak-cta" onclick="document.getElementById('sidebar-close-btn').click();">
                    <div class="streak-cta-icon">🌱</div>
                    <div class="streak-cta-body">
                        <div class="streak-cta-title">Start your streak!</div>
                        <div class="streak-cta-sub">Visit a location to build up your streaks</div>
                    </div>
                    <i class="ph-bold ph-caret-right"></i>
                </div>
            `;
            return;
        }
        const flames = streak >= 7 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : '🔥';
        el.innerHTML = `
            <div class="streak-card">
                <div class="streak-flames">${flames}</div>
                <div class="streak-info">
                    <div class="streak-count">${streak}-Day Streak</div>
                    <div class="streak-sub">Keep visiting eco spots daily!</div>
                </div>
            </div>
        `;
    }

    // ── Persistent Progress Strip logic removed at user request ──
    function updateProgressStrip() {
        return; // Overlay removed to keep map clean
    }

    // ── Map Init ───────────────────────────────────────
    const map = L.map('map', {
        center: [47.0480, 8.3200], zoom: 12, zoomControl: false,
        attributionControl: true, minZoom: 2, maxZoom: 18, worldCopyJump: true,
        maxBounds: [[-85, -180], [85, 180]], maxBoundsViscosity: 1,
    });

    let tileLayer;
    function setMapStyle(key) {
        S.tileKey = Object.hasOwn(TILES, key) ? key : 'light';
        if (tileLayer) map.removeLayer(tileLayer);
        tileLayer = S.tileKey === 'light'
            ? createStreetLayer(() => toast('Using the standard street map while the vector map is unavailable.', 'info'))
            : L.tileLayer(TILES.satellite.url, { attribution: TILES.satellite.attr, maxZoom: 19 });
        if (dom.landingPage.classList.contains('hidden')) tileLayer.addTo(map);
        tileLayer.on('tileerror', () => {
            document.getElementById('map-result-count').textContent = 'Map tiles are unavailable. You can still search the guide.';
        });
        dom.layerCards.forEach(card => { card.classList.toggle('active', card.dataset.style === S.tileKey); card.setAttribute('aria-pressed', String(card.dataset.style === S.tileKey)); });
    }
    setMapStyle(getSettings().style);

    // ── Loading ────────────────────────────────────────
    setTimeout(() => {
        dom.loadingScreen.remove();
        document.body.classList.add('guide-ready');
    }, 150);

    // ── Search ─────────────────────────────────────────
    let searchTimer = null;
    dom.searchInput.addEventListener('input', () => {
        const v = dom.searchInput.value.trim();
        mainSearchRevision++;
        dom.searchClear.classList.toggle('hidden', v.length === 0);
        clearTimeout(searchTimer);
        if (v.length < 2) { dom.searchResults.classList.remove('visible'); return; }
        doSearch(v, false);
    });
    dom.searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') { clearTimeout(searchTimer); doSearch(dom.searchInput.value.trim()); }
        if (e.key === 'Escape') { dom.searchResults.classList.remove('visible'); dom.searchInput.blur(); }
    });
    dom.searchClear.addEventListener('click', () => {
        mainSearchRevision++;
        dom.searchInput.value = ''; dom.searchClear.classList.add('hidden');
        dom.searchResults.classList.remove('visible'); dom.searchInput.focus();
    });
    document.addEventListener('click', e => {
        if (!e.target.closest('#search-bar')) dom.searchResults.classList.remove('visible');
    });

    let mainSearchRevision = 0;
    async function doSearch(q, external = true) {
        const revision = ++mainSearchRevision;
        if (!q) return;
        const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
        const matches = SUSTAINABLE_LOCATIONS.filter(loc => `${loc.name} ${loc.address} ${CATEGORIES[loc.category].label}`.toLowerCase().includes(q.toLowerCase()));
        if (matches.length) {
            dom.searchResults.innerHTML = matches.slice(0, 8).map(loc => `<button class="sr-item" data-search-place="${escape(loc.id)}"><span class="sr-icon"><i class="ph ph-map-pin" aria-hidden="true"></i></span><span class="sr-text"><span class="sr-name">${escape(loc.name)}</span><span class="sr-detail">${escape(loc.address)}</span></span></button>`).join('');
            dom.searchResults.classList.add('visible');
            dom.searchResults.querySelectorAll('[data-search-place]').forEach(button => button.addEventListener('click', () => {
                S.activeCategories.clear();
                updateEcoMarkers();
                S.ecoMarkers.find(item => item.loc.id === button.dataset.searchPlace)?.marker.fire('click');
                dom.searchResults.classList.remove('visible');
                dom.searchInput.value = matches.find(loc => loc.id === button.dataset.searchPlace).name;
            }));
            return;
        }
        if (!external) {
            dom.searchResults.innerHTML = '<p class="search-hint">No guide match. Press Enter or Search to look up an address.</p>';
            dom.searchResults.classList.add('visible');
            return;
        }
        try {
            const data = await geocode(q, 6);
            if (revision !== mainSearchRevision || dom.searchInput.value.trim() !== q) return;
            if (!data.length) {
                dom.searchResults.innerHTML = '<div class="sr-item"><div class="sr-text"><div class="sr-name" style="color:var(--text-muted)">No results found</div></div></div>';
                dom.searchResults.classList.add('visible'); return;
            }
            dom.searchResults.innerHTML = data.map(d => `
                <button type="button" class="sr-item" data-lat="${d.lat}" data-lon="${d.lon}" data-name="${escapeHTML(d.display_name.split(',')[0])}">
                    <div class="sr-icon"><i class="ph ph-map-pin"></i></div>
                    <div class="sr-text">
                        <div class="sr-name">${escapeHTML(d.display_name.split(',')[0])}</div>
                        <div class="sr-detail">${escapeHTML(d.display_name)}</div>
                    </div>
                </button>`).join('');
            dom.searchResults.classList.add('visible');
            dom.searchResults.querySelectorAll('.sr-item').forEach(el => {
                el.addEventListener('click', () => {
                    const lat = +el.dataset.lat, lng = +el.dataset.lon, name = el.dataset.name;
                    showLocation(lat, lng, name, el.querySelector('.sr-detail').textContent);
                    dom.searchResults.classList.remove('visible');
                    dom.searchInput.value = name;
                });
            });
        } catch { toast('Search failed', 'error'); }
    }

    // ── Show location (info card + marker + fly) ──────
    let infoMarker = null;
    let infoLat = null, infoLng = null, infoName = null, infoId = null;

    function updateInfoVisitedBtn() {
        const btn = dom.infoVisitedBtn;
        if (!btn) return;
        btn.hidden = !infoId;
        btn.setAttribute('aria-pressed', String(infoId ? isVisited(infoId) : false));
        if (!infoId) { btn.classList.remove('visited-active'); btn.querySelector('i').className = 'ph ph-check-circle'; btn.querySelector('span').textContent = 'Visited'; return; }
        const v = isVisited(infoId);
        btn.classList.toggle('visited-active', v);
        btn.querySelector('i').className = v ? 'ph-bold ph-check-circle' : 'ph ph-check-circle';
        btn.querySelector('span').textContent = v ? 'Visited ✓' : 'Visited';
    }

    function updateInfoSavedBtn() {
        const btn = dom.infoSavedBtn;
        if (!btn) return;
        btn.hidden = !infoId;
        btn.setAttribute('aria-pressed', String(infoId ? isSaved(infoId) : false));
        if (!infoId) { btn.classList.remove('saved-active'); btn.querySelector('i').className = 'ph ph-heart'; btn.querySelector('span').textContent = 'Save'; return; }
        const s = isSaved(infoId);
        btn.classList.toggle('saved-active', s);
        btn.querySelector('i').className = s ? 'ph-fill ph-heart' : 'ph ph-heart';
        btn.querySelector('span').textContent = s ? 'Saved' : 'Save';
    }

    function showLocation(lat, lng, name, fullName, locId = null) {
        map.flyTo([lat, lng], 14, { duration: 1.3 });
        if (infoMarker) map.removeLayer(infoMarker);
        infoMarker = L.marker([lat, lng], {
            icon: L.divIcon({ className: '', html: '<div class="marker-pin red"></div>', iconSize: [32, 32], iconAnchor: [16, 32] })
        }).addTo(map);
        infoLat = lat; infoLng = lng; infoName = name; infoId = locId;
        dom.infoTitle.textContent = name;
        dom.infoSub.textContent = fullName || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        dom.infoSdg.innerHTML = '';
        $('#info-description').hidden = true;
        dom.infoCard.classList.remove('hidden');
        if (dom.featuredCarousel) dom.featuredCarousel.classList.add('hidden');
        updateInfoVisitedBtn();
        updateInfoSavedBtn();
    }

    dom.infoClose.addEventListener('click', () => {
        dom.infoCard.classList.add('hidden');
        if (infoMarker) { map.removeLayer(infoMarker); infoMarker = null; }
        infoId = null;
        map.closePopup();
        dom.searchInput.focus({ preventScroll: true });
    });

    // Saved button handler
    dom.infoSavedBtn?.addEventListener('click', () => {
        if (!infoId) return;
        const nowSaved = toggleSaved(infoId);
        updateInfoSavedBtn();
        const entry = S.ecoMarkers.find(e => e.loc.id === infoId);
        if (entry) refreshChipIcon(entry);
        if (typeof renderMyPlaces === 'function') renderMyPlaces();

        // Update carousel cards if present
        const fcSaveBtns = document.querySelectorAll(`.fc-save-btn[data-id="${infoId}"]`);
        fcSaveBtns.forEach(b => {
            b.style.color = nowSaved ? '#ef4444' : 'var(--text-secondary)';
            b.innerHTML = `<i class="${nowSaved ? 'ph-fill ph-heart' : 'ph ph-heart'}"></i>`;
        });

        toast(nowSaved ? '❤ Added to My Places' : 'Removed from My Places', 'info');
    });

    // Visited button handler
    dom.infoVisitedBtn.addEventListener('click', () => {
        if (!infoId) return;
        const prevCount = getVisited().size;
        const prevLevel = getEcoLevel(prevCount);
        
        const nowVisited = toggleVisited(infoId);
        updateInfoVisitedBtn();
        // Update the chip on the map
        const entry = S.ecoMarkers.find(e => e.loc.id === infoId);
        if (entry) refreshChipIcon(entry);
        updateEcoScore();

        const newCount = getVisited().size;
        const newLevel = getEcoLevel(newCount);

        if (nowVisited && newLevel.label !== prevLevel.label) {
            dom.menuBtn.classList.add('has-notification');
            toast(`🌟 Level Up! You're now a ${newLevel.label}!`, 'success', 5000);
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, zIndex: 99999 });
        } else if (nowVisited) {
            toast('✅ Spot marked as visited!', 'success');
        } else {
            toast('Removed from visited', 'info');
        }

        // Record today's visit for streak tracking
        if (nowVisited) { recordVisitToday(); renderStreak(); }
        
        // Check if this completes today's challenge
        const ch = getTodayChallenge();
        const loc = SUSTAINABLE_LOCATIONS.find(l => l.id === infoId);
        if (nowVisited && loc && loc.category === ch.category && !isChallengeCompleted()) {
            markChallengeComplete();
            renderDailyChallenge();
            dom.menuBtn.classList.add('has-notification');
            setTimeout(() => {
                toast('🎉 Daily challenge completed!', 'success', 4000);
                if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 80, origin: { y: 0.8 }, zIndex: 99999 });
            }, 600);
        }

        // Update the always-visible progress strip
        updateProgressStrip();
    });

    dom.infoDirBtn.addEventListener('click', () => {
        if (infoLat != null) {
            openDirections();
            setPoint('dest', infoLat, infoLng, infoName);
            dom.infoCard.classList.add('hidden');
            if (infoMarker) { map.removeLayer(infoMarker); infoMarker = null; }
            if (!S.origin) dom.dirOrigin.focus();
        }
    });

    async function copyToClipboard(text) {
        if (!navigator.clipboard) {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                return successful ? Promise.resolve() : Promise.reject();
            } catch (err) {
                document.body.removeChild(textArea);
                return Promise.reject(err);
            }
        }
        return navigator.clipboard.writeText(text);
    }

    dom.infoShareBtn.addEventListener('click', () => {
        if (infoLat != null) {
            // Build the site URL for sharing
            const baseUrl = window.location.origin + window.location.pathname;
            const url = infoId
                ? `${baseUrl}?loc=${infoId}`
                : `${baseUrl}?lat=${infoLat.toFixed(5)}&lng=${infoLng.toFixed(5)}`;

            copyToClipboard(url)
                .then(() => toast('Link copied!', 'success'))
                .catch(() => toast('Copy failed. Please try again or use a secure connection.', 'error'));
        }
    });

    // ── Map Click → info card with reverse geocode ────
    map.on('click', async e => {
        if (S.dirOpen || S.ecoGameActive || NAV.active) return;
        const { lat, lng } = e.latlng;
        showLocation(lat, lng, 'Loading...', '');
        const name = await reverseGeocode(lat, lng);
        if (infoLat !== lat || infoLng !== lng || dom.infoCard.classList.contains('hidden')) return;
        const shortName = name.split(',')[0];
        dom.infoTitle.textContent = shortName;
        dom.infoSub.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (infoMarker) infoName = shortName;
    });

    // ── Suggest a Spot Modal ───────────────────────────
    dom.suggestBtn.addEventListener('click', () => {
        dom.suggestModal.classList.remove('hidden');
        if (S.sidebarOpen) dom.sidebarClose.click();
    });

    dom.suggestClose.addEventListener('click', () => {
        dom.suggestModal.classList.add('hidden');
        dom.suggestForm.reset();
        dom.suggestStatus.className = 'suggest-status hidden';
        dom.suggestStatus.textContent = '';
    });

    dom.suggestForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Grab form values
        const name = $('#sg-name').value.trim();
        const address = $('#sg-address').value.trim();
        const category = $('#sg-category').value;
        const description = $('#sg-desc').value.trim();
        const submitter = $('#sg-submitter').value.trim();

        if (!name || !address || !category || !description) {
            dom.suggestStatus.textContent = 'Please fill out all required fields marked with *';
            dom.suggestStatus.className = 'suggest-status error';
            return;
        }

        dom.suggestSubmitBtn.disabled = true;
        dom.suggestSubmitBtn.innerHTML = '<div class="btn-spinner"></div> Submitting...';
        dom.suggestStatus.className = 'suggest-status hidden';

        try {
            // Geocode the address using existing Nominatim API before storing
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
                headers: { 'Accept-Language': 'en' }
            });
            const geoData = await geoRes.json();
            let lat = null, lng = null;
            if (geoData && geoData.length > 0) {
                lat = parseFloat(geoData[0].lat);
                lng = parseFloat(geoData[0].lon);
            }

            // Post to our new Netlify Function connected to Neon
            const res = await fetch('/api/submit-location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address, lat, lng, category, description, submitted_by: submitter })
            });

            if (!res.headers.get('content-type')?.includes('application/json')) throw new Error('Submission service unavailable');
            const data = await res.json();

            if (res.ok) {
                dom.suggestStatus.textContent = data.message || 'Thank you! Your spot has been submitted for review.';
                dom.suggestStatus.className = 'suggest-status success';
                dom.suggestForm.reset();
                setTimeout(() => dom.suggestClose.click(), 3000);
            } else {
                dom.suggestStatus.textContent = data.error || 'Something went wrong. Please try again.';
                dom.suggestStatus.className = 'suggest-status error';
            }
        } catch (err) {
            console.error('Submission error:', err);
            dom.suggestStatus.textContent = 'The submission service is unavailable. Your form is still here; please try again later.';
            dom.suggestStatus.className = 'suggest-status error';
        } finally {
            dom.suggestSubmitBtn.disabled = false;
            dom.suggestSubmitBtn.innerHTML = '<i class="ph-bold ph-paper-plane-tilt"></i> Submit for Review';
        }
    });

    // ── Settings Modal ─────────────────────────────────
    function getSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('vibemap_settings') || '{}') || {};
            return { ...settings, style: Object.hasOwn(TILES, settings.style) ? settings.style : 'light', unit: settings.unit === 'imperial' ? 'imperial' : 'metric' };
        } catch { return { style: 'light', unit: 'metric' }; }
    }

    function saveSettings(s) {
        localStorage.setItem('vibemap_settings', JSON.stringify(s));
    }

    // Apply settings on load
    const userSettings = getSettings();
    S.tileKey = userSettings.style || 'light'; // Voyager is our default

    // Wire up UI
    dom.settingsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        dom.settingsModal.classList.remove('hidden');
        if (S.sidebarOpen) dom.sidebarClose.click();

        // Sync buttons to current state
        const current = getSettings();
        dom.stButtons.forEach(btn => {
            if (btn.dataset.style) {
                btn.classList.toggle('active', btn.dataset.style === current.style);
                btn.setAttribute('aria-pressed', String(btn.dataset.style === current.style));
            }
            if (btn.dataset.unit) {
                btn.classList.toggle('active', btn.dataset.unit === current.unit);
                btn.setAttribute('aria-pressed', String(btn.dataset.unit === current.unit));
            }
        });
    });

    dom.settingsClose.addEventListener('click', () => {
        dom.settingsModal.classList.add('hidden');
        $('#reset-confirmation').hidden = true;
    });

    dom.stButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const current = getSettings();
            if (btn.dataset.style) {
                current.style = btn.dataset.style;
                setMapStyle(current.style);
            }
            if (btn.dataset.unit) {
                current.unit = btn.dataset.unit;
                // Route responses stay in meters; format them using this preference.
            }
            saveSettings(current);
            if (S.allRouteData[S.mode]) renderActiveState(false);

            // Re-render active state visually
            const siblings = btn.parentElement.querySelectorAll('.st-btn');
            siblings.forEach(s => { s.classList.remove('active'); s.setAttribute('aria-pressed', 'false'); });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
        });
    });

    let resetBackup;
    const refreshVisitProgress = () => {
        S.ecoMarkers.forEach(refreshChipIcon);
        updateEcoScore(); renderStreak(); renderDailyChallenge(); updateProgressStrip(); updateInfoVisitedBtn();
    };
    dom.stResetData.addEventListener('click', () => {
        $('#reset-confirmation').hidden = false;
        $('#reset-cancel').focus();
    });
    $('#reset-cancel').addEventListener('click', () => {
        $('#reset-confirmation').hidden = true;
        dom.stResetData.focus();
    });
    $('#reset-confirm').addEventListener('click', () => {
        resetBackup = new Map();
        for (const key of Object.keys(localStorage)) {
            if (key === VISITED_KEY || key === STREAK_KEY || key.startsWith('vibemap_ch_')) resetBackup.set(key, localStorage.getItem(key));
        }
        resetBackup.forEach((value, key) => localStorage.removeItem(key));
        $('#reset-confirmation').hidden = true;
        $('#reset-undo').hidden = false;
        dom.stResetData.disabled = true;
        $('#reset-undo').focus();
        refreshVisitProgress();
        toast('Visit progress reset. You can undo this while this page stays open.', 'info');
    });
    $('#reset-undo').addEventListener('click', () => {
        resetBackup?.forEach((value, key) => localStorage.setItem(key, value));
        resetBackup = null;
        $('#reset-undo').hidden = true;
        dom.stResetData.disabled = false;
        refreshVisitProgress();
        dom.stResetData.focus();
        toast('Visit progress restored.', 'success');
    });

    // ── Directions Panel ───────────────────────────────
    dom.dirPanel.inert = true;
    dom.directionsBtn.addEventListener('click', () => openDirections());
    dom.dirBack.addEventListener('click', () => closeDirections());

    function openDirections() {
        recordView('directions');
        S.dirOpen = true;
        dom.dirPanel.inert = false;
        document.body.classList.add('planning-route');
        dom.dirPanel.classList.remove('hidden');
        $('#search-bar').style.display = 'none';
        const strip = document.getElementById('progress-strip');
        if (strip) strip.classList.add('strip-hidden');
        (S.origin ? dom.dirDest : dom.dirOrigin).focus();
    }

    $('#dir-use-location').addEventListener('click', () => {
        if (!navigator.geolocation) { toast('Location unavailable. Choose a starting point.', 'info'); return; }
        const revision = routeRevision;
        navigator.geolocation.getCurrentPosition(pos => {
            if (!S.dirOpen || revision !== routeRevision) return;
            if (pos.coords.accuracy > 60) { toast('Location is imprecise. Choose a starting point or retry outdoors.', 'info'); return; }
            setPoint('origin', pos.coords.latitude, pos.coords.longitude, 'Your location');
        }, () => toast('Location unavailable. Choose a starting point.', 'info'), { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 });
    });

    function closeDirections() {
        recordView('map');
        S.dirOpen = false;
        dom.dirPanel.inert = true;
        document.body.classList.remove('planning-route');
        dom.dirPanel.classList.add('hidden');
        $('#search-bar').style.display = '';
        const strip = document.getElementById('progress-strip');
        if (strip) strip.classList.remove('strip-hidden');
        clearRoute();
        dom.directionsBtn.focus({ preventScroll: true });
    }

    // ── Set origin / dest ──────────────────────────────
    function setPoint(type, lat, lng, name) {
        if (type === 'origin') {
            S.origin = { lat, lng, name };
            dom.dirOrigin.value = name;
            if (S.originMarker) map.removeLayer(S.originMarker);
            S.originMarker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: '<div class="nav-marker origin"><span class="nav-marker-label">A</span></div>', iconSize: [28, 28], iconAnchor: [14, 14] }),
                zIndexOffset: 800,
            }).addTo(map);
        } else {
            S.dest = { lat, lng, name };
            dom.dirDest.value = name;
            if (S.destMarker) map.removeLayer(S.destMarker);
            S.destMarker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: '<div class="nav-marker dest"><span class="nav-marker-label">B</span></div>', iconSize: [28, 28], iconAnchor: [14, 14] }),
                zIndexOffset: 800,
            }).addTo(map);
        }
        // Auto-fetch all modes when both set
        if (S.origin && S.dest) fetchAllModes();
    }

    // ── Autocomplete for dir inputs ────────────────────
    function setupDirAC(input, dropdown, type) {
        let searchRevision = 0;
        const showResults = data => {
            dropdown.innerHTML = data.map(d => `<button type="button" class="dir-ac-item" data-lat="${d.lat}" data-lon="${d.lon}" data-name="${escapeHTML(d.display_name)}"><i class="ph ph-map-pin" aria-hidden="true"></i><span class="dir-ac-name">${escapeHTML(d.display_name)}</span></button>`).join('');
            dropdown.classList.toggle('visible', data.length > 0);
            dropdown.querySelectorAll('.dir-ac-item').forEach(el => el.addEventListener('click', () => {
                searchRevision++;
                setPoint(type, +el.dataset.lat, +el.dataset.lon, el.dataset.name);
                dropdown.classList.remove('visible');
            }));
        };
        const localResults = q => SUSTAINABLE_LOCATIONS.filter(loc => `${loc.name} ${loc.address}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5).map(loc => ({ lat: loc.lat, lon: loc.lng, display_name: `${loc.name}, ${loc.address}` }));
        const search = async () => {
            const q = input.value.trim();
            if (q.length < 2) return;
            const revision = ++searchRevision;
            const local = localResults(q);
            if (local.length) { showResults(local); return; }
            try {
                const results = await geocode(q, 5);
                if (revision !== searchRevision || q !== input.value.trim()) return;
                showResults(results);
                if (!results.length) toast('No address found. Try a full address or pick a point on the map.', 'info');
            } catch { if (revision === searchRevision) toast('Address search unavailable. Pick a point on the map.', 'error'); }
        };
        const findButton = document.createElement('button');
        findButton.type = 'button';
        findButton.className = 'dir-find-button';
        findButton.textContent = 'Find';
        findButton.setAttribute('aria-label', type === 'origin' ? 'Find starting point' : 'Find destination');
        input.parentElement.appendChild(findButton);
        findButton.addEventListener('click', search);
        input.addEventListener('input', () => {
            searchRevision++;
            S[type === 'origin' ? 'origin' : 'dest'] = null;
            const markerKey = type === 'origin' ? 'originMarker' : 'destMarker';
            if (S[markerKey]) { map.removeLayer(S[markerKey]); S[markerKey] = null; }
            invalidateRoutes();
            const q = input.value.trim();
            showResults(q.length >= 2 ? localResults(q) : []);
        });
        input.addEventListener('keydown', e => {
            if (e.key === 'Escape') { searchRevision++; dropdown.classList.remove('visible'); }
            if (e.key === 'Enter') { e.preventDefault(); search(); }
        });
        document.addEventListener('click', e => { if (!e.target.closest('.dir-field-wrap')) dropdown.classList.remove('visible'); });
    }
    setupDirAC(dom.dirOrigin, dom.dirOriginAC, 'origin');
    setupDirAC(dom.dirDest, dom.dirDestAC, 'dest');

    // ── Swap ───────────────────────────────────────────
    dom.dirSwap.addEventListener('click', () => {
        const o = S.origin, d = S.dest;
        clearRoute();
        if (d) setPoint('origin', d.lat, d.lng, d.name);
        if (o) setPoint('dest', o.lat, o.lng, o.name);
    });

    // ── Mode Tabs ──────────────────────────────────────
    dom.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            S.mode = tab.dataset.mode;
            S.activeRouteIdx = 0; // reset to first route when changing mode
            dom.modeTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-pressed', 'false'); });
            tab.classList.add('active');
            tab.setAttribute('aria-pressed', 'true');
            if (S.allRouteData[S.mode]) renderActiveState(true);
            else {
                clearMapRoutes(); dom.routeSummary.classList.add('hidden'); dom.dirBottom.classList.add('hidden'); dom.stepsList.innerHTML = '';
                dom.alternativesList.classList.remove('hidden');
                dom.alternativesList.textContent = !S.origin || !S.dest
                    ? 'Choose a starting point and destination to compare routes.'
                    : 'No route available for this mode. Choose another mode or change the endpoints.';
            }
        });
    });

    // ── Fetch all modes at once (Google Maps style) ───
    let routeController;
    let routeRevision = 0;
    function invalidateRoutes() {
        routeRevision++;
        routeController?.abort();
        S.allRouteData = {};
        clearMapRoutes();
        dom.routeSummary.classList.add('hidden');
        dom.dirBottom.classList.add('hidden');
        dom.alternativesList.classList.add('hidden');
        dom.stepsList.innerHTML = '';
        dom.etaDriving.textContent = '—'; dom.etaCycling.textContent = '—'; dom.etaWalking.textContent = '—';
    }
    async function fetchAllModes() {
        if (!S.origin || !S.dest) return;
        invalidateRoutes();
        const revision = routeRevision;
        routeController = new AbortController();
        const controller = routeController;
        const timeout = setTimeout(() => controller.abort(), 20000);
        const signal = routeController.signal;
        const origin = { ...S.origin }, destination = { ...S.dest };

        // Show loading ETAs
        dom.etaDriving.textContent = '...';
        dom.etaCycling.textContent = '...';
        dom.etaWalking.textContent = '...';

        try {
            const modes = Object.entries(MODE);
            const results = await Promise.allSettled(modes.map(([key]) => GreenRouting.fetchRoutes(origin, destination, key, signal)));
            if (revision !== routeRevision) return;
            results.forEach((result, index) => {
                const [key, cfg] = modes[index];
                if (result.status === 'fulfilled') S.allRouteData[key] = result.value.map(route => ({ route, duration: route.duration, distM: route.distance, cfg }));
            });
            dom.etaDriving.textContent = S.allRouteData.driving ? durShort(S.allRouteData.driving[0].duration) : '—';
            dom.etaCycling.textContent = S.allRouteData.cycling ? durShort(S.allRouteData.cycling[0].duration) : '—';
            dom.etaWalking.textContent = S.allRouteData.walking ? durShort(S.allRouteData.walking[0].duration) : '—';
            if (!S.allRouteData[S.mode]) {
                dom.alternativesList.classList.remove('hidden');
                dom.alternativesList.textContent = 'Routing unavailable for this mode. Try another mode or retry your endpoints.';
                return;
            }

            S.activeRouteIdx = 0;
            renderActiveState(true);

        } catch (err) { if (revision === routeRevision) toast('Routing unavailable. Please try again.', 'error'); }
        finally { clearTimeout(timeout); }
    }

    function renderActiveState(fit = false) {
        const modeData = S.allRouteData[S.mode];
        if (!modeData) return;

        renderMapRoutes(modeData, fit);
        renderAlternativesUI(modeData);
        renderCurrentRoute(modeData[S.activeRouteIdx]);
    }

    // ── Render on Map ──────────────────────────────────
    function renderMapRoutes(routes, fit) {
        clearMapRoutes();
        const activeDuration = routes[S.activeRouteIdx].duration;

        routes.forEach((rd, idx) => {
            const isActive = idx === S.activeRouteIdx;
            const coords = rd.route.geometry.coordinates.map(c => [c[1], c[0]]);

            // 1. Render all inactive routes first (gray)
            if (!isActive) {
                const line = L.polyline(coords, {
                    color: '#6b6b90', weight: 6, opacity: 0.6, lineJoin: 'round', lineCap: 'round',
                }).addTo(map);

                line.on('click', () => {
                    S.activeRouteIdx = idx;
                    renderActiveState(false);
                });

                S.alternativeLines.push(line);
            }

            // Route Badge (Google Maps style ETA labels)
            // Offset the midpoint slightly so multiple routes don't overlap badges
            const ptIdx = Math.floor(coords.length * (0.45 + (idx * 0.05)));
            const midPt = coords[Math.min(ptIdx, coords.length - 1)];

            let text;
            let className = 'route-badge';
            if (isActive) {
                text = durShort(rd.duration);
                className += ' active';
            } else {
                const diff = rd.duration - activeDuration;
                if (Math.abs(diff) < 60) text = 'Similar ETA';
                else if (diff > 0) text = durShort(diff) + ' slower';
                else text = durShort(Math.abs(diff)) + ' faster';
            }

            const badge = L.marker(midPt, {
                icon: L.divIcon({
                    className: '',
                    html: `<div class="${className}" data-mode="${S.mode}">${text}</div>`,
                    iconSize: null, // let it size to content
                    iconAnchor: [40, 12] // approximate center offset
                }),
                zIndexOffset: isActive ? 500 : 400
            }).addTo(map);

            badge.on('click', () => { S.activeRouteIdx = idx; renderActiveState(false); });
            S.routeBadges.push(badge);
        });

        // 2. Render active route (colored)
        const active = routes[S.activeRouteIdx];
        const activeCoords = active.route.geometry.coordinates.map(c => [c[1], c[0]]);

        S.routeShadow = L.polyline(activeCoords, {
            color: active.cfg.color, weight: 12, opacity: 0.2, lineJoin: 'round', lineCap: 'round',
        }).addTo(map);

        S.routeLine = L.polyline(activeCoords, {
            color: active.cfg.color, weight: 6, opacity: 1.0, lineJoin: 'round', lineCap: 'round',
        }).addTo(map);

        // Fit bounds only if requested (e.g. first search, not just toggling alternative)
        if (fit) {
            const size = map.getSize();
            const panel = dom.dirPanel.getBoundingClientRect();
            const mobile = size.x <= 768;
            map.fitBounds(S.routeLine.getBounds(), {
                paddingTopLeft: [mobile ? 30 : panel.width + 30, 40],
                paddingBottomRight: [30, mobile ? panel.height + 20 : 30], duration: 1
            });
        }
    }

    // ── Render Alternatives Panel ──────────────────────
    function renderAlternativesUI(routes) {
        dom.alternativesList.classList.remove('hidden');
        dom.alternativesList.innerHTML = `<p class="route-options-note">${routes.length > 1 ? `${routes.length} routes available · select one` : 'One route available · no alternative returned'}</p>` + routes.map((rd, i) => {
            const via = findMainRoad(rd.route);
            const extra = rd.duration - routes[0].duration;
            return `
                <button type="button" class="route-card ${i === S.activeRouteIdx ? 'active' : ''}" aria-pressed="${i === S.activeRouteIdx}" data-idx="${i}" data-mode="${S.mode}">
                    <div class="route-card-header">
                        <span class="route-card-duration">${durShort(rd.duration)}</span>
                        <span class="route-card-dist">${fmt(rd.distM)}</span>
                    </div>
                    <div class="route-card-via">${via ? 'via ' + escapeHTML(via) : `Route ${i + 1}`} · ${i === 0 ? 'Fastest estimate' : extra < 60 ? 'Similar time' : `+${durShort(extra)}`}</div>
                </button>
            `;
        }).join('');

        dom.alternativesList.querySelectorAll('.route-card').forEach(card => {
            card.addEventListener('click', () => {
                S.activeRouteIdx = +card.dataset.idx;
                renderActiveState(false);
            });
        });
    }

    // ── Render Current Selected Route Details ──────────
    function renderCurrentRoute(rd) {
        const cfg = rd.cfg;
        dom.routeDuration.textContent = dur(rd.duration);
        dom.routeDuration.style.color = cfg.color;
        dom.routeDetails.textContent = `${fmt(rd.distM)}`;
        const mainRoad = findMainRoad(rd.route);
        dom.routeVia.textContent = mainRoad ? `via ${mainRoad}` : '';
        const points = rd.route.geometry.coordinates;
        const startGap = distM([S.origin.lat, S.origin.lng], [points[0][1], points[0][0]]);
        const last = points[points.length - 1];
        const endGap = distM([S.dest.lat, S.dest.lng], [last[1], last[0]]);
        $('#route-service-note').textContent = Math.max(startGap, endGap) > 100
            ? 'Route ends at the nearest accessible road or path. Check the final approach.'
            : 'Estimated time · no live traffic. Routes: Valhalla / OpenStreetMap.';
        dom.routeSummary.classList.remove('hidden');

        buildSteps(rd.route, cfg);
        dom.dirBottom.classList.remove('hidden');
    }

    function findMainRoad(route) {
        const steps = route.legs[0]?.steps || [];
        let longest = '', maxDist = 0;
        steps.forEach(s => { if (s.distance > maxDist && s.name) { maxDist = s.distance; longest = s.name; } });
        return longest;
    }

    function clearMapRoutes() {
        if (S.routeLine) { map.removeLayer(S.routeLine); S.routeLine = null; }
        if (S.routeShadow) { map.removeLayer(S.routeShadow); S.routeShadow = null; }
        S.alternativeLines.forEach(l => map.removeLayer(l));
        S.alternativeLines = [];
        if (S.routeBadges) S.routeBadges.forEach(b => map.removeLayer(b));
        S.routeBadges = [];
    }

    function clearRoute() {
        invalidateRoutes();
        clearMapRoutes();
        if (S.originMarker) { map.removeLayer(S.originMarker); S.originMarker = null; }
        if (S.destMarker) { map.removeLayer(S.destMarker); S.destMarker = null; }
        S.origin = null; S.dest = null; S.allRouteData = {};
        dom.dirOrigin.value = ''; dom.dirDest.value = '';
        dom.routeSummary.classList.add('hidden');
        dom.alternativesList.classList.add('hidden');
        dom.dirBottom.classList.add('hidden');
        dom.stepsList.innerHTML = '';
        dom.etaDriving.textContent = '—'; dom.etaCycling.textContent = '—'; dom.etaWalking.textContent = '—';
    }

    dom.clearRouteBtn.addEventListener('click', () => { clearRoute(); toast('Route cleared', 'info'); });

    // ═══════════════════════════════════════════════════
    //  LIVE NAVIGATION ENGINE
    // ═══════════════════════════════════════════════════
    const NAV = {
        active: false,
        mode: 'driving',
        watchId: null,
        routeCoords: [],   // [[lat,lng], ...] full route
        passedIdx: 0,      // index of the last passed point
        linePassed: null,  // gray polyline (already traveled)
        lineRemain: null,  // colored polyline (remaining)
        arrowMarker: null, // user arrow / blue dot
        rerouteTimer: null,
        lastRerouteTime: 0,
        steps: [],         // OSRM steps for instruction display
        stepIdx: 0,        // current step
        destCoord: null,   // [lat, lng] destination
        routeDuration: 0,
        routeDistance: 0,
        offRouteReadings: 0,
        rerouting: false,
        generation: 0,
    };

    /* distance in metres between two [lat,lng] points */
    function distM(a, b) {
        const R = 6371000, toR = d => d * Math.PI / 180;
        const dLat = toR(b[0] - a[0]), dLon = toR(b[1] - a[1]);
        const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(h));
    }

    /* build nav HUD overlay if not present */
    function ensureNavHUD() {
        if ($('#nav-hud')) return;
        const hud = document.createElement('div');
        hud.id = 'nav-hud';
        hud.innerHTML = `
            <div id="nav-hud-step">
                <div id="nav-hud-icon"><i class="ph-bold ph-navigation-arrow"></i></div>
                <div id="nav-hud-text">
                    <div id="nav-hud-instruction">Calculating…</div>
                    <div id="nav-hud-dist-step"></div>
                </div>
            </div>
            <div id="nav-hud-bottom">
                <span id="nav-hud-eta"><i class="ph ph-clock"></i> —</span>
                <span id="nav-hud-remain"><i class="ph ph-path"></i> —</span>
                <button id="nav-stop-btn"><i class="ph-bold ph-x"></i> Stop</button>
            </div>
        `;
        document.body.appendChild(hud);
        $('#nav-stop-btn').addEventListener('click', stopNavigation);
    }

    function updateNavHUD({ instruction, distToStep, etaSec, remainM }) {
        const hud = $('#nav-hud');
        if (!hud) return;
        if (instruction) $('#nav-hud-instruction').textContent = instruction;
        if (distToStep != null) $('#nav-hud-dist-step').textContent = fmt(distToStep);
        if (etaSec != null) $('#nav-hud-eta').innerHTML = `<i class="ph ph-clock"></i> ${dur(etaSec)}`;
        if (remainM != null) $('#nav-hud-remain').innerHTML = `<i class="ph ph-path"></i> ${fmt(remainM)}`;
    }

    function stopNavigation() {
        NAV.generation++;
        document.body.classList.remove('navigation-active');
        if (NAV.watchId != null) navigator.geolocation.clearWatch(NAV.watchId);
        clearTimeout(NAV.rerouteTimer);
        if (NAV.linePassed) { map.removeLayer(NAV.linePassed); NAV.linePassed = null; }
        if (NAV.lineRemain) { map.removeLayer(NAV.lineRemain); NAV.lineRemain = null; }
        if (NAV.arrowMarker) { map.removeLayer(NAV.arrowMarker); NAV.arrowMarker = null; }
        const hud = $('#nav-hud');
        if (hud) hud.remove();
        Object.assign(NAV, {
            active: false, watchId: null, routeCoords: [], passedIdx: 0,
            linePassed: null, lineRemain: null, arrowMarker: null, steps: [], stepIdx: 0
        });

        // Clear route completely and return to directions panel for a fresh start
        clearRoute();
        openDirections();
        toast('Navigation ended — choose a new destination', 'info', 3500);
    }

    async function startNavigation() {
        if (!S.origin || !S.dest || !S.allRouteData[S.mode]) {
            toast('Set a route first!', 'error'); return;
        }
        if (!navigator.geolocation) { toast('Geolocation unavailable', 'error'); return; }

        // Close sidebar & directions panel
        if (S.sidebarOpen) dom.sidebarClose.click();
        dom.dirPanel.classList.add('hidden');
        dom.dirPanel.inert = true;
        document.body.classList.remove('planning-route');
        $('#search-bar').style.display = 'none';

        const rd = S.allRouteData[S.mode][S.activeRouteIdx];
        NAV.mode = S.mode;
        NAV.routeCoords = rd.route.geometry.coordinates.map(c => [c[1], c[0]]);
        NAV.steps = rd.route.legs[0]?.steps || [];
        NAV.stepIdx = 0;
        NAV.passedIdx = 0;
        NAV.destCoord = NAV.routeCoords[NAV.routeCoords.length - 1];
        NAV.routeDuration = rd.duration;
        NAV.routeDistance = rd.distM;
        NAV.offRouteReadings = 0;
        NAV.generation++;
        NAV.active = true;
        document.body.classList.add('navigation-active');

        // Remove old static route lines
        clearMapRoutes();

        // Draw initial split
        NAV.linePassed = L.polyline([], { color: '#888', weight: 6, opacity: 0.7, lineJoin: 'round' }).addTo(map);
        NAV.lineRemain = L.polyline(NAV.routeCoords, { color: MODE[S.mode].color, weight: 7, opacity: 1, lineJoin: 'round' }).addTo(map);

        ensureNavHUD();
        updateNavHUD({ instruction: getStepInstruction(NAV.steps[0]), etaSec: rd.duration, remainM: rd.distM });
        toast(`${MODE[S.mode].label} navigation started`, 'success');

        NAV.watchId = navigator.geolocation.watchPosition(onNavPosition,
            () => toast('GPS signal lost', 'error'),
            { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
        );
    }

    function onNavPosition(pos) {
        if (!NAV.active) return;
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const userPos = [lat, lng];
        if (!Number.isFinite(accuracy) || accuracy > 60) {
            NAV.offRouteReadings = 0;
            updateNavHUD({ instruction: 'Waiting for a more accurate GPS position…' });
            return;
        }

        // Move user arrow
        if (NAV.arrowMarker) map.removeLayer(NAV.arrowMarker);
        NAV.arrowMarker = L.marker(userPos, {
            icon: L.divIcon({ className: '', html: '<div class="nav-arrow-dot"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }),
            zIndexOffset: 2000,
        }).addTo(map);

        // Follow user — keep map centered
        map.setView(userPos, Math.max(map.getZoom(), 16), { animate: true, duration: 0.6 });

        // Find nearest point on route
        const match = GreenRouting.nearestOnRoute(NAV.routeCoords, userPos);
        const { idx, d } = match;

        // Off-route? reroute after 30m deviation and 5s cooldown
        const now = Date.now();
        NAV.offRouteReadings = d > Math.max(35, accuracy * 1.5) ? NAV.offRouteReadings + 1 : 0;
        if (NAV.offRouteReadings >= 2 && !NAV.rerouting && now - NAV.lastRerouteTime > 15000) {
            NAV.lastRerouteTime = now;
            toast('Off route — recalculating…', 'info', 3000);
            rerouteFrom(lat, lng);
            return;
        }

        // Update passed idx (never go backwards)
        if (idx > NAV.passedIdx) NAV.passedIdx = idx;

        // Split route into passed (gray) and remaining (colored)
        const passed = NAV.routeCoords.slice(0, idx + 1).concat([match.point]);
        const remain = [match.point].concat(NAV.routeCoords.slice(idx + 1));
        NAV.linePassed.setLatLngs(passed);
        NAV.lineRemain.setLatLngs(remain);

        // Advance step
        while (NAV.stepIdx < NAV.steps.length - 1) {
            const location = NAV.steps[NAV.stepIdx + 1].maneuver.location;
            const turn = GreenRouting.nearestOnRoute(NAV.routeCoords, [location[1], location[0]]);
            if (turn.remaining < match.remaining - Math.min(8, accuracy / 2)) break;
            NAV.stepIdx++;
        }
        const step = NAV.steps[Math.min(NAV.stepIdx + 1, NAV.steps.length - 1)];
        if (step) {
            const stepLoc = [step.maneuver.location[1], step.maneuver.location[0]];
            const turn = GreenRouting.nearestOnRoute(NAV.routeCoords, stepLoc);
            const distToStep = Math.max(0, match.remaining - turn.remaining);
            const instruction = getStepInstruction(step);
            const remainM = match.remaining;
            const etaSec = GreenRouting.remainingTime(NAV.steps, NAV.stepIdx, distToStep);
            updateNavHUD({ instruction, distToStep, etaSec, remainM });
        }

        // Arrived?
        if (accuracy <= 25 && match.remaining < 50 && distM(userPos, NAV.destCoord) < 20) {
            toast('You have arrived! 🎉', 'success', 5000);
            stopNavigation();
        }
    }

    function getStepInstruction(step) {
        if (!step) return 'Continue towards destination';
        if (step.maneuver?.instruction) return step.maneuver.instruction;
        const m = step.maneuver;
        const type = m?.type || 'continue';
        const mod = m?.modifier || '';
        const name = step.name || 'the road';
        if (type === 'depart') return `Head on ${name}`;
        if (type === 'arrive') return 'Arrive at destination';
        const act = mod ? mod.charAt(0).toUpperCase() + mod.slice(1) : 'Continue';
        return step.name ? `${act} on ${name}` : act;
    }

    async function rerouteFrom(lat, lng) {
        if (!NAV.active || !S.dest || NAV.rerouting) return;
        NAV.rerouting = true;
        const generation = NAV.generation;
        const mode = NAV.mode;
        try {
            const routes = await GreenRouting.fetchRoutes({ lat, lng }, S.dest, mode, AbortSignal.timeout(15000), 0);
            if (!NAV.active || generation !== NAV.generation) return;
            const r = routes[0];
            NAV.routeCoords = r.geometry.coordinates.map(c => [c[1], c[0]]);
            NAV.steps = r.legs[0]?.steps || [];
            NAV.stepIdx = 0;
            NAV.passedIdx = 0;
            NAV.lastRerouteTime = Date.now();
            NAV.routeDuration = r.duration;
            NAV.routeDistance = r.distance;
            NAV.offRouteReadings = 0;
            NAV.linePassed.setLatLngs([]);
            NAV.lineRemain.setLatLngs(NAV.routeCoords);
            toast('Route updated ✓', 'success', 2000);
        } catch { if (NAV.active && generation === NAV.generation) toast('Reroute unavailable. Keeping the current route.', 'error'); }
        finally { NAV.rerouting = false; }
    }

    dom.startNavBtn.addEventListener('click', startNavigation);

    // ── Build Steps ────────────────────────────────────
    function buildSteps(route, cfg) {
        const steps = route.legs[0]?.steps || [];
        const dirIcons = {
            depart: 'ph-flag', arrive: 'ph-flag-checkered',
            turn: 'ph-arrow-bend-up-right', 'new name': 'ph-arrow-up',
            merge: 'ph-arrows-merge', continue: 'ph-arrow-up',
            roundabout: 'ph-arrows-clockwise', rotary: 'ph-arrows-clockwise',
            fork: 'ph-git-fork', 'end of road': 'ph-arrow-u-down-left',
            'on ramp': 'ph-arrow-bend-right-up', 'off ramp': 'ph-arrow-bend-right-down',
        };
        const modIcons = {
            left: 'ph-arrow-bend-up-left', right: 'ph-arrow-bend-up-right',
            'sharp left': 'ph-arrow-bend-double-up-left', 'sharp right': 'ph-arrow-bend-double-up-right',
            'slight left': 'ph-arrow-up-left', 'slight right': 'ph-arrow-up-right',
            straight: 'ph-arrow-up', uturn: 'ph-arrow-u-down-left',
        };

        dom.stepsList.innerHTML = steps.map((s, i) => {
            const m = s.maneuver, type = m.type || 'continue', mod = m.modifier || '';
            const icon = modIcons[mod] || dirIcons[type] || 'ph-arrow-up';
            let text;
            if (m.instruction) text = escapeHTML(m.instruction);
            else if (type === 'depart') text = `Head on <strong>${escapeHTML(s.name || 'the road')}</strong>`;
            else if (type === 'arrive') text = `Arrive at <strong>destination</strong>`;
            else {
                const act = mod ? (mod.charAt(0).toUpperCase() + mod.slice(1)) : 'Continue';
                text = s.name ? `${escapeHTML(act)} on <strong>${escapeHTML(s.name)}</strong>` : escapeHTML(act);
            }
            const stepDur = durShort(s.duration);
            return `<div class="step-item" data-lat="${m.location[1]}" data-lng="${m.location[0]}">
                <div class="step-icon"><i class="ph ${icon}"></i></div>
                <div class="step-content">
                    <div class="step-text">${text}</div>
                    <div class="step-dist">${fmt(s.distance)} · ${stepDur}</div>
                </div>
            </div>`;
        }).join('');

        // Click step → zoom
        dom.stepsList.querySelectorAll('.step-item').forEach(el => {
            el.addEventListener('click', () => {
                map.flyTo([+el.dataset.lat, +el.dataset.lng], 16, { duration: 0.8 });
            });
        });
    }

    // ── Map click while directions open → set o/d ─────
    map.on('click', async e => {
        if (!S.dirOpen) return;
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        const short = name.split(',')[0];
        if (!S.origin) {
            setPoint('origin', lat, lng, short);
        } else if (!S.dest) {
            setPoint('dest', lat, lng, short);
        } else {
            // Both set → update destination
            setPoint('dest', lat, lng, short);
        }
    });

    // ── Locate (Shared functionality) ─────────────────
    const triggerLocate = async (btn) => {
        if (!navigator.geolocation) { toast('Geolocation unavailable', 'error'); return; }
        if (btn) btn.classList.add('active');
        toast('Finding location...', 'info', 2000);
        try {
            const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { enableHighAccuracy: true, timeout: 10000 }));
            const { latitude: lat, longitude: lng } = pos.coords;
            if (btn) btn.classList.remove('active');
            if (S.userMarker) map.removeLayer(S.userMarker);
            S.userMarker = L.marker([lat, lng], {
                icon: L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
                zIndexOffset: 1000,
            }).addTo(map);
            map.flyTo([lat, lng], 15, { duration: 1.2 });
            toast('Location found!', 'success');
            // If directions open & no origin, set it
            if (S.dirOpen && !S.origin) {
                setPoint('origin', lat, lng, 'Your location');
            }
        } catch (err) {
            console.error(err);
            if (btn) btn.classList.remove('active');
            toast('Failed to get location', 'error');
        }
    };

    dom.locateBtn.addEventListener('click', () => triggerLocate(dom.locateBtn));
    dom.searchLocateBtn.addEventListener('click', () => triggerLocate(dom.searchLocateBtn));

    // ── Search Action ──
    dom.searchGoBtn.addEventListener('click', () => {
        const query = dom.searchInput.value.trim();
        if (query) { clearTimeout(searchTimer); doSearch(query); }
    });
    

    // ── Layers ─────────────────────────────────────────
    dom.layersBtn.addEventListener('click', () => {
        S.layersOpen = !S.layersOpen;
        dom.layersPanel.inert = !S.layersOpen;
        dom.layersBtn.setAttribute('aria-expanded', String(S.layersOpen));
        dom.layersPanel.classList.toggle('hidden', !S.layersOpen);
        dom.layersBtn.classList.toggle('active', S.layersOpen);
    });
    dom.layersClose.addEventListener('click', () => {
        S.layersOpen = false;
        dom.layersPanel.inert = true;
        dom.layersBtn.setAttribute('aria-expanded', 'false');
        dom.layersPanel.classList.add('hidden');
        dom.layersBtn.classList.remove('active');
    });
    dom.layerCards.forEach(card => {
        card.addEventListener('click', () => {
            const key = card.dataset.style;
            if (key === S.tileKey) return;
            S.tileKey = key;
            dom.layerCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            setMapStyle(key);
            saveSettings({ ...getSettings(), style: key });
            toast(`Map: ${key.charAt(0).toUpperCase() + key.slice(1)}`, 'info', 1500);
        });
    });

    // ── Zoom ───────────────────────────────────────────
    dom.zoomIn.addEventListener('click', () => map.zoomIn());
    dom.zoomOut.addEventListener('click', () => map.zoomOut());

    // ── Sidebar Menu ──────────────────────────────────
    dom.menuBtn.addEventListener('click', () => {
        dom.menuBtn.classList.remove('has-notification');
        S.sidebarOpen = true;
        dom.menuBtn.setAttribute('aria-expanded', 'true');
        $('#site-menu-btn').setAttribute('aria-expanded', 'true');
        dom.sidebarMenu.classList.remove('hidden');
        dom.sidebarClose.focus();
        dom.sidebarOverlay.classList.remove('hidden');
        const strip = document.getElementById('progress-strip');
        if (strip) strip.classList.add('strip-hidden');
        if (S.layersOpen) dom.layersClose.click();
    });


    dom.sidebarClose.addEventListener('click', () => {
        S.sidebarOpen = false;
        dom.menuBtn.setAttribute('aria-expanded', 'false');
        $('#site-menu-btn').setAttribute('aria-expanded', 'false');
        (S.dirOpen ? $('#site-menu-btn') : dom.menuBtn).focus();
        dom.sidebarMenu.classList.add('hidden');
        dom.sidebarOverlay.classList.add('hidden');
        const strip = document.getElementById('progress-strip');
        if (strip) strip.classList.remove('strip-hidden');
    });

    dom.sidebarOverlay.addEventListener('click', () => {
        dom.sidebarClose.click();
    });
    $('#site-menu-btn').addEventListener('click', () => dom.menuBtn.click());

    // Landing Page Navigation
    if (dom.startExploringBtn) {
        dom.startExploringBtn.addEventListener('click', () => {
            openGuideMap();
        });
    }

    function openGuideMap(category) {
        recordView('map');
        dom.landingPage.inert = false;
        dom.lessonPage.classList.add('hidden');
        if (S.sidebarOpen) dom.sidebarClose.click();
        dom.landingPage.classList.add('hidden');
        setMapAccessibility(true);
        if (category) {
            S.activeCategories.clear();
            S.activeCategories.add(category);
        }
        updateEcoMarkers();
        map.invalidateSize();
        if (!map.hasLayer(tileLayer)) tileLayer.addTo(map);
        if (category) {
            const locations = SUSTAINABLE_LOCATIONS.filter(loc => loc.category === category);
            if (locations.length) map.fitBounds(locations.map(loc => [loc.lat, loc.lng]), { padding: [65, 150], maxZoom: 14 });
        }
        dom.menuBtn.focus({ preventScroll: true });
    }

    function setMapAccessibility(visible) {
        document.body.classList.toggle('guide-open', !visible);
        document.querySelectorAll('#map, #map-categories, #map-result-count, #search-bar, #fab-stack, #zoom-controls, #suggest-btn, #map-site-nav, #info-card').forEach(el => el.inert = !visible);
    }

    function initLocalGuide() {
        setMapAccessibility(false);
        const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
        document.querySelectorAll('[data-location-count]').forEach(el => el.textContent = SUSTAINABLE_LOCATIONS.length);
        document.querySelectorAll('[data-category-count]').forEach(el => el.textContent = Object.keys(CATEGORIES).length);
        document.getElementById('landing-categories').innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => `
            <button class="guide-category" data-guide-category="${key}"><i class="ph ${cat.icon}" aria-hidden="true"></i><span>${escape(cat.label)}</span><i class="ph ph-arrow-up-right" aria-hidden="true"></i></button>`).join('');
        document.querySelectorAll('[data-guide-category]').forEach(button => button.addEventListener('click', () => openGuideMap(button.dataset.guideCategory)));
        document.querySelectorAll('[data-open-map]').forEach(button => button.addEventListener('click', () => openGuideMap()));
        document.getElementById('map-categories').innerHTML = '<button data-map-category="all" aria-pressed="true">All places</button>' + Object.entries(CATEGORIES).map(([key, cat]) => `
            <button data-map-category="${key}" aria-pressed="false"><i class="ph ${cat.icon}" aria-hidden="true"></i>${escape(cat.label)}</button>`).join('');
        document.querySelectorAll('[data-map-category]').forEach(button => button.addEventListener('click', () => {
            S.activeCategories.clear();
            if (button.dataset.mapCategory !== 'all') S.activeCategories.add(button.dataset.mapCategory);
            updateEcoMarkers();
            const visible = SUSTAINABLE_LOCATIONS.filter(loc => S.activeCategories.size === 0 || S.activeCategories.has(loc.category));
            if (visible.length) map.fitBounds(visible.map(loc => [loc.lat, loc.lng]), { padding: [65, 150], maxZoom: 14 });
        }));
        const pickIds = ['karls-kraut', 'the-secondhand', 'neubad'];
        const picks = pickIds.map(id => SUSTAINABLE_LOCATIONS.find(loc => loc.id === id)).filter(Boolean);
        const descriptions = {
            'karls-kraut': 'Plant-based food by the Reuss.',
            'the-secondhand': 'A stop for secondhand clothing.',
            'neubad': 'A former swimming pool, now a cultural meeting place.'
        };
        document.getElementById('local-picks').innerHTML = picks.map((loc, index) => `
            <button class="guide-pick" data-guide-location="${escape(loc.id)}"><span class="pick-number">0${index + 1}</span><span class="guide-eyebrow">${escape(CATEGORIES[loc.category].label)}</span><h3>${escape(loc.name)}</h3><p>${escape(descriptions[loc.id])}</p><span class="pick-address">${escape(loc.address)}</span><span class="pick-link">Find on the map <i class="ph ph-arrow-up-right" aria-hidden="true"></i></span></button>`).join('');
        document.querySelectorAll('[data-guide-location]').forEach(button => button.addEventListener('click', () => {
            S.activeCategories.clear();
            openGuideMap();
            S.ecoMarkers.find(item => item.loc.id === button.dataset.guideLocation)?.marker.fire('click');
        }));
        const preview = L.map('landing-map', { center: [47.051, 8.308], zoom: 14, zoomControl: false, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false });
        const previewTiles = createStreetLayer().addTo(preview);
        previewTiles.on('tileerror', () => {
            document.querySelector('.guide-map-caption > span:first-child').textContent = 'Map preview unavailable. Explore the listings in the full guide.';
        });
        SUSTAINABLE_LOCATIONS.filter(loc => loc.lat > 47.035 && loc.lat < 47.068 && loc.lng > 8.29 && loc.lng < 8.34).forEach(loc => {
            const cat = CATEGORIES[loc.category];
            L.circleMarker([loc.lat, loc.lng], { radius: 5, color: '#ffffff', weight: 2, fillColor: cat.color, fillOpacity: 1, interactive: false }).addTo(preview);
        });
        new ResizeObserver(() => preview.invalidateSize()).observe(document.getElementById('landing-map'));
        updateEcoMarkers();
    }

    // ── Keyboard Shortcuts ─────────────────────────────
    document.addEventListener('keydown', e => {
        if (!dom.landingPage.classList.contains('hidden')) return;
        if (e.target.closest('input, textarea, select, [contenteditable]')) {
            if (e.key === 'Escape') { e.target.blur(); dom.searchResults.classList.remove('visible'); }
            return;
        }
        if (!dom.lessonPage.classList.contains('hidden') || document.querySelector('.modal-overlay:not(.hidden), #game-modal:not(.hidden), #sidebar-menu:not(.hidden)') || S.ecoGameActive || NAV.active) return;
        if (e.key === '/') { e.preventDefault(); dom.searchInput.focus(); }
        if (e.key === 'n' || e.key === 'N') { S.dirOpen ? closeDirections() : openDirections(); }
        if (e.key === 'l' || e.key === 'L') dom.locateBtn.click();
        if (e.key === 'Escape') { if (S.dirOpen) closeDirections(); dom.infoCard.classList.add('hidden'); }
        if (e.key === 'Escape' && S.layersOpen) dom.layersClose.click();
        if (e.key === '+' || e.key === '=') map.zoomIn();
        if (e.key === '-') map.zoomOut();
    });

    // Close dropdowns on outside click
    document.addEventListener('click', e => {
        if (!e.target.closest('.dir-field-wrap')) {
            dom.dirOriginAC.classList.remove('visible');
            dom.dirDestAC.classList.remove('visible');
        }
        if (!e.target.closest('#layers-panel') && !e.target.closest('#layers-btn')) {
            S.layersOpen = false;
            dom.layersPanel.inert = true;
            dom.layersBtn.setAttribute('aria-expanded', 'false');
            dom.layersPanel.classList.add('hidden');
            dom.layersBtn.classList.remove('active');
        }
    });

    // ── Sustainability Data & Categories ─────────────────
    function buildChipHTML(catInfo, visited, saved) {
        return `<div class="eco-chip ${visited ? 'visited' : ''} ${saved ? 'saved' : ''}" style="--chip-color:${catInfo.color}"><i class="ph-bold ${catInfo.icon}"></i></div>`;
    }

    function refreshChipIcon({ loc, marker }) {
        const catInfo = CATEGORIES[loc.category];
        marker.setIcon(L.divIcon({
            className: '',
            html: buildChipHTML(catInfo, isVisited(loc.id), isSaved(loc.id)),
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }));
    }

    function initEcoData() {
        dom.categoriesList.innerHTML = Object.entries(CATEGORIES).map(([key, cat]) => {
            return `<button type="button" class="category-item" aria-pressed="false" data-cat="${key}">
                <div class="category-icon" style="background: ${cat.color}"><i class="ph-bold ${cat.icon}"></i></div>
                <div class="category-label">${cat.label}</div>
            </button>`;
        }).join('');

        dom.categoriesList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                const cat = item.dataset.cat;
                if (S.activeCategories.has(cat)) {
                    S.activeCategories.delete(cat);
                    item.classList.remove('active');
                } else {
                    S.activeCategories.add(cat);
                    item.classList.add('active');
                }
                updateEcoMarkers();
            });
        });

        const visitedSet = getVisited();
        const savedSet = getSaved();

        S.ecoMarkers = SUSTAINABLE_LOCATIONS.map(loc => {
            const catInfo = CATEGORIES[loc.category];
            const visited = visitedSet.has(loc.id);
            const saved = savedSet.has(loc.id);

            const marker = L.marker([loc.lat, loc.lng], {
                title: loc.name, alt: loc.name,
                icon: L.divIcon({
                    className: '',
                    html: buildChipHTML(catInfo, visited, saved),
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                })
            });

            marker.on('click', () => {
                map.flyTo([loc.lat, loc.lng], 16, { duration: 1.0 });
                dom.infoTitle.textContent = loc.name;
                dom.infoSub.textContent = catInfo.label + ' · ' + loc.address;
                $('#info-description').textContent = loc.description;
                $('#info-description').hidden = false;

                // Show SDG Badges
                if (loc.sdg && loc.sdg.length > 0) {
                    dom.infoSdg.innerHTML = loc.sdg.map(num => `
                        <button class="sdg-badge" data-goal="${num}" aria-label="Learn about Goal ${num}">
                            <img src="https://open-sdg.github.io/sdg-translations/assets/img/goals/en/${num}.png"
                                 class="sdg-mini-icon" alt="Goal ${num}">
                        </button>
                    `).join('');
                } else {
                    dom.infoSdg.innerHTML = '';
                }

                infoLat = loc.lat; infoLng = loc.lng; infoName = loc.name;
                infoId = loc.id;
                updateInfoVisitedBtn();
                updateInfoSavedBtn();
                dom.infoCard.classList.remove('hidden');
                if (dom.featuredCarousel) dom.featuredCarousel.classList.add('hidden');
            });
            marker.on('add', () => marker.getElement()?.setAttribute('aria-label', loc.name));

            return { loc, marker };
        });

        updateEcoMarkers();
        renderMyPlaces();
    }

    window.renderMyPlaces = function () {
        if (!dom.myPlacesList) return;
        const savedIds = Array.from(getSaved());
        const savedLocs = savedIds.map(id => SUSTAINABLE_LOCATIONS.find(l => l.id === id)).filter(Boolean);

        if (savedLocs.length === 0) {
            dom.myPlacesList.innerHTML = `
                <div class="saved-empty-state">
                    <i class="ph ph-heart-break"></i>
                    <div>No saved places yet.<br>Click the heart icon on any place to save it here!</div>
                </div>
            `;
            return;
        }

        dom.myPlacesList.innerHTML = savedLocs.map(loc => {
            const cat = CATEGORIES[loc.category];
            return `
                <button type="button" class="saved-place-item" data-id="${loc.id}">
                    <div class="saved-place-info">
                        <div class="category-icon" style="background: ${cat.color}"><i class="ph-bold ${cat.icon}"></i></div>
                        <div class="saved-place-meta">
                            <div class="saved-place-name">${loc.name}</div>
                            <div class="saved-place-cat">${cat.label}</div>
                        </div>
                    </div>
                </button>
            `;
        }).join('');

        dom.myPlacesList.querySelectorAll('.saved-place-item').forEach(item => {
            item.addEventListener('click', () => {
                if (S.sidebarOpen) dom.sidebarClose.click();
                const markerObj = S.ecoMarkers.find(m => m.loc.id === item.dataset.id);
                if (markerObj) markerObj.marker.fire('click');
            });
        });
    }

    function updateEcoMarkers() {
        const showAll = S.activeCategories.size === 0;
        document.querySelectorAll('[data-map-category]').forEach(button => {
            const active = button.dataset.mapCategory === 'all' ? showAll : S.activeCategories.has(button.dataset.mapCategory);
            button.setAttribute('aria-pressed', String(active));
        });
        dom.categoriesList.querySelectorAll('.category-item').forEach(item => { const active = S.activeCategories.has(item.dataset.cat); item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
        const count = SUSTAINABLE_LOCATIONS.filter(loc => showAll || S.activeCategories.has(loc.category)).length;
        document.getElementById('map-result-count').textContent = `${count} ${count === 1 ? 'place' : 'places'} in the guide`;
        S.ecoMarkers.forEach(({ loc, marker }) => {
            // Only show markers if not in eco game study phase
            if (!S.ecoGameActive) {
                if (showAll || S.activeCategories.has(loc.category)) {
                    if (!map.hasLayer(marker)) marker.addTo(map);
                } else {
                    if (map.hasLayer(marker)) map.removeLayer(marker);
                }
            } else {
                // If eco game is active, hide all markers
                if (map.hasLayer(marker)) map.removeLayer(marker);
            }
        });
    }

    dom.layersBtn.addEventListener('click', () => {
        if (S.sidebarOpen) dom.sidebarClose.click();
    });

    function parseUrlParams() {
        const params = new URLSearchParams(window.location.search);
        if (params.get('map') === '1') openGuideMap();
        const locId = params.get('loc');
        const lat = params.get('lat');
        const lng = params.get('lng');

        if (locId) {
            openGuideMap();
            const loc = SUSTAINABLE_LOCATIONS.find(l => l.id === locId);
            if (loc) {
                // Delay to ensure loading screen hide and app init
                setTimeout(() => {
                    if (view !== 'map' || dom.landingPage.classList.contains('hidden') === false) return;
                    // Find if the marker is already there (it should be)
                    const markerObj = S.ecoMarkers.find(e => e.loc.id === locId);
                    if (markerObj) {
                        // Open the card by firing a click event (it centers map and opens card info)
                        markerObj.marker.fire('click');
                    } else {
                        // If categories filter hid it, show all first
                        S.activeCategories.clear();
                        dom.categoriesList.querySelectorAll('.category-item').forEach(el => el.classList.remove('active'));
                        updateEcoMarkers();
                        const mo = S.ecoMarkers.find(e => e.loc.id === locId);
                        if (mo) mo.marker.fire('click');
                    }
                }, 0);
            }
        } else if (lat && lng) {
            openGuideMap();
            const pLat = parseFloat(lat);
            const pLng = parseFloat(lng);
            if (Number.isFinite(pLat) && Number.isFinite(pLng) && Math.abs(pLat) <= 90 && Math.abs(pLng) <= 180) {
                setTimeout(async () => {
                    showLocation(pLat, pLng, 'Loading location...', '');
                    const name = await reverseGeocode(pLat, pLng);
                    const shortName = name.split(',')[0];
                    dom.infoTitle.textContent = shortName;
                    dom.infoSub.textContent = name;
                    if (infoMarker) infoName = shortName;
                }, 0);
            }
        }

        // Optionally clean up the URL to prevent re-opening on manual refresh
        // if (locId || (lat && lng)) window.history.replaceState({}, document.title, window.location.pathname);
    }

    let showSdgLesson;
    let refreshLessons;
    const initEduModal = () => {
        const LESSONS = [
            { 
                id: 'p1', title: 'No Poverty', goal: 1, fact: '736M people live on less than $1.90 a day.', 
                text: 'Eradicating poverty is not just a gesture of charity, but an act of justice and the key to unlocking human potential. Sustainable development begins with ensuring that the most vulnerable populations have access to basic resources, services, and social protections. By 2030, we aim to build the resilience of the poor and those in vulnerable situations to reduce their exposure to climate-related extreme events and other economic shocks.',
                summary: 'The fundamental battle against global deprivation and the foundation for all 17 goals.',
                status2024: 'An additional 23 million people were pushed into extreme poverty recently due to the lingering impacts of COVID-19 and escalating global conflicts.'
            },
            { 
                id: 'p2', title: 'Zero Hunger', goal: 2, fact: 'One third of food produced is wasted globally.', 
                text: 'Hunger is the leading cause of death in the world, yet our planet produces enough food to feed everyone. Achieving zero hunger requires a global transformation of our food systems to be more productive, inclusive, and sustainable. This involves supporting small-scale farmers, ensuring equal access to land and markets, and significantly reducing the massive amounts of food waste that occur in high-income nations.',
                summary: 'Reimagining how we produce and share the world’s most basic necessity.',
                status2024: 'Critically off-track: Over 100 million more people suffered from severe hunger in 2022 compared to 2019.'
            },
            { 
                id: 'p3', title: 'Good Health', goal: 3, fact: 'Vaccines prevent 2-3 million deaths every year.', 
                text: 'Ensuring healthy lives and promoting well-being at all ages is essential to building prosperous societies. While significant progress has been made in reducing child and maternal mortality, the global community must continue to fight infectious diseases and emerging health crises. Universal health coverage, access to safe vaccines, and the promotion of mental health are all critical pillars of this mission to provide a higher quality of life for everyone.',
                summary: 'Securing a future where global health is a universal right, not a luxury.',
                status2024: 'Global health progress has alarmingly decelerated, undoing nearly a decade of gains in life expectancy globally.'
            },
            { 
                id: 'p4', title: 'Quality Education', goal: 4, fact: '617M youth lack basic mathematics and literacy skills.', 
                text: 'Education is the most powerful tool for breaking the cycles of poverty and reducing gender and social inequalities. It empowers people to live more healthy and sustainable lives while fostering the innovation needed to solve global challenges. We must work to ensure that all girls and boys complete free, equitable, and quality primary and secondary education that leads to relevant and effective learning outcomes.',
                summary: 'Unlocking the potential of the next generation through universal access to learning.',
                status2024: 'Post-pandemic assessments show alarming declines in student mathematics and reading skills in many countries.'
            },
            { 
                id: 'p5', title: 'Gender Equality', goal: 5, fact: 'Women perform 2.6x more unpaid care work than men.', 
                text: 'Gender equality is not only a fundamental human right but a necessary foundation for a peaceful, prosperous, and sustainable world. Providing women and girls with equal access to education, health care, and decent work is essential for the economic growth of all nations. We must also work to eliminate all forms of violence, exploitation, and discrimination to ensure full and effective participation for women in leadership and decision-making.',
                summary: 'Empowering half the world’s population to drive true global progress.',
                status2024: 'Despite isolated gains, achieving full gender equality at the current pace is projected to take nearly 300 years.'
            },
            { 
                id: 'p6', title: 'Clean Water', goal: 6, fact: '2.3B people lack basic sanitation services.', 
                text: 'Access to safe water, sanitation, and hygiene is a basic human right that remains out of reach for billions of people. Water scarcity, poor water quality, and inadequate sanitation negatively impact food security, livelihood choices, and educational opportunities for poor families across the globe. By investing in resilient water infrastructure and protecting our natural water-related ecosystems, we can ensure a sustainable supply of life’s most vital resource.',
                summary: 'Protecting the fundamental resource that sustains all life and industry.',
                status2024: 'Intensifying climate chaos is disrupting water cycles, leaving billions increasingly vulnerable to both extreme droughts and floods.'
            },
            { 
                id: 'p7', title: 'Clean Energy', goal: 7, fact: 'Energy accounts for roughly 60% of global greenhouse emissions.', 
                text: 'Energy is the dominant contributor to climate change, and our transition to a cleaner, more sustainable energy future is urgent. Access to affordable and reliable energy services is crucial for development, yet millions still rely on harmful traditional fuels. We must double the global rate of improvement in energy efficiency and substantially increase the share of renewable energy in the global energy mix to avoid the worst impacts of warming.',
                summary: 'Powering a sustainable future through the rapid transition to renewables.',
                status2024: 'While access has improved, the transition to renewables is too slow to offset rising global greenhouse gas emissions.'
            },
            { 
                id: 'p8', title: 'Decent Work', goal: 8, fact: 'Global unemployment stood at 192M in 2022.', 
                text: 'Sustained and inclusive economic growth can drive progress, create decent jobs for all, and improve living standards. However, the global economy continues to face challenges like stagnant wages, informal labor, and unequal opportunities for youth and marginalized groups. We must promote policies that support productive activities, entrepreneurship, and innovation while ensuring the full protection of labor rights and a safe working environment.',
                summary: 'Building a global economy that values fair wages and dignified labor.',
                status2024: 'For the first time this century, per-capita GDP growth in half of the world’s vulnerable nations is slower than in advanced economies.'
            },
            { 
                id: 'p9', title: 'Innovation', goal: 9, fact: 'Only 54% of the population has reliable internet access.', 
                text: 'Inclusive and sustainable industrialization, together with innovation and infrastructure, can unleash dynamic and competitive economic forces. Investments in transport, irrigation, energy, and information technology are crucial to achieving sustainable development and empowering communities. We must foster industrial innovation that is environmentally sound and accessible to small-scale enterprises and developing nations alike.',
                summary: 'Driving progress through resilient infrastructure and green technology.',
                status2024: 'The digital divide remains stark, stalling critical green technological innovation in the developing world.'
            },
            { 
                id: 'p10', title: 'Reduced Inequality', goal: 10, fact: 'The richest 10% earn 52% of all global income.', 
                text: 'The global community has made significant strides towards lifting people out of poverty, but inequality still persists and large disparities remain in access to health and education. Reducing inequality requires transformative change, including greater social protection and the empowerment of marginalized groups. We must ensure that the poorest 40 percent of the population experience income growth that is higher than the national average.',
                summary: 'Bridging the global wealth gap and ensuring no one is left behind.',
                status2024: 'Global inequalities are increasing again as economic setbacks disproportionately affect the poorest nations.'
            },
            { 
                id: 'p11', title: 'Sustainable Cities', goal: 11, fact: 'Cities consume 60-80% of energy despite their small footprint.', 
                text: 'The world is becoming increasingly urbanized, and making cities safe and sustainable is one of our greatest challenges. Sustainable urban planning must provide access to safe and affordable housing, upgrade slum settlements, and invest in public transport that reduces carbon emissions. Protecting the world’s cultural and natural heritage while enhancing green public spaces is essential for the well-being of billions of city dwellers.',
                summary: 'Designing the urban future to be safe, resilient, and inclusive.',
                status2024: 'Critically off-track: Rapid, unplanned urbanization is vastly outpacing the development of sustainable infrastructure.'
            },
            { 
                id: 'p12', title: 'Responsible Consumption', goal: 12, fact: 'We would need 3 planets to sustain current resource usage.', 
                text: 'Sustainable consumption and production are about doing more and better with less. It is also about decoupling economic growth from environmental degradation, increasing resource efficiency, and promoting sustainable lifestyles. We must significantly reduce waste through prevention, reduction, recycling, and reuse, while ensuring that consumers everywhere have the information and awareness needed for sustainable development.',
                summary: 'Learning to live within our planet’s means through mindful consumption.',
                status2024: 'Global resource extraction and consumption rates continue to rise, far exceeding the Earth’s regenerative capacity.'
            },
            { 
                id: 'p13', title: 'Climate Action', goal: 13, fact: 'Global CO2 emissions have increased by 50% since 1990.', 
                text: 'Climate change is the defining challenge of our time, and the window of opportunity to avoid its worst impacts is closing rapidly. Weather patterns are changing, sea levels are rising, and extreme weather events are becoming more frequent and severe. Urgent action is needed to strengthen resilience and adaptive capacity to climate-related hazards while integrating climate change measures into national policies and strategies.',
                summary: 'The critical global mission to protect our planet from environmental collapse.',
                status2024: '2023 was the warmest year on record, nearing the critical 1.5°C threshold while atmospheric CO2 concentrations hit new highs.'
            },
            { 
                id: 'p14', title: 'Life Below Water', goal: 14, fact: 'Oceans absorb about 30% of human-produced CO2.', 
                text: 'The world’s oceans—their temperature, chemistry, currents, and life—drive global systems that make the Earth habitable for humankind. Protecting these vast marine resources is essential for climate regulation, biodiversity, and global food security. We must work to prevent and significantly reduce marine pollution of all kinds, particularly from land-based activities, and protect at least 30% of the world’s oceans by 2030.',
                summary: 'Sustaining the vast marine ecosystems that regulate our entire climate.',
                status2024: 'Critically off-track: Ocean temperatures reached unprecedented highs in 2024, devastating coral reefs and marine life.'
            },
            { 
                id: 'p15', title: 'Life on Land', goal: 15, fact: '13 million hectares of forest are lost every year.', 
                text: 'Terrestrial ecosystems provide the essential services that sustain all human life, from the air we breathe to the food we eat. However, biodiversity is declining at an unprecedented rate, and land degradation is threatening the livelihoods of billions. We must take urgent action to halt the loss of biodiversity, protect and restore forests, and combat desertification to ensure the continued health of the Earth’s life-support systems.',
                summary: 'Restoring and protecting the biodiversity that sustains all life on land.',
                status2024: 'Critically off-track: Mass extinction driven by habitat loss continues, severely threatening global food supply chains.'
            },
            { 
                id: 'p16', title: 'Peace & Justice', goal: 16, fact: 'Corruption and tax evasion cost US$1.26T per year.', 
                text: 'Peaceful, just, and inclusive societies are the core foundation for all other sustainable development goals. Conflict, insecurity, weak institutions, and limited access to justice remain a great threat to sustainable development globally. We must focus on significantly reducing all forms of violence, ending exploitation and trafficking, and ensuring that everyone has an equal opportunity to seek justice through transparent and accountable institutions.',
                summary: 'The fundamental pillars of peace, justice, and human rights for all.',
                status2024: 'Critically off-track: By May 2024, forcibly displaced people reached 120 million, and civilian casualties spiked 72% in 2023.'
            },
            { 
                id: 'p17', title: 'Partnerships', goal: 17, fact: '193 countries agreed on these global goals in 2015.', 
                text: 'A successful sustainable development agenda requires partnerships between governments, the private sector, and civil society. These inclusive partnerships built upon principles and values, a shared vision, and shared goals that place people and the planet at the center, are needed at the global, regional, national, and local levels. Only by working together can we mobilize the resources and innovation needed to achieve the 2030 Agenda.',
                summary: 'The global union of nations required to turn these 17 goals into reality.',
                status2024: 'Only 17% of all UN targets are currently on track. Massive financial reform and bolder actions are required immediately.'
            }
        ];

        const renderLessons = () => {
            const learned = JSON.parse(localStorage.getItem('vibemap_learned') || '[]');

            // Show all 1-17
            const html = LESSONS.map(lesson => {
                const isLearned = learned.includes(lesson.id);
                return `
                    <article class="lesson-card ${isLearned ? 'completed' : ''}" data-id="${lesson.id}" data-goal="${lesson.goal}">
                        <span class="guide-eyebrow">Goal ${lesson.goal}</span>
                        <h4>${lesson.title}</h4>
                        <p>${lesson.summary}</p>
                        <div class="lesson-actions"><button class="lesson-btn">Explore this goal →</button>
                        <a href="https://sdgs.un.org/goals/goal${lesson.goal}" target="_blank" rel="noopener noreferrer">UN source ↗</a></div>
                    </article>`;
            }).join('');

            // Inject into both modal and landing page section
            if (dom.eduLessons) dom.eduLessons.innerHTML = html;
            if (dom.lpLessons) dom.lpLessons.innerHTML = html;

            // Listeners for both containers
            [dom.eduLessons, dom.lpLessons].forEach(container => {
                if (!container) return;
                container.querySelectorAll('.lesson-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const card = e.target.closest('.lesson-card');
                        const goalNum = card.dataset.goal;
                        showSdgLesson(goalNum);
                    });
                });
            });
        };

        refreshLessons = renderLessons;
        // Render initially for landing page
        renderLessons();

        const strip = document.getElementById('progress-strip');
        const show = () => {
            dom.eduModal.classList.remove('hidden');
            if (strip) strip.classList.add('strip-hidden');
            renderLessons();
        };

        const hide = () => {
            dom.eduModal.classList.add('hidden');
            if (strip) strip.classList.remove('strip-hidden');
        };

        // Unified Function to show the main landing guide section
        const showMainGuide = () => {
            if (S.ecoGameActive || !dom.gameModal.classList.contains('hidden')) dom.gameExitBtn.click();
            dom.landingPage.inert = false;
            // 1. Close all active modals/overlays
            if (dom.eduModal) dom.eduModal.classList.add('hidden');
            if (dom.lessonPage) dom.lessonPage.classList.add('hidden');
            if (dom.gameModal) dom.gameModal.classList.add('hidden');
            if (dom.infoCard) dom.infoCard.classList.add('hidden');
            if (S.dirOpen) closeDirections();
            if (S.layersOpen) dom.layersClose.click();
            
            // 2. Exit specialized modes (Game, etc)
            document.body.classList.remove('game-active');
            
            // 3. Ensure sidebar is closed
            if (S.sidebarOpen) dom.sidebarClose.click();

            // 4. Show landing page and scroll to section
            dom.landingPage.classList.remove('hidden');
            setMapAccessibility(false);
            document.getElementById('landing-edu-section').classList.remove('hidden');
            const section = document.getElementById('landing-edu-section');
            if (section) {
                // Short timeout to ensure display:none is gone before scrolling
                setTimeout(() => {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 10);
            }
        };

        showLearningGuide = () => { showMainGuide(); recordView('learn'); };

        // Scroll to section instead of opening modal from landing page button
        if (dom.lpEduScrollBtn) {
            dom.lpEduScrollBtn.addEventListener('click', showLearningGuide);
        }

        // Return to Guide from the map
        if (dom.mapEduBtn) {
            dom.mapEduBtn.addEventListener('click', showLearningGuide);
        }

        if (dom.landingEduBtn) dom.landingEduBtn.addEventListener('click', show);
        if (dom.sidebarEduBtn) dom.sidebarEduBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLearningGuide();
            // Close sidebar if open
            if (S.sidebarOpen) dom.sidebarClose.click();
        });
        if (dom.eduClose) dom.eduClose.addEventListener('click', hide);
        if (dom.eduCloseBottom) dom.eduCloseBottom.addEventListener('click', hide);
        if (dom.eduModal) dom.eduModal.addEventListener('click', (e) => {
            if (e.target === dom.eduModal) hide();
        });
    };

    const initSdgLessons = () => {
        const SDG_LESSONS = {
            1: {
                title: 'No Poverty',
                role: 'Eradicating poverty is not just a gesture of charity, but an act of justice and the key to unlocking human potential. Sustainable development begins with ensuring that the most vulnerable populations have access to basic resources, services, and social protections. We aim to build the resilience of the poor to reduce their exposure to economic and environmental shocks.',
                fact: '736 million people live on less than $1.90 a day.',
                action: 'Achieving this requires action from everyone. Start by donating unused resources, purchasing fair trade goods that guarantee a living wage, and advocating for policies that empower marginalized communities.',
                targets: ['Eradicate extreme poverty (people living on <$1.25/day)', 'Reduce poverty by at least half', 'Implement social protection systems', 'Ensure equal rights to resources and services'],
                progress: '🚨 2024 Global Status: An additional 23 million people were pushed into extreme poverty recently due to lingering pandemic impacts and escalating global conflicts. Urgent, systemic financial reform is required.',
                challenges: ['Widening global inequalities', 'Economic shocks from pandemics', 'Impact of climate change on vulnerable regions']
            },
            2: {
                title: 'Zero Hunger',
                role: 'Hunger is the leading cause of death globally, yet our planet produces enough food to feed everyone. Achieving zero hunger requires a global transformation of our food systems to be more productive, inclusive, and sustainable. This involves securing equitable access to land, technology, and markets for small-scale farmers.',
                fact: 'One third of all food produced is wasted globally.',
                action: 'You can directly support this goal by shifting to a more plant-based diet, aggressively reducing personal food waste, and choosing locally grown, sustainable produce over imported goods.',
                targets: ['End hunger and ensure access to food', 'End all forms of malnutrition', 'Double agricultural productivity', 'Ensure sustainable food systems'],
                progress: '🚨 2024 Global Status: Critically off-track. Over 100 million more people suffered from severe hunger in 2022 compared to 2019, driven by climate disasters and supply chain shocks.',
                challenges: ['Climate-related drought and floods', 'High costs of nutritious food', 'Disruptions in global food supply chains']
            },
            3: {
                title: 'Good Health',
                role: 'Ensuring healthy lives and promoting well-being at all ages is essential to building prosperous societies. The global community must continue to fight infectious diseases, emerging health crises, and the lack of universal health coverage. Accessible global healthcare should be a fundamental human right.',
                fact: 'Vaccines prevent 2-3 million deaths every year.',
                action: 'Prioritize your own physical and mental well-being, stay up-to-date with vaccinations, and support charities that deliver vital medical supplies to underfunded regions.',
                targets: ['Reduce maternal mortality', 'End preventable deaths for children < 5', 'End epidemics (AIDS, TB, Malaria)', 'Reduce premature mortality from non-communicable diseases'],
                progress: '🚨 2024 Global Status: Progress has alarmingly decelerated. The pandemic effectively undid nearly a decade of hard-won gains in global life expectancy and immunization rates.',
                challenges: ['Strained healthcare systems', 'Emerging infectious diseases', 'Disparities in vaccine access']
            },
            4: {
                title: 'Quality Education',
                role: 'Education is the most powerful tool we possess for breaking vast cycles of poverty and reducing entrenched social inequalities. It empowers people to live more healthy, sustainable lives while fostering the innovation needed to solve tomorrow’s global challenges.',
                fact: '617 million youth lack basic mathematics and literacy skills.',
                action: 'Support local educational initiatives, mentor youth in your community, hold book drives, and advocate for free, equitable primary education for all children globally.',
                targets: ['Universal primary/secondary education', 'Equal access to technical/vocational/tertiary education', 'Increase number of youth with relevant job skills', 'Eliminate gender disparities in education'],
                progress: '🚨 2024 Global Status: Post-pandemic assessments show alarming declines in student mathematics and reading skills across dozens of nations, reversing decades of progress.',
                challenges: ['Educational gaps in conflict zones', 'Lack of digital infrastructure for remote learning', 'Teacher shortages in developing nations']
            },
            5: {
                title: 'Gender Equality',
                role: 'Gender equality is a fundamental human right and a necessary foundation for a peaceful, prosperous, and sustainable world. Equal access to education, systemic healthcare, and fair representation in political and economic decision-making processes remains vital.',
                fact: 'Women perform 2.6x more unpaid care work than men.',
                action: 'Actively support women-owned enterprises, advocate relentlessly for equal pay in your workplace, and challenge harmful gender stereotypes whenever they arise.',
                targets: ['End all forms of discrimination against women', 'Eliminate violence and exploitation', 'Eliminate forced marriage and genital mutilation', 'Ensure full participation in leadership and decision-making'],
                progress: '🚨 2024 Global Status: Despite isolated cultural gains, achieving full, systemic gender equality at the current global pace is projected to take nearly 300 years.',
                challenges: ['Persistent gender pay gaps', 'Harmful traditional practices', 'Unequal representation in leadership']
            },
            6: {
                title: 'Clean Water',
                role: 'Access to safe water, sanitation, and hygiene fundamentally underpins human health and economic development. Water scarcity and poor sanitation negatively impact food security, livelihood choices, and educational opportunities for impoverished families worldwide.',
                fact: '3 in 10 people lack access to safely managed drinking water.',
                action: 'Conserve water aggressively at home. Fix leaks immediately, take shorter showers, and avoid dumping toxic chemicals, oils, or medications down the drain.',
                targets: ['Universal access to safe/affordable drinking water', 'Access to sanitation and hygiene', 'Improve water quality and reduce pollution', 'Increase water-use efficiency'],
                progress: '🚨 2024 Global Status: Intensifying climate chaos is violently disrupting water cycles, leaving billions increasingly vulnerable to both extreme, prolonged droughts and severe floods.',
                challenges: ['Aging water infrastructure', 'Increasing water scarcity from climate change', 'Water pollution from industrial runoff']
            },
            7: {
                title: 'Clean Energy',
                role: 'Traditional energy extraction is the dominant contributor to global climate change. Transitioning to a cleaner, sustainable energy future is urgent to decouple economic growth from catastrophic environmental degradation. Affordable renewables are the key to a surviving future.',
                fact: 'Energy accounts for 60% of all greenhouse gas emissions.',
                action: 'Switch your home to a green energy provider, invest in highly energy-efficient appliances, and drastically reduce your personal dependence on fossil-fuel-powered transport.',
                targets: ['Universal access to modern energy', 'Increase globally the share of renewable energy', 'Double the global rate of energy efficiency', 'Enhance international cooperation for clean energy'],
                progress: '🚨 2024 Global Status: While base access to electricity has improved, the global transition to renewables remains far too slow to offset rising, record-high greenhouse gas emissions.',
                challenges: ['Deep dependence on fossil fuels', 'High initial costs for renewable infrastructure', 'Energy access gaps in rural areas']
            },
            8: {
                title: 'Decent Work',
                role: 'Sustained, inclusive economic growth drives global progress, creates decent jobs, and lifts living standards. We must foster environments that support productive entrepreneurship while establishing uncompromising labor rights and eradicating modern slavery.',
                fact: 'Global unemployment stood at over 190 million in 2022.',
                action: 'Support responsible, ethical companies that guarantee fair wages. Purchase goods from local artisans, and advocate for workers’ rights and safe conditions in global supply chains.',
                targets: ['Sustain per capita economic growth', 'Achieve higher levels of economic productivity', 'Promote development-oriented policies', 'Improve global resource efficiency in consumption/production'],
                progress: '🚨 2024 Global Status: For the first time this century, per-capita GDP growth in half of the world’s most vulnerable nations is tracking slower than in advanced economies.',
                challenges: ['Informal economy labor without protections', 'Youth unemployment rates higher than adults', 'Safe working conditions in remote manufacturing']
            },
            9: {
                title: 'Innovation',
                role: 'Resilient infrastructure and inclusive industrialization are the backbone of a dynamic economy. Fostering innovation—from green tech to robust transport systems—is crucial for empowering disconnected communities and achieving large-scale sustainable milestones.',
                fact: 'Only 54% of the global population has reliable internet access.',
                action: 'Invest in and advocate for sustainable tech. Keep your electronics longer to reduce e-waste, and support initiatives that aim to close the digital divide in low-income brackets.',
                targets: ['Develop resilient/sustainable/inclusive infrastructure', 'Promote inclusive and sustainable industrialization', 'Increase access to financial services/markets', 'Upgrade infrastructure with clean technologies'],
                progress: '🚨 2024 Global Status: The global digital divide remains stark. An inability to access reliable internet is stalling critical green technological innovation across the developing world.',
                challenges: ['Limited research funding in low-income countries', 'Persistent digital divide', 'Fragile infrastructure in disaster-prone areas']
            },
            10: {
                title: 'Reduced Inequality',
                role: 'Vast disparities remain in wealth, health, and education across the globe. Systemic inequality threatens long-term social and economic development, breeds poverty, and destroys people’s sense of fulfillment and self-worth. We must mandate inclusive progress.',
                fact: 'The richest 10% earn over 50% of global income.',
                action: 'Raise your voice against discriminatory policies. Vote for politicians who support living wages, robust social safety nets, and equitable tax laws that prevent extreme wealth hoarding.',
                targets: ['Progressively achieve income growth for the bottom 40%', 'Empower and promote social/economic/political inclusion', 'Ensure equal opportunity and reduce inequalities of outcome', 'Adopt policies (fiscal/wage/social) for greater equality'],
                progress: '🚨 2024 Global Status: Global inequalities are increasing again. Recent global economic setbacks have disproportionately devastated the poorest nations while wealth consolidates at the top.',
                challenges: ['Migration crises and displaced people', 'Wage stagnation for lower-income tiers', 'Discrimination based on age, disability, and ethnicity']
            },
            11: {
                title: 'Sustainable Cities',
                role: 'The human future is urbanized. Making expanding cities safe and sustainable involves securing affordable housing, overhauling mass transit to eliminate emissions, and dedicating massive tracts of land to green, accessible public spaces for all demographics.',
                fact: 'Cities consume 60-80% of energy despite their small footprint.',
                action: 'Commit to public transportation, biking, or walking instead of driving. Participate in local city council meetings to demand protected bike lanes and expanded public parks.',
                targets: ['Ensure access to safe/affordable housing/services', 'Provide safe/sustainable transport systems', 'Enhance inclusive/sustainable urbanization', 'Protect the world’s cultural/natural heritage'],
                progress: '🚨 2024 Global Status: Critically off-track. Rapid, unplanned global urbanization is vastly outpacing the funding and development of sustainable, resilient civic infrastructure.',
                challenges: ['Rapid, unplanned urbanization', 'Air pollution levels exceeding WHO limits', 'Growing slum populations in mega-cities']
            },
            12: {
                title: 'Responsible Consumption',
                role: 'True sustainability requires decoupling economic growth from environmental destruction. We must end our throwaway culture and prioritize the circular economy—focusing intensely on prevention, reduction, recycling, and smart reuse of all global resources.',
                fact: 'We would need 3 planets to sustain current resource usage levels.',
                action: 'Embrace a minimalist approach to consumption. Buy second-hand clothes, repair broken items instead of replacing them, and absolutely reject single-use plastics.',
                targets: ['Implement the 10-year framework on sustainable consumption', 'Achieve sustainable management/efficient use of resources', 'Halve per capita global food waste', 'Achieve environmentally sound management of chemicals/wastes'],
                progress: '🚨 2024 Global Status: Global resource extraction, electronic waste generation, and raw consumption rates continue to rise, far exceeding the Earth’s natural regenerative capacity.',
                challenges: ['High levels of electronic waste', 'Single-use plastic dependency', 'Over-consumption in high-income nations']
            },
            13: {
                title: 'Climate Action',
                role: 'Climate change is the defining, existential challenge of our time. The window of opportunity to avoid irreversible tipping points is closing rapidly. We must drastically cut emissions, strengthen climate resilience, and integrate emergency measures onto every national agenda.',
                fact: 'Global CO2 emissions have increased by 50% since 1990.',
                action: 'Calculate and aggressively reduce your carbon footprint. Prioritize local plant-based diets, divest your finances from fossil fuel companies, and demand sweeping climate legislation.',
                targets: ['Strengthen resilience to climate-related hazards', 'Integrate climate change measures into national policies', 'Improve education and awareness on climate change', 'Implement the UN Framework Convention on Climate Change'],
                progress: '🚨 2024 Global Status: 2023 was the warmest year recorded in human history. We are nearing the critical 1.5°C threshold while atmospheric CO2 concentrations hit alarming new highs.',
                challenges: ['Rising ocean temperatures and acidification', 'Inertia in global energy transitions', 'Increasing frequency of extreme weather events']
            },
            14: {
                title: 'Life Below Water',
                role: 'The world’s oceans—their temperature, chemistry, currents, and abundant life—drive the global systems that make Earth habitable. Protecting these vast marine ecosystems is arguably our most critical defense for regulating the climate and securing global food chains.',
                fact: 'Oceans absorb 30% of human-produced CO2.',
                action: 'Eliminate all single-use plastics from your daily routine, ensure the seafood you consume is strictly certified sustainable, and support relentless marine conservation and cleanup groups.',
                targets: ['Prevent/reduce marine pollution of all kinds', 'Sustainably manage/protect marine/coastal ecosystems', 'Minimize/address the impacts of ocean acidification', 'Effectively regulate harvesting and end overfishing'],
                progress: '🚨 2024 Global Status: Critically off-track. Global ocean temperatures reached unprecedented highs in 2024, triggering devastating, widespread coral reef bleaching and mass die-offs.',
                challenges: ['Plastic pollution in deep-sea habitats', 'Coral reef bleaching and die-offs', 'Illegal and unregulated overfishing']
            },
            15: {
                title: 'Life on Land',
                role: 'Terrestrial ecosystems provide the very oxygen we breathe and the soil that grows our food. We are witnessing an unprecedented decline in biodiversity driven by human expansion. Halting deforestation and restoring degraded land is a matter of sheer human survival.',
                fact: '13 million hectares of forest are lost every year.',
                action: 'Support massive reforestation initiatives, switch to digital billing to save paper, buy recycled products, and advocate fiercely against industrial expansion into protected wilderness areas.',
                targets: ['Ensure conservation/restoration of terrestrial/freshwater ecosystems', 'Promote sustainable management of all types of forests', 'Combat desertification and restore degraded land', 'Ensure conservation of mountain ecosystems'],
                progress: '🚨 2024 Global Status: Critically off-track. The mass extinction event driven by constant habitat loss and aggressive agricultural expansion continues, severely threatening global food supply chains.',
                challenges: ['Halt of biodiversity loss', 'Illegal wildlife trafficking', 'Expanding agricultural land into rainforests']
            },
            16: {
                title: 'Peace & Justice',
                role: 'Peaceful, just, and strictly inclusive societies are the core foundation upon which all other sustainable development goals depend. Without security, strong institutions, and fair access to justice, it is fundamentally impossible to achieve long-term, systemic improvements.',
                fact: 'Corruption and tax evasion cost $1.26T per year.',
                action: 'Stay informed about global politics, participate actively in your local democratic processes, report corruption, and forcefully support organizations fighting for global human rights.',
                targets: ['Significantly reduce all forms of violence/death rates', 'End abuse/exploitation/trafficking of children', 'Promote the rule of law and ensure equal access to justice', 'Significantly reduce illicit financial and arms flows'],
                progress: '🚨 2024 Global Status: Critically off-track. By mid-2024, the number of forcibly displaced people reached an unprecedented 120 million, and global civilian casualties spiked by 72% over the previous year.',
                challenges: ['Geopolitical conflicts and wars', 'Weak judicial institutions in developing zones', 'Rise in digital misinformation and cyber-crime']
            },
            17: {
                title: 'Partnerships',
                role: 'The UN Sustainable Development Goals cannot be achieved in isolation. Success demands an unprecedented, inclusive partnership between governments, massive private sector corporations, and global civil society—all sharing a singular vision that prioritizes the planet over profit.',
                fact: '193 countries agreed on these global goals in 2015.',
                action: 'Join or support local environmental groups, collaborate with your neighbors on sustainability projects, and leverage your professional networks to push for corporate social responsibility.',
                targets: ['Strengthen domestic resource mobilization', 'Fully implement official development assistance commitments', 'Mobilize additional financial resources for developing countries', 'Promote a universal/rules-based/multilateral trading system'],
                progress: '🚨 2024 Global Status: Warning. Only 17% of all UN targets are currently on track. Massive, systemic global financial reform and radically bolder actions by world leaders are required immediately.',
                challenges: ['Debt sustainability for developing nations', 'Fragmentation of international trade policies', 'Difficulty in global data standardization']
            }
        };

        const renderTrack = () => {
            if (!dom.sdgTrack) return;
            let html = '';
            for (let i = 1; i <= 17; i++) {
                const data = SDG_LESSONS[i];
                if (!data) continue;
                html += `
                    <button type="button" class="sdg-card goal-${i}" data-goal="${i}">
                        <div class="sdg-num">${i}</div>
                        <h4>${data.title}</h4>
                        <p>${data.fact}</p>
                    </button>
                `;
            }
            dom.sdgTrack.innerHTML = html;
        };

        renderTrack();

        let returnFocus;
        let returnToModal = false;
        let returnToLanding = false;
        const showSdg = (num) => {
            const data = SDG_LESSONS[num];
            if (!data) return;
            returnFocus = document.activeElement;
            returnToModal = !dom.eduModal.classList.contains('hidden');
            returnToLanding = !dom.landingPage.classList.contains('hidden');

            recordView('goal-' + num);
            dom.lessonPage.style.setProperty('--hero-color', `var(--goal-${num})`);
            dom.lpGoalIcon.src = `https://open-sdg.github.io/sdg-translations/assets/img/goals/en/${num}.png`;
            dom.lpGoalNum.textContent = 'SDG Goal ' + num;
            dom.lpGoalTitle.textContent = data.title;
            $('#lp-un-source').href = `https://sdgs.un.org/goals/goal${num}`;
            dom.lpGoalRole.textContent = data.role;
            dom.lpGoalFact.textContent = data.fact;
            dom.lpGoalAction.textContent = data.action;
            dom.lpGoalProgress.textContent = data.progress;

            // Targets Injections
            dom.lpGoalTargets.innerHTML = data.targets.map((t, i) => `
                <div class="lp-target-card">
                    <h5>Target ${num}.${i + 1}</h5>
                    <p>${t}</p>
                </div>
            `).join('');

            // Challenges Injections
            dom.lpGoalChallenges.innerHTML = data.challenges.map(c => `<li>${c}</li>`).join('');

            // Animations and visibility
            dom.eduModal.classList.add('hidden'); // Hide the guide while deep dive is open
            dom.landingPage.inert = true;
            dom.landingPage.classList.add('hidden');
            setMapAccessibility(false);
            dom.lessonPage.classList.remove('hidden');
            dom.lessonPage.scrollTo(0, 0);
            dom.lessonPage.querySelector('.lesson-page-container').scrollTo(0, 0);
            dom.lessonBack.focus({ preventScroll: true });

            // Set current goal for completion
            dom.lpCompleteBtn.onclick = () => {
                const learned = JSON.parse(localStorage.getItem('vibemap_learned') || '[]');
                const id = `p${num}`;
                if (!learned.includes(id)) {
                    learned.push(id);
                    localStorage.setItem('vibemap_learned', JSON.stringify(learned));
                }
                recordVisitToday();
                renderStreak();
                toast(`🎯 Lesson Complete! Streak updated.`, 'success');
                hideSdgPage();
                refreshLessons();
            };
        };

        showSdgLesson = showSdg;

        const hideSdgPage = () => {
            recordView(returnToLanding ? 'learn' : 'map');
            dom.lessonPage.classList.add('hidden');
            dom.landingPage.inert = false;
            if (returnToLanding) dom.landingPage.classList.remove('hidden');
            if (returnToModal) dom.eduModal.classList.remove('hidden');
            setMapAccessibility(dom.landingPage.classList.contains('hidden'));
            const focus = returnFocus?.getClientRects().length ? returnFocus : returnToLanding ? dom.lpEduScrollBtn : dom.menuBtn;
            focus?.focus({ preventScroll: true });
        };
        dom.lessonBack.addEventListener('click', hideSdgPage);
        dom.lessonPage.addEventListener('keydown', event => {
            if (event.key === 'Escape') hideSdgPage();
        });

        document.getElementById('sdg-icon-grid').addEventListener('click', event => {
            const tile = event.target.closest('[data-goal]');
            if (tile) showSdg(tile.dataset.goal);
        });
        dom.infoSdg.addEventListener('click', event => {
            const badge = event.target.closest('[data-goal]');
            if (badge) showSdg(badge.dataset.goal);
        });

        dom.sdgTrack.addEventListener('click', (e) => {
            const card = e.target.closest('.sdg-card');
            if (card) {
                const num = parseInt(card.dataset.goal);
                showSdg(num);
            }
        });

        const trackCont = dom.sdgTrack.parentElement;
        let isDown = false, startX, scrollLeft;
        trackCont.addEventListener('mousedown', e => { isDown = true; startX = e.pageX - trackCont.offsetLeft; scrollLeft = trackCont.scrollLeft; });
        trackCont.addEventListener('mouseleave', () => isDown = false);
        trackCont.addEventListener('mouseup', () => isDown = false);
        trackCont.addEventListener('mousemove', e => { if (!isDown) return; e.preventDefault(); const x = e.pageX - trackCont.offsetLeft; const walk = (x - startX) * 2; trackCont.scrollLeft = scrollLeft - walk; });
    };

    const initEcoGame = () => {
        let gameTimer = null;
        let timeLeft = 0;
        let gameMarkers = [];
        let gameActive = false;
        let recallData = [];
        let gamePlaces = [];

        const updateClock = (s) => {
            const m = Math.floor(s / 60), sec = s % 60;
            dom.gameCountdown.textContent = `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        };

        const stopGameTimer = () => { if (gameTimer) { clearInterval(gameTimer); gameTimer = null; } };

        const showPhasePopup = (phase) => {
            dom.gameModal.classList.remove('hidden');
            dom.gameIntroView.classList.add('hidden');
            dom.gameResultsView.classList.add('hidden');
            
            if (phase === 'intro') {
                dom.gameIntroView.classList.remove('hidden');
            } else if (phase === 'results') {
                dom.gameResultsView.classList.remove('hidden');
            }
        };

        const endChallenge = () => {
            stopGameTimer();
            gameActive = false;
            S.ecoGameActive = false;
            updateEcoMarkers();
            document.body.classList.remove('game-active');
            dom.gameTimerBar.classList.remove('active');
            dom.gameRecallPanel.classList.remove('active');
            dom.gameRecallPanel.classList.add('hidden');
            
            // Calculate Score
            let score = 0;
            const inputs = dom.gameRecallInputs.querySelectorAll('input');
            const userAnswers = Array.from(inputs).map(i => i.value.trim().toLowerCase()).filter(v => v);
            
            // Get all valid location names
            const validNames = gamePlaces
                .map(l => l.name.toLowerCase());

            // A name is correct if it matches any valid name exactly (basic)
            // or if it's "close enough" (optional, but let's stick to exact for now as per "Check answers")
            userAnswers.forEach(ans => {
                const idx = validNames.indexOf(ans);
                if (idx !== -1) {
                    score++;
                    validNames.splice(idx, 1); // Only count once
                }
            });

            const total = gamePlaces.length;
            dom.gameFinalScore.textContent = `${score} / ${total}`;
            
            if (score === total) dom.gameFeedback.textContent = "Unbelievable! Perfect score. You are a sustainability master! 🏆";
            else if (score > total / 2) dom.gameFeedback.textContent = "Great job! Your memory of the city is impressive. 🌱";
            else dom.gameFeedback.textContent = "A good start! Keep exploring Luzern to learn more spots. 🗺️";

            showPhasePopup('results');
            
            // Clear map
            clearChallengeMarkers();
        };

        const clearChallengeMarkers = () => {
            gameMarkers.forEach(m => map.removeLayer(m));
            gameMarkers = [];
        };

        const startRecallPhase = () => {
            stopGameTimer();
            $('#game-ready-btn').hidden = true;
            dom.gamePhaseLabel.textContent = 'Recall Phase';
            timeLeft = 5 * 60; // 15 minutes
            updateClock(timeLeft);
            
            // Hide Markers
            clearChallengeMarkers();

            // Setup Recall Panel
            dom.gameRecallInputs.innerHTML = '';
            const total = gamePlaces.length;
            for (let i = 0; i < total; i++) {
                const group = document.createElement('div');
                group.className = 'recall-input-group';
                group.innerHTML = `<label for="recall-${i}">Place ${i + 1}</label><input id="recall-${i}" type="text" placeholder="Location name...">`;
                dom.gameRecallInputs.appendChild(group);
            }
            
            dom.gameRecallPanel.classList.remove('hidden');
            setTimeout(() => dom.gameRecallPanel.classList.add('active'), 100);

            gameTimer = setInterval(() => {
                timeLeft--;
                updateClock(timeLeft);
                if (timeLeft <= 0) endChallenge();
            }, 1000);
        };

        const startMemorizationPhase = () => {
            $('#game-ready-btn').hidden = false;
            gameActive = true;
            S.ecoGameActive = true;
            updateEcoMarkers();
            document.body.classList.add('game-active');
            dom.gameModal.classList.add('hidden');
            dom.gameTimerBar.classList.add('active');
            dom.gamePhaseLabel.textContent = 'Memorize!';
            
            timeLeft = 90; // A short study period for five places
            updateClock(timeLeft);

            // Show ALL markers
            clearChallengeMarkers();
            gamePlaces = [...SUSTAINABLE_LOCATIONS].sort(() => Math.random() - .5).slice(0, 5);
            gamePlaces.forEach(loc => {
                // Show the selected places
                if (loc.name.toLowerCase().includes('carlisle')) return;

                const m = L.marker([loc.lat, loc.lng], {
                    icon: L.divIcon({ className: '', html: '<div class="marker-pin green"></div>', iconSize: [32, 32], iconAnchor: [16, 32] })
                }).addTo(map);
                m.bindTooltip(loc.name, { permanent: true, direction: 'top', offset: [0, -32] });
                gameMarkers.push(m);
            });

            map.fitBounds(gamePlaces.map(loc => [loc.lat, loc.lng]), { padding: [70, 100], maxZoom: 14 });

            gameTimer = setInterval(() => {
                timeLeft--;
                updateClock(timeLeft);
                if (timeLeft <= 0) startRecallPhase();
            }, 1000);
        };

        // Event Listeners
        dom.guideStartGameBtn?.addEventListener('click', () => {
            openGuideMap();
            showPhasePopup('intro');
            // Hide landing page to show map
            dom.landingPage.classList.add('hidden');
            if (S.sidebarOpen) dom.sidebarClose.click();
        });

        dom.gameStartBtn.addEventListener('click', startMemorizationPhase);
        $('#game-ready-btn').addEventListener('click', startRecallPhase);
        $('#game-cancel-btn').addEventListener('click', () => dom.gameExitBtn.click());
        $('#game-study-exit').addEventListener('click', () => dom.gameExitBtn.click());
        dom.gameSubmitBtn.addEventListener('click', endChallenge);
        dom.gameReplayBtn.addEventListener('click', () => {
            showPhasePopup('intro');
        });
        dom.gameExitBtn.addEventListener('click', () => {
            stopGameTimer();
            gameActive = false;
            clearChallengeMarkers();
            S.ecoGameActive = false;
            updateEcoMarkers();
            dom.gameTimerBar.classList.remove('active');
            dom.gameRecallPanel.classList.add('hidden');
            dom.gameRecallPanel.classList.remove('active');
            dom.gameModal.classList.add('hidden');
            // Show landing page again? No, stay on map but exiting game mode
            document.body.classList.remove('game-active');
            dom.menuBtn.focus({ preventScroll: true });
        });
    };

    initEcoData();
    initLocalGuide(); // The map opens without an automatic carousel.
    initEduModal();
    initSdgLessons();
    updateEcoScore();
    renderDailyChallenge();

    // Progress is earned through optional activities, not by opening the site.
    renderStreak();
    updateProgressStrip();

    initEcoGame(); // Call new game init
    function showView(next) {
        if (NAV.active) stopNavigation();
        if (S.ecoGameActive || !dom.gameModal.classList.contains('hidden')) dom.gameExitBtn.click();
        if (S.sidebarOpen) dom.sidebarClose.click();
        if (S.layersOpen) dom.layersClose.click();
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));
        dom.infoCard.classList.add('hidden');
        if (next === 'directions' && S.dirOpen) return;
        if (S.dirOpen) closeDirections();
        if (next === 'home') {
            dom.lessonPage.classList.add('hidden');
            dom.landingPage.inert = false;
            dom.landingPage.classList.remove('hidden');
            setMapAccessibility(false);
            recordView('home');
            dom.landingPage.scrollTo({ top: 0, behavior: 'instant' });
            dom.startExploringBtn.focus({ preventScroll: true });
        } else if (next === 'learn') showLearningGuide();
        else if (next.startsWith('goal-')) { showLearningGuide(); showSdgLesson(+next.slice(5)); }
        else { openGuideMap(); if (next === 'directions') openDirections(); }
    }
    document.querySelectorAll('[data-site-view]').forEach(button => button.addEventListener('click', () => {
        const next = button.dataset.siteView;
        if (next === view) return;
        restoringView = true;
        showView(next);
        restoringView = false;
        recordView(next);
    }));
    window.addEventListener('popstate', () => {
        const target = GreenNavigation.parse(location.hash);
        restoringView = true;
        if (!location.hash && location.search) { showView('map'); parseUrlParams(); }
        else showView(target.view === 'goal' ? 'goal-' + target.goal : target.view);
        restoringView = false;
    });
    if (location.hash) {
        const target = GreenNavigation.parse(location.hash);
        restoringView = true;
        showView(target.view === 'goal' ? 'goal-' + target.goal : target.view);
        restoringView = false;
    } else {
        restoringView = true;
        parseUrlParams();
        restoringView = false;
        if (!location.search) recordView('home', true);
    }

    // Dialog lifecycle: hide background controls, keep keyboard focus inside and restore it on close.
    const dialogs = [...document.querySelectorAll('.modal-overlay, #game-modal, #sidebar-menu')];
    let activeDialog = null;
    let previousFocus = null;
    function syncDialogs() {
        const next = dialogs.find(dialog => !dialog.classList.contains('hidden'));
        dialogs.forEach(dialog => dialog.inert = dialog !== next);
        dom.infoCard.inert = Boolean(next);
        dom.dirPanel.inert = Boolean(next) || !S.dirOpen;
        dom.layersPanel.inert = Boolean(next) || !S.layersOpen;
        dom.lessonPage.inert = Boolean(next);
        if (next === activeDialog) return;
        if (next) {
            previousFocus = document.activeElement;
            next.setAttribute('role', 'dialog');
            next.setAttribute('aria-modal', 'true');
            next.setAttribute('aria-label', next.querySelector('h2')?.textContent || 'Menu');
            next.querySelector('button, input, a')?.focus();
        } else if (activeDialog && previousFocus?.isConnected && previousFocus.getClientRects().length) previousFocus.focus();
        activeDialog = next;
        document.body.classList.toggle('dialog-open', Boolean(next));
        setMapAccessibility(!next && dom.landingPage.classList.contains('hidden') && dom.lessonPage.classList.contains('hidden'));
        dom.landingPage.inert = Boolean(next) || !dom.lessonPage.classList.contains('hidden');
    }
    const observer = new MutationObserver(syncDialogs);
    dialogs.forEach(dialog => observer.observe(dialog, { attributes: true, attributeFilter: ['class'] }));
    const closeDialog = dialog => {
        const close = dialog.querySelector('[id$="close-btn"], #game-cancel-btn');
        if (close) close.click();
        else dialog.classList.add('hidden');
    };
    dialogs.forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog && dialog.id !== 'sidebar-menu') closeDialog(dialog); }));
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && S.ecoGameActive) { event.preventDefault(); dom.gameExitBtn.click(); return; }
        if (!activeDialog) return;
        if (event.key === 'Escape') { event.preventDefault(); closeDialog(activeDialog); }
        if (event.key === 'Tab') {
            const controls = [...activeDialog.querySelectorAll('button, a[href], input, textarea, select')].filter(el => !el.disabled && el.getClientRects().length);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    });
    syncDialogs();

    // ── PWA: Register Service Worker ──────────────────
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('✅ Service worker registered'))
                .catch(err => console.warn('SW registration failed:', err));
        });
    }

    console.log('Green Luzern local guide loaded');
})();

