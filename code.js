var attack_mode=true;
var purchase_pots = true; //Set to true in order to allow potion purchases
var pots_minimum = 100; //If you have less than this, you will buy
var pots_to_buy = 500; //This is how many you will buy
var monster_name = "minimush";

// Monsters:
// Irritated Goo: cgoo
// Bee: bee
// Goo: goo
// Pom Pom: minimush

var useHpPotion=0.7;
var useMpPotion=0.5;

var startGold;
var startDate;

sendDataToDBLand();
startTrackingGold();
initGoldGUI();

setInterval(function(){
	loot();
	purchase_potions();
	updateGUI(); // Exp and gold bar.
	targetMonster();
	useHpMpPotions();
	
},1000/6); // Loops every 1/4 seconds.

function useHpMpPotions(){
	if(character.hp < (character.max_hp*useHpPotion)){ 
		if(character.ctype=='priest'){
			heal(get_player(character.name));	
		} else {
			parent.use('hp');
		}
	}
	if(character.mp < (character.max_mp*useMpPotion)){ parent.use('mp'); }	
}

function targetMonster(){
	if(!attack_mode) return;
	
	var target=get_nearest_monster_by_name(monster_name);
	if(!target)
	{
		target=get_nearest_monster_by_name(monster_name);
		if(target) change_target(target);
		else
		{
			set_message("No Monsters");
			return;
		}
	}
	
	if(!in_attack_range(target))
	{
		move(
			character.real_x+(target.real_x-character.real_x)/2,
			character.real_y+(target.real_y-character.real_y)/2
			);
		// Walk half the distance
	}
	else if(can_attack(target))
	{
		attack(target);
	}
}
	
function sendDataToDBLand(){
		// DB Land.
		window.aldc_apikey = 'auto-1umf4xngsg4w0c0w'; 
		$.getScript('http://adventurecode.club/script?t='+(new Date).getTime(), 		function() { game_log('DB Land - ON!', '#FFFF00'); });
}
	
function get_nearest_monster_by_name(name)
{
		var min_d=character.range;
		var target=null;
		for(id in parent.entities)
		{
			var current=parent.entities[id];
			if(current.mtype!=name) continue;
			if(current.type!="monster" || current.dead) continue;
			if(current.target && current.target!=character.name) continue;
			var c_dist=parent.distance(character,current);
			if(c_dist<min_d) min_d=c_dist,target=current;
		}
		return target;
}

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

// Time to level up.
//Courtesy of Four

setInterval(function() {
  update_xptimer();
}, 1000 / 4);

var minute_refresh; // how long before the clock resets

function init_xptimer(minref) {
  minute_refresh = minref || 1;
  parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);

  let $ = parent.$;
  let brc = $('#bottomrightcorner');

  brc.find('#xptimer').remove();

  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '96px',
    fontSize: '28px',
    color: '#77EE77',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px'
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
// lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;

  let $ = parent.$;
  let now = new Date();

  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
  if (time < 1) return; // 1s safe delay
  let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
  if (time > 60 * minute_refresh) {
    last_minutes_checked = new Date();
    last_xp_checked_minutes = character.xp;
  }
  last_xp_checked_kill = character.xp;

  let xp_missing = parent.G.levels[character.level] - character.xp;
  let seconds = Math.round(xp_missing / xp_rate);
  let minutes = Math.round(seconds / 60);
  let hours = Math.round(minutes / 60);
  let counter = `${hours}h ${minutes % 60}min`;

  $('#xpcounter').text(counter);
  $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

// *******************************************************
var ui_gamelog = function() {
  var gamelog_data = {
    kills: {
      show: false,
      regex: /killed/,
 //     tab_name: 'Kills'
    },
    gold: {
      show: false,
      regex: /gold/,
  //    tab_name: 'Gold'
    },
    party: {
      show: true,
      regex: /party/,
      tab_name: 'Party'
    },
    items: {
      show: true,
      regex: /found/,
      tab_name: 'Items'
    },
    upgrade_and_compound: {
      show: true,
      regex: /(upgrade|combination)/,
      tab_name: 'Upgr.'
    },
    errors: {
      show: true,
      regex: /(error|line|column)/i,
      tab_name: 'Errors'
    }
  };

  // filter buttons are alternating lighter and darker for aesthetic effect
  // colours in order are: dark blue, light blue, white, dark gray, light gray, lighter gray
  var filter_colours = {
    on_dark: '#151342',
    on_light: '#1D1A5C',
    on_text: '#FFF',
    off_dark: '#222',
    off_light: '#333',
    off_text: '#999'
  };

  var $ = parent.$;

  init_timestamps();
  init_gamelog_filter();

  function init_gamelog_filter() {
    $('#bottomrightcorner').find('#gamelog-tab-bar').remove();

    let gamelog_tab_bar = $('<div id="gamelog-tab-bar" class="enableclicks" />').css({
      border: '5px solid gray',
      height: '24px',
      background: 'black',
      margin: '-5px 0',
      display: 'flex',
      fontSize: '22px',
      fontFamily: 'pixel'
    });

    let gamelog_tab = $('<div class="gamelog-tab enableclicks" />').css({
      height: '100%',
      width: 'calc(100% / 6)',
      textAlign: 'center',
      lineHeight: '24px',
      cursor: 'default'
    });

    for (let key in gamelog_data) {
      if (!gamelog_data.hasOwnProperty(key)) continue;
      let filter = gamelog_data[key];
      gamelog_tab_bar.append(
        gamelog_tab
        .clone()
        .attr('id', `gamelog-tab-${key}`)
        .css({
          background: gamelog_tab_bar.children().length % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light
        })
        .text(filter.tab_name)
        .click(function() {
          toggle_gamelog_filter(key);
        })
      );
    }
    $('#gamelog').before(gamelog_tab_bar);
  }

  function filter_gamelog() {
    $('.gameentry').each(function() {
      for (let filter of Object.values(gamelog_data)) {
        if (filter.regex.test(this.innerHTML)) {
          this.style.display = filter.show ? 'block' : 'none';
          return;
        }
      }
    });
  }

  function toggle_gamelog_filter(filter) {
    gamelog_data[filter].show = !gamelog_data[filter].show;
    console.log(JSON.stringify(gamelog_data));
    let tab = $(`#gamelog-tab-${filter}`);
    if (gamelog_data[filter].show) {
      tab.css({
        background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.on_dark : filter_colours.on_light,
        color: filter_colours.on_text
      });
    } else {
      tab.css({
        background: $('.gamelog-tab').index(tab) % 2 == 0 ? filter_colours.off_dark : filter_colours.off_dark,
        color: filter_colours.off_text
      });
    }
    filter_gamelog();
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
  }

	//**************************************************
function init_xptimer(minref) {
  minute_refresh = minref || 1;
 // parent.add_log(minute_refresh.toString() + ' min until tracker refresh!', 0x00FFFF);

  let $ = parent.$;
  let brc = $('#bottomrightcorner');

  brc.find('#xptimer').remove();

  let xpt_container = $('<div id="xptimer"></div>').css({
    background: 'black',
    border: 'solid gray',
    borderWidth: '5px 5px',
    width: '320px',
    height: '96px',
    fontSize: '28px',
    color: '#77EE77',
    textAlign: 'center',
    display: 'table',
    overflow: 'hidden',
    marginBottom: '-5px'
  });

  //vertical centering in css is fun
  let xptimer = $('<div id="xptimercontent"></div>')
    .css({
      display: 'table-cell',
      verticalAlign: 'middle'
    })
    .html('Estimated time until level up:<br><span id="xpcounter" style="font-size: 40px !important; line-height: 28px">Loading...</span><br><span id="xprate">(Kill something!)</span>')
    .appendTo(xpt_container);

  brc.children().first().after(xpt_container);
}

var last_minutes_checked = new Date();
var last_xp_checked_minutes = character.xp;
var last_xp_checked_kill = character.xp;
// lxc_minutes = xp after {minute_refresh} min has passed, lxc_kill = xp after a kill (the timer updates after each kill)

function update_xptimer() {
  if (character.xp == last_xp_checked_kill) return;

  let $ = parent.$;
  let now = new Date();

  let time = Math.round((now.getTime() - last_minutes_checked.getTime()) / 1000);
  if (time < 1) return; // 1s safe delay
  let xp_rate = Math.round((character.xp - last_xp_checked_minutes) / time);
  if (time > 60 * minute_refresh) {
    last_minutes_checked = new Date();
    last_xp_checked_minutes = character.xp;
  }
  last_xp_checked_kill = character.xp;

  let xp_missing = parent.G.levels[character.level] - character.xp;
  let seconds = Math.round(xp_missing / xp_rate);
  let minutes = Math.round(seconds / 60);
  let hours = Math.round(minutes / 60);
  let counter = `${hours}h ${minutes % 60}min`;

  $('#xpcounter').text(counter);
  $('#xprate').text(`${ncomma(xp_rate)} XP/s`);
}

function ncomma(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

init_xptimer(5)

// Hp below mob and player.
function draw_rectangle(x, y, width, height, size, color, fill, opacity) {
  if (!color) color = 0x00F33E;
  if (!size) size = 1;
  let rectangle = new PIXI.Graphics();
  if (opacity) {
    rectangle.alpha = opacity;
  }
  if (fill) {
    rectangle.beginFill(color);
  }
  rectangle.lineStyle(size, color);
  rectangle.drawRect(x, y, width, height);
  if (fill) {
    rectangle.endFill();
  }
  return rectangle;
}

// From runner_functions.js https://github.com/kaansoral/adventureland/blob/master/runner_functions.js
// Modified not to be pushed onto the canvas yet
function draw_circle(x, y, radius, size, color) {
  if (!color) {
    color = 0x00F33E;
  }
  if (!size) {
    size = 1;
  }
  let sprite = new PIXI.Graphics();
  sprite.lineStyle(size, color);
  sprite.drawCircle(x, y, radius);
  return sprite;
}

// From runner_functions.js https://github.com/kaansoral/adventureland/blob/master/runner_functions.js
// Modified not to be pushed onto the canvas yet
function draw_line(x, y, x2, y2, size, color) {
  if (!color) {
    color = 0xF38D00;
  }
  if (!size) {
    size = 1;
  }
  let sprite = new PIXI.Graphics();
  sprite.lineStyle(size, color);
  sprite.moveTo(x, y);
  sprite.lineTo(x2, y2);
  sprite.endFill();
  return sprite;
}

// Credit due to draivin
function draw_text(x, y, text, size = 20, color = 0x000000, font = 'pixel', quality = 2) {
  let sprite = new PIXI.Text(text, {
    fontFamily: font,
    fontSize: size * quality,
    fontWeight: 'bold',
    fill: color,
    align: 'center'
  });
  sprite.anchor.set(0.5, 0.5);
  sprite.scale = new PIXI.Point(1 / quality, 1 / quality);
  sprite.position.x = x;
  sprite.position.y = y;
  sprite.displayGroup = parent.text_layer;
  return sprite;
}

var colours = [0x00FFFF, 0x00CCFF, 0x0099FF, 0x0066FF, 0x0033FF, 0x0000FF];

function draw() {
  clear_drawings();
  let sprite_array = [];
  sprite_array = sprite_array.concat(draw_hp_in_range());
  sprite_array = sprite_array.concat(draw_party_data());
  apply_PIXI(sprite_array);
}

function clear_drawings() {
  drawings.forEach(sprite => {
    try {
      sprite.destroy();
    } catch (ex) {}
  });
  drawings = parent.drawings = [];
}
	
	
  function pad(num, pad_amount_) {
    pad_amount = pad_amount_ || 2;
    return ("0".repeat(pad_amount) + num).substr(-pad_amount, pad_amount);
  }

  function add_log_filtered(c, a) {
    if (parent.mode.dom_tests || parent.inside == "payments") {
      return;
    }
    if (parent.game_logs.length > 1000) {
      var b = "<div class='gameentry' style='color: gray'>- Truncated -</div>";
      parent.game_logs = parent.game_logs.slice(-720);
      parent.game_logs.forEach(function(d) {
        b += "<div class='gameentry' style='color: " + (d[1] || "white") + "'>" + d[0] + "</div>"
      });
      $("#gamelog").html(b)
    }
    parent.game_logs.push([c, a]);

    let display_mode = 'block';

    for (let filter of Object.values(gamelog_data)) {
      if (filter.regex.test(c)) {
        display_mode = filter.show ? 'block' : 'none';
        break;
      }
    }

    $("#gamelog").append(`<div class='gameentry' style='color: ${a || "white"}; display: ${display_mode};'>${c}</div>`);
    $("#gamelog").scrollTop($("#gamelog")[0].scrollHeight);
  }

  function init_timestamps() {
    if (parent.socket.hasListeners("game_log")) {
      parent.socket.removeListener("game_log");
      parent.socket.on("game_log", data => {
        parent.draw_trigger(function() {
          let now = new Date();
          if (is_string(data)) {
            add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data}`, "gray");
          } else {
            if (data.sound) sfx(data.sound);
            add_log_filtered(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} | ${data.message}`, data.color);
          }
        })
      });
    }
  }
}();
setInterval(100);
