
/*
HELPERS
*/
function inArray(needle, haystack) {
    var length = haystack.length;
    for(var i = 0; i < length; i++) {
        if(haystack[i] == needle) return true;
    }
    return false;
}

/*
GAME MECHANICS
*/

function initDeck() {

  let deck = [];

  let infantaria = { ...card };
  infantaria.name = "Infantaria";
  infantaria.points = 2;
  infantaria.description = "Sem efeito";
  deck.push(infantaria, infantaria, infantaria, infantaria, infantaria, infantaria);

  let arqueiros = { ...card }
  arqueiros.name = "Arqueiros";
  arqueiros.points = 2;
  arqueiros.description = "Se não houver arqueiros ou catapultas na linha de batalha inimiga, ganhe um ponto de bônus";
  arqueiros.effectTiming = "beforeBattle";
  arqueiros.effectCallback = function(enemyBattlefield){
    if (!inArray("Arqueiros", enemyBattlefield.cards) && !inArray("Catapultas", enemyBattlefield.cards)){
      yourBattlefield.bonusPoints++;
    }
  };
  deck.push(arqueiros,arqueiros,arqueiros,arqueiros);

  let cavalaria = { ...card } 
  cavalaria.name = "Cavalaria";
  cavalaria.points = 3;
  cavalaria.description = "Sem efeito";
  deck.push(cavalaria,cavalaria,cavalaria);

  let catapultas = { ...card };
  catapultas.name = "Catapultas";
  catapultas.points = 3;
  catapultas.description = "Se não houver catapultas na linha de batalha inimiga, ganhe um ponto de bônus";
  catapultas.effectTiming = "beforeBattle";
  catapultas.effectCallback = function(enemyBattlefield){
    if (!inArray("Catapultas", enemyBattlefield)){
      yourBattlefield.totalPoints++;
    }
  };
  deck.push(catapultas, catapultas);

  let sabotadores = { ...card };
  sabotadores.name = "Sabotadores";
  sabotadores.points = -1;
  deck.push(sabotadores,sabotadores,sabotadores,sabotadores);

  let desastre = { ...card };
  desastre.name = "Desastre";
  desastre.points = 0;
  desastre.description = "Todas as cartas no campo de batalha são descartadas e ambas fortalezas sofrem 1 dano.";
  catapultas.effectTiming = "beforeBattle";
  catapultas.effectCallback = function(enemyBattlefield){
    yourDamage++;
    enemyDamage++;
  };
  deck.push(catapultas, catapultas);
  return deck;

  

}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function resolveBattle(yourBattlefield, enemyBattlefield){
  for (thisCard of yourBattlefield.cards) {
    console.log(thisCard);
    if (thisCard.effectTiming == "beforeBattle"){
      thisCard.effectCallback(enemyBattlefield);
    }
  }
}


/* 
GAME COMPONENTS
*/

var card = {
  name : "",
  points: 0,
  description : "",
  effectTiming : "",
  effectCallback : function() { return false; }
}

var battlefield = {
  cards : [],
  totalPoints: 0,
  bonusPoints: 0,
  calcTotal: function() {
    for (let i=0; i<this.cards.length; i++){
      console.log("teste");
      console.log(this.cards[i].points);
      this.totalPoints = this.totalPoints + this.cards[i].points;
    } 
    this.totalPoints = this.totalPoints + this.bonusPoints;
    if (this.totalPoints < 0) {
      this.totalPoints = 0;
    }
  }
}

var yourDeck = shuffle(initDeck());
var yourHand = [yourDeck.pop(), yourDeck.pop(), yourDeck.pop()]
var yourBattlefield = { ...battlefield };
var yourDamage = 0;
var yourDiscardPile = [];

var enemyDeck = shuffle(initDeck());
var enemyHand = [enemyDeck.pop(), enemyDeck.pop(), enemyDeck.pop()]
var yourBattlefield = { ...battlefield };
var enemyDamage = 0;
var enemyDiscardPile = [];
