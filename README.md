# 📦 Lagerverwaltung – Inventory Management System

Webanwendung zur Verwaltung von Produkten in mehreren Lagern. Ein- und Ausgangsrechnungen ändern den Bestand automatisch, jedes Produkt hat einen eigenen QR-Code, und jede Bestandsbewegung wird mit Vorher-/Nachher-Stand und verantwortlichem Nutzer protokolliert.



**Live-Demo:** [Inventory Web App](https://inventory-1jl4qfkl7-bjornx007s-projects.vercel.app/login) · **Demo-Login Username:** `demo` /Password: `demo1234`

---

## Funktionen

- **Automatische Bestandsführung:** Eingangsrechnungen erhöhen, Ausgangsrechnungen senken den Bestand pro Lager.
- **Mehrere Lager:** Verfügbarkeit wird je Lager getrennt geführt.
- **Produktanlage:** einzeln oder per Excel-Import (`.xlsx`).
- **QR-Code pro Produkt:** zum schnellen Suchen und Scannen.
- **Dashboard:** Gesamtübersicht über Bestände, letzte Rechnungen und Lager.
- **Protokoll:** jede Bewegung mit Bestand vor/nach der Änderung, Beleg und Nutzer.

### Rollen und Rechte

| Rolle | Rechte |
|---|---|
| **Super-Admin** | Neue Nutzer einladen und Rollen vergeben |
| **Admin** | Alle Rechnungen sehen, neue Lager anlegen |
| **Nutzer** | Nur eigene Rechnungen sehen, Verfügbarkeit jedes Produkts in jedem Lager abfragen |

---

## Technik im Detail

| Bereich | Umsetzung |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, responsives Layout (mobile first) |
| **Backend** | Route Handlers / Server Actions in Next.js, Validierung der Eingaben serverseitig |
| **Datenbank** | PostgreSQL (Neon), relationales Schema mit Fremdschlüsseln |
| **Authentifizierung** | Login mit Session, Einladung per Link mit Einmal-Token |
| **Autorisierung** | Rollenprüfung auf dem Server bei jeder Anfrage, nicht nur im UI |
| **QR-Codes** | Codierte URL zur Produktseite, Generierung als SVG/PNG |
| **Excel-Import** | Datei wird eingelesen, Zeile für Zeile geprüft, Fehler werden mit Zeilennummer angezeigt |
| **Deployment** | Vercel (Anwendung) + Neon (Datenbank) |

### Datenmodell (vereinfacht)

```
users ─┬─< invoices ─< invoice_items >─ products
       │                    │
       │                    └── warehouse
       └─< stock_logs >── products / warehouses

stock (product_id, warehouse_id, quantity)
```

### Wie der Bestand konsistent bleibt

Der Bestand wird nie von Hand geändert, sondern nur über Rechnungen. Jede Rechnung läuft in **einer Datenbank-Transaktion**:

1. Prüfen, ob genug Bestand da ist (bei Ausgangsrechnungen)
2. Bestand für Produkt und Lager aktualisieren
3. Protokolleintrag schreiben: `menge_vorher`, `menge_nachher`, Beleg, Nutzer

Schlägt ein Schritt fehl, wird alles zurückgerollt. So laufen Bestand und Protokoll nie auseinander.

---

## Nutzung mit einem einfachen Smartphone

Die App läuft komplett im **Browser**, es muss nichts installiert werden. Ein günstiges Android- oder iPhone mit Kamera und Mobilfunk reicht.

- **Scannen ohne extra App:** Die normale Kamera-App liest den QR-Code und öffnet direkt die Produktseite mit Bestand je Lager.
- **Lageristen am Regal:** QR-Code scannen, Verfügbarkeit prüfen, fertig. Keine Suche, kein Tippen.
- **Mobil bedienbar:** große Buttons, einspaltiges Layout, Tabellen scrollen seitlich.
- **Wenig Datenverbrauch:** serverseitig gerendertes HTML, kleine Seiten, dadurch auch bei schwachem Netz nutzbar.
- **Zum Startbildschirm hinzufügen:** die Seite lässt sich wie eine App ablegen.
- **Ausdrucken:** QR-Codes können als Etikett gedruckt und auf Regale oder Kartons geklebt werden.

Typischer Ablauf: Ware kommt an → Admin erfasst Eingangsrechnung am PC → Lagerist scannt am Handy den QR-Code und sieht sofort den neuen Bestand.

---



## Excel-Import

| name | sku | kategorie | einheit | anfangsbestand | lager |
|---|---|---|---|---|---|
| Stahlschraube M8 | SB-M8 | Hardware | Stk | 500 | Hauptlager |

---

## Ausblick

- [ ] Warnung bei niedrigem Bestand
- [ ] Rechnungen als PDF exportieren
- [ ] Barcode-Scan direkt in der App-Oberfläche


