// !! DIT SPEL WERKT NIET OP SCHOOL(WIFI)!!

// Wij hebben het spel overloper gemaakt aan de hand van de eisen. We hebben 2 extra features bedacht en toegevoegd. 

//De 1ste feature is dat we geluidjes hebben toegevoegd. De 2de feature is dat je kan teleporteren van bovenrand naar benedenrand en andersom.

//var en const door elkaar. We hebben const er tussengezet, omdat we buggs kregen met var.

var levens = 3; // Aantal levens van de speler
const CANVAS_WIDTH = 900; // Breedte van het canvas
const CANVAS_HEIGHT = 600; // Hoogte van het canvas
const FRAME_RATE = 10; // Snelheid van frames per seconde
const XPOSITIE = 400 // xPositie van bommen
const MIN_POSITIE_X = 1; // Minimale X positie van raster
const MIN_POSITIE_Y = 1; // Minimale Y positie van raster
const MAX_POSITIE_X = 17; // Maximale X positie van raster
const MAX_POSITIE_Y = 11; // Maximale Y positie van raster
const BOMB_SNELHEID = 0.5; // Snelheid van bommen
const TEXT_GROOTTE = 90; // Grootte van tekst
const FRAME_NUMBER = 3; // Frame nummer voor animatie

class Raster {
  constructor(r, k) {
    this.aantalRijen = r; // Aantal rijen
    this.aantalKolommen = k; // Aantal kolommen
    this.celGrootte = null; // Grootte van een cel in het raster
  }

  berekenCelGrootte() {
    this.celGrootte = canvas.width / this.aantalKolommen; // Berekent de celgrootte op basis van het canvas
  }

  teken() {
    push();
    stroke('grey'); // Stelt de kleur van de lijnen in
    for (var rij = 0; rij < this.aantalRijen; rij++) { // Loopt door de rijen
      for (var kolom = 0; kolom < this.aantalKolommen; kolom++) { // Loopt door de kolommen
        if (kolom == this.aantalKolommen - 1 || rij == this.aantalRijen - 1) { // Kleurt de buitenste rand oranje
          fill('orange')
        } else {
          noFill() // Geen vulling voor overige cellen
        }
        rect(kolom * this.celGrootte, rij * this.celGrootte, this.celGrootte, this.celGrootte); // Tekent de cel
      }
    }
    pop();
  }
};

var rodeAppel = {
  x: null, // X-positie van rode appel
  y: null, // Y-positie van rode appel
  toon() {
    image(rodeAppelImage, this.x, this.y, raster.celGrootte, raster.celGrootte); // Toont de rode appel op het canvas
  }
};

var groeneAppel = {
  x: null, // X-positie van groene appel
  y: null, // Y-positie van groene appel
  snelheidX: 30, // Snelheid in de X richting
  snelheidY: 30, // Snelheid in de Y richting
  demping: 1.0, // Demping om snelheid te verminderen bij botsing

  beweeg() {
    this.x += this.snelheidX; // beweegt de groene appel horizontaal
    this.y += this.snelheidY; // beweegt de groene appel verticaal

    if (this.x <= 0 || this.x >= canvas.width - raster.celGrootte) { // Als botsing met zijden
      this.snelheidX *= -this.demping; // Keert richting om en past demping toe
    }

    if (this.y <= 0 || this.y >= canvas.height - raster.celGrootte) { // Als botsing met boven- en onderkant
      this.snelheidY *= -this.demping; // Keert richting om en past demping toe
    }
  },

  toon() {
    image(groeneAppelImage, this.x, this.y, raster.celGrootte, raster.celGrootte); // Toont de groene appel
  }
};

class Bom {
  constructor(XPOSITIE) {
    this.snelheidY = floor(random(0, raster.celGrootte * BOMB_SNELHEID)); // Willekeurige snelheid in de Y-richting
    this.stapGrootte = raster.celGrootte; // Stapgrootte in pixels
    this.x = XPOSITIE; // X-positie van de bom
    this.y = floor(random(MIN_POSITIE_Y, MAX_POSITIE_Y)) * raster.celGrootte; // Willekeurige Y-positie
  }

  beweeg() {
    this.y += this.snelheidY; // Verplaatst de bom verticaal

    if (this.y <= 0 || this.y >= canvas.height - raster.celGrootte) { // Botsing met boven- en onderkant
      this.snelheidY *= -1; // Keert de richting om
    }
  }

  toon() {
    image(bomImage, this.x, this.y, raster.celGrootte, raster.celGrootte); // Toont de bom
  }
}

var bommenArray = []; // Array om bommen op te slaan
var gebruikteKolommen = []; // Array om gebruikte kolommen bij te houden

function toonEindScherm(gewonnen) {
  if (gewonnen) {
    background('green'); // Achtergrond groen als gewonnen
    fill('white');
    push();
    textAlign(CENTER);
    textSize(45);
    text("Je hebt gewonnen!", CANVAS_WIDTH/2, CANVAS_HEIGHT/2); // Tekst als speler wint
    pop();
    
  } else {
    background('red'); // Achtergrond rood als verloren
    fill('white');
    push();
    textAlign(CENTER);
    textSize(45);
    text("Helaas, je hebt verloren", CANVAS_WIDTH/2, CANVAS_HEIGHT/2); // Tekst als speler verliest
    pop();
  }
  noLoop(); // Stopt de tekenloop
}

class Jos {
  constructor() {
    this.spawn(); // Spelerpositie initialiseren
    this.animatie = []; // Array voor animatieframes
    this.frameNummer = FRAME_NUMBER; // Initieert het frame voor animatie
    this.stapGrootte = null; // Verplaatsing in pixels per stap
    this.gehaald = false; // Variabele om te zien of speler de finish bereikt heeft
  }

  spawn() {
    this.x = raster.celGrootte * 0; // Beginpositie x
    this.y = raster.celGrootte * 5; // Beginpositie y
  }

  wordtGeraaktGroeneAppel() {
    if (this.x >= groeneAppel.x && this.x < groeneAppel.x + raster.celGrootte &&
      this.y >= groeneAppel.y && this.y < groeneAppel.y + raster.celGrootte) {
      levens++; // Verhoogt levens bij aanraking met groene appel
      return true;
    }
  }

  wordtGeraaktRodeAppel() {
    if (this.x >= rodeAppel.x && this.x < rodeAppel.x + raster.celGrootte &&
      this.y >= rodeAppel.y && this.y < rodeAppel.y + raster.celGrootte) {
      levens++; // Verhoogt levens bij aanraking met rode appel
      return true;
    } else {
      return false;
    }
  }

  beweeg() {
    if (keyIsDown(65)) { // Beweging naar links
      this.x -= this.stapGrootte;
      this.frameNummer = 2;
    }
    if (keyIsDown(68)) { // Beweging naar rechts
      this.x += this.stapGrootte;
      this.frameNummer = 1;
    }
    if (keyIsDown(87)) { // Beweging naar boven
      this.y -= this.stapGrootte;
      this.frameNummer = 4;
    }
    if (keyIsDown(83)) { // Beweging naar beneden
      this.y += this.stapGrootte;
      this.frameNummer = 5;
    }

    if (this.y >= canvas.height) { // Teleporteert bovenaan als onderzijde canvas bereikt
      this.y = 0;
    }

    if (this.y < 0) { // Teleporteert onderaan als bovenkant canvas bereikt
      this.y = canvas.height - raster.celGrootte;
    }

    this.x = constrain(this.x, 0, canvas.width); // Begrenst de x-positie binnen het canvas
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte); // Begrenst de y-positie

    if (this.x == canvas.width) { // Markeert de speler als 'gehaald' bij het bereiken van de rechterkant
      this.gehaald = true;
    }
  }
  
  wordtGeraakt(vijand) { // Controleert botsing met vijand
    if (this.x >= vijand.x && this.x < vijand.x + raster.celGrootte &&
      this.y >= vijand.y && this.y < vijand.y + raster.celGrootte) {
      levens--; // Vermindert levens bij botsing
      return true;
    } else {
      return false;
    }
  }

  toon() {
    image(this.animatie[this.frameNummer], this.x, this.y, raster.celGrootte, raster.celGrootte); // Toont het huidige animatieframe
  }
};


// Definieert de Vijand klasse, met willekeurige beweging en sprite
class Vijand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = null; // Sprite van vijand, ingeladen in setup
    this.stapGrootte = null; // Verplaatsing per stap
  }

  // Willekeurige beweging binnen een bereik van -1 tot 1 stapgrootte
  beweeg() {
    this.x += floor(random(-1, 2)) * this.stapGrootte;
    this.y += floor(random(-1, 2)) * this.stapGrootte;

    // Zorgt ervoor dat de vijand binnen het canvas blijft
    this.x = constrain(this.x, 0, canvas.width - raster.celGrootte);
    this.y = constrain(this.y, 0, canvas.height - raster.celGrootte);
  }

  // Toont de vijandensprite op de huidige positie
  toon() {
    image(this.sprite, this.x, this.y, raster.celGrootte, raster.celGrootte);
  }
}

// Geluidsinstellingen voor verschillende acties en evenementen in het spel
var bomSound = new Howl({ src: ['audio/bomSound.mp3'] });
var aliceSound = new Howl({ src: ['audio/diabolisches-lachen-252777.mp3'], volume: 1.0 });
var winSound = new Howl({ src: ['audio/winSound.wav'] });
var verliesSound = new Howl({ src: ['audio/verliesSound.mp3'], volume: 1.0 });
var eetSound = new Howl({ src: ['audio/eetSound.mp3'], volume: 1.0 });

// Preload functie om afbeeldingen in te laden voordat het spel begint
function preload() {
  brug = loadImage("images/backgrounds/dame_op_brug_1800.jpg");
  groeneAppelImage = loadImage("images/sprites/appel_1.png");
  rodeAppelImage = loadImage("images/sprites/appel_2.png");
  bomImage = loadImage("images/sprites/bom.png");
  backgroundExtra2 = loadImage("images/backgrounds/dutchFlag.PNG");
  backgroundMain = loadImage("images/backgrounds/basketball.JPEG");
}

// Toont en beweegt appels, aangeroepen in draw
function toonEnBeweegAppelen() {
  rodeAppel.toon();
  groeneAppel.toon();
  groeneAppel.beweeg();
}

// Beweegt en toont vijanden, aangeroepen in draw
function beweegEnToonVijanden() {
  bob.beweeg();
  alice.beweeg();
  bob.toon();
  alice.toon();
}

// Setup functie om het canvas en spelobjecten te initialiseren
function setup() {
  canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(FRAME_RATE);
  textFont("Verdana");
  textSize(TEXT_GROOTTE);

  raster = new Raster(12, 18);
  raster.berekenCelGrootte();

  // Positioneert de rode en groene appel willekeurig binnen het raster
  rodeAppel.x = floor(random(MIN_POSITIE_X, raster.aantalKolommen)) * raster.celGrootte;
  rodeAppel.y = floor(random(MIN_POSITIE_Y, raster.aantalRijen)) * raster.celGrootte;
  groeneAppel.x = floor(random(MIN_POSITIE_X, MAX_POSITIE_X)) * raster.celGrootte;
  groeneAppel.y = floor(random(MIN_POSITIE_Y, MAX_POSITIE_Y)) * raster.celGrootte;

  // Plaatst bommen op willekeurige kolommen die nog niet zijn gebruikt
  for (var b = 0; b < 5; b++) {
    var nieuweKolom;
    do {
      nieuweKolom = floor(random(0.5 * raster.aantalKolommen, MAX_POSITIE_X));
    } while (gebruikteKolommen.includes(nieuweKolom));

    gebruikteKolommen.push(nieuweKolom);
    bommenArray.push(new Bom(nieuweKolom * raster.celGrootte, 0));
  }

  // Initialiseert speler "eve" met animatie frames
  eve = new Jos();
  eve.stapGrootte = 1 * raster.celGrootte;
  for (var b = 0; b < 6; b++) {
    var frameEve = loadImage("images/sprites/Eve100px/Eve_" + b + ".png");
    eve.animatie.push(frameEve);
  }

  // Maakt vijanden Alice en Bob met hun sprites
  alice = new Vijand(700, 200);
  alice.stapGrootte = 0.5 * eve.stapGrootte;
  alice.sprite = loadImage("images/sprites/Alice100px/Alice.png");

  bob = new Vijand(600, 400);
  bob.stapGrootte = 1 * eve.stapGrootte;
  bob.sprite = loadImage("images/sprites/Bob100px/Bob.png");
}

// De hoofd-tekenfunctie die elk frame uitvoert
function draw() {
  background(backgroundMain);
  fill('snow');
  textSize(20);
  raster.teken();
  text("Aantal Levens: " + levens + " ; Win door het rechterrand te passeren!", raster.celGrootte * 0.5, raster.celGrootte * 0.5);
  

  // Wisselt achtergrond bij muispositie
  if (mouseX >= canvas.width - raster.celGrootte && mouseX <= canvas.width) {
    background(backgroundExtra2);
    raster.teken();
    text("Aantal Levens: " + levens, raster.celGrootte * 0.5, raster.celGrootte * 0.5);
  }

  if (mouseY >= canvas.height - raster.celGrootte && mouseY <= canvas.height) {
    background(backgroundExtra2);
    raster.teken();
    text("Aantal Levens: " + levens, raster.celGrootte * 0.5, raster.celGrootte * 0.5);
  }

  // Beweegt en toont bommen
  for (var b = 0; b < bommenArray.length; b++) {
    bommenArray[b].beweeg();
    bommenArray[b].toon();
  }

  toonEnBeweegAppelen();
  beweegEnToonVijanden();

  eve.beweeg();
  eve.toon();

  // Controleert botsingen van "eve" met objecten en speelt geluiden af
  if (eve.wordtGeraaktRodeAppel(rodeAppel)) {
    rodeAppel.y = -raster.celGrootte * 2;
    eetSound.play();
  }

  if (eve.wordtGeraaktGroeneAppel(groeneAppel)) {
    groeneAppel.x = -raster.celGrootte * 2;
    eetSound.play();
  }

  if (eve.wordtGeraakt(alice)) {
    aliceSound.play();
    eve.spawn();
  }

  if (bommenArray.some(bom => eve.wordtGeraakt(bom))) {
    bomSound.play();
    eve.spawn();
  }

  // Eindigt het spel bij 0 levens of bij behalen van het doel
  if (levens <= 0) {
    toonEindScherm(false);
    verliesSound.play();
  }

  if (eve.gehaald) {
    toonEindScherm(true);
    winSound.play();
  }
}
