// Normtabellen
const NORM_SE_HS = [
    [21.33, 25.33, 29.33, 33.32, 37.32],
    [20.87, 24.95, 29.03, 33.13, 37.18],
    [17.93, 21.37, 24.80, 28.23, 31.67],
    [13.98, 17.71, 21.44, 25.17, 28.90],
    [24.60, 28.55, 33.04, 37.53, 42.01],
    [15.53, 18.97, 22.40, 25.83, 29.27]
];

const NORM_FE_HS = [
    [12.66, 18.16, 23.66, 29.16, 34.66],
    [13.33, 18.42, 23.51, 28.60, 33.69],
    [10.75, 15.41, 20.07, 24.73, 29.39],
    [14.22, 15.30, 16.38, 17.46, 18.54],
    [14.12, 20.21, 26.30, 32.39, 38.48],
    [10.53, 14.51, 18.49, 22.47, 26.45]
];

const NORM_SE_FS = [
    [17.54, 24.03, 30.53, 37.02, 43.51],
    [17.80, 24.26, 30.73, 37.19, 43.65],
    [18.03, 22.41, 26.79, 31.17, 35.55],
    [14.28, 15.55, 16.83, 18.10, 19.37],
    [20.69, 27.49, 34.29, 41.09, 47.89],
    [12.44, 18.06, 23.68, 29.29, 34.91]
];

const NORM_FE_FS = [
    [15.30, 19.79, 24.28, 28.77, 33.26],
    [14.63, 18.94, 23.25, 27.56, 31.87],
    [14.62, 17.81, 21.00, 24.19, 27.38],
    [15.00, 15.55, 16.10, 16.65, 17.20],
    [18.44, 22.61, 26.78, 30.95, 35.12],
    [9.79, 13.97, 18.15, 22.33, 26.51]
];

const KOMPETENZEN = ['Arbeitsverhalten', 'Lernverhalten', 'Sozialverhalten', 'Fachkompetenz', 'Personale Kompetenz', 'Methodenkompetenz'];

const ITEMS = [
    'Zuverlässigkeit', 'Arbeitstempo', 'Arbeitsplanung', 'Organisationsfähigkeit',
    'Geschicklichkeit', 'Ordnung', 'Sorgfalt', 'Kreativität', 'Problemlösungsfähigkeit',
    'Abstraktionsvermögen', 'Selbstständigkeit', 'Belastbarkeit', 'Konzentrationsfähigkeit',
    'Verantwortungsbewusstsein', 'Eigeninitiative', 'Leistungsbereitschaft', 'Auffassungsgabe',
    'Merkfähigkeit', 'Motivationsfähigkeit', 'Reflektionsfähigkeit', 'Teamfähigkeit',
    'Hilfsbereitschaft', 'Kontaktfähigkeit', 'Respektvoller Umgang', 'Kommunikationsfähigkeit',
    'Einfühlungsvermögen', 'Konfliktfähigkeit', 'Kritikfähigkeit', 'Schreiben', 'Lesen',
    'Mathematik', 'Naturwissenschaft', 'Fremdsprachen', 'Präsentationsfähigkeit',
    'PC Kenntnisse', 'Fächerübergreifendes Denken'
];

function calculateSums(items) {
    const sums = [0, 0, 0, 0, 0, 0, 0];
    
    for (let i = 0; i < 10; i++) sums[1] += items[i];
    for (let i = 10; i < 20; i++) sums[2] += items[i];
    for (let i = 20; i < 28; i++) sums[3] += items[i];
    sums[3] += items[8] + items[9];
    for (let i = 28; i < 36; i++) sums[4] += items[i];
    
    sums[5] = items[0] + items[1] + items[5] + items[6] + items[7] +
              items[8] + items[9] + items[11] + items[12] + items[13] + items[14];
    
    sums[6] = items[2] + items[3] + items[4] + items[8] + items[9] +
              items[10] + items[16] + items[17];
    
    return sums;
}

function calculateProfileValues(sums, norm) {
    const values = [];
    for (let k = 1; k <= 6; k++) {
        let value = 5;
        for (let p = 0; p < 5; p++) {
            if (sums[k] < norm[k - 1][p]) {
                value = p + 1;
                break;
            }
        }
        values.push(value);
    }
    return values;
}

function calculateCompetenceValues(profile, normType = 'HS') {
    const seItems = [];
    const feItems = [];
    
    for (let i = 1; i <= 36; i++) {
        seItems.push(profile[`item${i}`] || 2);
        feItems.push(profile[`feitem${i}`] || 2);
    }
    
    const seSums = calculateSums(seItems);
    const feSums = calculateSums(feItems);
    
    const normSE = normType === 'HS' ? NORM_SE_HS : NORM_SE_FS;
    const normFE = normType === 'HS' ? NORM_FE_HS : NORM_FE_FS;
    
    return {
        se: calculateProfileValues(seSums, normSE),
        fe: calculateProfileValues(feSums, normFE)
    };
}

function calculateCorrelation(seValues, feValues) {
    const n = seValues.length;
    let sumSE = 0, sumFE = 0, sumSEFE = 0, sumSE2 = 0, sumFE2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumSE += seValues[i];
        sumFE += feValues[i];
        sumSEFE += seValues[i] * feValues[i];
        sumSE2 += seValues[i] * seValues[i];
        sumFE2 += feValues[i] * feValues[i];
    }
    
    const numerator = n * sumSEFE - sumSE * sumFE;
    const denominator = Math.sqrt((n * sumSE2 - sumSE * sumSE) * (n * sumFE2 - sumFE * sumFE));
    
    return denominator === 0 ? 0 : numerator / denominator;
}

function calculateAgreement(seItems, feItems) {
    let matches = 0;
    for (let i = 0; i < 36; i++) {
        if (seItems[i] === feItems[i]) matches++;
    }
    return matches * 100 / 36;
}

function getRatingText(value) {
    switch (value) {
        case 1: return 'weit unterdurchschnittlich';
        case 2: return 'unterdurchschnittlich';
        case 3: return 'durchschnittlich';
        case 4: return 'überdurchschnittlich';
        case 5: return 'weit überdurchschnittlich';
        default: return 'unbekannt';
    }
}

function getInterpretation(correlation, agreement, seValues, feValues) {
    let text = '';
    
    if (correlation >= 0.8) {
        text += `Sehr gute Übereinstimmung zwischen Selbst- und Fremdeinschätzung (r = ${correlation.toFixed(2)}).\n\n`;
    } else if (correlation >= 0.6) {
        text += `Gute Übereinstimmung zwischen Selbst- und Fremdeinschätzung (r = ${correlation.toFixed(2)}).\n\n`;
    } else if (correlation >= 0.4) {
        text += `Mäßige Übereinstimmung zwischen Selbst- und Fremdeinschätzung (r = ${correlation.toFixed(2)}).\n\n`;
    } else if (correlation >= 0.2) {
        text += `Schwache Übereinstimmung zwischen Selbst- und Fremdeinschätzung (r = ${correlation.toFixed(2)}).\n\n`;
    } else {
        text += `Keine signifikante Übereinstimmung zwischen Selbst- und Fremdeinschätzung (r = ${correlation.toFixed(2)}).\n\n`;
    }
    
    text += `Die inhaltliche Übereinstimmung beträgt ${agreement.toFixed(1)}%.\n\n`;
    text += 'Auswertung der Kompetenzen:\n';
    text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    text += 'Selbsteinschätzung:\n';
    for (let i = 0; i < 6; i++) {
        text += `  • ${KOMPETENZEN[i]}: ${getRatingText(seValues[i])} (${seValues[i]}/5)\n`;
    }
    text += '\nFremdeinschätzung:\n';
    for (let i = 0; i < 6; i++) {
        text += `  • ${KOMPETENZEN[i]}: ${getRatingText(feValues[i])} (${feValues[i]}/5)\n`;
    }
    
    return text;
}

function buildItemsObject(seItems, feItems) {
    const obj = {};
    for (let i = 0; i < 36; i++) {
        obj[`item${i + 1}`] = seItems[i];
        obj[`feitem${i + 1}`] = feItems[i];
    }
    return obj;
}