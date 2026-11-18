(function () {
    const DUREE = 400; // doit correspondre au 0.25s du CSS
    let enCours = false;

    function aller(url) {
        if (enCours) return;
        enCours = true;
        document.body.classList.add('quitte');
        setTimeout(() => { location.href = url; }, DUREE);
    }

    // utilisable aussi depuis d'autres scripts : allerVers('page.html')
    window.allerVers = aller;

    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const a = e.target.closest('a');
        if (!a || !a.href) return;
        if (a.target && a.target !== '_self') return;
        if (a.hasAttribute('download')) return;

        const url = new URL(a.href, location.href);
        // liens externes, mailto, etc. : on ne touche à rien
        if (url.protocol !== location.protocol || url.host !== location.host) return;
        // lien vers un endroit de la même page : on ne touche à rien
        if (url.pathname === location.pathname && url.search === location.search) return;

        e.preventDefault();
        aller(a.href);
    });

    // bouton "retour" du navigateur : la page revient parfois figée en fondu
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            enCours = false;
            document.body.classList.remove('quitte');
        }
    });
})();