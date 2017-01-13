var attack_mode=true;
var monster_name = "mvampire";

var useHpPotion=0.49;
var useMpPotion=0.5;
var healWhenHpIsBelow=0.50;
var isHealer;
var playerToHeal = "Chudini";
var isHealing=1; // 1 if priest should heal playerToHeal. 0 if priest is hunting alone.
if(character.ctype=="priest"){ isHealer = isHealing } else { isHealer = 0 }

setInterval(function(){
	loot();
	if(isHealer==0) { targetMonster(); }
	useHpMpPotions();
	if(isHealer==1) { healTarget(playerToHeal); } // If playerToHeal is below 50% hp heal him, if priest is not healing, attack his monster.
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

function healTarget(nick){
	var entity = get_player(nick);
	if(entity!=null){
		if(!in_attack_range(entity))
		{
			move(
				character.real_x+(entity.real_x-character.real_x)/2,
				character.real_y+(entity.real_y-character.real_y)/2
				);
			// Walk half the distance
		}
	if((entity.hp/entity.max_hp)<healWhenHpIsBelow){
		if(can_attack(entity))
		{
			set_message("Healing");
			heal(entity);
		}	
	} else {
		var entityTarget = get_target_of(entity);
		if(can_attack(entityTarget))
		{
			set_message("Attacking boss");
			attack(entityTarget);
		}	
	}
	} else { set_message("Heal target is offline"); }
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