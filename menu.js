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

    // réglages : taille du texte et affichage de la barre
    function appliquer() {
        const r = lire();
        document.documentElement.style.fontSize = r.taille === 'grand' ? '18px' : '';
        lecteur.hidden = r.lecteur === false;
    }

    window.YEReglages = { appliquer };
    appliquer();
})();
