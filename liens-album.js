(function () {
    function slug(t) {
        return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    const nomArtiste = document.querySelector('.hero-artiste h1').textContent.trim();
    const page = location.pathname.split('/').pop();

    document.querySelectorAll('.album-detail').forEach((carte) => {
        if (carte.parentElement.tagName === 'A') return;
        const titre = carte.querySelector('h3').textContent.trim();
        const img = carte.querySelector('img').getAttribute('src');
        const titreSansAnnee = titre.replace(/\s*\(\d{4}\)\s*$/, '');
        const cle = slug(nomArtiste) + '-' + slug(titreSansAnnee);

        const lien = document.createElement('a');
        lien.className = 'lien-album';
        lien.href = 'album.html?a=' + encodeURIComponent(cle) +
                    '&t=' + encodeURIComponent(titre) +
                    '&n=' + encodeURIComponent(nomArtiste) +
                    '&i=' + encodeURIComponent(img) +
                    '&r=' + encodeURIComponent(page);
        carte.parentNode.insertBefore(lien, carte);
        lien.appendChild(carte);
    });
})();