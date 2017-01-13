var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 100; //If you have less than this, you will buy
var pots_to_buy = 500; //This is how many you will buy

setInterval(function(){
	purchase_potions();
},1000/6); // Loops every 1/4 seconds.

function purchase_potions() {
  if (character.items[0].q < pots_minimum) {
    parent.buy("hpot0", pots_to_buy);
    game_log("Buying hp pots.");
  }
  if (character.items[1].q < pots_minimum) {
    parent.buy("mpot0", pots_to_buy);
    game_log("Buying mp pots.");
  }
}