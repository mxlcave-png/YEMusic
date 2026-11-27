(function () {
    const CLE = 'yemusic_reglages';

    function lire() {
        try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
    }

    // logo du menu
    document.querySelectorAll('header img.logo').forEach((img) => {
        img.src = 'images/logo rond.png';
    });

    // entrée active du menu
    const page = location.pathname.split('/').pop() || 'index2.html';
    document.querySelectorAll('header nav a').forEach((a) => {
        if (a.getAttribute('href') === page) a.classList.add('actif');
    });

    // barre de lecture : ajoutée sur toutes les pages qui n'en ont pas
    const MODELE_LECTEUR =
        '<div class="lp-infos">' +
            '<img id="lp-pochette" src="images/logo rond.png" alt="">' +
            '<div><p id="lp-titre">Choisis un titre</p><p class="lp-artiste">YEMusic</p></div>' +
        '</div>' +
        '<div class="lp-centre">' +
            '<div class="lp-boutons">' +
                '<button id="lp-shuffle" aria-label="Lecture aléatoire" aria-pressed="false"></button>' +
                '<button id="lp-prev" aria-label="Titre précédent"></button>' +
                '<button id="lp-play" aria-label="Lecture / pause"></button>' +
                '<button id="lp-next" aria-label="Titre suivant"></button>' +
            '</div>' +
            '<div class="lp-progress">' +
                '<span id="lp-pos">0:00</span>' +
                '<input type="range" id="lp-barre" min="0" max="100" value="0">' +
                '<span id="lp-dur">0:00</span>' +
            '</div>' +
        '</div>';

    const MODELE_DROITE =
        '<span class="lp-vol-icone" aria-hidden="true"></span>' +
        '<input type="range" id="lp-volume" min="0" max="100" value="70" aria-label="Volume">' +
        '<button id="lp-repeat" aria-label="Répétition"></button>' +
        '<button id="lp-ouvrir" aria-label="Ouvrir le lecteur détaillé"></button>';

    let lecteur = document.querySelector('.lecteur-perso');
    if (!lecteur) {
        lecteur = document.createElement('div');
        lecteur.className = 'lecteur-perso';
        lecteur.innerHTML = MODELE_LECTEUR;
        document.body.append(lecteur);
    }
    if (!lecteur.querySelector('.lp-droite')) {
        const droite = document.createElement('div');
        droite.className = 'lp-droite';
        droite.innerHTML = MODELE_DROITE;
        lecteur.append(droite);
    }

    // icônes en SVG : même trait, même taille partout
    const att = 'width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"';
    const LINE = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
    const ICONES = {
        play: '<svg ' + att + '><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" fill="currentColor"/></svg>',
        pause: '<svg ' + att + '><rect x="6" y="5" width="4" height="14" rx="1.2" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.2" fill="currentColor"/></svg>',
        prev: '<svg ' + att + '><path d="M6 5h2v14H6z" fill="currentColor"/><path d="M19 5.8v12.4a.8.8 0 0 1-1.25.66L9.5 12.66a.8.8 0 0 1 0-1.32l8.25-5.2A.8.8 0 0 1 19 5.8z" fill="currentColor"/></svg>',
        next: '<svg ' + att + '><path d="M16 5h2v14h-2z" fill="currentColor"/><path d="M5 5.8v12.4a.8.8 0 0 0 1.25.66l8.25-5.2a.8.8 0 0 0 0-1.32L6.25 5.14A.8.8 0 0 0 5 5.8z" fill="currentColor"/></svg>',
        shuffle: '<svg ' + att + ' ' + LINE + '><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
        repeat: '<svg ' + att + ' ' + LINE + '><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
        ouvrir: '<svg ' + att + ' ' + LINE + '><path d="M14 4h6v6"/><path d="M20 4l-7 7"/><path d="M10 20H4v-6"/><path d="M4 20l7-7"/></svg>',
        volume: '<svg ' + att + ' ' + LINE + '><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/></svg>'
    };

    const set = (id, svg) => { const b = document.getElementById(id); if (b) b.innerHTML = svg; };
    set('lp-prev', ICONES.prev);
    set('lp-next', ICONES.next);
    set('lp-shuffle', ICONES.shuffle);
    set('lp-repeat', ICONES.repeat);
    set('lp-ouvrir', ICONES.ouvrir);
    const vol = lecteur.querySelector('.lp-vol-icone');
    if (vol) vol.innerHTML = ICONES.volume;

    // le bouton lecture change tout seul (▶ / pause) : on remet l'icône correspondante
    const btnPlay = document.getElementById('lp-play');
    function majPlay() {
        if (!btnPlay) return;
        const etat = btnPlay.textContent.indexOf('\u25B6') !== -1 ? 'play' : 'pause';
        if (btnPlay.dataset.etat === etat) return;
        btnPlay.dataset.etat = etat;
        btnPlay.innerHTML = ICONES[etat];
    }
    if (btnPlay) {
        majPlay();
        new MutationObserver(majPlay).observe(btnPlay, { childList: true, characterData: true, subtree: true });
    }

    // réglages : taille du texte et affichage de la barre
    function appliquer() {
        const r = lire();
        document.documentElement.style.fontSize = r.taille === 'grand' ? '18px' : '';
        lecteur.hidden = r.lecteur === false;
    }

    window.YEReglages = { appliquer };
    appliquer();
})();
