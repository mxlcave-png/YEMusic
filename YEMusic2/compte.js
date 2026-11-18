// compte.js : compte en ligne YEMusic (pseudo + code) et synchronisation des favoris, playlists et progression
(function () {
    const SUPABASE_URL = 'https://jjxwhoktccsrhjvtdlkx.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeHdob2t0Y2NzcmhqdnRkbGt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3NDA1ODYsImV4cCI6MjExMDMxNjU4Nn0.XpRXR4SfYcqQooENDwVE_rFwuSuRM-8m5rgYi8hxFn0';
    const DOMAINE = '@yemusic.fr';
    const CLES = { favoris: 'yemusic_favoris', playlists: 'yemusic_playlists', dernier: 'yemusic_dernier' };
    const TOUTES_CLES = Object.values(CLES);
    const PSEUDO_ERREUR = 'Le pseudo doit contenir au moins 3 lettres ou chiffres (sans accents ni espaces).';

    let client = null;
    let user = null;

    // ----- utilitaires -----
    function normaliser(pseudo) {
        return pseudo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    }
    function emailPour(pseudo) { return normaliser(pseudo) + DOMAINE; }
    function lireLocal(cle, defaut) {
        try {
            const v = localStorage.getItem(cle);
            return v === null ? defaut : JSON.parse(v);
        } catch (e) { return defaut; }
    }
    function estVide(v) {
        return Array.isArray(v) ? v.length === 0 : Object.keys(v || {}).length === 0;
    }
    function lireTout() {
        return TOUTES_CLES.map((c) => localStorage.getItem(c)).join('|');
    }
    function traduire(message) {
        if (!message) return 'Une erreur est survenue.';
        if (/already registered|already been registered/i.test(message)) return 'Ce pseudo est déjà utilisé. Essaie de te connecter.';
        if (/Invalid login credentials/i.test(message)) return 'Pseudo ou code incorrect.';
        if (/at least/i.test(message)) return 'Le code doit contenir au moins 6 caractères.';
        if (/email/i.test(message)) return PSEUDO_ERREUR;
        return 'Erreur : ' + message;
    }

    // Méthodes d'origine du stockage, gardées à part pour éviter les boucles
    const setItemOrig = Storage.prototype.setItem;
    const removeItemOrig = Storage.prototype.removeItem;

    // Quand une page change favoris, playlists ou progression, on envoie tout en ligne
    Storage.prototype.setItem = function (cle, valeur) {
        setItemOrig.call(this, cle, valeur);
        if (this === localStorage && TOUTES_CLES.includes(cle)) sauvegarder();
    };
    Storage.prototype.removeItem = function (cle) {
        removeItemOrig.call(this, cle);
        if (this === localStorage && TOUTES_CLES.includes(cle)) sauvegarder();
    };

    // ----- synchronisation -----
    // Chaque appareil garde la date de sa dernière modification (yemusic_maj).
    // La version la plus récente gagne : une vieille copie ne peut plus effacer des playlists récentes.
    const CLE_MAJ = 'yemusic_maj';

    function temps(date) {
        const t = date ? Date.parse(date) : 0;
        return isNaN(t) ? 0 : t;
    }

    async function sauvegarder() {
        if (!user || !client) return;
        const maintenant = new Date().toISOString();
        setItemOrig.call(localStorage, CLE_MAJ, maintenant);
        const { error } = await client.from('donnees_utilisateur').update({
            favoris: lireLocal(CLES.favoris, []),
            playlists: lireLocal(CLES.playlists, []),
            progression: lireLocal(CLES.dernier, {}),
            mis_a_jour: maintenant
        }).eq('user_id', user.id);
        if (error) console.warn('Sauvegarde en ligne impossible :', error.message);
    }

    // Copie les données du compte sur l'appareil ; renvoie true si quelque chose a changé
    function appliquerServeur(data) {
        const avant = lireTout();
        setItemOrig.call(localStorage, CLES.favoris, JSON.stringify(data.favoris || []));
        setItemOrig.call(localStorage, CLES.playlists, JSON.stringify(data.playlists || []));
        if (!estVide(data.progression)) setItemOrig.call(localStorage, CLES.dernier, JSON.stringify(data.progression));
        else removeItemOrig.call(localStorage, CLES.dernier);
        if (data.mis_a_jour) setItemOrig.call(localStorage, CLE_MAJ, data.mis_a_jour);
        return avant !== lireTout();
    }

    async function synchroniser() {
        if (!user || !client) return;
        const { data, error } = await client.from('donnees_utilisateur')
            .select('*').eq('user_id', user.id).maybeSingle();
        if (error || !data) return;

        const majLocale = localStorage.getItem(CLE_MAJ);
        const serveurVide = estVide(data.favoris) && estVide(data.playlists) && estVide(data.progression);
        const localVide = estVide(lireLocal(CLES.favoris, [])) && estVide(lireLocal(CLES.playlists, []))
            && estVide(lireLocal(CLES.dernier, {}));

        // L'appareil a les modifications les plus récentes : il envoie vers le compte
        let doitEnvoyer;
        if (!majLocale) doitEnvoyer = !localVide && serveurVide;   // premier appareil avec des données
        else doitEnvoyer = temps(majLocale) > temps(data.mis_a_jour);
        if (doitEnvoyer) { await sauvegarder(); return; }

        // Le compte a des modifications plus récentes : on recopie sur l'appareil
        if (!majLocale || temps(data.mis_a_jour) > temps(majLocale)) {
            if (appliquerServeur(data)) location.reload();
        }
    }

    // ----- affichage -----
    function ajouterBouton() {
        const header = document.querySelector('header');
        if (!header || document.getElementById('compte-btn')) return;
        const a = document.createElement('a');
        a.id = 'compte-btn';
        a.className = 'compte-btn';
        a.href = 'compte.html';
        a.textContent = '👤';
        header.appendChild(a);
    }

    function rafraichir() {
        const btn = document.getElementById('compte-btn');
        const pseudo = user && user.user_metadata && user.user_metadata.pseudo;
        if (btn) {
            btn.textContent = pseudo ? pseudo.charAt(0).toUpperCase() : '👤';
            btn.title = pseudo ? 'Mon compte (' + pseudo + ')' : 'Mon compte';
        }
        document.dispatchEvent(new CustomEvent('compte:change', { detail: { user: user } }));
    }

    // ----- actions du compte -----
    async function creer(pseudo, code) {
        if (!client) return { erreur: 'Le service se charge, réessaie dans un instant.' };
        const p = pseudo.trim();
        if (normaliser(p).length < 3) return { erreur: PSEUDO_ERREUR };

        const { error: errCreation } = await client.auth.signUp({
            email: emailPour(p), password: code, options: { data: { pseudo: p } }
        });
        if (errCreation) return { erreur: traduire(errCreation.message) };

        const { data: sessionData } = await client.auth.getSession();
        if (!sessionData.session) {
            const { error } = await client.auth.signInWithPassword({ email: emailPour(p), password: code });
            if (error) return { erreur: traduire(error.message) };
        }

        const { data: { user: nouveau } } = await client.auth.getUser();
        const { error: errLigne } = await client.from('donnees_utilisateur').insert({
            user_id: nouveau.id,
            pseudo: p,
            favoris: lireLocal(CLES.favoris, []),
            playlists: lireLocal(CLES.playlists, []),
            progression: lireLocal(CLES.dernier, {})
        });
        if (errLigne) {
            await client.auth.signOut();
            return { erreur: 'Impossible de créer ce compte. Essaie un autre pseudo.' };
        }
        user = nouveau;
        rafraichir();
        return { ok: true };
    }

    async function connexion(pseudo, code) {
        if (!client) return { erreur: 'Le service se charge, réessaie dans un instant.' };
        const { data, error } = await client.auth.signInWithPassword({ email: emailPour(pseudo), password: code });
        if (error) return { erreur: traduire(error.message) };
        user = data.user;
        await synchroniser();
        rafraichir();
        return { ok: true };
    }

    async function deconnexion() {
        if (client) await client.auth.signOut();
        user = null;
        TOUTES_CLES.concat(CLE_MAJ).forEach((c) => removeItemOrig.call(localStorage, c));
        rafraichir();
    }

    window.YECompte = {
        creer: creer,
        connexion: connexion,
        deconnexion: deconnexion,
        utilisateur: () => user
    };

    // ----- démarrage -----
    async function demarrer() {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data } = await client.auth.getSession();
        user = data.session ? data.session.user : null;
        if (user) await synchroniser();
        rafraichir();
    }

    function chargerSupabase(suite) {
        if (window.supabase) return suite();
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
        s.onload = suite;
        s.onerror = () => console.warn('Impossible de charger Supabase (connexion internet ?)');
        document.head.appendChild(s);
    }

    ajouterBouton();
    chargerSupabase(demarrer);
})();
