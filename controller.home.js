app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
	var onLoad = checkData();
	$scope.rows = ["1"];
    $scope.columns = ["1"];
	$scope.statsList = [
	                ["Str", "Strength. Affects damage the unit deals with physical attacks.",    "215px", "200px"],
	                ["Mag", "Magic. Affects damage the unit deals with magical attacks.",        "240px", "200px"],
	                ["Skl", "Skill. Affects hit rate and the frequency of critical hits.",       "265px", "200px"],
	                ["Spd", "Speed. Affects Avo. Unit strikes twice if 5 higher than opponent.", "290px", "200px"],
	                ["Lck", "Luck. Has various effects. Lowers risk of enemy criticals.",        "215px", "315px"],
	                ["Def", "Defense. Reduces damage from physical attacks.",                    "240px", "315px"],
	                ["Res", "Resistance. Reduces damage from physical attacks.",                 "265px", "315px"],
					["Mov", "Movement. Affects how many blocks a unit can move in a turn.",      "290px", "315px"],
					["Con", "Constitution. Affects how much weight a unit can carry.", 			 "100px", "315px"]
	               ];
	
	//Interval timers
    var rowTimer = $interval(calcNumRows, 250, 20); //attempt to get rows 20 times at 250 ms intervals (total run: 5 sec)
    var colTimer = $interval(calcNumColumns, 250, 20);
    var dragNDrop = $interval(initializeListeners, 250, 20);
    
	//Map and music variables
	$scope.showGrid = 1;
    $scope.musicTrack = 0;
	const numSongs = 3;
    var numDefeat = 0;

    //Positioning constants
    const statVerticalPos = ["10px", "39px", "68px", "97px", "126px", "155px", "184px"];
    const weaponVerticalPos = ["10px", "45px", "80px", "115px", "150px"];
    const weaponRankHorzPos = ["15px", "85px", "155px"];
    const weaponDescVerticalPos = ["10px", "35px", "60px", "85px", "105px"];
    const skillVerticalPos = ["10px", "45px", "80px", "115px", "150px", "185px", "220px"];
    const skillDescVerticalPos = ["5px", "15px", "22px", "29px", "36px", "43px", "50px", "57px", "63px"];
	const weaknessIconHorzPos = ["151px", "171px", "151px", "171px"];
	const weaknessIconVerticalPos = ["5px", "5px", "25px", "25px"];
    
    //Color constants
    const STAT_DEFAULT_COLOR = "#E5C68D";
    const STAT_BUFF_COLOR = "#42adf4";
    const STAT_DEBUFF_COLOR = "#960000";
	const COLOR_RED = "#E01616";
	const COLOR_WHITE = "#FFFFFF";
	const COLOR_ORANGE = "#FF6600";
	const COLOR_PINK = "#E900E9";
	const COLOR_PURPLE = "#9D009D";
	const COLOR_GREEN = "#089000";
	const COLOR_BLUE = "#3850e0";
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the DataService if they have
    function checkData(){
    	if(DataService.getCharacters() == null)
    		$location.path('/');
    	else{
    		$scope.charaData = DataService.getCharacters();
			$scope.mapUrl = DataService.getMap();
			//$scope.terrainData = DataService.getTerrain();
    	}
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP SETUP \\
    //*************************\\
    
	const boxWidth = 16;
	const gridWidth = 0;

    /* Using the height of the map image, calculates the number of tiles tall
     * the map is and returns a subsection of the rowNames array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
    function calcNumRows(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var height = map.naturalHeight; //calculate the height of the map
        	
        	height = height / (boxWidth + gridWidth);
        	var temp = [];
			for(var i = 0; i < height; i++)
				temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(rowTimer); //cancel $interval timer
        		$scope.rows = temp;
        	}
    	}
    };
    
   /* Using the width of the map image, calculates the number of tiles wide
    * the map is and returns an array of that size.
    * Called every 250 ms for the first 5 seconds the app is open.
    */
   function calcNumColumns(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var width = map.naturalWidth; //calculate the height of the map
        	
        	width = width / (boxWidth + gridWidth);
        	var temp = [];
        	
        	for(var i = 0; i < width; i++)
        		temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(colTimer); //cancel $interval timer
        		$scope.columns = temp;
        	}
    	}
    };
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	return (index * boxWidth) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	return (index * boxWidth) + "px";
    };

	$scope.toggleGrid = function() {
    	if($scope.showGrid == 3) $scope.showGrid = 0;
    	else $scope.showGrid += 1;
    };
    
    $scope.toggleMusic = function() {
    	if($scope.musicTrack == $scope.numSongs-1) $scope.musicTrack = 0;
    	else $scope.musicTrack += 1;

    	var audio = document.getElementById('audio');
    	audio.load();
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP       \\
    // CHARACTERS/SPRITES      \\
    //*************************\\
    
    //Toggles character/enemy information box
    $scope.displayData = function(char){
    	var bool = $scope[char + "_displayBox"];
    	if(bool == undefined || bool == false){
    		positionCharBox(char);
    		$scope[char + "_displayBox"] = true;
    	}else{
    		$scope[char + "_displayBox"] = false;
    	}
    };
    
    $scope.removeData = function(index){
    	$scope[index + "_displayBox"] = false;
    };
    
    $scope.checkCharToggle = function(index){
    	return $scope[index + "_displayBox"] == true;
    };
    
    $scope.isPaired = function(pos){
		var pair = $scope.enemyData[index][32];
    	if(pair.indexOf(",") == -1 && pair.length > 0 && pair != "Defeated" && pair != "Not Deployed") return true;
    	
    	var name = $scope.enemyData[index][0];
    	for(var i = 0; i < $scope.enemyData.length; i++)
    		if($scope.enemyData[i][32] == name)
    			return true;
    	return false;
    	return pos != undefined && pos.indexOf("(") > -1;
    };
    
    //Returns the image URL for the unit in the back of a pairup
    //0 = charaData, 1 = enemyData
    $scope.getPairUnitIcon = function(pair){
		var pairName = pair.substring(pair.indexOf("(")+1, pair.indexOf(")"));
    	var pairedUnit = locatePairedUnit(pairName).unit;
    	return pairedUnit.spriteUrl;
    };
    
    //Switches char info box to show the stats of the paired unit
    //Triggered when char info box "Switch to Paired Unit" button is clicked
    $scope.findPairUpChar = function(char){
    	var clickedChar = $scope.charaData[char];
		var pairedUnitName = clickedChar.position.substring(clickedChar.position.indexOf("(")+1, clickedChar.position.indexOf(")"));
    	var pairedUnit = locatePairedUnit(pairedUnitName);
		pairedUnit.paired = true;
    	
    	//Toggle visibility
    	$scope[char + "_displayBox"] = false;
    	$scope[pairedUnit.unitLoc + "_displayBox"] = true;
    	
		//var currEnemy = document.getElementById(char);
    	var currBox = document.getElementById(char + '_box');
    	var pairBox = document.getElementById(pairedUnit.unitLoc + '_box');
    
		pairBox.style.top = currBox.offsetTop + 'px';
    	pairBox.style.left = currBox.offsetLeft + 'px';
    };
    
    function locatePairedUnit(unitName){
		var pairedUnit = {};
    	var charPos = "";

    	//Find paired unit
    	for(var char in $scope.charaData){
    		if($scope.charaData[char].name == unitName){
				pairedUnit = $scope.charaData[char];
				charPos = char;
				break;
			}		
    	}
    	
    	return { 'unit': pairedUnit, 'unitLoc' : charPos };
    };
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
    $scope.getEnemyNum = function(name){
    	if(name == "Boss" || name == "Enmity" || name == "Forthright")
    		return "IMG/shield_boss.png";
    	if(name.lastIndexOf(" ") == -1)
    		return "";

    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	if(name.match(/^[0-9]+$/) != null) return "IMG/num_" + name + ".png";
    	else return "";
    };
    
    $scope.validPosition = function(pos){ return pos.indexOf(",") != -1; };

	$scope.hasMoved = function(moved){ return moved == "1"; };
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineCharX = function(pos){
		if(pos == "Not Deployed")
			return "0px";
    	pos = pos.substring(0,pos.indexOf(",")); //grab first number
    	pos = parseInt(pos);
    	return ((pos - 1) * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };
    
    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineCharY = function(pos){
		if(pos == "Not Deployed")
			return "0px";
		pos = pos.substring(pos.indexOf(",")+1, pos.indexOf("(") != -1 ? pos.indexOf("(") : pos.length); //grab first char
		pos = pos.trim();
    	pos = parseInt(pos);
    	return ((pos - 1) * (boxWidth + (gridWidth * 2)) + 1) + "px";
    };

    //***********************\\
    // POSITION CALCULATIONS \\
    //***********************\\
    
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
    
    $scope.fetchStatVerticalPos = function(index){ return statVerticalPos[index] };
    $scope.fetchWeaponVerticalPos = function(index){ return weaponVerticalPos[index]; };
    $scope.fetchWpnRankHorzPos = function(index){ return weaponRankHorzPos[index]; };
    $scope.fetchWpnDescVerticalPos = function(index){ return weaponDescVerticalPos[index]; };
    $scope.fetchSklVerticalPos = function(index){ return skillVerticalPos[index]; };
    $scope.fetchSklDescVerticalPos = function(index){ return skillDescVerticalPos[index]; };
	$scope.fetchWeaknessHorzPos = function(index){ return weaknessIconHorzPos[index]; };
	$scope.fetchWeaknessVerticalPos = function(index){ return weaknessIconVerticalPos[index]; };
    
    //***********************\\
    // FUNCTIONS FOR STAT    \\
    // PROCESSING/FORMATTING \\
    //***********************\\
    
    //Returns true if the value in the passed attribute is >= 0
    $scope.checkRate = function(stat){ return parseInt(stat) >= 0; };

	$scope.validHP = function(currHp, maxHp){
		var c = parseInt(currHp);
    	var m = parseInt(maxHp);
    	if(c < m && c > 0) return true;
    	else return false;
	};
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     * 
     * toggle = 0 for char, 1 for enemy
     */
    $scope.determineStatColor = function(character, index, stat, toggle){
    	var char;
    	
    	if(toggle == "0") char = $scope.charaData[character];
    	else char = $scope.enemyData[character];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    	
    	if(debuff == "") debuff = 0;
    	else debuff = parseInt(debuff);
    	
    	weaponBuff = parseInt(weaponBuff);
    	
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		return STAT_BUFF_COLOR; //blue buff
    	else if(totalBuffs < 0)
    		return STAT_DEBUFF_COLOR //red debuff
    	return STAT_DEFAULT_COLOR;
    };
    
    $scope.calcEnemyBaseStat = function(enemy, stat){
    	var char = $scope.enemyData[enemy];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var total = char[stat];
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    
    	total = parseInt(total);
    	debuff = parseInt(debuff);
    	weaponBuff = parseInt(weaponBuff);
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	return total - (debuff + weaponBuff + pairUp);
    };

	$scope.calcAttack = function(cIndex){
		var c = $scope.charaData[cIndex];
		if(c.atk != undefined) return c.atk;

		var equippedWpn = c.inventory.itm1;
		var weaponClass = equippedWpn.class;
		var wpnRank1 = c.weaponRanks.wpn1;
		var wpnRank2 = c.weaponRanks.wpn2;
		var wpnRank3 = c.weaponRanks.wpn3;

    	if(equippedWpn.name == "-" || equippedWpn.name == ""){ c.atk = "-"; return c.atk; }
    	var power = parseInt(equippedWpn.might);
    	
    	//S-rank power boost
    	if(wpnRank1.class == weaponClass && parseInt(wpnRank1.exp) >= 150) power += 1;
    	if(wpnRank2.class == weaponClass && parseInt(wpnRank2.exp) >= 150) power += 1;
    	if(wpnRank3.class == weaponClass && parseInt(wpnRank3.exp) >= 150) power += 1;
    	
    	var effect = parseInt(equippedWpn.effect);
		var magicalWeapons = "TomeTalismanRelicStaff";
    	if(effect == 28 || effect == 30 || magicalWeapons.indexOf(weaponClass) != -1){ c.atk = power + parseInt(c.Str); }
    	if(effect == 29 || effect == 31){ c.atk = power + parseInt(c.Mag); }
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
		
    	if(equippedWpn.name == "-" || equippedWpn.name == ""){ c.hit = "-"; return c.hit; }
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
    	
		//TODO: Terrain bonus
    	var avoBonus = 0; //$scope.enemyData[index][33][1];
    	//if(avoBonus == "-") avoBonus = 0;
    	//else avoBonus = parseInt(avoBonus);
    	
    	c.avo = speed*2 + parseInt(c.Lck) + avoBonus;
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

	$scope.getWeaknessIcon = function(w){
		if(w == "" || w == undefined || w == "NPC-only") return "";
    	else return "IMG/Weakness/weak_" + w + ".png";
	};
    
    $scope.validSkill = function(skill){
    	return skill != "" && skill != "None";
    };

    //Returns the image for a character's skill, if they're at the minimum
    //level to obtain it. Otherwise, returns the blank skill image.
    $scope.fetchSkillImage = function(skillName, charLvl, index){
    	var minLvl = (index - 1) * 5;
    	if(minLvl == 0) minLvl = 1;
    	
    	if(skillName == "-" || minLvl > parseInt(charLvl))
    		return "IMG/SKL/skl_blank.png";
    	
    	if(index == "0")
    		return "IMG/SKL/skl_personal.png";
    	
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/SKL/skl_" + skillName + ".png";
    };
    
    $scope.checkShields = function(num, shields){
    	num = parseInt(num);
    	shields = parseInt(shields);
    	
    	if(shields == 10) return "IMG/blueshield.png";
    	else if(shields >= num) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };

	$scope.getPairName = function(pos){
		if(pos.indexOf("(") == -1) return "None";
		else return pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));
	};

	$scope.getPairSupportRank = function(name, pos){
		var supportRanks = DataService.getSupportIndex();
		var partner = pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));
		var rank = supportRanks[name][partner];
		if(rank != "-") return rank;
		else return "None";
	};

	$scope.buildPairSupportBonuses = function(pos){
		var data = DataService.getSupportBonuses();
		var partner = pos.substring(pos.indexOf("(")+1, pos.indexOf(")"));
		var bonuses = data[partner];
		var returnStr = "";

		for(var stat in bonuses){
			var value = parseInt(bonuses[stat]);
			if(value > 0){
				returnStr += stat + ": +" + bonuses[stat] + ", ";
			}else if(value < 0){
				returnStr += stat + ": " + bonuses[stat] + ", ";
			}	
		}	
		
		if(returnStr.length > 2)
			returnStr = returnStr.substring(0, returnStr.length-2);
		return returnStr;
	};
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // & WEAPONS PROFICIENCY   \\
    //*************************\\
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(weaponName){
    	if(weaponName != "-" && weaponName != "- (-)" && weaponName != "") return true;
    	else return false;
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for characters
    $scope.getWeaponClassIcon = function(type){
    	type = type.toLowerCase();
    	return "IMG/type_" + type + ".png";
    };
    
    //Checks if the passed "type" is listed in the effectiveness column of a character's weapon
    //(Ex. Flier, Monster, Beast, Dragon, Armor)
    $scope.weaponEffective = function(types, goal){
    	types = types.toLowerCase();
    	return types.indexOf(goal) != -1;
    };
    
    $scope.existsWeapon = function(weaponName){
    	return weaponName != "" && weaponName != "None";
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.weaponIcon = function(weaponName){ 	
    	var c = weaponName.toLowerCase();
    	return "IMG/rank_" + c + ".png";
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(exp){
		return ((exp/25) * (boxWidth-2));
    };
    
    //Checks if there is a value in the index
    $scope.validDebuff = function(value){
    	return value != "" && value != "0" && value != "-";
    };
    
    $scope.formatWeaponName = function(name){
    	if(name.indexOf("(") == -1) return name;
    	else return name.substring(0, name.indexOf("(")-1);
    };
    
    $scope.hasWeaponRank = function(rank){
    	return rank != "-";
    };
    
    //Returns true if the weapon at the index is not an item
    $scope.notItem = function(type){
    	return type != "Staff" && type != "Consumable" && type != "Mystery";
    };
    
    $scope.setDescriptionLoc = function(type){
    	if(type != "Staff" && type != "Consumable" && type != "Mystery") return "60px";
    	else return "25px";
    };

	$scope.determineInfoColor = function(aff){
    	if(aff == "Immolan Guard" || aff == "Gershom" || aff == "Guile" || aff == "Community (Human)" || aff == "Community (Reaper)"){
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
    
    //***************************\\
    // MOUSEOVER/MOUSEOUT EVENTS \\
    //***************************\\
    
    $scope.weaponHoverIn = function(char, index){ $scope[char + "wpn_" + index] = true; };
    $scope.weaponHoverOut = function(char, index){ $scope[char + "wpn_" + index] = false; };
    $scope.weaponHoverOn = function(char, index){ return $scope[char + "wpn_" + index] == true; };
    
    $scope.skillHoverIn = function(char, index){ $scope[char + "skl_" + index] = true; };
    $scope.skillHoverOut = function(char, index){ $scope[char + "skl_" + index] = false; };
    $scope.skillHoverOn = function(char, index){ return $scope[char + "skl_" + index] == true; };
    
    $scope.statHoverIn = function(char, stat){ $scope[char + "hov_" + stat] = true; };
    $scope.statHoverOut = function(char, stat){ $scope[char + "hov_" + stat] = false; };
    $scope.statHoverOn = function(char, stat){ return $scope[char + "hov_" + stat] == true; };
    
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
    
    function initializeListeners(){;
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
}]);