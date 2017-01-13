var startGold;
var startDate;

startTrackingGold();
initGoldGUI();

setInterval(function(){
	updateGUI(); // Exp and gold bar.
},1000/6); // Loops every 1/4 seconds.


function initGoldGUI() {
  let $ = parent.$;
  let brc = $('#bottomrightcorner');
  $('#xpui').css({
    fontSize: '28px',
  });

  brc.find('.xpsui').css({
    background: 'url("https://i.imgur.com/zCb8PGK.png")',
    backgroundSize: 'cover'
  });

  brc.find('#goldui').remove();
  let gb = $('<div id="goldui"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '0 5px',
    height: '80px',
    lineHeight: '24px',
    fontSize: '30px',
    color: '#FFD700',
    textAlign: 'center',
  });
  gb.insertBefore($('#gamelog'));
}

function updateGUI() {
  let $ = parent.$;
  let xp_percent = ((character.xp / G.levels[character.level]) * 100).toFixed(2);
  let xp_missing = ncomma(G.levels[character.level] - character.xp);
  let xp_string = `LV${character.level} ${xp_percent}% (${xp_missing}) xp to go!`;
  $('#xpui').html(xp_string);
	var gained = updateGoldGained();
  $('#goldui').html(ncomma(character.gold) + " GOLD <br>" + ncomma(gained));
}

function startTrackingGold(){
	startGold = character.gold;
	startDate = new Date();
	
	var startHour = startDate.getHours();
	var startMinutes = startDate.getMinutes();
	
	game_log(`${startHour}:${startMinutes} - Gold: ${startGold}.`);
}
function updateGoldGained(){
	var currentDate = new Date();
	var howLong;
	
	var timeDiff = Math.abs(currentDate.getTime() - startDate.getTime());
	var diffHours = Math.ceil((timeDiff / (1000 * 3600)))-1; 
	var diffMins = Math.ceil(((timeDiff / (1000 * 60)) -1 - (diffHours * 60))); 
	var diffSecs = Math.ceil((timeDiff / (1000)) - (diffMins * 60));
	var totalSecs = Math.ceil((timeDiff / (1000)));
	
	howLong = `${diffHours}h ${diffMins}m ${diffSecs}s`;
	
	var gold = character.gold - startGold;
	goldperHour = ncomma(Math.ceil(((gold / totalSecs) * 3600)));
	goldPerHourString = `<br> Gold per hour: ${goldperHour}`;
	
	var gained = `${gold} gold in ${howLong} ${goldPerHourString}`;
	return gained;
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}