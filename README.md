# DÜSK - Electron Desktop App (Vollständige README.md)


**DÜSK** ist eine professionelle Desktop-Anwendung für Windows, macOS und Linux zur Erfassung und Auswertung von Selbst- und Fremdeinschätzungen von Schülerkompetenzen. Die App wurde mit **Electron** entwickelt und bietet eine native Benutzeroberfläche auf allen Plattformen.

---

## 📋 Inhaltsverzeichnis

- [Überblick](#-überblick)
- [Features](#-features)
- [Technologie-Stack](#-technologie-stack)
- [Screenshots](#-screenshots)
- [API-Dokumentation](#-api-dokumentation)
- [Datenbankstruktur](#-datenbankstruktur)
- [Installation](#-installation)
- [Projektstruktur](#-projektstruktur)
- [Berechnungslogik](#-berechnungslogik)
- [Konfiguration](#-konfiguration)
- [Build & Deployment](#-build--deployment)
- [Entwicklung](#-entwicklung)
- [Fehlerbehandlung](#-fehlerbehandlung)

---

## 🎯 Überblick

DÜSK (Düsseldorfer Schülerinventar) ist ein diagnostisches Instrument zur Erfassung von Schülerkompetenzen in sechs Bereichen:

| Bereich | Beschreibung |
|---------|--------------|
| 1. **Arbeitsverhalten** | Zuverlässigkeit, Arbeitstempo, Planung, Organisation |
| 2. **Lernverhalten** | Selbstständigkeit, Belastbarkeit, Konzentration, Merkfähigkeit |
| 3. **Sozialverhalten** | Teamfähigkeit, Hilfsbereitschaft, Kommunikation, Konfliktfähigkeit |
| 4. **Fachkompetenz** | Schreiben, Lesen, Mathematik, Naturwissenschaften, Fremdsprachen |
| 5. **Personale Kompetenz** | Kreativität, Problemlösung, Abstraktion, Reflexion |
| 6. **Methodenkompetenz** | Präsentation, PC-Kenntnisse, fächerübergreifendes Denken |

Die Anwendung ermöglicht den Vergleich von **Selbsteinschätzung (SE)** und **Fremdeinschätzung (FE)** mit Normtabellen für Hauptschulen (HS) und Förderschulen (FS).

---

## ✨ Features

### Kernfunktionen
- ✅ **Login/Logout** mit Session-Verwaltung und persistenter Authentifizierung
- ✅ **CRUD-Operationen** für Schülerprofile (Erstellen, Lesen, Aktualisieren, Löschen)
- ✅ **36 Items** pro Einschätzung (4-stufige Likert-Skala: 1-4)
- ✅ **Automatische Kompetenzberechnung** aus 72 Items
- ✅ **Normwertvergleich** (HS/FS Normtabellen)
- ✅ **Profilansicht** mit Tabellen, interaktiven Diagrammen und Textinterpretation

### Erweiterte Funktionen
- 📊 **Zeitreihenanalyse** für Gruppenentwicklung über Zeit
- 📈 **Vergleichsdiagramme** (SE vs. FE mit Pearson-Korrelation)
- 📐 **Korrelationsberechnung** mit statistischer Interpretation
- 📑 **Exportfunktion** (CSV, PDF in Entwicklung)
- 🔍 **Such- und Filterfunktionen** (nach Namen und Gruppen)
- 📁 **Gruppenverwaltung** (CRUD mit Umbenennung)
- 🌙 **Dark Mode Support** (systemabhängig)
- 💾 **Persistente Speicherung** (electron-store für Fensterposition, Session)
- 🖥️ **Native Desktop Integration** (Menüs, Dialoge, Shortcuts)
- 🔄 **Auto-Updater** für automatische Updates
- ⌨️ **Tastatur-Shortcuts** (Cmd+N, F11, Cmd+Q, etc.)

---

## 🛠 Technologie-Stack

### Electron App

| Komponente | Technologie | Version |
|------------|-------------|---------|
| Framework | Electron | 28.0 |
| Sprache | JavaScript (ES6) | - |
| HTTP-Client | Axios | 1.6.5 |
| Charts | Chart.js | 4.4.0 |
| Persistenz | electron-store | 8.1.0 |
| Updater | electron-updater | 6.1.7 |
| PDF Export | pdfmake | 0.2.9 |
| Build-Tool | electron-builder | 24.9.1 |

### Server (PHP API)

| Komponente | Technologie |
|------------|-------------|
| Backend | PHP 7.4+ |
| Datenbank | MySQL 5.7+ |
| Webserver | Apache/Nginx |
| Format | JSON |

---

## 📡 API-Dokumentation

Die REST-API ist unter `https://paul-koop.org/api/` verfügbar.

### Authentifizierung

#### POST `/api_login.php`

```json
// Request
{
    "username": "gast",
    "password": "gast"
}

// Response (Success)
{
    "success": true,
    "userID": "12345",
    "session": "abc123def456789"
}

// Response (Error)
{
    "success": false,
    "error": "Invalid credentials"
}
```

### Profile-Endpunkte

> **Wichtig:** Alle Profile-Endpunkte benötigen die Header:
> - `X-User-ID`: Benutzer-ID aus Login
> - `X-Session`: Session-Token aus Login

#### GET `/api_profiles.php`

**Response**: Array aller Profile des Benutzers

```json
[
    {
        "profilID": "1",
        "name": "Max Mustermann",
        "gruppename": "Klasse 8a",
        "gruppeID": "5",
        "created_at": "2024-01-15 10:30:00",
        "item1": 4, "item2": 3, ..., "item36": 2,
        "feitem1": 3, "feitem2": 4, ..., "feitem36": 3
    }
]
```

#### GET `/api_profiles.php?id={profileId}`

**Response**: Einzelnes Profil

#### POST `/api_profiles.php`

**Request Body**: Vollständiges Profil-Objekt (alle 72 Items)
**Response**: `200 OK` bei Erfolg

#### PUT `/api_profiles.php`

**Request Body**: Aktualisiertes Profil-Objekt
**Response**: `200 OK` bei Erfolg

#### DELETE `/api_profiles.php?id={profileId}`

**Response**: `200 OK` bei Erfolg

### Gruppen-Endpunkte

#### GET `/api_groups.php`

**Response**:
```json
[
    {"gruppeID": 1, "name": "Klasse 8a"},
    {"gruppeID": 2, "name": "Klasse 8b"},
    {"gruppeID": 3, "name": "Klasse 9a"}
]
```

#### POST `/api_groups.php`

**Request Body**: `{"name": "Neue Gruppe"}`
**Response**: `200 OK` bei Erfolg

#### DELETE `/api_groups.php?id={groupId}`

**Response**: `200 OK` bei Erfolg

---

## 🗄 Datenbankstruktur

### ER-Diagramm

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │   groups    │     │  profiles   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ userID (PK) │────<│ userID (FK) │     │ profilID(PK)│
│ username    │     │ gruppeID(PK)│<────│ userID (FK) │
│ password    │     │ name        │     │ gruppeID(FK)│
│ session     │     │ created_at  │     │ name        │
│ created_at  │     └─────────────┘     │ item1-36    │
└─────────────┘                          │ feitem1-36  │
                                         │ created_at  │
                                         │ updated_at  │
                                         └─────────────┘
```

### SQL-Schema

```sql
-- Users Tabelle
CREATE TABLE users (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    session_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Tabelle
CREATE TABLE groups (
    gruppeID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    UNIQUE KEY unique_group_per_user (userID, name)
);

-- Profiles Tabelle
CREATE TABLE profiles (
    profilID INT AUTO_INCREMENT PRIMARY KEY,
    userID INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    gruppeID INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- 36 SE-Items (Werte 1-4)
    item1 TINYINT DEFAULT 2, item2 TINYINT DEFAULT 2, ..., item36 TINYINT DEFAULT 2,
    -- 36 FE-Items (Werte 1-4)
    feitem1 TINYINT DEFAULT 2, feitem2 TINYINT DEFAULT 2, ..., feitem36 TINYINT DEFAULT 2,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (gruppeID) REFERENCES groups(gruppeID) ON DELETE SET NULL
);
```

---

## 💻 Installation

### Voraussetzungen

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** oder **yarn**
- **Für Windows:** Visual Studio 2022 Build Tools mit C++ Desktop-Entwicklung
- **Für macOS:** Xcode Command Line Tools
- **Für Linux:** build-essential (`sudo apt install build-essential`)

### Schritt-für-Schritt Installation

```bash
# 1. Repository klonen
git clone https://github.com/yourusername/duesk-electron.git
cd duesk-electron

# 2. Abhängigkeiten installieren
npm install

# 3. App starten (Entwicklungsmodus)
npm start

# 4. Debug-Modus mit Entwicklertools
npm run dev
```

### Plattformspezifische Builds

```bash
# Windows Installer (NSIS)
npm run build:win

# macOS App (DMG)
npm run build:mac

# Linux (AppImage + DEB)
npm run build:linux

# Alle Plattformen
npm run dist
```

---

## 📁 Projektstruktur

```
duesk-electron/
├── package.json                    # Abhängigkeiten & Skripte
├── electron-builder.json           # Build-Konfiguration
├── main.js                         # Hauptprozess (Electron)
├── preload.js                      # Preload-Skript (IPC Bridge)
├── src/
│   ├── index.html                  # Haupt-HTML (Template)
│   ├── renderer.js                 # Renderer-Prozess (Hauptlogik)
│   ├── styles.css                  # Globale Styles
│   ├── js/
│   │   ├── api.js                  # API-Kommunikation (Axios)
│   │   ├── session.js              # Session-Management
│   │   ├── calculator.js           # Berechnungslogik (Normen, Korrelation)
│   │   └── utils.js                # Hilfsfunktionen (escapeHtml, formatDate)
│   └── pages/
│       ├── splash.html             # Splash Screen beim Start
│       ├── login.html              # Login-Seite
│       ├── main.html               # Hauptansicht mit Sidebar
│       ├── profile-detail.html     # Profildetails mit Charts
│       ├── profile-edit.html       # Profil bearbeiten/erstellen
│       ├── group-manager.html      # Gruppenverwaltung
│       └── time-series.html        # Zeitreihenanalyse
├── assets/
│   ├── icons/
│   │   ├── icon.png                # App-Icon (512x512)
│   │   ├── icon.ico                # Windows-Icon
│   │   └── icon.icns               # macOS-Icon
│   └── build/                      # Build-Ausgabe (dist)
└── README.md                       # Dokumentation
```

---

## 🧮 Berechnungslogik

### Item-zu-Kompetenz-Zuordnung

```javascript
// Kompetenz 1: Arbeitsverhalten (Items 1-10)
for (let i = 0; i < 10; i++) sums[1] += items[i];

// Kompetenz 2: Lernverhalten (Items 11-20)
for (let i = 10; i < 20; i++) sums[2] += items[i];

// Kompetenz 3: Sozialverhalten (Items 21-28 + Items 9-10)
for (let i = 20; i < 28; i++) sums[3] += items[i];
sums[3] += items[8] + items[9];

// Kompetenz 4: Fachkompetenz (Items 29-36)
for (let i = 28; i < 36; i++) sums[4] += items[i];

// Kompetenz 5: Personale Kompetenz (spezifische Items)
sums[5] = items[0] + items[1] + items[5] + items[6] + items[7] +
          items[8] + items[9] + items[11] + items[12] + items[13] + items[14];

// Kompetenz 6: Methodenkompetenz (spezifische Items)
sums[6] = items[2] + items[3] + items[4] + items[8] + items[9] +
          items[10] + items[16] + items[17];
```

### Profilwertberechnung

```javascript
function calculateProfileValue(rawSum, normTable) {
    // 1 = weit unterdurchschnittlich
    // 2 = unterdurchschnittlich  
    // 3 = durchschnittlich
    // 4 = überdurchschnittlich
    // 5 = weit überdurchschnittlich
    
    for (let i = 0; i < normTable.length; i++) {
        if (rawSum < normTable[i]) {
            return i + 1;
        }
    }
    return 5;
}
```

### Korrelationsberechnung (Pearson)

```javascript
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
    const denominator = Math.sqrt((n * sumSE2 - sumSE * sumSE) * 
                                   (n * sumFE2 - sumFE * sumFE));
    
    return denominator === 0 ? 0 : numerator / denominator;
}
```

### Normtabellen (Vollständig)

| Kompetenz | HS SE Grenzwerte | HS FE Grenzwerte |
|-----------|------------------|------------------|
| Arbeitsverhalten | 21.33, 25.33, 29.33, 33.32, 37.32 | 12.66, 18.16, 23.66, 29.16, 34.66 |
| Lernverhalten | 20.87, 24.95, 29.03, 33.13, 37.18 | 13.33, 18.42, 23.51, 28.60, 33.69 |
| Sozialverhalten | 17.93, 21.37, 24.80, 28.23, 31.67 | 10.75, 15.41, 20.07, 24.73, 29.39 |
| Fachkompetenz | 13.98, 17.71, 21.44, 25.17, 28.90 | 14.22, 15.30, 16.38, 17.46, 18.54 |
| Personale Kompetenz | 24.60, 28.55, 33.04, 37.53, 42.01 | 14.12, 20.21, 26.30, 32.39, 38.48 |
| Methodenkompetenz | 15.53, 18.97, 22.40, 25.83, 29.27 | 10.53, 14.51, 18.49, 22.47, 26.45 |

*Für FS (Förderschule) existieren separate Normtabellen.*

---

## ⚙️ Konfiguration

### API Base URL ändern

```javascript
// main.js oder js/api.js
const API_BASE_URL = 'https://your-server.com/api/';
```

### Umgebungsvariablen

```bash
# .env Datei (für Entwicklung)
API_URL=https://paul-koop.org/api/
DEBUG_MODE=true
```

### App-Icons und Build-Konfiguration

```json
// electron-builder.json
{
    "appId": "com.duesk.app",
    "productName": "DÜSK",
    "directories": {
        "output": "dist"
    },
    "win": {
        "target": "nsis",
        "icon": "assets/icons/icon.ico"
    },
    "mac": {
        "target": "dmg",
        "icon": "assets/icons/icon.icns",
        "category": "public.app-category.education"
    },
    "linux": {
        "target": ["AppImage", "deb"],
        "icon": "assets/icons/icon.png",
        "category": "Education"
    }
}
```

---

## 🚀 Build & Deployment

### Entwicklung

```bash
# Entwicklung starten
npm start

# Mit Debug-Entwicklertools
npm run dev

# Tests ausführen
npm test
```

### Produktions-Build

```bash
# Windows (NSIS Installer)
npm run build:win

# macOS (DMG)
npm run build:mac

# Linux (AppImage + DEB)
npm run build:linux

# Alle Plattformen
npm run dist
```

### Build-Ausgabe

| Plattform | Ausgabeort | Datei |
|-----------|------------|-------|
| Windows | `dist/win-unpacked/` | `DÜSK Setup.exe` |
| macOS | `dist/mac/` | `DÜSK.dmg` |
| Linux | `dist/linux-unpacked/` | `DÜSK.AppImage` |

---

## ⌨️ Tastatur-Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Cmd/Ctrl + N` | Neues Profil |
| `Cmd/Ctrl + Q` | Beenden |
| `Cmd/Ctrl + Z` | Rückgängig |
| `Cmd/Ctrl + Y` | Wiederherstellen |
| `Cmd/Ctrl + C` | Kopieren |
| `Cmd/Ctrl + V` | Einfügen |
| `Cmd/Ctrl + A` | Alles auswählen |
| `F11` | Vollbild |
| `F12` | Entwicklertools |

---

## 🐛 Fehlerbehandlung

### HTTP-Statuscodes

| Code | Bedeutung | Behandlung |
|------|-----------|------------|
| 200 | Erfolg | Daten verarbeiten |
| 400 | Bad Request | Validierungsfehler prüfen |
| 401 | Unauthorized | Neu anmelden |
| 403 | Forbidden | Berechtigung prüfen |
| 404 | Not Found | Ressource existiert nicht |
| 500 | Server Error | Erneut versuchen, Support kontaktieren |

### Typische Fehler und Lösungen

```javascript
try {
    const result = await apiCall('api_profiles.php', 'GET');
    if (!result.success) {
        if (result.status === 401) {
            // Session abgelaufen - erneut anmelden
            await logout();
        } else {
            showError(result.error || 'Unbekannter Fehler');
        }
    }
} catch (error) {
    if (error.code === 'ECONNABORTED') {
        showError('Verbindung zeitüberschritten');
    } else if (error.message.includes('Network Error')) {
        showError('Keine Internetverbindung');
    } else {
        showError(`Fehler: ${error.message}`);
    }
}
```

---

## 🔄 Vergleich der Implementierungen

| Feature | Electron | Flutter | React Native | Swift (iOS) |
|---------|----------|---------|--------------|-------------|
| Plattformen | 3 (Win/Mac/Linux) | 6 | 2 | 1 |
| Code-Wiederverwendung | 100% | 95% | 70% | - |
| Performance | Mittel | Sehr gut | Gut | Exzellent |
| Installationsgröße | ~80 MB | ~25 MB | ~30 MB | ~15 MB |
| Lernkurve | Gering | Mittel | Gering | Hoch |
| Charts | Chart.js | FL Chart | React Native Chart Kit | Swift Charts |
| Desktop-Integration | Exzellent | Gut | Eingeschränkt | Exzellent |
| Auto-Updater | ✅ Ja | ❌ Nein | ❌ Nein | ✅ Ja (App Store) |

- **Normtabellen:** Bildungsforschung Düsseldorf
- **API-Entwicklung:** Paul Koop
- **Electron Framework:** OpenJS Foundation
- **Chart.js:** Chart.js Contributors
- **Testing & Feedback:** Alle Beta-Tester

---

*Letzte Aktualisierung: Januar 2026*

---

## 🎯 Nächste Schritte

Die Electron-Version ist **vollständig implementiert** und unterstützt **Windows, macOS und Linux**.

### Alle DÜSK-Implementierungen sind nun abgeschlossen:

| Version | Plattformen | Status |
|---------|-------------|--------|
| **Java/Swing** | Windows, macOS, Linux | ✅ Vollständig |
| **Swift/SwiftUI** | iOS, macOS | ✅ Vollständig |
| **React Native** | iOS, Android | ✅ Vollständig |
| **Flutter** | iOS, Android, Web, Windows, macOS, Linux | ✅ Vollständig |
| **Electron** | Windows, macOS, Linux | ✅ Vollständig |

**Alle Versionen sind funktional identisch und teilen dieselbe API!**