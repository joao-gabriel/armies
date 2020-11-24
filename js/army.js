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

  // 6 Infantarias
  let infantaria = { ...card };
  infantaria.name = "Infantaria";
  infantaria.points = 2;
  infantaria.description = "Sem efeito especial";
  infantaria.image = "infantaria.png";
  deck.push(infantaria, infantaria, infantaria, infantaria, infantaria, infantaria);

  // 4 Arqueiros
  let arqueiros = { ...card }
  arqueiros.name = "Arqueiros";
  arqueiros.points = 2;
  arqueiros.description = "Se não houver arqueiros ou catapultas na linha de batalha inimiga, ganhe um ponto de bônus";
  arqueiros.image = "arqueiros.png";  
  arqueiros.effectTiming = "beforeBattle";
  arqueiros.effectCallback = function(affectedBattlefield, otherBattlefield){
    for (let thisCard of otherBattlefield.cards) {
      if (thisCard.name == "Arqueiros" || thisCard.name == "Catapultas") {
        return false;
      }
    }
    affectedBattlefield.bonusPoints++;
    return true;
  };
  deck.push(arqueiros,arqueiros,arqueiros,arqueiros);

  // 3 Cavalarias
  let cavalaria = { ...card } 
  cavalaria.name = "Cavalaria";
  cavalaria.points = 3;
  cavalaria.description = "Sem efeito especial";
  cavalaria.image = "cavalaria.png";
  deck.push(cavalaria,cavalaria,cavalaria);

  // 2 Construtores
  let contrutores = { ...card };
  contrutores.name = "Construtores";
  contrutores.points = 1;
  contrutores.description = "Em caso de vitória, Recupera 1 ponto de dano da sua fortaleza.";
  contrutores.image = "construtores.png";
  contrutores.effectTiming = "afterVictory";
  contrutores.effectCallback = function(affectedBattlefield) {
    if (yourDamage > 1) {
      yourDamage--;
      return true;
    }
    return false;
  };
  deck.push(contrutores, contrutores);

  // 2 Catapultas
  let catapultas = { ...card };
  catapultas.name = "Catapultas";
  catapultas.points = 3;
  catapultas.description = "Se não houver catapultas na linha de batalha inimiga, ganhe um ponto de bônus";
  catapultas.image = "catapultas.png";    
  catapultas.effectTiming = "beforeBattle";
  catapultas.effectCallback = function(affectedBattlefield, otherBattlefield){
    if (otherBattlefield.cards[0].name != "Catapultas" && otherBattlefield.cards[1].name != "Catapultas" ){
      affectedBattlefield.bonusPoints++;
      return true;
    }
    return false;
  };
  deck.push(catapultas, catapultas);

  // 4 Sabotadores
  let sabotadores = { ...card };
  sabotadores.name = "Sabotadores";
  sabotadores.description = "Sem efeito especial";  
  sabotadores.image = "sabotadores.png";
  sabotadores.points = -1;
  deck.push(sabotadores,sabotadores,sabotadores,sabotadores);

  // 1 Clérigo
  let clerigo = { ...card };
  clerigo.name = "Clérigo";
  clerigo.points = 1;
  clerigo.description = "Em caso de vitória, recupera a última carta descartada de Infantaria, Arqueiros, Cavalaria ou Construtores.";
  clerigo.image = "clerigo.png";  
  clerigo.effectTiming = "afterVictory";
  clerigo.effectCallback = function(enemyBattlefield) {
    for (thisCard of yourDiscardPile){
      if (
          thisCard.name == "Infantaria" || 
          thisCard.name == "Arqueiros" ||
          thisCard.name == "Cavalaria" || 
          thisCard.name == "Construtores") {
          yourDeck.push(thisCard);
          return true;
      }
    }
    return false;
  };
  deck.push(clerigo);

  // 1 Desastre
/* TODO: fazer com que nenhuma outra carta seja contabilizada nesse turno */
  let desastre = { ...card };
  desastre.name = "Desastre";
  desastre.points = 0;
  desastre.description = "Todas as cartas no campo de batalha são descartadas e ambas fortalezas sofrem 1 dano.";
  desastre.image = "desastre.png";
  desastre.effectTiming = "beforeBattle";
  desastre.effectCallback = function(enemyBattlefield){
    enemyBattlefield.cards[0].points = 0;
    enemyBattlefield.cards[1].points = 0;
    yourBattlefield.cards[0].points = 0;
    yourBattlefield.cards[1].points = 0;
    
    yourDamage++;
    enemyDamage++;
  };
//  deck.push(desastre);  

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
  let yourAfterVictoryEffects = [];
  let enemyAfterVictoryEffects = [];

  for (let thisCard of yourBattlefield.cards) {
    if (thisCard.effectTiming == "beforeBattle"){
      thisCard.effectCallback(yourBattlefield, enemyBattlefield);
    }
    if (thisCard.effectTiming == "afterVictory"){
      yourAfterVictoryEffects.push(thisCard.effectCallback);
    }
  }

  for (let thisCard of enemyBattlefield.cards) {
    if (thisCard.effectTiming == "beforeBattle"){
      thisCard.effectCallback(enemyBattlefield, yourBattlefield);
    }
    if (thisCard.effectTiming == "afterVictory"){
      enemyAfterVictoryEffects.push(thisCard.effectCallback);
    }
  }

  yourBattlefield.calcTotal();
  enemyBattlefield.calcTotal();

  if (yourBattlefield.totalPoints > enemyBattlefield.totalPoints) {
    enemyDamage = enemyDamage + (yourBattlefield.totalPoints - enemyBattlefield.totalPoints);
    for (thisAfterVictoryEffect of yourAfterVictoryEffects) {
      thisAfterVictoryEffect(enemyBattlefield);
    }
  }else if (yourBattlefield.totalPoints < enemyBattlefield.totalPoints) {
    yourDamage = yourDamage + (enemyBattlefield.totalPoints - yourBattlefield.totalPoints);
    for (thisAfterVictoryEffect of enemyAfterVictoryEffects) {
      thisAfterVictoryEffect(yourBattlefield);
    }
  }

  for (let thisCard of yourBattlefield.cards) {
    yourDiscardPile.push(thisCard);
    setCard(thisCard, $('.discarded-top-card'), 0);
  }

  for (let thisCard of enemyBattlefield.cards) {
    enemyDiscardPile.push(thisCard);
  }

}

function newTurn() {
  // TODO: check if decks are over
  yourBattlefield = { ...battlefield };
  enemyBattlefield = { ...battlefield };
  // TODO: populate hands inside a loop to make it possible to fill hands with less than 3 cards
  yourHand = [yourDeck.pop(), yourDeck.pop(), yourDeck.pop()];
  enemyHand = [enemyDeck.pop(), enemyDeck.pop(), enemyDeck.pop()];
  
  $.each(yourHand, function(i, item) {
    let thisCardDiv = $('.your-hand > div:nth-child('+(i+1)+') .game-card.in-hand');
    setCard(item, thisCardDiv, i);
  });

  $('.remaining-cards').text(yourDeck.length);
  $('.your-damage').text(yourDamage);
  $('.enemy-damage').text(enemyDamage);
  $('.discarded-cards').text(yourDiscardPile.length);
}

function chooseYourCard(cardIndex){
  yourDeck.push(yourHand[cardIndex]);
  yourHand.splice(cardIndex, 1);
  yourBattlefield.cards = yourHand;
  yourHand = [];
}

function chooseEnemyCard(cardIndex){
  enemyDeck.push(enemyHand[cardIndex]);
  enemyHand.splice(cardIndex, 1);
  enemyBattlefield.cards = enemyHand;
  enemyHand = [];
}

/* 
GAME COMPONENTS
*/
var card = {
  name : "",
  points: 0,
  description : "",
  image: "",
  effectTiming : "", // beforeBattle, afterVictory
  effectCallback : function() { return false; }
}

var battlefield = {
  cards : [],
  totalPoints: 0,
  bonusPoints: 0,
  calcTotal: function() {
    for (let i=0; i<this.cards.length; i++){
      this.totalPoints = (this.totalPoints + this.cards[i].points);
    } 
    this.totalPoints = (this.totalPoints + this.bonusPoints);
    if (this.totalPoints < 0) {
      this.totalPoints = 0;
    }
  }
}

var yourDeck = shuffle(initDeck());
var yourHand;
var yourBattlefield;
var yourDamage = 0;
var yourDiscardPile = [];

var enemyDeck = shuffle(initDeck());
var enemyHand
var enemyBattlefield 
var enemyDamage = 0;
var enemyDiscardPile = [];

newTurn();

function setCard(card, element, index) {
  element.find('.name').text(card.name);
  element.find('img').attr('src', 'img/'+card.image);
  element.find('.description').text(card.description);
  element.find('.points').text(card.points>0 ? '+'+card.points:card.points);
  element.attr('data-index', index);
}

$('.game-card.in-hand').click(function(e){
  chooseYourCard($(this).data('index'));
  chooseEnemyCard(Math.floor(Math.random() * 3));
  resolveBattle(yourBattlefield, enemyBattlefield);

  console.log(enemyBattlefield);
  let enemyCardDiv = $('.enemyBattlefield .battle-card');
  setCard(enemyBattlefield.cards[0], $(enemyCardDiv[0]), 0);
  setCard(enemyBattlefield.cards[1], $(enemyCardDiv[1]), 1);
  $('.enemyPoints').text(enemyBattlefield.totalPoints);

  let yourCardDiv = $('.yourBattlefield .battle-card');
  setCard(yourBattlefield.cards[0], $(yourCardDiv[0]), 0);
  setCard(yourBattlefield.cards[1], $(yourCardDiv[1]), 1);
  $('.yourPoints').text(yourBattlefield.totalPoints);
  
  $('#myModal').modal('show');
  newTurn();
});
