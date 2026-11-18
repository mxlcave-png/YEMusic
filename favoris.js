const CLE_FAVORIS = 'yemusic_favoris';

function lireFavoris() {
    try {
        return JSON.parse(localStorage.getItem(CLE_FAVORIS)) || [];
    } catch (e) {
        return [];
    }
}

function ecrireFavoris(liste) {
    try {
        localStorage.setItem(CLE_FAVORIS, JSON.stringify(liste));
    } catch (e) {}
}

function estFavori(id) {
    return lireFavoris().some((f) => f.id === id);
}

// ajoute ou retire un titre ; renvoie true s'il est maintenant en favori
function basculerFavori(piste) {
    const liste = lireFavoris();
    const i = liste.findIndex((f) => f.id === piste.id);
    if (i >= 0) {
        liste.splice(i, 1);
        ecrireFavoris(liste);
        return false;
    }
    liste.push(piste);
    ecrireFavoris(liste);
    return true;
}

function viderFavoris() {
    try {
        localStorage.removeItem(CLE_FAVORIS);
    } catch (e) {}
}

// crée le bouton cœur d'un titre
function creerCoeur(piste, apresChangement) {
    const b = document.createElement('button');
    b.className = 'coeur';
    b.type = 'button';

    function afficher(actif) {
        b.classList.toggle('actif', actif);
        b.textContent = actif ? '\u2665' : '\u2661';
        b.setAttribute('aria-pressed', actif);
        b.setAttribute('aria-label', actif ? 'Retirer des favoris' : 'Ajouter aux favoris');
    }

    afficher(estFavori(piste.id));

    b.addEventListener('click', (e) => {
        e.stopPropagation(); // le clic sur le cœur ne lance pas le titre
        const actif = basculerFavori(piste);
        afficher(actif);
        if (apresChangement) apresChangement(actif);
    });

    return b;
}