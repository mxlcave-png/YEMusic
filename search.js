// Récupère la barre de recherche
const searchInput = document.getElementById('search');

// Écoute les changements dans la barre
searchInput.addEventListener('input', function() {
    const filter = this.value.toLowerCase(); // texte recherché
    const categories = document.querySelectorAll('div.artistes');

    categories.forEach(category => {
        let hasVisible = false; // savoir si au moins un artiste est visible

        const artists = category.querySelectorAll('.artiste');
        artists.forEach(artist => {
            const name = artist.querySelector('h3').textContent.toLowerCase();
            const description = artist.querySelector('p').textContent.toLowerCase();
            
            if(name.includes(filter) || description.includes(filter)) {
                artist.style.display = 'flex'; // affiche l'artiste
                hasVisible = true;
            } else {
                artist.style.display = 'none'; // cache l'artiste
            }
        });

        // Si aucun artiste visible, cache la catégorie (titre + div)
        if(!hasVisible) {
            const heading = category.previousElementSibling; // h2
            heading.style.display = 'none';
            category.style.display = 'none';
        } else {
            const heading = category.previousElementSibling; // h2
            heading.style.display = 'block';
            category.style.display = 'flex';
        }
    });
});