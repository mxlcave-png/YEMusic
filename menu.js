(function () {
    const CLE = 'yemusic_reglages';

    function lire() {
        try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
    }

    // logo vectoriel fixe, rouge
    document.querySelectorAll('header img.logo').forEach((img) => {
        img.src = 'images/logo rond.png';
    });

    // entrée active du menu
    const page = location.pathname.split('/').pop() || 'index2.html';
    document.querySelectorAll('header nav a').forEach((a) => {
        if (a.getAttribute('href') === page) a.classList.add('actif');
    });

    // taille du texte et lecteur, selon les réglages
    function appliquer() {
        const r = lire();
        document.documentElement.style.fontSize = r.taille === 'grand' ? '18px' : '';
        const lecteur = document.querySelector('.lecteur-perso');
        if (lecteur) lecteur.hidden = r.lecteur === false;
    }

    window.YEReglages = { appliquer };
    appliquer();
})();
