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

function setCard(card, element, index) {
  element.find('.name').text(card.name);
  element.find('img').attr('src', 'img/'+card.image);
  element.find('.description').text(card.description);
  element.find('.points').text(card.points>0 ? '+'+card.points:card.points);
  element.attr('data-index', index);
}

function setMessage(){

  let message = '';
  if (you.battlefield.wonBattle) {
    message = 'Você ganhou causando ';
    message += (you.battlefield.totalPoints - enemy.battlefield.totalPoints).toString();
    message += ' ponto(s) de dano'; 
  }else if (enemy.battlefield.wonBattle) {
    message = 'O inimigo ganhou causando ';
    message += (enemy.battlefield.totalPoints - you.battlefield.totalPoints).toString();
    message += ' ponto(s) de dano';
  }else{
    message = 'Empate';
  }
  
  message += you.battlefield.feedbackMessage;
  message += enemy.battlefield.feedbackMessage;
  message += "!";

  return message;
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
  for (let i = 0; i<12; i++){
    deck.push(infantaria);
  }

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
  for (let i = 0; i<8; i++){
    deck.push(arqueiros);
  }

  // 3 Cavalarias
  let cavalaria = { ...card } 
  cavalaria.name = "Cavalaria";
  cavalaria.points = 3;
  cavalaria.description = "Sem efeito especial";
  cavalaria.image = "cavalaria.png";
  for (let i = 0; i<6; i++){
    deck.push(cavalaria);
  }

  // 2 Construtores
  let construtores = { ...card };
  construtores.name = "Construtores";
  construtores.points = 1;
  construtores.description = "Em caso de vitória, Recupera 1 ponto de dano da sua fortaleza.";
  construtores.image = "construtores.png";
  construtores.effectTiming = "afterVictory";
  construtores.effectCallback = function(affectedBattlefield) {
    if (you.damage > 1) {
      you.damage--;
          affectedBattlefield.feedbackMessage = " e recuperou 1 ponto de dano";
      return true;
    }
    return false;
  };
  for (let i = 0; i<4; i++){
    deck.push(construtores);
  }

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
  for (let i = 0; i<4; i++){
    deck.push(catapultas);
  }

  // 4 Sabotadores
  let sabotadores = { ...card };
  sabotadores.name = "Sabotadores";
  sabotadores.description = "Sem efeito especial";  
  sabotadores.image = "sabotadores.png";
  sabotadores.points = -1;
  for (let i = 0; i<8; i++){
    deck.push(sabotadores);
  }

  // 1 Clérigo
  let clerigo = { ...card };
  clerigo.name = "Clérigo";
  clerigo.points = 1;
  clerigo.description = "Em caso de vitória, recupera a última carta descartada de Infantaria, Arqueiros, Cavalaria ou Construtores.";
  clerigo.image = "clerigo.png";  
  clerigo.effectTiming = "afterVictory";
  clerigo.effectCallback = function(affectedBattlefield) {
    for (thisCard of you.discardPile){
      if (
          thisCard.name == "Infantaria" || 
          thisCard.name == "Arqueiros" ||
          thisCard.name == "Cavalaria" || 
          thisCard.name == "Construtores") {
          you.deck.push(thisCard);
          // TODO: Retirar essa carta da pilha de descartes
          affectedBattlefield.feedbackMessage = " e recuperou "+thisCard.name;
          return true;
      }
    }
    return false;
  };
  for (let i = 0; i<6; i++){
    deck.push(clerigo);
  }

  // 1 Desastre
/* TODO: fazer com que nenhuma outra carta seja contabilizada nesse turno */
  let desastre = { ...card };
  desastre.name = "Desastre";
  desastre.points = 0;
  desastre.description = "Todas as cartas no campo de batalha são descartadas e ambas fortalezas sofrem 1 dano.";
  desastre.image = "desastre.png";
  desastre.effectTiming = "beforeBattle";
  desastre.effectCallback = function(affectedBattlefield, otherBattlefield){
    affectedBattlefield.cards[0].points = 0;
    affectedBattlefield.cards[1].points = 0;
    otherBattlefield.cards[0].points = 0;
    otherBattlefield.cards[1].points = 0;
    you.damage++;
    enemy.damage++;
    return true;
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

function resolveBattle(){
  
  let afterVictoryEffects = [];
  for (let thisCard of you.battlefield.cards) {
    if (thisCard.effectTiming == "beforeBattle") {
      thisCard.effectCallback(you.battlefield, enemy.battlefield);
    }
    if (thisCard.effectTiming == "afterVictory") {
      afterVictoryEffects.push(thisCard.effectCallback);
    }
  }
  you.battlefield.afterVictoryEffects = afterVictoryEffects;
  you.battlefield.calcTotal();

  afterVictoryEffects = [];
  for (let thisCard of enemy.battlefield.cards) {
    if (thisCard.effectTiming == "beforeBattle") {
      thisCard.effectCallback(enemy.battlefield, you.battlefield);
    }
    if (thisCard.effectTiming == "afterVictory") {
      afterVictoryEffects.push(thisCard.effectCallback);
    }
  }
  enemy.battlefield.afterVictoryEffects = afterVictoryEffects;
  enemy.battlefield.calcTotal();

  if (you.battlefield.totalPoints > enemy.battlefield.totalPoints) {
    you.battlefield.wonBattle = true;
    enemy.damage = enemy.damage + (you.battlefield.totalPoints - enemy.battlefield.totalPoints);
    for (thisAfterVictoryEffect of you.battlefield.afterVictoryEffects) {
      thisAfterVictoryEffect(enemy.battlefield);
    }
  }else if (you.battlefield.totalPoints < enemy.battlefield.totalPoints) {
    enemy.battlefield.wonBattle = true;
    you.damage = you.damage + (enemy.battlefield.totalPoints - you.battlefield.totalPoints);
    for (thisAfterVictoryEffect of enemy.battlefield.afterVictoryEffects) {
      thisAfterVictoryEffect(you.battlefield);
    }
  }

  for (let thisCard of you.battlefield.cards) {
    you.discardPile.push(thisCard);
    setCard(thisCard, $('.discarded-top-card'), 0);
  }

  for (let thisCard of enemy.battlefield.cards) {
    enemy.discardPile.push(thisCard);
  }

}

function newTurn() {
  
  if (you.damage > 12 || you.deck.length < 3) {
    alert("Você perdeu!");
    window.location.reload();
    return false;
  } else if (enemy.damage  > 12 || enemy.deck.length < 3) {
    alert("Você ganhou!");
    window.location.reload();
    return false;
  }

  // TODO: check if decks are over
  you.battlefield = { ...battlefield };
  enemy.battlefield = { ...battlefield };
  
  // TODO: populate hands inside a loop to make it possible to fill hands with less than 3 cards
  you.hand = [you.deck.pop(), you.deck.pop(), you.deck.pop()];
  enemy.hand = [enemy.deck.pop(), enemy.deck.pop(), enemy.deck.pop()];
  i=0;
  for (item of you.hand) {
    let thisCardDiv = $('.your-hand > div:nth-child('+(i+1)+') .game-card.in-hand');
    setCard(item, thisCardDiv, i);
    i++;
  }

  $('.remaining-cards').text(you.deck.length);
  $('.your-damage').text(you.damage);
  $('.enemy-damage').text(enemy.damage);
  // TODO: show last discarded card turned up
  $('.discarded-cards').text(you.discardPile.length);
}

function chooseYourCard(cardIndex){
  you.deck.push(you.hand[cardIndex]);
  you.hand.splice(cardIndex, 1);
  you.battlefield.cards = you.hand;
  you.hand = [];
}

function chooseEnemyCard(cardIndex){
  enemy.deck.push(enemy.hand[cardIndex]);
  enemy.hand.splice(cardIndex, 1);
  enemy.battlefield.cards = enemy.hand;
  enemy.hand = [];
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
  effectCallback : function() { return false; },
  effectInterruptTurn : false
};

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
  },
  afterVictoryEffects: [],
  feedbackMessage: "",
  wonBattle: false
};

var player = {
  deck: {},
  hand: [],
  damage: 0,
  damageLimit: 12,
  discardPile: []
};

var you = { ...player};
you.deck = shuffle(initDeck());

var enemy = { ...player};
enemy.deck = shuffle(initDeck());

// It may be useful for loops (?)
var players = [you, enemy];

$('.your-damage-limit').text(you.damageLimit);
$('.enemy-damage-limit').text(enemy.damageLimit);

newTurn();

$('.game-card.in-hand').click(function(e){
  chooseYourCard($(this).data('index'));
  chooseEnemyCard(Math.floor(Math.random() * 3));
  resolveBattle(you.battlefield, enemy.battlefield);

  $('.alert').html(setMessage());

  let enemyCardDiv = $('.enemyBattlefield .battle-card');
  setCard(enemy.battlefield.cards[0], $(enemyCardDiv[0]), 0);
  setCard(enemy.battlefield.cards[1], $(enemyCardDiv[1]), 1);
  $('.enemyPoints').text(enemy.battlefield.totalPoints);

  let yourCardDiv = $('.yourBattlefield .battle-card');
  setCard(you.battlefield.cards[0], $(yourCardDiv[0]), 0);
  setCard(you.battlefield.cards[1], $(yourCardDiv[1]), 1);
  $('.yourPoints').text(you.battlefield.totalPoints);
  
  $('#myModal').modal('show');
});

$('#myModal').on('hidden.bs.modal', function (e) {
  newTurn();
})
