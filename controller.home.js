app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'MapDataService', function ($scope, $location, $interval, MapDataService) {
	$scope.coordinates = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28","29", "30", "31", "32"];
	$scope.statsList = [
	                ["Str", "Strength. Affects damage the unit deals with physical attacks."],
	                ["Mag", "Magic. Affects damage the unit deals with magical attacks."],
	                ["Skl", "Skill. Affects hit rate and the frequency of critical hits."],
	                ["Spd", "Speed. Affects Avo. Unit strikes twice if 5 higher than opponent."],
	                ["Lck", "Luck. Has various effects. Lowers risk of enemy criticals."],
	                ["Def", "Defense. Reduces damage from physical attacks."],
	                ["Res", "Resistance. Reduces damage from physical attacks."],
					["Con", "Constitution. Affects how much weight a unit can carry."]
	               ];
	
	//Interval timers
    var dragNDrop = $interval(initializeListeners, 250, 20);
	var pairUps = $interval(setPairIcons, 250, 20);
	var refreshListener, mapType;
    
	//Map and music variables
	$scope.showGrid = 1;
    $scope.musicTrack = 0;
	const numSongs = 3;
    var numDefeat = 0;
    
    //Color constants
	const ITEM_DROP_COLOR = "#008000";
	const COLOR_HP_RED = "#FF0000";
	const COLOR_HP_YELLOW = "#FFFF00";
	const COLOR_HP_GREEN = "#00FF00";
	const COLOR_RED = "#E01616";
	const COLOR_WHITE = "#FFFFFF";
	const COLOR_ORANGE = "#FF6600";
	const COLOR_PINK = "#E900E9";
	const COLOR_PURPLE = "#9D009D";
	const COLOR_GREEN = "#089000";
	const COLOR_BLUE = "#3850e0";
	const COLOR_BLACK = "#000000";
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the MapDataService if they have
	if(MapDataService.getCharacters() == null)
		$location.path('/');
	else{
		$scope.charaData = MapDataService.getCharacters();
		$scope.terrainTypes = MapDataService.getTerrainTypes();
		$scope.terrainLocs = MapDataService.getTerrainMappings();
		$scope.mapUrl = MapDataService.getMap();
		mapType = MapDataService.getMapType();
	}
    
    //*************************\\
    // FUNCTIONS FOR MAP SETUP \\
    //*************************\\
    
	const boxWidth = 16;
	const gridWidth = 0;
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	return (index * boxWidth) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	return (index * boxWidth) + "px";
    };

	$scope.determineGlowColor = function(loc){
		if($scope.terrainLocs == undefined) return '';
		var terrainInfo = $scope.terrainLocs[loc];
		if(terrainInfo.movCount > 0) return 'blue';
		if(terrainInfo.atkCount > 0) return 'red';
		if(terrainInfo.healCount > 0) return 'green';
		return '';
	};

	$scope.toggleGrid = function() {
    	if($scope.showGrid == 3) $scope.showGrid = 0;
    	else $scope.showGrid += 1;
    };
    
    $scope.toggleMusic = function() {
    	if($scope.musicTrack == numSongs-1) $scope.musicTrack = 0;
    	else $scope.musicTrack += 1;

    	var audio = document.getElementById('audio');
    	audio.load();
    };

	$scope.redirectToHomePage = function() {
		$location.path('/');
  	};

	$scope.refreshData = function(){
		if($scope.refreshing == true) return; //If already refreshing, don't make a second call
		$scope.refreshing = true;
		
		refreshListener = $scope.$on('loading-bar-updated', function(event, data) {
			if(data >= 100){
				refreshListener(); //cancel listener
				$scope.refreshing = false;
				$scope.charaData = MapDataService.getCharacters();
				$scope.terrainTypes = MapDataService.getTerrainTypes();
				$scope.terrainLocs = MapDataService.getTerrainMappings();
				$scope.mapUrl = MapDataService.getMap();
				$scope.$apply();
			}
		});

		MapDataService.loadMapData(mapType);
	};

	$scope.launchConvoyDialog = function() { $scope.showConvoy = true; };
	$scope.launchShopDialog = function(){ $scope.showShop = true; };
    
    //*************************\\
    // FUNCTIONS FOR MAP       \\
    // CHARACTERS/SPRITES      \\
    //*************************\\
    
    //Toggles character/enemy information box
    $scope.displayData = function(char){
    	var bool = $scope[char + "_displayBox"];
    	if(bool == undefined || bool == false){
    		positionCharBox(char);
			toggleCharRange(char, 1);
    		$scope[char + "_displayBox"] = true;
    	}else{
			toggleCharRange(char, -1);
    		$scope[char + "_displayBox"] = false;
    	}
    };

    $scope.removeData = function(char){
		toggleCharRange(char, -1);
    	$scope[char + "_displayBox"] = false;
    };
    
    $scope.checkCharToggle = function(char){
    	return $scope[char + "_displayBox"] == true;
    };

	//Add/remove character's range highlighted cells
	function toggleCharRange(char, val){
		var movRangeList = $scope.charaData[char].range;
		var atkRangeList = $scope.charaData[char].atkRange;
		var healRangeList = $scope.charaData[char].healRange;

		for(var i = 0; i < movRangeList.length; i++)
			$scope.terrainLocs[movRangeList[i]].movCount += val;
		for(var j = 0; j < atkRangeList.length; j++)
			$scope.terrainLocs[atkRangeList[j]].atkCount += val;
		for(var k = 0; k < healRangeList.length; k++)
			$scope.terrainLocs[healRangeList[k]].healCount += val;
	};
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns the icon for that number
    $scope.getEnemyNum = function(name){
    	if(name == "Boss" || name == "Enmity" || name == "Forthright")
    		return "IMG/shield_boss.png";
    	if(name.lastIndexOf(" ") == -1)
    		return "";

    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	if(name.match(/^[0-9]+$/) != null) return "IMG/num_" + name + ".png";
    	else return "";
    };

	//Returns true if character has moved, coloring the sprite gray
	$scope.hasMoved = function(moved){ return moved == "1"; };
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineCharX = function(index, pos){
		if(index == 0) numDefeat = 0; 
    	if(pos == "Defeated" || pos == "Not Deployed") return (((((numDefeat-1)%30)+2)*16))-16 + "px";

    	var comma = pos.indexOf(",");
    	if(comma == -1) return "-1px";
    	
    	pos = pos.substring(0,comma); //grab first 1-2 chars
    	pos = parseInt(pos);
    	return ((pos*16))-16 + "px";
    };
    
    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineCharY = function(pos){
		if(pos == "Defeated" || pos == "Not Deployed"){
    		numDefeat +=1;
    		return (34+Math.floor((numDefeat-1)/30))*16-16+"px";
    	}
		
    	var comma = pos.indexOf(",");
    	if(comma == -1) return "-1px";
    	
    	pos = pos.substring(comma+1,pos.length); //grab last 1-2 chars
    	pos = parseInt(pos);
    	return ((pos*16))-16 + "px";
    };

	$scope.determineHPColor = function(curr, max){
    	curr = parseInt(curr);
    	max = parseInt(max);

    	if(curr<=max/4){ return COLOR_HP_RED; }
		else if(curr<=max/2){ return COLOR_HP_YELLOW; }
    	return COLOR_HP_GREEN;
    };

    //********************************\\
    // INFO BOX POSITION CALCULATIONS \\
    //********************************\\
    
    //Relocate the information box relative to the clicked char
    function positionCharBox(char){
    	var sprite = document.getElementById(char);
    	var box = document.getElementById(char + '_box');
    	
		var x = sprite.style.left;
    	var y = sprite.style.top;
    	x = parseInt(x.substring(0, x.length-2));
    	y = parseInt(y.substring(0, y.length-2));
    	
    	if(x < 671) x += 40;	
    	else x -= 671;
    	
    	if(y < 77) y += 40;
    	else y -= 77;
    	
    	box.style.left = x + 'px';
    	box.style.top = y + 'px';
    };
    
	//Positioning constants
    const statVerticalPos = ["29px", "53px", "77px", "101px", "125px", "149px", "173px", "197px"];
    const weaponVerticalPos = ["5px", "34px", "63px", "92px", "121px"];
    const weaponDescVerticalPos = ["5px", "5px", "5px", "5px", "5px"];
    const weaponRankHorzPos = ["368px", "404px", "440px"];
    const skillVerticalPos = ["96px", "121px", "146px", "171px", "196px"];
    const skillDescVerticalPos = ["96px", "96px", "96px", "96px", "96px"];
	const weaknessIconHorzPos = ["151px", "171px", "151px", "171px"];
	const weaknessIconVerticalPos = ["5px", "5px", "25px", "25px"];

	//Returns positioning constant related to appropriate stat
    $scope.fetchStatVerticalPos = function(index){ return statVerticalPos[index] };
    $scope.fetchWeaponVerticalPos = function(index){ return weaponVerticalPos[index]; };
    $scope.fetchWpnRankHorzPos = function(index){ return weaponRankHorzPos[index]; };
    $scope.fetchWpnDescVerticalPos = function(index){ return weaponDescVerticalPos[index]; };
    $scope.fetchSklVerticalPos = function(index){ return skillVerticalPos[index]; };
    $scope.fetchSklDescVerticalPos = function(index){ return skillDescVerticalPos[index]; };
	$scope.fetchWeaknessHorzPos = function(index){ return weaknessIconHorzPos[index]; };
	$scope.fetchWeaknessVerticalPos = function(index){ return weaknessIconVerticalPos[index]; };
    
	//Set background color for info box based on affliation
	$scope.determineInfoColor = function(aff){
    	if(aff == "Immolan Guard" || aff == "Gershom" || aff == "Guile" || aff.indexOf("Community") != -1){
    		return COLOR_RED;
    	}
    	else if(aff == "Environment"){
    		return COLOR_WHITE;
    	}
    	else if(aff == "Belenus" || aff == "Self"){
    		return COLOR_ORANGE;
    	}
    	else if(aff.indexOf("Reaper") != -1 || aff == "Lettie"){
    		return COLOR_PINK;
    	}
    	else if(aff == "Loveless"){
    		return COLOR_PURPLE;
    	}
    	else if(aff == "Whimsy" || aff == "Cupidity" || aff == "Neutral" || aff == "Prisoner"){
    		return COLOR_GREEN;
    	}
		return COLOR_BLUE;
    };

    //*****************************************\\
    // FUNCTIONS FOR CHARACTER STAT PROCESSING \\
    //******************************************\\
    
	$scope.validHP = function(currHp, maxHp){
		var c = parseInt(currHp);
    	var m = parseInt(maxHp);
    	if(c < m && c > 0) return true;
    	else return false;
	};

	$scope.calcAttack = function(cIndex){
		var c = $scope.charaData[cIndex];
		if(c.atk != undefined) return c.atk;

		var equippedWpn = c.inventory.itm1;
		var weaponClass = equippedWpn.class;
		var wpnRank1 = c.weaponRanks.wpn1;
		var wpnRank2 = c.weaponRanks.wpn2;
		var wpnRank3 = c.weaponRanks.wpn3;

    	if(equippedWpn.name == "-" || equippedWpn.name == "" || equippedWpn.might.match(/^-?[0-9]+$/) == null){
			 c.atk = "-";
			 return c.atk; 
		}
    	var power = parseInt(equippedWpn.might);
    	
    	//S-rank power boost
    	if(wpnRank1.class == weaponClass && parseInt(wpnRank1.exp) >= 150) power += 1;
    	if(wpnRank2.class == weaponClass && parseInt(wpnRank2.exp) >= 150) power += 1;
    	if(wpnRank3.class == weaponClass && parseInt(wpnRank3.exp) >= 150) power += 1;
    	
    	var effect = parseInt(equippedWpn.effect);
		var magicalWeapons = "TomeTalismanRelicStaff";
    	if(effect == 29 || effect == 31 || magicalWeapons.indexOf(weaponClass) != -1){ c.atk = power + parseInt(c.Mag); }
    	else{ c.atk = power + parseInt(c.Str); }
		return c.atk;
    };

	$scope.calcHit = function(cIndex){
		var c = $scope.charaData[cIndex];
		if(c.hit != undefined) return c.hit;

		var equippedWpn = c.inventory.itm1;
		var weaponClass = equippedWpn.class;
		var wpnRank1 = c.weaponRanks.wpn1;
		var wpnRank2 = c.weaponRanks.wpn2;
		var wpnRank3 = c.weaponRanks.wpn3;
		
    	if(equippedWpn.name == "-" || equippedWpn.name == "" || equippedWpn.hit.match(/^-?[0-9]+$/) == null){
			 c.hit = "-";
			 return c.hit; 
		}
    	var hit = parseInt(equippedWpn.hit);
    	
    	//S-rank hit boost
    	if(wpnRank1.class == weaponClass && parseInt(wpnRank1.exp) >= 150) hit += 15;
    	if(wpnRank2.class == weaponClass && parseInt(wpnRank2.exp) >= 150) hit += 15;
    	if(wpnRank3.class == weaponClass && parseInt(wpnRank3.exp) >= 150) hit += 15;
    	
    	c.hit = Math.floor(hit + parseInt(c.Skl)*2 + parseInt(c.Lck)/2);
		return c.hit;
	};

	$scope.calcCrit = function(cIndex){
		var c = $scope.charaData[cIndex];
		if(c.crit != undefined) return c.crit;

		var equippedWpn = c.inventory.itm1;
    	if(equippedWpn.name == "-" || equippedWpn.name == "" || equippedWpn.crit == "-" || equippedWpn.crit == ""){ c.crit = "-"; return c.crit; }
		
    	var crit = parseInt(equippedWpn.crit);
    	var cls = c.class.name;
    	
    	if(cls=="Assassin"||cls=="Rogue"||cls=="Shepherd") crit += 10;
    	else if(cls=="Berserker"||cls=="Sniper"||cls=="Swordsmaster"||cls=="Halberdier"||cls=="Savior") crit += 15;
    	
    	c.crit = Math.floor(crit + parseInt(c.Skl)/2);
		return c.crit;
	};

	$scope.calcAvo = function(cIndex){
		var c = $scope.charaData[cIndex];
		if(c.avo != undefined) return c.avo;

		var equippedWpn = c.inventory.itm1;
		var speed = parseInt(c.Spd);
    	var loss = equippedWpn.weight;
    	
    	if(loss == "-" || loss == "") loss = 0;
    	else loss = parseInt(loss);
    	
    	if (c.Con != "-" && c.Con != undefined && c.Con != "") loss -= parseInt(c.Con);
    	if(loss < 0) loss = 0;
    	speed -= loss;
    	
    	var terrainBonus = 0;
		if($scope.validPosition(c.position)){ terrainBonus = $scope.terrainTypes[$scope.terrainLocs[c.position].type].avo; }
    
    	c.avo = speed*2 + parseInt(c.Lck) + terrainBonus;
		return c.avo;
	};

	$scope.getStatusName = function(name){
		if(name == "None") return "Normal Status";
		else return name;
	}	

	$scope.getStatusIcon = function(status, turnsLeft){
		if(status == "None") return "";
		if(status == "Doomed") return "IMG/Status/s_" + status + turnsLeft +".png";
		else return "IMG/Status/s_" + status + ".png";
	};

	$scope.getTurnsLeft = function(turns){
		return parseInt(turns);
	};

	$scope.getWeaknessIcon = function(w){
		if(w == "" || w == undefined || w == "NPC-only") return "";
    	else return "IMG/Weakness/weak_" + w + ".png";
	};
    
    $scope.validSkill = function(skill){
    	return skill != "" && skill != "None";
    };

	$scope.validExp = function(exp){
		return exp != "-";
	};

	$scope.calcExpBarPercent = function(lvl, exp){
		if(lvl == "40") return "73px";
    	return ((parseInt(exp)/100) * 73) + 'px'
	};
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // & WEAPONS PROFICIENCY   \\
    //*************************\\
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(weaponName){
    	if(weaponName.length > 0) return true;
    	else return false;
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for characters
    $scope.getWeaponClassIcon = function(type, alt){
		if(alt.length > 0) return alt;
    	type = type.toLowerCase();
    	return "IMG/Items/type_" + type + ".png";
    };
  
    $scope.existsWeaponRank = function(weaponName){ return weaponName != "-" && weaponName != "None" };

	$scope.formatWeaponRank = function(str){ return str.substring(0,1); };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.getWeaponRankIcon = function(name){ 
    	name = name.toLowerCase();
    	return "IMG/rank_" + name + ".png";
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(exp){
    	var progress = 0;
    	var total = 0;
		exp = parseInt(exp)

    	if(exp<10){ progress = exp; total = 10; } //E
    	else if(exp<30){ progress = exp-10; total = 20; } //D
    	else if(exp<60){ progress = exp-30; total = 30; } //C
    	else if(exp<100){ progress = exp-60; total = 40; } //B
    	else if(exp<150){ progress = exp-100; total = 50; } //A
    	else{ progress = 1; total = 1; } //S
    	
    	return ((progress/total) * 30) + 'px'; //30 is the max number of pixels
    };
    
	$scope.removeParenthesisWeaponName = function(name){
		if(name.indexOf("(") == -1) return name;
    	else return name.substring(0, name.indexOf("(")-1);
	};
    
    $scope.formatWeaponName = function(name){
    	if(name.indexOf("(D)") == -1) return name;
    	else return name.substring(0, name.indexOf("(D)")-1);
    };

	$scope.formatItemRank = function(name, rank){
		const ClassesWithNoRank = "ConsumableItemEquipmentNone";
    	if(ClassesWithNoRank.indexOf(name) != -1) return name;
    	else return rank + "-" + name;
    };
    
	$scope.determineItemColor = function(name){
    	if(name.indexOf("(D)") != -1) return ITEM_DROP_COLOR;
    	return COLOR_BLACK;
    };

	$scope.itemCanBeUsed = function(char, itemIndex){
		var char = $scope.charaData[char];
		var eqptClass = char.inventory["itm" + itemIndex].class;

		return eqptClass == char.weaponRanks.wpn1.class
		    || eqptClass == char.weaponRanks.wpn2.class
			|| eqptClass == char.weaponRanks.wpn3.class
			|| eqptClass == "None" || eqptClass == "Consumable" || eqptClass == "Equipment" || eqptClass == "Item";
	};

    //***************************\\
    // MOUSEOVER/MOUSEOUT EVENTS \\
    //***************************\\
    
    $scope.weaponHoverIn = function(char, index){ $scope[char + "wpn_" + index] = true; };
    $scope.weaponHoverOut = function(char, index){ $scope[char + "wpn_" + index] = false; };
    $scope.weaponHoverOn = function(char, index){ return $scope[char + "wpn_" + index] == true; };
    
    $scope.skillHoverIn = function(char, index){ $scope[char + "skl_" + index] = true; };
    $scope.skillHoverOut = function(char, index){ $scope[char + "skl_" + index] = false; };
    $scope.skillHoverOn = function(char, index){ return $scope[char + "skl_" + index] == true; };
    
	$scope.terrainHoverIn = function(char){ $scope[char + "trn"] = true; };
	$scope.terrainHoverOut = function(char){ $scope[char + "trn"] = false; };
	$scope.terrainHoverOn = function(char){ return $scope[char + "trn"] == true; };

    $scope.nameHoverIn = function(char){ $scope[char + "name"] = true; };
    $scope.nameHoverOut = function(char){ $scope[char + "name"] = false; };
    $scope.nameHoverOn = function(char){ return $scope[char + "name"] == true; };

	$scope.statusHoverIn = function(char){ $scope[char + "status"] = true; };
	$scope.statusHoverOut = function(char){ $scope[char + "status"] = false; };
	$scope.statusHoverOn = function(char){ return $scope[char + "status"] == true; };

	$scope.goldHoverIn = function(char){ $scope[char + "gold"] = true; };
	$scope.goldHoverOut = function(char){ $scope[char + "gold"] = false; };
	$scope.goldHoverOn = function(char){ return $scope[char + "gold"] == true; };
    
    //*************************\\
    // SUPPORT FOR DRAGABILITY \\
    // OF CHAR INFO BOX        \\
    //*************************\\
    var currDrag = "";
    
    function dragStart(event){
    	var style = window.getComputedStyle(event.target, null);
    	currDrag = event.target.id;
        event.dataTransfer.setData("text",(parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    };
    
    function dragOver(event){
    	event.preventDefault();
    	return false;
    };
    
    function dragEnter(event){
    	event.preventDefault();
    };
    
    function dropDiv(event){
    	event.preventDefault();
    	var data = event.dataTransfer.getData("text").split(',');

    	var drag = document.getElementById(currDrag);
    	drag.style.left = (event.clientX + parseInt(data[0],10)) + 'px';
    	drag.style.top = (event.clientY + parseInt(data[1],10)) + 'px';
    	currDrag = "";
    };
    
    function initializeListeners(){
    	var test = document.getElementById('char_0_box');
    	if($scope.charaData != undefined && test != null){

    		var i = 0;
    		//Set event listeners to be activated when the div is dragged
    	    for(var char in $scope.charaData){
    	    	var box = document.getElementById(char + '_box');
    	    	box.addEventListener('dragstart',dragStart,false);
    	    	i++;
    	    }
    	    
    	    //Set event listeners
    	    var drop = document.getElementById('dropArea');
    	    drop.addEventListener('dragenter',dragEnter,false);
    	    drop.addEventListener('dragover',dragOver,false);
    	    drop.addEventListener('drop',dropDiv,false);
    	    
    	    $interval.cancel(dragNDrop); //cancel $interval timer
    	}
    };

	//*********************\\
    // TOGGLE PAIRUP ICONS \\
    //*********************\\

	function setPairIcons(){
		var test = document.getElementById('char_0');
		if(test != null){
			for(var index in $scope.charaData){
				var c = $scope.charaData[index];
				if(!$scope.validPosition(c.position)){
					var pair = searchForPartner(c.position);
					if(pair != null){
						var pairIcon = document.getElementById(pair + "_pairIcon");
						pairIcon.style.display = "inline";
					}	
				}
			}
			
			$interval.cancel(pairUps); //cancel $interval timer
		}
	};

	$scope.validPosition = function(pos){
		return pos.indexOf(",") != -1 || pos == "Not Deployed" || pos == "Defeated";
	};

	function searchForPartner(name){
		for(var index in $scope.charaData){
			var c = $scope.charaData[index];
			if(c.name == name)
				return index;
		}
		return null;
	};
}]);