// Link to repo: https://github.com/TiagoGoddard/AdventureLandDrops
// Site: http://adventurecode.club:8081

sendDataToDBLand();

function sendDataToDBLand(){
		// DB Land.
		window.aldc_apikey = 'YOUR_API_KEY_HERE!'; // Ask creator on Discord for this.
		$.getScript('http://adventurecode.club/script?t='+(new Date).getTime(), 		function() { game_log('DB Land - ON!', '#FFFF00'); });
}