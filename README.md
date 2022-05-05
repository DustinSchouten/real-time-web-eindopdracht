# Real time web

## De drie concepten
Om alvast wat inspiratie te krijgen, heb ik onderzoek gedaan naar de verschillende beschikbare API's. Op basis daarvan heb ik drie verschillende ideeën globaal geschetst en beschreven.

### Concept 1: Football quiz app
Het eerste idee is een quiz app met vragen over voetbal. Het idee is dat twee spelers het tegen elkaar opnemen om te zien wie de meeste kennis over voetbal heeft. Hierbij kunnen verschillende vragen gesteld worden als "Welke speler komt uit (een land)?", "Hoeveel doelpunten heeft (speler X) dit seizoen gemaakt?".
![](projectbeschrijving_images/c1_football_quiz_app.png)

### Concept 2: Rijksmuseum quiz app
Het tweede idee lijkt sterk op het idee van de voetbalquiz. Het verschil is dat hier bij iedere vraag een schilderij wordt getoond en dat de speers moeten raden welke schilder hierbij hoort.
![](projectbeschrijving_images/c2_rijksmuseum_quiz_app.png)

### Concept 3: Weather app
Het derde idee is een weer app waarbij de gebruiker realtime data ontvangt van de huidige weersomstandigheden in een zelfgekozen stad.
![](projectbeschrijving_images/c3_weather_app.png)

## Het gekozen concept
Het concept dat ik ga uitwerken is de voetbal quiz app. Nog voordat ik ben begonnen met ontwikkelen, heb ik eerst mijn ideeën wat verder uitgewerkt. Ik heb eerst een aantal schermen geschetst om te laten zien hoe de app er uiteindelijk uit moet zien. Hieronder leg ik de schermen uit:

### De schermen
Omdat je in mijn potentiële app met z'n tweeën tegen elkaar speelt, heb ik bedacht dat je in socket.io rooms kan maken door de ene speler een gegenereerde code (het room id) aan de andere speler te geven, zodat deze twee spelers in dezelfde room zitten.
![](projectbeschrijving_images/welke_speler.png)
![](projectbeschrijving_images/spelers_connecten.png)

Het spel zelf heeft als idee dat je een aantal vragen krijgt die op basis van de data uit de API worden gegenereerd. Een speler krijgt bij het beantwoorden van een vraag meteen te zien of hij/zij de vraag goed of fout heeft beantword. Wanneer beide spelers de vraag hebben beantwoord (ongeacht goed of fout), gaat de app door naar de volgende vraag. Als alle vragen voorbij zijn, gaat de app over naar een resultatenscherm waarin te zien is wie de meeste vragen goed heeft beantwoord.
![](projectbeschrijving_images/game_en_resultaten.png)

### Het datamodel
Hieronder heb ik geprobeerd om schematisch weer te geven welke data er in de app gebruikt wordt en hoe deze data zich tot elkaar verhoudt. Dit betreft zowel API-data als data die gebruikt wordt om namen en scores op te slaan. Zie het datamodel hieronder:
DATAMODEL

### Het data lifecycle diagram
Hieronder heb ik geprobeerd om de datastroom tussen de clients, de server en de API te visualiseren. Dit model heb ik ontworpen op het moment dat ik mijn project nog niet afgerond heb.
Bij de quiz app is het zoals gezegd de bedoeling dat twee spelers tegen elkaar spelen. Deze twee spelers geven elkaar een gegenereerde room code door, voordat het spel daadwerkelijk begint. Tijdens het geven en ontvangen van de room code hebben de twee spelers verschillende handelingen, terwijl tijdens het spel zelf de handelingen van de twee spelers (clients) precies gelijk zijn. Daarom heb ik ervoor gekozen om twee aparte diagrammen te ontwerpen die op elkaar aansluiten. Zie het diagram hieronder:
![](projectbeschrijving_images/data_lifecycle_diagram.png)

## Bronnen
- https://www.football-data.org/documentation/quickstart
- https://docs.google.com/spreadsheets/d/1YKMTvdWVbzJ-CXDCHBEH2n3KofcQTN7EerTOEXy9MHI/edit#gid=0
- https://app.diagrams.net/
- https://www.subpng.com/png-tzm7b4/