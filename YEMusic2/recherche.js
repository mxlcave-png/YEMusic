// artistes du site : nom, page, photo, titres EXACTS des cartes albums
const ARTISTES = [
    { nom: "Bryson Tiller", page: "artiste-bryson-tiller.html", image: "images/bryson tyler.jpg",
      albums: ["Trapsoul", "True To Self", "Anniversary (2020)", "Bryson Tiller (2024)", "Solace & The Vices (2025)"] },
    { nom: "PartyNextDoor", page: "artiste-partynextdoor.html", image: "images/PartyNextDoor.jpg",
      albums: ["PartyNextDoor 3", "PartyNextDoor 4", "PartyNextDoor Two (2014)", "Partymobile (2020)", "Some Sexy Songs 4 U (2025, avec Drake)"] },
    { nom: "Chris Brown", page: "artiste-chris-brown.html", image: "images/chris brown.jpg",
      albums: ["F.A.M.E.", "Royalty", "Exclusive (2007)", "Graffiti (2009)", "Fortune (2012)", "X (2014)", "Heartbreak on a Full Moon (2017)", "Indigo (2019)", "Breezy (2022)", "11:11 (2023)", "Brown (2026)"] },
    { nom: "Sheltoh", page: "artiste-sheltoh.html", image: "images/sheltoh.jpg",
      albums: ["No Need for Tears"] },
    { nom: "Snoop Dogg", page: "artiste-snoop-dogg.html", image: "images/snoop dogg.jpg",
      albums: ["Gangsta Grillz", "Tha Last Meal", "Doggystyle (1993)", "Tha Doggfather (1996)", "Da Game Is to Be Sold, Not to Be Told (1998)", "No Limit Top Dogg (1999)", "Paid tha Cost to Be da Bo$$ (2002)", "Rhythm & Gangsta: The Masterpiece (2004)", "Tha Blue Carpet Treatment (2006)", "Ego Trippin' (2008)", "Malice n Wonderland (2009)", "Doggumentary (2011)", "Reincarnated (2013)", "Bush (2015)", "Coolaid (2016)", "Neva Left (2017)", "Bible of Love (2018)", "I Wanna Thank Me (2019)", "From tha Streets 2 tha Suites (2021)", "BODR (2022)", "Missionary (2024, avec Dr. Dre)", "Iz It a Crime? (2025)", "10 Til' Midnight (2026)"] },
    { nom: "Kendrick Lamar", page: "artiste-kendrick-lamar.html", image: "images/kendrick lamar.jpg",
      albums: ["Good Kid, M.A.A.D City", "DAMN.", "Section.80 (2011)", "To Pimp a Butterfly (2015)", "Mr. Morale & the Big Steppers (2022)", "GNX (2024)"] },
    { nom: "Drake", page: "artiste-drake.html", image: "images/drake.jpg",
      albums: ["Take Care", "Scorpion", "Thank Me Later (2010)", "Nothing Was the Same (2013)", "Views (2016)", "Certified Lover Boy (2021)", "Honestly, Nevermind (2022)", "For All the Dogs (2023)", "Some Sexy Songs 4 U (2025, avec PartyNextDoor)", "Iceman (2026)", "Habibti (2026)", "Maid of Honour (2026)"] },
    { nom: "Travis Scott", page: "artiste-travis-scott.html", image: "images/travis scott.jpg",
      albums: ["Utopia", "Astroworld", "Rodeo (2015)", "Birds in the Trap Sing McKnight (2016)", "JackBoys 2 (2025, compilation)"] },
    { nom: "Niska", page: "artiste-niska.html", image: "images/niska.jpg",
      albums: ["Commando", "Mr Sal", "Zifukoro (2016)"] },
    { nom: "Ninho", page: "artiste-ninho.html", image: "images/ninho.jpg",
      albums: ["M.I.L.S 3", "Destin", "Comme prevu (2017)", "Jefe (2021)", "NI (2023)", "GOAT (2024, avec Niska)", "M.I.L.S 4 (2026)"] },
    { nom: "Leto", page: "artiste-leto.html", image: "images/leto.jpg",
      albums: ["100 Visages", "17%", "Jusqu'aux Etoiles (2022, avec Guy2Bezbar)", "Capitaine fait de l'art (2024)", "LIFE (2025)"] },
    { nom: "Damso", page: "artiste-damso.html", image: "images/damso.jpg",
      albums: ["Batterie Faible", "QALF", "Ipseite (2017)", "Lithopedion (2018)", "J'ai Menti. (2024)", "BEYAH (2025)"] }
];
// ajoute les albums de albums-extra.js (mixtapes, collaborations...)
ARTISTES.forEach((a) => {
    ((window.ALBUMS_EXTRA || {})[a.nom] || []).forEach((e) => {
        if (!a.albums.includes(e.t)) a.albums.push(e.t);
    });
});

function normaliser(t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// même règle que dans liens-albums.js
function slug(t) {
    return normaliser(t).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function lirePochettes() {
    try {
        return JSON.parse(localStorage.getItem('yemusic_pochettes')) || {};
    } catch (e) {
        return {};
    }
}

// tous les mots doivent être trouvés (dans le titre ou l'artiste),
// et au moins un dans le titre : "drake" seul ne ressort pas tous ses titres
function correspond(mots, titre, artiste) {
    const t = normaliser(titre);
    const tout = t + ' ' + normaliser(artiste);
    return mots.every((m) => tout.includes(m)) && mots.some((m) => t.includes(m));
}

function rechercher(requete) {
    const mots = normaliser(requete).split(/\s+/).filter(Boolean);
    const res = { artistes: [], albums: [], titres: [] };
    if (!mots.length) return res;

    const donnees = window.ALBUMS || {};
    const pochettes = lirePochettes();

    ARTISTES.forEach((a) => {
        if (mots.every((m) => normaliser(a.nom).includes(m))) res.artistes.push(a);

        a.albums.forEach((titreCarte) => {
            const cle = slug(a.nom) + '-' + slug(titreCarte.replace(/\s*\([^)]*\)\s*$/, ''));
            const m = titreCarte.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
            const nomAlbum = m ? m[1] : titreCarte;
            const annee = (m && (m[2].match(/\d{4}/) || [])[0]) || '';
            const d = donnees[cle];
            const pochette = (d && d.pochette) || pochettes[cle] || '';

            if (correspond(mots, titreCarte, a.nom)) {
                res.albums.push({
                    cle: cle, titreCarte: titreCarte, nom: nomAlbum, annee: annee || (d && d.annee) || '',
                    artiste: a.nom, page: a.page, pochette: pochette,
                    nbTitres: d && d.titres ? d.titres.length : 0
                });
            }

            if (d && d.titres) {
                d.titres.forEach((p) => {
                    if (!correspond(mots, p[0], a.nom + ' ' + nomAlbum)) return;
                    const trouve = String(p[1] || '').match(/[A-Za-z0-9]{22}/);
                    res.titres.push({
                        id: trouve ? trouve[0] : '',
                        titre: p[0], artiste: a.nom, album: nomAlbum,
                        pochette: pochette, duree: p[2] || '',
                        lien: lienAlbum(cle, titreCarte, a.nom, a.page, pochette)
                    });
                });
            }
        });
    });
    return res;
}

function lienAlbum(cle, titreCarte, artiste, page, pochette) {
    return 'album.html?a=' + encodeURIComponent(cle) +
           '&t=' + encodeURIComponent(titreCarte) +
           '&n=' + encodeURIComponent(artiste) +
           (pochette ? '&i=' + encodeURIComponent(pochette) : '') +
           '&r=' + encodeURIComponent(page);
}