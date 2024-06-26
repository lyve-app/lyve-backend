![Logo](../assets/lyve_logo.svg)

(ausgesprochen Live)

### 0 Autoren

Jan-Niklas Rau

Louis-Kaan Ay

[https://github.com/Louis3797/Lyve](https://github.com/Louis3797/Lyve)

# 1 Einführung

Lyve ist eine Livestreaming-Plattform in der User livestreamen oder Livestreams schauen können. Viewer können mit den Streamer per Chat interagieren und sogennante Rewards an diesen senden. Das erreichen bestimmter Meilensteine (Achievements) führt dazu, dass Streamer mehr auf der Plattform promoted werden und so an Sichtbarkeit und Ansehen gewinnen.

---

---

# 2 Anforderungen

## 2.1 Stakeholder

### Persona

| Name   | Alter | Geschlecht | Beruf                 | Interessen                                  | Nutzung von Lyve                                                                           | Ziele und Motivation                                                                                        |
| ------ | ----- | ---------- | --------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Sarah  | 22    | Weiblich   | Studentin             | Mode, Kunst, Lifestyle                      | Teilt Outfit-Ideen, Make-up-Tutorials, Lifestyle-Tipps mit der Community                   | Reichweite vergrößern, Gleichgesinnte finden, kreative Inhalte teilen                                       |
| Max    | 28    | Männlich   | Grafikdesigner        | Fotografie, Design, visuelle Ästhetik       | Veranstaltet Live-Fotografie-Touren, teilt Tipps zur Fotografie                            | Fachwissen teilen, Inspiration erhalten                                                                     |
| Lena   | 20    | Weiblich   | Fitness-Enthusiast    | Workouts, gesunde Ernährung                 | Bietet Live-Workouts an, gibt Ernährungstipps, teilt ihre Fitnessreise                     | Unterstützende Fitness-Community aufbauen, Menschen zu einem gesünderen Lebensstil inspirieren              |
| Jonas  | 24    | Männlich   | Musikproduzent        | Elektronische Musik, DJing                  | Streamt Live-DJ-Sets, präsentiert neue Tracks, interagiert mit Fans                        | Musik teilen, Fanbase aufbauen                                                                              |
| Sophie | 18    | Weiblich   | Abiturientin          | Modedesign, Styling                         | Veranstaltet Live-Modenschauen, stellt ihre Designs vor, erhält Feedback von der Community | Kreative Fähigkeiten weiterentwickeln, sich mit Modeinteressierten austauschen                              |
| Tim    | 30    | Männlich   | Softwareentwickler    | Technologie, Gadgets, Innovationen          | Teilt Live-Reviews von Gadgets, Software-Updates und technischen Lösungen                  | Fachwissen teilen, Feedback erhalten, sich mit anderen Tech-Begeisterten vernetzen                          |
| Laura  | 26    | Weiblich   | Reisebloggerin        | Reisen, Kulturen, Abenteuer                 | Bietet Live-Reiseberichte, gibt Tipps für unterwegs, veranstaltet virtuelle Reiseführungen | Reiseerfahrungen teilen, Menschen inspirieren, eine globale Reisecommunity aufbauen                         |
| David  | 32    | Männlich   | Koch                  | Kochen, Backen, kulinarische Experimente    | Veranstaltet Live-Kochkurse, demonstriert Rezepte, bietet kulinarische Events              | Leidenschaft für gutes Essen teilen, Tipps und Tricks weitergeben, eine lebendige Food-Community aufbauen   |
| Julia  | 21    | Weiblich   | Psychologie-Studentin | Persönliche Entwicklung, mentale Gesundheit | Bietet Live-Coachings, Meditationssitzungen, gibt Tipps für Stressbewältigung              | Menschen helfen, ihre mentale Gesundheit zu stärken, Unterstützung finden, eine positive Community aufbauen |
| Felix  | 29    | Männlich   | DIY-Enthusiast        | Kreative Projekte, Heimwerken               | Veranstaltet Live-DIY-Workshops, teilt Bauanleitungen, gibt Tipps für Heimwerkerprojekte   | Handwerkliche Fähigkeiten teilen, Inspiration bieten, eine Community von Heimwerkern aufbauen               |
| Emma   | 17    | Weiblich   | Schülerin             | Unterhaltung, Lifestyle                     | Schaut Live-Modenschauen, verfolgt Live-Kochkurse, nimmt an Live-Workouts teil             | Unterhaltung finden, Inspiration für den eigenen Lebensstil erhalten                                        |
| Oliver | 16    | Männlich   | Schüler               | Technologie, Gaming                         | Verfolgt Live-Reviews von Gadgets, schaut Live-DJ-Sets, nimmt an Live-Workshops teil       | Neueste Technologien entdecken, Unterhaltung finden, Fachwissen in IT und Gaming erweitern                  |
| Lara   | 18    | Weiblich   | Schülerin             | Kochen, DIY-Projekte                        | Schaut Live-Kochkurse, nimmt an Live-DIY-Workshops teil, verfolgt Live-Modenschauen        | Neue Rezepte kennenlernen, Inspiration für DIY-Projekte finden, Unterhaltung in ihrer Freizeit genießen     |

### Zusammenfassung zu Stakeholdern

| Stakeholder      | Beschreibung                                                                                                                                                                                               |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Streamer         | Personen, die Inhalte live über die Lyve-Plattform streamen. Sie können ihre Leidenschaften, Fähigkeiten und Interessen teilen und eine Community aufbauen.                                                |
| Zuschauer/Viewer | Personen, die die Live-Streams auf der Lyve-Plattform anschauen. Sie suchen nach Unterhaltung, Inspiration, Lernmöglichkeiten oder Gemeinschaft und interagieren mit den Streamern und anderen Zuschauern. |

## 2.2 Funktionale Anforderungen

![Untitled](../assets/UseCase.drawio.png)

Akteure: User (Viewer/Streamer), Keycloak, API, Mediaserver

## 2.3 Nicht-funktionale Anforderungen

### 2.3.1 Rahmenbedingungen

- Es sollten gängige Authentifizierungs Protokolle genutzt werden damit keiner leicht auf anderer Accounts zugreifen kann
- Eine Internetverbindung ist erforderlich
- Die App sollte auf einer breiten Palette von mobilen Geräten und Betriebssystemversionen laufen
- Es ist wichtig, dass die App ressourcenschonend ist, um den Akkuverbrauch und den Datenverbrauch der Benutzer zu minimieren.
- Es ist wichtig, dass die App barrierefrei gestaltet ist, um auch Menschen mit verschiedenen Einschränkungen den Zugang zu ermöglichen.
- Die App sollte eine intuitive Benutzeroberfläche haben, die auch für technisch weniger versierte Benutzer leicht verständlich ist.
- Es ist wichtig, dass die App die geltenden rechtlichen Vorschriften und Standards einhält, um rechtliche Risiken zu minimieren und das Vertrauen der Benutzer zu stärken.

### 2.3.2 Betriebsbedingungen

- Die App sollte für iOS und Android Smartphones verfügbar sein
- Livestreams sollten flüssig übertragen werden
- Das App Design sollte eine Vielzahl an Bildschirmgrößen unterstützen
- Das Benutzen der App sollte schnell sein.
  - Keine langen Ladezeiten
- Die App sollte die Datenschutzbestimmungen einhalten und sicherstellen
- Die Sicherheit der Benutzerdaten und der Plattform als Ganzes sollte oberste Priorität haben. Es sollten angemessene Sicherheitsmaßnahmen implementiert werden, um Datenlecks, Hacking-Versuche und andere Sicherheitsbedrohungen zu verhindern.
- Die App sollte eine hohe Verfügbarkeit aufweisen

### 2.3.3 Qualitätsmerkmale

| Qualitätsmerkmal       | sehr gut | gut | normal | nicht relevant |
| ---------------------- | -------- | --- | ------ | -------------- |
| Zuverlässigkeit        |          |     |        |                |
| Fehlertoleranz         | X        | -   | -      | -              |
| Wiederherstellbarkeit  | X        | -   | -      | -              |
| Ordnungsmäßigkeit      | X        | -   | -      | -              |
| Richtigkeit            | X        | -   | -      | -              |
| Konformität            | -        | X   | -      | -              |
| Benutzerfreundlichkeit |          |     |        |                |
| Installierbarkeit      | -        | -   | X      | -              |
| Verständlichkeit       | X        | -   | -      | -              |
| Erlernbarkeit          | -        | X   | -      | -              |
| Bedienbarkeit          | X        | -   | -      | -              |
| Performance            |          |     |        |                |
| Zeitverhalten          | X        | -   | -      | -              |
| Effizienz              | -        | X   | -      | -              |
| Sicherheit             |          |     |        |                |
| Analysierbarkeit       | -        | -   | X      | -              |
| Modifizierbarkeit      | -        | -   | -      | X              |
| Stabilität             | X        | -   | -      | -              |

## 2.4 Grafische Benuzter Oberfläche (GUI)

### Mobile

- **Login**

  ![Untitled](../assets/1%20-%20Login.png)

- **Register**

  ![Untitled](../assets/2%20-%20Registration.png)

- **Home Page**

  ![Untitled](../assets/9%20-%20Frontpage.png)
  ![Untitled](../assets/mockup_homepage.png)

- **Search Page**

  ![Untitled](../assets/10%20-%20Search.png)

- **Stream**

  - **Sicht Viewer**

    ![Untitled](../assets/7%20-%20Viewer%20View.png)
    ![Untitled](../assets/mockup_stream.png)

  - **Sicht Streamer**

    ![Untitled](../assets/8%20-%20Streamer%20View.png)

- **Profile**

  - **Eigenes Profil**

    ![Untitled](../assets/4%20-%20Own%20Profile%20-%20Statistics.png)
    ![Untitled](../assets/6%20-%20Own%20Profile%20-%20Achievements.png)

  - **Anderes Profil**

    ![Untitled](../assets/3%20-%20Streamer%20Profile%20-%20Statistics.png)
    ![Untitled](../assets/5%20-%20Streamer%20Profile%20-%20Achievements.png)

- **Einstellungen**

  ![Untitled](../assets/11%20-%20Settings.png)

## 2.5 Anforderungen im Detail

| Rolle                            | Anforderung                                                                                        | Ziel                                                                              | Beschreibung                                                                                                                                                                                                                                                                          | Priorität |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Streamer                         | Livestreams erstellen können                                                                       | Um ein Publikum zu erreichen                                                      | Benutzer der App können mit ihrer Smartphone-Kamera Livestreams erstellen, die dann in der App angezeigt werden und von anderen Benutzern live angesehen werden können.                                                                                                               | must      |
| Streamer                         | Rewards von meinen Zuschauern erhalten können                                                      | Um meine Arbeit geschätzt zu wissen und meine Streams verbessern zu können        | Zuschauer können virtuelle Belohnungen kaufen und an den Streamer senden. Der Streamer erhält Echtzeitbenachrichtigungen über jede erhaltene Belohnung, was ihm hilft, seine Streams zu verbessern.                                                                                   | should    |
| Zuschauer                        | Livestreams nach Kategorien filtern können                                                         | Um schnell Inhalte zu finden, die mich interessieren                              | Die Lyve-Plattform bietet eine Filteroption, mit der Zuschauer Live-Streams nach verschiedenen Kategorien wie Mode, Musik, Fitness usw. sortieren können. Die Filterfunktion ist benutzerfreundlich und ermöglicht eine schnelle Navigation durch die verfügbaren Inhalte.            | should    |
| Zuschauer                        | Benachrichtigungen über gestartete Live-Streams erhalten können, deren Streamer ich abonniert habe | Um keine wichtigen Inhalte zu verpassen                                           | Zuschauer können Benachrichtigungen aktivieren, um über Live-Streams ihrer bevorzugten Streamer informiert zu werden. Die Benachrichtigungen werden rechtzeitig zum Start des Live-Streams gesendet.                                                                                  | could     |
| Zuschauer                        | Während eines Live-Streams Fragen stellen können                                                   | Um mit dem Streamer interagieren zu können                                        | Ein Live-Chat-Fenster ist während des Live-Streams verfügbar, das es den Zuschauern ermöglicht, Fragen zu stellen und Kommentare zu hinterlassen.                                                                                                                                     | must      |
| Böswilliger Benutzer (Zuschauer) | Den Live-Chat mit Spam-Nachrichten überfluten können                                               | Um die Kommunikation zwischen Streamer und Zuschauern zu stören                   | Spam-Nachrichten werden vom Live-Chat erkannt und blockiert.                                                                                                                                                                                                                          | should    |
| Streamer                         | Achievements von der App erhalten                                                                  | Um als Streamer gefördert zu werden                                               | Streamer können Meilensteine wie z. B. eine bestimmte Anzahl von Zuschauern erreichen und werden von der App belohnt. Achievements sind für Zuschauer und Streamer einsehbar und tragen dazu bei, den Streamer zu fördern.                                                            | must      |
| Zuschauer                        | Streamer abonnieren können                                                                         | Um über Aktivitäten und Live-Streams des Streamers auf dem Laufenden zu bleiben   | Zuschauer können Streamer abonnieren und erhalten Benachrichtigungen über neue Live-Streams ihrer abonnierten Streamer. Die Abonnementverwaltung ermöglicht es den Zuschauern, ihre Abonnements zu verwalten.                                                                         | must      |
| Böswilliger Benutzer (Streamer)  | Unangemessene Inhalte in Live-Streams zeigen                                                       | Um die Richtlinien der Lyve-Plattform zu brechen                                  | Zuschauer können unangemessene Streams melden, sodass das System Maßnahmen gegen den Streamer und den Stream treffen kann.                                                                                                                                                            | could     |
| Böswilliger Benutzer (Zuschauer) | Streams melden, die nicht gegen die Plattformrichtlinien verstoßen                                 | Um Unterbrechungen von Live-Streams oder die Sperrung von Streamern zu verhindern | Die Moderation von gemeldeten Streams sollte feststellen können, ob ein Stream tatsächlich unangemessen ist. Eine Gruppe von Zuschauern, die einen Stream wiederholt als unangemessen melden, sollte nicht dazu führen, dass ein Stream unterbrochen oder der Streamer gesperrt wird. | could     |
| Böswilliger Benutzer             | Viele Fake-Accounts erstellen                                                                      | Um Livestreams oder die Plattform mit Fakenutzern zu fluten                       | Erstellte Benutzerkonten sollten per E-Mail oder SMS verifiziert werden. Nur verifizierte Konten sollten auf die Plattform zugreifen können.                                                                                                                                          | should    |
| Frontend-Entwickler              | Benutzerfreundliche Oberfläche                                                                     | Um eine angenehme und intuitive Benutzererfahrung zu bieten                       | Die Benutzeroberfläche sollte klare Navigation, konsistente Designelemente und eine ansprechende visuelle Darstellung aufweisen.                                                                                                                                                      | must      |
| Frontend-Entwickler              | Optimiertes App-Design für verschiedene Bildschirmgrößen                                           | Um eine konsistente Erfahrung auf allen Geräten zu gewährleisten                  | Die UI-Elemente sollten dynamisch skalierbar sein und sich automatisch anpassen, um eine optimale Darstellung auf allen Geräten sicherzustellen.                                                                                                                                      | must      |
| Benutzer                         | Nach Profilen suchen können                                                                        | Um Profile anderer erkunden und abonnieren zu können                              | Die App verfügt über eine Suchfunktion, mit der Benutzer nach Profilen suchen können.                                                                                                                                                                                                 | should    |

## Feature Zusammenfassung

- Livestreaming
- Live Chat in Livestreams
  - Spam Detektion (optional)
- Livestreams können nach Kategorie gefiltert werden
- Benachrichtigungen/Notifications (optional)
- Zuschauer können Rewards an Streamer senden
  - Rewards müssen von den Usern mit Echtgeld gekauft werden (optional)
- Streamer erhalten Achievements für das erreichen von Meilensteinen
  - Achievements führen zu mehr Reichweite
- Streamer und Zuschauer können sich gegeneinander abonnieren
- Unangemessene Inhalte können von den Benutzern gemeldet werden (optional)
- Account Email Verification

# 3 Technische Beschreibung

## 3.1 Systemübersicht

![Untitled](../assets/system_architecture.png)

## 3.2 Softwarearchitektur

API Software Architektur

![API Software Architektur](../assets/api_software_architecture.png)

## 3.2.1 Technologieauswahl

**Autorisierung und Authentifizierung:**

- Keycloak
  - OpenID Connect
  - JWT (JSON-Web-Token) + Refresh Token Rotation

**Frontend (Mobile)**

- Programmiersprache
  - Typescript
- Frameworks:
  - React Native
  - Expo
- CSS Framework
  - NativeWind (TailwindCSS)
- Protokolle
  - REST
  - Websocket
  - WebRTC

**Backend (API)**

- Programmiersprache
  - Typescript
- Frameworks:
  - Express.js
  - Socket.io
- ORM
  - Prisma
- Protokolle
  - Websocket → LiveChat + Notifications
  - REST → API Calls (Create User)
  - AMQP → Signaling für den Media Server
- Datenformate
  - JSON

**Backend (Media Server)**

- Programmiersprache
  - Typescript
- Framework:
  - Express.js
- Library:
  - Mediasoup
- Protokolle
  - WebRTC
  - AMQP (fürs Signaling)
- Datenformate
  - JSON

**Event basierte Kommunikation**

- API → Media Server:
  - RabbitMQ

**Datenbank**

- MySQL
- Redis (Cache)

**Blob Storage**

- Minio

**DevOps**

- CI/CD
  - GitHub Actions
    - Automatische generierung der Docker Images
    - Code scanning
    - Dependabot
- Docker
- Docker Compose

## 3.3 Schnittstellen

Siehe [API Dokumentation](https://github.com/Louis3797/Lyve/blob/main/documentation/api.md)

### 3.3.1 Ereignisse

**RabbitMQ (erstmal nur gedanklich)**

- API → Media-Server
  - create-stream → Erstellt Stream Router
  - destroy-stream → Entfernt den mediasoup Router + beendet stream
  - join-as-viewer → Viewer zum Stream hinzufügen + Anfrage nach WebRTC Infos
  - remove-viewer → Viewer vom Stream entfernen
- Media-Server → API
  - you-joined-as-viewer → Sendet WebRTC Info
  - stream-created → Sendet WebRTC Info und Success

## 3.4 Datenmodell

![Bildschirmfoto 2024-04-29 um 17.05.27.png](../assets/erd.png)

## 3.5 Abläufe

Erstellung vom Livestream

![Untitled](../assets/start_stream.png)

Verbindung zum Livestream

![Untitled](../assets/join_stream.png)

- [ ] Todo Sequenzdiagram Authentifizierung
- [ ] Todo Sequenzdiagram Account erstellen
- [ ] Todo Sequenzdiagram Reward geben
- [ ] Todo Sequenzdiagram LiveChat

## 3.6 Entwurf

## 3.7 Fehlerbehandlung

Responses: Siehe [API Dokumentation](https://github.com/Louis3797/Lyve/blob/main/documentation/api.md)

## 3.8 Validierung

- Integration Tests für die API sind geplant

# 4 Projektorganisation

## 4.1 Annahmen

- App/Mobile
  - Typescript
  - React Native + Expo
  - Kommunikation mit dem Backend per:
    - REST → HTTP
    - WebRTC
    - Websocket
- Monorepo Projektaufbau (yarn Workspaces)
- IOS und Android App
- Alle Server und oder Services haben ein Docker Image
- Docker Compose wird genutzt als Entwicklungsumgebung
- Backend und Frontend sollen mit der späteren Scalability im Hinterkopf entwickelt werden

## 4.2 Verantwortlichkeit

### Rollen

| Name           | Rolle                                                                        |
| -------------- | ---------------------------------------------------------------------------- |
| Louis-Kaan Ay  | Softwarearchitekt <br/> Frontend- & Backend Entwickler <br/> DevOps Engineer |
| Jan-Niklas Rau | Frontend- & Backend Entwickler <br/>UI/UX Designer <br/>Dokumanager          |

## 4.3 Grober Projektplan

### Meilensteine

- [ ] Spezifikation abgeben 03.05

**MVP**

- [ ] MVP App Gui
  - [ ] Routing zwischen Pages
  - [ ] HomePage
    - [ ] Stream Recommendations
    - [ ] Streams der gefolgten User
  - [ ] StreamPage
    - [ ] Video des Streams wird angezeigt
    - [ ] Audio des Streams wird ausgegeben
    - [ ] Chat wird angezeigt
    - [ ] Nachrichten können gesendet werden
  - [ ] ProfilPage
    - [ ] User Info wird auf der Seite angezeigt
      - [ ] Name
      - [ ] Follower und FollowingCount
      - [ ] Bild
      - [ ] Achievements
      - [ ] Most Streamed Genre Statistik
- [ ] Authentifizierung mit AuthSession und Keycloak
  - [ ] User wird in Datenbank erstellt
  - [ ] Keycloak erstellt User
  - [ ] Keycloak authentifiziert User → Middleware im Backend
- [ ] Livestreams implementieren
  - [ ] WebRTC Verbidnung zwischen Client und Media-Server erstellen
  - [ ] Streame Media (audio,video) zwischen zwei Clients
  - [ ] Streams können mehrere Viewer beiwohnen
- [ ] LiveChat implementation
  - [ ] Mit [Socket.io](http://Socket.io) Room verbinden
  - [ ] Sende Nachrichten zwischen Clients die im selben Stream sind
  - [ ] Anzeigen der Nachrichten im Stream
- [ ] Achievement System
  - [ ] Erster Stream Achievement wird nach einen gestarteten Stream vergeben
  - [ ] Achievement wird in Profil angezeigt
- [ ] MVP vorstellung ~Ende Mai

# 5 Anhänge

### 5.1 Glossar

**Mediasoup**

mediasoup und seine client-seitigen Bibliotheken bieten eine super low level API. Sie sind dazu gedacht, verschiedene Anwendungsfälle und Szenarien zu ermöglichen, ohne irgendwelche Einschränkungen oder Annahmen. Einige dieser Anwendungsfälle sind:

- Group video chat applications.
- One-to-many (or few-to-many) broadcasting applications in real-time.
- RTP streaming.

**RTP**

Real-Time-Transport

**Peer**

Ein Peer ist eine Entität in einem WebRTC-Netzwerk, die eine Verbindung zu einem mediasoup-Router herstellt. Ein Peer kann Audio- und Videodaten produzieren und konsumieren und mit anderen Peers kommunizieren.

**Pipe**

Eine Pipe ist eine Verbindung zwischen einem Producer und einem Consumer in mediasoup. Sie ermöglicht den Transport von Audio- oder Videodaten vom Producer zum Consumer über den mediasoup-Router.

**Worker**

Ein Worker stellt einen mediasoup C++-Unterprozess dar, der auf einem einzigen CPU-Kern läuft. Ein Worker kann viele Router handhaben.

**Router**

Ein Router enthält Producer’s und Consumer’s, die Audio/Video RTP zwischen ihnen austauschen. In bestimmten Anwendungsfällen kann ein Router als "Mehrparteien-Konferenzraum" verstanden werden.

**Consumer**

Ein Consumer ist ein Endpunkt für Audio- oder Videodaten in mediasoup. Ein Consumer ist mit einem Producer verbunden und empfängt die vom Producer bereitgestellten Medienströme.

**Producer**

Ein Producer ist eine Quelle für Audio- oder Videodaten in mediasoup

**SFU (Selective Forwarding Unit)**

Eine SFU ist ein Bestandteil eines WebRTC-Netzwerks, der dazu dient, Medienströme von einem Sender an mehrere Empfänger weiterzuleiten. Anders als bei einem traditionellen Videokonferenz-Setup, bei dem alle Teilnehmer alle Medienströme empfangen, entscheidet die SFU, welche Medienströme an welche Teilnehmer gesendet werden. Dadurch kann die Bandbreitennutzung optimiert werden, insbesondere in großen Konferenzen.

**WebRTC**

WebRTC steht für "Web Real-Time Communication" und ist ein offener Standard, der es ermöglicht, Echtzeitkommunikation direkt im Webbrowser ohne Plugins oder zusätzliche Software zu realisieren. WebRTC umfasst verschiedene Technologien, darunter die Übertragung von Audio- und Videodaten sowie den Austausch von Daten (Data Channels) in Echtzeit.

**Keycloak**

Keycloak ist ein Open-Source-Softwareprodukt, das Single Sign-On mit Identitäts- und Zugriffsmanagement für moderne Anwendungen und Dienste ermöglicht

**OAuth**

OAuth 2.0 steht für „Open Authorization“ und ist ein Standard, mithilfe dessen eine Website oder Anwendung auf Ressourcen zugreifen kann, die von anderen Web-Apps für einen Nutzer gehostet werden

**OpenID Connect**

OpenID Connect oder OIDC ist ein Identitätsprotokoll, das die Autorisierungs- und Authentifizierungsmechanismen von OAuth 2.0 nutzt

**Streamer**

Ein Streamer ist ein User der Livestreams produziert

**Viewer**

Ein Viewer ist ein User der Livestreams konsumiert

### 5.2 Referenzen

- [DSGVO](https://dsgvo-gesetz.de/)
- [https://mediasoup.org/](https://mediasoup.org/)
- [https://www.keycloak.org/](https://www.keycloak.org/)
- [https://auth0.com/de/intro-to-iam/what-is-oauth-2](https://auth0.com/de/intro-to-iam/what-is-oauth-2)
- [https://www.prisma.io/](https://www.prisma.io/)
- [https://expo.dev/](https://expo.dev/)
- [https://www.rabbitmq.com/](https://www.rabbitmq.com/)
- [https://www.typescriptlang.org/](https://www.typescriptlang.org/)
- [https://expressjs.com/de/](https://expressjs.com/de/)
- [https://react.dev/](https://react.dev/)
- [https://tailwindcss.com/](https://tailwindcss.com/)
- [https://socket.io/](https://socket.io/)
- [https://webrtc.org/?hl=de](https://webrtc.org/?hl=de)
- [https://reactnative.dev/](https://reactnative.dev/)
- [https://min.io/](https://min.io/)

### 5.3 Index
