const CLE_PLAYLISTS = 'yemusic_playlists';

function lirePlaylists() {
    try {
        const l = JSON.parse(localStorage.getItem(CLE_PLAYLISTS));
        return Array.isArray(l) ? l : [];
    } catch (e) {
        return [];
    }
}

function ecrirePlaylists(l) {
    try {
        localStorage.setItem(CLE_PLAYLISTS, JSON.stringify(l));
    } catch (e) {}
}

function trouverPlaylist(id) {
    return lirePlaylists().find((p) => p.id === id) || null;
}

function creerPlaylist(nom) {
    const l = lirePlaylists();
    const pl = {
        id: 'pl' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        nom: nom,
        titres: []
    };
    l.push(pl);
    ecrirePlaylists(l);
    return pl;
}

function supprimerPlaylist(id) {
    ecrirePlaylists(lirePlaylists().filter((p) => p.id !== id));
}

function renommerPlaylist(id, nom) {
    const l = lirePlaylists();
    const p = l.find((x) => x.id === id);
    if (p) {
        p.nom = nom;
        ecrirePlaylists(l);
    }
}

function ajouterAPlaylist(id, piste) {
    const l = lirePlaylists();
    const p = l.find((x) => x.id === id);
    if (!p) return false;
    if (!p.titres.some((t) => t.id === piste.id)) p.titres.push(piste);
    ecrirePlaylists(l);
    return true;
}

function retirerDePlaylist(id, idTitre) {
    const l = lirePlaylists();
    const p = l.find((x) => x.id === id);
    if (!p) return;
    p.titres = p.titres.filter((t) => t.id !== idTitre);
    ecrirePlaylists(l);
}

// ----- menu "Ajouter à une playlist" -----
function fermerMenuPlaylists() {
    const m = document.getElementById('menu-playlists');
    if (m) m.remove();
}

document.addEventListener('click', fermerMenuPlaylists);

function ouvrirMenuPlaylists(bouton, piste) {
    fermerMenuPlaylists();

    const menu = document.createElement('div');
    menu.id = 'menu-playlists';
    menu.className = 'menu-playlists';
    menu.addEventListener('click', (e) => e.stopPropagation());

    const titre = document.createElement('p');
    titre.className = 'menu-titre';
    titre.textContent = 'Ajouter à une playlist';
    menu.append(titre);

    lirePlaylists().forEach((pl) => {
        const dedans = pl.titres.some((t) => t.id === piste.id);
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'menu-item';
        item.textContent = (dedans ? '\u2713 ' : '') + pl.nom;
        item.addEventListener('click', () => {
            if (dedans) retirerDePlaylist(pl.id, piste.id);
            else ajouterAPlaylist(pl.id, piste);
            fermerMenuPlaylists();
        });
        menu.append(item);
    });

    const nouvelle = document.createElement('button');
    nouvelle.type = 'button';
    nouvelle.className = 'menu-item menu-nouvelle';
    nouvelle.textContent = '+ Nouvelle playlist';
    nouvelle.addEventListener('click', () => {
        const nom = prompt('Nom de la playlist ?');
        if (nom && nom.trim()) {
            const pl = creerPlaylist(nom.trim());
            ajouterAPlaylist(pl.id, piste);
        }
        fermerMenuPlaylists();
    });
    menu.append(nouvelle);

    document.body.append(menu);

    const r = bouton.getBoundingClientRect();
    const largeur = 230;
    const gauche = Math.min(r.left + window.scrollX, window.scrollX + document.documentElement.clientWidth - largeur - 10);
    menu.style.top = (r.bottom + window.scrollY + 6) + 'px';
    menu.style.left = Math.max(10, gauche) + 'px';
}

// crée le bouton "+" d'un titre
function creerBoutonAjout(piste) {
    const b = document.createElement('button');
    b.className = 'btn-ajout';
    b.type = 'button';
    b.textContent = '+';
    b.setAttribute('aria-label', 'Ajouter à une playlist');
    b.addEventListener('click', (e) => {
        e.stopPropagation(); // le clic sur + ne lance pas le titre
        ouvrirMenuPlaylists(b, piste);
    });
    return b;
}