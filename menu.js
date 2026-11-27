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
                '<button id="lp-shuffle" aria-label="Lecture aléatoire">&#128256;</button>' +
                '<button id="lp-prev" aria-label="Titre précédent">&#9198;</button>' +
                '<button id="lp-play" aria-label="Lecture / pause">&#9654;</button>' +
                '<button id="lp-next" aria-label="Titre suivant">&#9197;</button>' +
            '</div>' +
            '<div class="lp-progress">' +
                '<span id="lp-pos">0:00</span>' +
                '<input type="range" id="lp-barre" min="0" max="100" value="0">' +
                '<span id="lp-dur">0:00</span>' +
            '</div>' +
        '</div>';

    const MODELE_DROITE =
        '<input type="range" id="lp-volume" min="0" max="100" value="70" aria-label="Volume">' +
        '<button id="lp-repeat" aria-label="Répétition">&#128257;</button>' +
        '<button id="lp-ouvrir" aria-label="Ouvrir le lecteur détaillé">&#8599;</button>';

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

    // icônes nettes pour aléatoire et répétition (remplacent les émojis)
    const ICONES = {
        'lp-shuffle': '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/></svg>',
        'lp-repeat': '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>'
    };
    Object.keys(ICONES).forEach((id) => {
        const b = document.getElementById(id);
        if (b) b.innerHTML = ICONES[id];
    });

    // réglages : taille du texte et affichage de la barre
    function appliquer() {
        const r = lire();
        document.documentElement.style.fontSize = r.taille === 'grand' ? '18px' : '';
        lecteur.hidden = r.lecteur === false;
    }

    window.YEReglages = { appliquer };
    appliquer();
})();
