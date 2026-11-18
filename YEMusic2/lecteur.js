window.initLecteur = function (ol, uriDepart) {
    const $ = (id) => document.getElementById(id);

    window.onSpotifyIframeApiReady = (IFrameAPI) => {
        if (!uriDepart) return;
        const options = { uri: uriDepart, width: '100%', height: 152 };

        IFrameAPI.createController($('embed-spotify'), options, (controller) => {
            const titres     = Array.from(ol.children);
            const btnPlay    = $('lp-play');
            const btnPrev    = $('lp-prev');
            const btnNext    = $('lp-next');
            const btnShuffle = $('lp-shuffle');
            const barre      = $('lp-barre');
            const posEl      = $('lp-pos');
            const durEl      = $('lp-dur');
            const nomEl      = $('lp-titre');

            const jouables   = [];
            const historique = [];
            let courant = -1;
            let fini = false;
            let aleatoire = false;
            let positionActuelle = 0;
            let dernierLancement = 0;

            // dernier titre écouté (lu une seule fois, avant d'être remplacé)
            let dernierId = '';
            try {
                const d = JSON.parse(localStorage.getItem('yemusic_dernier'));
                if (d && d.id) dernierId = d.id;
            } catch (e) {}

            function format(ms) {
                const s = Math.floor(ms / 1000);
                return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
            }

            function lancer(li, sansHistorique) {
                courant = jouables.indexOf(li);
                fini = false;
                dernierLancement = Date.now();
                positionActuelle = 0;
                if (!sansHistorique) historique.push(li);
                controller.loadUri('spotify:track:' + li.dataset.id);
                controller.play();
                titres.forEach((t) => t.classList.remove('active', 'dernier'));
                li.classList.add('active');
                nomEl.textContent = li.querySelector('.titre').textContent;
                // pages où les titres viennent d'albums différents
                if (li.dataset.artiste) $('lp-artiste').textContent = li.dataset.artiste;
                if (li.dataset.pochette) $('lp-pochette').src = li.dataset.pochette;

                // on retient ce titre pour "Reprendre l'écoute" sur l'accueil
                try {
                    localStorage.setItem('yemusic_dernier', JSON.stringify({
                        id: li.dataset.id,
                        titre: li.querySelector('.titre').textContent,
                        artiste: li.dataset.artiste || '',
                        album: li.dataset.album || '',
                        pochette: li.dataset.pochette || '',
                        lien: location.pathname.split('/').pop() + location.search
                    }));
                } catch (e) {}
            }

            function auHasard() {
                if (jouables.length === 1) return 0;
                let i;
                do { i = Math.floor(Math.random() * jouables.length); } while (i === courant);
                return i;
            }

            function suivant() {
                if (!jouables.length) return;
                if (aleatoire) {
                    lancer(jouables[auHasard()]);
                } else if (courant < jouables.length - 1) {
                    lancer(jouables[courant + 1]);
                }
            }

            function precedent() {
                if (courant === -1) return;
                if (positionActuelle > 3000) {
                    controller.seek(0);
                    return;
                }
                if (aleatoire && historique.length > 1) {
                    historique.pop();
                    lancer(historique[historique.length - 1], true);
                } else if (courant > 0) {
                    lancer(jouables[courant - 1]);
                }
            }

            titres.forEach((li) => {
                if (!li.dataset.id) return;
                li.classList.add('cliquable');
                if (dernierId && li.dataset.id === dernierId) li.classList.add('dernier');
                jouables.push(li);
                li.addEventListener('click', () => lancer(li));
            });

            controller.addListener('playback_update', (e) => {
                const { position, duration, isPaused } = e.data;
                btnPlay.innerHTML = isPaused ? '&#9654;' : '&#10074;&#10074;';
                if (Date.now() - dernierLancement < 2000) return;

                positionActuelle = position;
                if (duration) {
                    barre.max = duration;
                    barre.value = position;
                    posEl.textContent = format(position);
                    durEl.textContent = format(duration);
                    if (!fini && courant !== -1 && position >= duration - 1000) {
                        fini = true;
                        suivant();
                    }
                }
            });

            btnPlay.addEventListener('click', () => {
                if (courant === -1) {
                    if (jouables.length) lancer(jouables[aleatoire ? auHasard() : 0]);
                    else controller.togglePlay();
                } else {
                    controller.togglePlay();
                }
            });
            btnNext.addEventListener('click', suivant);
            btnPrev.addEventListener('click', precedent);

            btnShuffle.addEventListener('click', () => {
                aleatoire = !aleatoire;
                btnShuffle.classList.toggle('actif', aleatoire);
                btnShuffle.setAttribute('aria-pressed', aleatoire);
            });

            barre.addEventListener('input', () => controller.seek(barre.value / 1000));
        });
    };
};