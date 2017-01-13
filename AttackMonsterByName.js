var attack_mode=true;
var monster_name = "bee";

// Monsters:
// Irritated Goo: cgoo
// Bee: bee
// Goo: goo
// Pom Pom: minimush
// Armadillo: armadillo
// Dracul: mvampire

setInterval(function(){
	targetMonster();
},1000/6); // Loops every 1/4 seconds.

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