(function () {
    function slug(t) {
        return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    // enlève la parenthèse finale : "Anniversary (2020)" -> "Anniversary"
    function sansParentheses(t) {
        return t.replace(/\s*\([^)]*\)\s*$/, '');
    }

    // pour comparer deux titres sans tenir compte des accents ni de la ponctuation
    function norm(t) {
        return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '');
    }

    // années des albums dont le titre de carte n'a pas d'année (modifiable)
    const ANNEES = {
        "trapsoul": 2015,
        "true-to-self": 2017,
        "partynextdoor-3": 2016,
        "partynextdoor-4": 2024,
        "f-a-m-e": 2011,
        "royalty": 2015,
        "tha-last-meal": 2000,
        "good-kid-m-a-a-d-city": 2012,
        "damn": 2017,
        "take-care": 2011,
        "scorpion": 2018,
        "utopia": 2023,
        "astroworld": 2018,
        "commando": 2017,
        "mr-sal": 2019,
        "m-i-l-s-3": 2020,
        "destin": 2019,
        "100-visages": 2020,
        "batterie-faible": 2016,
        "qalf": 2020
    };

    function charger(src, suite) {
        const s = document.createElement('script');
        s.src = src;
        s.onload = suite;
        s.onerror = suite;
        document.body.appendChild(s);
    }

    // ajoute les cartes de albums-extra.js qui n'existent pas encore sur la page
    function ajouterExtras(nomArtiste) {
        const conteneur = document.querySelector('.discographie');
        if (!conteneur) return;
        const extras = (window.ALBUMS_EXTRA || {})[nomArtiste] || [];
        const presents = new Set(
            Array.from(conteneur.querySelectorAll('.album-detail h3'))
                 .map((h) => norm(h.textContent))
        );

        extras.forEach((e) => {
            if (presents.has(norm(e.t))) return;
            presents.add(norm(e.t));

            const carte = document.createElement('div');
            carte.className = 'album-detail';

            const img = document.createElement('img');
            img.src = e.img || ('https://placehold.co/300x300/1e1e1e/ffffff?text=' + encodeURIComponent(e.t));
            img.alt = e.t;

            const h3 = document.createElement('h3');
            h3.textContent = e.t;

            const p = document.createElement('p');
            p.textContent = e.type || '';

            carte.append(img, h3, p);
            conteneur.appendChild(carte);
        });
    }

    function demarrer() {
        const donnees = window.ALBUMS || {};
        const nomArtiste = document.querySelector('.hero-artiste h1').textContent.trim();
        const page = location.pathname.split('/').pop();

        ajouterExtras(nomArtiste);

        let pochettes = {};
        try {
            pochettes = JSON.parse(localStorage.getItem('yemusic_pochettes')) || {};
        } catch (e) {}

        const liens = [];

        document.querySelectorAll('.album-detail').forEach((carte) => {
            if (carte.parentElement.tagName === 'A') {
                carte.parentElement.replaceWith(carte);
            }
            const titre = carte.querySelector('h3').textContent.trim();
            const img = carte.querySelector('img').getAttribute('src');
            const nomAlbum = sansParentheses(titre);
            const cle = slug(nomArtiste) + '-' + slug(nomAlbum);
            const d = donnees[cle];

            pochettes[cle] = img;

            // année : dans le titre de la carte, sinon dans la table, sinon dans le fichier de données
            const dansTitre = titre.match(/\((\d{4})/);
            const annee = dansTitre ? parseInt(dansTitre[1], 10)
                        : (ANNEES[slug(nomAlbum)] || (d && parseInt(d.annee, 10)) || 0);

            // badge : l'album a des titres avec un lien Spotify
            const ecoutable = d && d.titres &&
                d.titres.some((p) => /[A-Za-z0-9]{22}/.test(String(p[1] || '')));
            if (ecoutable && !carte.querySelector('.badge-ecoute')) {
                const b = document.createElement('span');
                b.className = 'badge-ecoute';
                b.textContent = '\u25B6 \u00C9coutable';
                carte.append(b);
            }

            const lien = document.createElement('a');
            lien.className = 'lien-album';
            lien.href = 'album.html?a=' + encodeURIComponent(cle) +
                        '&t=' + encodeURIComponent(titre) +
                        '&n=' + encodeURIComponent(nomArtiste) +
                        '&i=' + encodeURIComponent(img) +
                        '&r=' + encodeURIComponent(page);
            carte.parentNode.insertBefore(lien, carte);
            lien.appendChild(carte);

            liens.push({ el: lien, annee: annee });
        });

        try {
            localStorage.setItem('yemusic_pochettes', JSON.stringify(pochettes));
        } catch (e) {}

        // tri : plus récent d'abord, les albums sans année restent à la fin
        const conteneur = document.querySelector('.discographie');
        if (conteneur) {
            liens.sort((a, b) => {
                if (!a.annee && !b.annee) return 0;
                if (!a.annee) return 1;
                if (!b.annee) return -1;
                return b.annee - a.annee;
            });
            liens.forEach((l) => conteneur.appendChild(l.el));
        }
    }

    // charge les données des albums, puis les albums en plus, puis démarre
    function etape2() {
        demarrer();
    }

    if (window.ALBUMS) etape2();
    else charger('albums-data.js', etape2);
})();