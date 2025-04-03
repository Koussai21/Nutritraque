// Fonctions pures pour les calculs
const calculerProgression = (actuel, objectif) => Math.min((actuel / objectif) * 100, 100);

const additionnerNutriments = (repas) => repas.reduce((accumulateur, repas) => ({
    calories: accumulateur.calories + repas.calories,
    proteines: accumulateur.proteines + repas.proteines,
    lipides: accumulateur.lipides + repas.lipides,
    glucides: accumulateur.glucides + repas.glucides
}), { calories: 0, proteines: 0, lipides: 0, glucides: 0 });

const formaterValeurNutriment = (valeur, unite) => `${Math.round(valeur)} ${unite}`;

const mettreAJourTexteProgression = (idElement, actuel, objectif, unite) => {
    const element = document.getElementById(idElement);
    if (element) {
        element.textContent = `${formaterValeurNutriment(actuel, unite)} / ${formaterValeurNutriment(objectif, unite)}`;
    }
};

const recupererObjectifs = async () => {
    try {
        const reponse = await fetch('http://localhost:3000/goals');
        return await reponse.json();
    } catch (erreur) {
        console.error('Erreur lors de la récupération des objectifs:', erreur);
        return null;
    }
};

const recupererRepas = async () => {
    try {
        const reponse = await fetch('http://localhost:3000/meals');
        return await reponse.json();
    } catch (erreur) {
        console.error('Erreur lors de la récupération des repas:', erreur);
        return null;
    }
};

const sauvegarderObjectif = async (donneesObjectif) => {
    try {
        const objectifs = await recupererObjectifs();
        const methode = objectifs && objectifs.length > 0 ? 'PUT' : 'POST';
        const url = objectifs && objectifs.length > 0 
            ? `http://localhost:3000/goals/${objectifs[0]._id}`
            : 'http://localhost:3000/goals';

        const reponse = await fetch(url, {
            method: methode,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(donneesObjectif),
        });
        return await reponse.json();
    } catch (erreur) {
        console.error('Erreur lors de la sauvegarde de l\'objectif:', erreur);
        return null;
    }
};

const sauvegarderRepas = async (donneesRepas) => {
    try {
        const reponse = await fetch('http://localhost:3000/meals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(donneesRepas),
        });
        return await reponse.json();
    } catch (erreur) {
        console.error('Erreur lors de la sauvegarde du repas:', erreur);
        return null;
    }
};

const formaterDate = (chaineDate) => {
    const date = new Date(chaineDate);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const afficherObjectifsActuels = (objectifs) => {
    const listeObjectifs = document.getElementById('goalsList');
    if (!listeObjectifs || !objectifs || objectifs.length === 0) return;

    const objectifActuel = objectifs[0];
    listeObjectifs.innerHTML = `
        <div class="goal-item">
            <span>Calories:</span>
            <span>${objectifActuel.calories} kcal</span>
        </div>
        <div class="goal-item">
            <span>Protéines:</span>
            <span>${objectifActuel.proteines} g</span>
        </div>
        <div class="goal-item">
            <span>Lipides:</span>
            <span>${objectifActuel.lipides} g</span>
        </div>
        <div class="goal-item">
            <span>Glucides:</span>
            <span>${objectifActuel.glucides} g</span>
        </div>
    `;
};

const basculerFormulaireObjectifs = (afficher) => {
    const objectifsActuels = document.getElementById('currentGoals');
    const formulaireObjectifs = document.getElementById('goalsForm');
    if (objectifsActuels && formulaireObjectifs) {
        objectifsActuels.style.display = afficher ? 'none' : 'block';
        formulaireObjectifs.style.display = afficher ? 'block' : 'none';
    }
};

const remplirFormulaireObjectifs = (objectifs) => {
    if (!objectifs || objectifs.length === 0) return;
    
    const objectifActuel = objectifs[0];
    document.getElementById('calories').value = objectifActuel.calories;
    document.getElementById('proteines').value = objectifActuel.proteines;
    document.getElementById('lipides').value = objectifActuel.lipides;
    document.getElementById('glucides').value = objectifActuel.glucides;
};

const gererFormulaireObjectifs = async (evenement) => {
    evenement.preventDefault();
    const donneesFormulaire = {
        calories: Number(document.getElementById('calories').value),
        proteines: Number(document.getElementById('proteines').value),
        lipides: Number(document.getElementById('lipides').value),
        glucides: Number(document.getElementById('glucides').value)
    };
    
    await sauvegarderObjectif(donneesFormulaire);
    basculerFormulaireObjectifs(false);
    const objectifs = await recupererObjectifs();
    afficherObjectifsActuels(objectifs);
    alert('Objectifs enregistrés avec succès !');
};

const gererFormulaireRepas = async (evenement) => {
    evenement.preventDefault();
    const donneesFormulaire = {
        plat: document.getElementById('nomPlat').value,
        calories: Number(document.getElementById('calories').value),
        proteines: Number(document.getElementById('proteines').value),
        lipides: Number(document.getElementById('lipides').value),
        glucides: Number(document.getElementById('glucides').value)
    };
    
    await sauvegarderRepas(donneesFormulaire);
    evenement.target.reset();
    mettreAJourListeRepas();
    alert('Repas enregistré avec succès !');
};

const mettreAJourTableauBord = async () => {
    const [objectifs, repas] = await Promise.all([recupererObjectifs(), recupererRepas()]);
    if (!objectifs || !repas) return;

    const nutrimentsActuels = additionnerNutriments(repas);
    const objectif = objectifs[0] || { calories: 0, proteines: 0, lipides: 0, glucides: 0 };

    const mettreAJourProgression = (nutriment) => {
        mettreAJourTexteProgression(`progression${nutriment.charAt(0).toUpperCase() + nutriment.slice(1)}`, nutrimentsActuels[nutriment], objectif[nutriment], 
            nutriment === 'calories' ? 'kcal' : 'g');
    };

    ['calories', 'proteines', 'lipides', 'glucides'].forEach(mettreAJourProgression);

    const listeRepasRecents = document.getElementById('repasRecents');
    if (listeRepasRecents) {
        listeRepasRecents.innerHTML = repas.slice(-5).map(repas => `
            <div class="list-group-item">
                <h5 class="mb-1">${repas.plat}</h5>
                <p class="mb-1">Calories: ${repas.calories} kcal | Protéines: ${repas.proteines}g | Lipides: ${repas.lipides}g | Glucides: ${repas.glucides}g</p>
                <small class="text-muted">Consommé le ${formaterDate(repas.date)}</small>
            </div>
        `).join('');
    }
};

const mettreAJourListeRepas = async () => {
    const repas = await recupererRepas();
    if (!repas) return;

    const listeRepas = document.getElementById('listeRepas');
    if (listeRepas) {
        listeRepas.innerHTML = repas.map(repas => `
            <div class="list-group-item">
                <h5 class="mb-1">${repas.plat}</h5>
                <p class="mb-1">Calories: ${repas.calories} kcal | Protéines: ${repas.proteines}g | Lipides: ${repas.lipides}g | Glucides: ${repas.glucides}g</p>
                <small class="text-muted">Consommé le ${formaterDate(repas.date)}</small>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const formulaireObjectifs = document.getElementById('goalsForm');
    const formulaireRepas = document.getElementById('formulaireRepas');
    const boutonModifierObjectifs = document.getElementById('editGoalsBtn');
    const boutonAnnulerModification = document.getElementById('cancelEditBtn');

    if (formulaireObjectifs) {
        formulaireObjectifs.addEventListener('submit', gererFormulaireObjectifs);
    }

    if (formulaireRepas) {
        formulaireRepas.addEventListener('submit', gererFormulaireRepas);
    }

    if (boutonModifierObjectifs) {
        boutonModifierObjectifs.addEventListener('click', async () => {
            const objectifs = await recupererObjectifs();
            remplirFormulaireObjectifs(objectifs);
            basculerFormulaireObjectifs(true);
        });
    }

    if (boutonAnnulerModification) {
        boutonAnnulerModification.addEventListener('click', () => {
            basculerFormulaireObjectifs(false);
        });
    }

    if (window.location.pathname.includes('dashboard.html')) {
        mettreAJourTableauBord();
    } else if (window.location.pathname.includes('meals.html')) {
        mettreAJourListeRepas();
    } else if (window.location.pathname.includes('goals.html')) {
        recupererObjectifs().then(objectifs => afficherObjectifsActuels(objectifs));
    }
});
