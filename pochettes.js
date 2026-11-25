(function () {
    const CLE = 'yemusic_pochettes';

    function lireCovers() {
        try { return JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { return {}; }
    }
    function ecrireCovers(o) {
        try { localStorage.setItem(CLE, JSON.stringify(o)); }
        catch (e) { alert("Cette image est trop lourde pour être enregistrée."); }
    }
    function lirePlaylists() {
        try { const l = JSON.parse(localStorage.getItem('yemusic_playlists')); return Array.isArray(l) ? l : []; }
        catch (e) { return []; }
    }
    function lireFavoris() {
        try { return JSON.parse(localStorage.getItem('yemusic_favoris')) || []; } catch (e) { return []; }
    }
    // pochette personnalisée si elle existe, sinon celle du premier titre ajouté
    function pochettePlaylist(p) {
        const perso = lireCovers()['pl:' + p.id];
        if (perso) return perso;
        const t = (p.titres || []).find((x) => x.pochette);
        return t ? t.pochette : '';
    }
    function pochetteFavoris() {
        const perso = lireCovers().favoris;
        if (perso) return perso;
        const f = lireFavoris().find((x) => x.pochette);
        return f ? f.pochette : '';
    }

    // ----- accueil : bloc « Vos playlists » -----
    const liste = document.getElementById('liste-playlists');
    if (liste) {
        const ligne = (href, src, nom, sous, icone) => {
            const a = document.createElement('a');
            a.className = 'ligne-playlist';
            a.href = href;
            if (src) {
                const img = document.createElement('img');
                img.src = src; img.alt = '';
                a.append(img);
            } else {
                const c = document.createElement('span');
                c.className = 'pochette-coeur';
                c.textContent = icone || '';
                a.append(c);
            }
            const d = document.createElement('div');
            const s1 = document.createElement('strong'); s1.textContent = nom;
            const s2 = document.createElement('small'); s2.textContent = sous;
            d.append(s1, s2);
            a.append(d);
            return a;
        };
        const fav = lireFavoris();
        liste.append(ligne('favoris.html', pochetteFavoris(), 'Favoris', fav.length + ' titres', '\u2665'));
        lirePlaylists().slice(0, 4).forEach((p) => {
            liste.append(ligne('playlists.html?p=' + encodeURIComponent(p.id), pochettePlaylist(p),
                p.nom, (p.titres || []).length + ' titres'));
        });
    }

    // ----- page favoris ou playlist : changer la pochette -----
    const params = new URLSearchParams(location.search);
    let cle = null;
    if (location.pathname.endsWith('favoris.html')) cle = 'favoris';
    else if (params.get('p')) cle = 'pl:' + params.get('p');
    const titre = document.getElementById('pl-nom') || document.querySelector('.titre-page');
    if (cle && titre) {
        const barre = document.createElement('div');
        barre.className = 'barre-pochette';
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.textContent = 'Changer la pochette';
        const fichier = document.createElement('input');
        fichier.type = 'file';
        fichier.accept = 'image/*';
        fichier.hidden = true;
        bouton.addEventListener('click', () => fichier.click());
        fichier.addEventListener('change', () => {
            const f = fichier.files[0];
            if (!f) return;
            const lecteur = new FileReader();
            lecteur.onload = () => {
                const img = new Image();
                img.onload = () => {
                    const s = Math.min(1, 400 / Math.max(img.width, img.height));
                    const c = document.createElement('canvas');
                    c.width = Math.round(img.width * s);
                    c.height = Math.round(img.height * s);
                    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
                    const o = lireCovers();
                    o[cle] = c.toDataURL('image/jpeg', 0.85);
                    ecrireCovers(o);
                    location.reload();
                };
                img.src = lecteur.result;
            };
            lecteur.readAsDataURL(f);
        });
        barre.append(bouton, fichier);
        titre.after(barre);
    }

    window.YEPochettes = { pochettePlaylist, pochetteFavoris };
})();
