app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
	$scope.rows = ["1"];
    $scope.columns = ["1"];
    $scope.showGrid = 1;
    $scope.musicTrack = 0;
    $scope.numSongs = 3;
    var numDefeat = 0;
    var rowTimer = $interval(calcNumRows, 250, 20); //attempt to get rows 20 times at 250 ms intervals (total run: 5 sec)
    var colTimer = $interval(calcNumColumns, 250, 20);
    var dragNDrop = $interval(initializeListeners, 250, 20);
    
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the DataService if they have
	$location.path('/');
    /*if(DataService.getEnemies() == null)
    	$location.path('/');
    else{
    	//$scope.charaData = DataService.getCharacters();
    	//$scope.enemyData = DataService.getEnemies();
    	$scope.map = DataService.getMap();
    	$scope.terrainData = DataService.getTerrain();
    }*/
    
    $scope.toggleGrid = function() {
    	if($scope.showGrid == 3){
    		$scope.showGrid = 0;
    	}
    	else{
    		$scope.showGrid+=1;
    	}
    };
    
    $scope.toggleMusic = function() {
    	if($scope.musicTrack == $scope.numSongs-1){
    		$scope.musicTrack = 0;
    	}
    	else{
    		$scope.musicTrack+=1;
    	}
    	
    	var audio = document.getElementById('audio');
    	audio.load();
    	
    };
    
    
    /* Using the height of the map image, calculates the number of tiles tall
     * the map is and returns a subsection of the rowNames array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
    function calcNumRows(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var height = map.naturalHeight; //calculate the height of the map
        	
        	//height -= 16;
        	height = height / 16;
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
        	
        	//width -= 16;
        	width = width / 16;
        	var temp = [];
        	
        	for(var i = 0; i < width; i++)
        		temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(colTimer); //cancel $interval timer
        		$scope.columns = temp;
        	}
    	}
    };
    
    //*************************\\
    // FUNCTIONS FOR CHARACTER \\
    // INFO BOX                \\
    //*************************\\
    
    $scope.toggleView = function(index){
    	var id = 'viewInfo_' + index;
    	if ($scope[id] == undefined) { $scope[id] = true; }
    	else { $scope[id] = !$scope[id]; }
    	
    	if($scope[id] == true)
    		setEInfoPos(index);
    };
    
    function setEInfoPos(index){
    	var enemy = document.getElementById('enemy_'+index);
    	var box = document.getElementById('enemy_' + index + "_box");
    	var map = document.getElementById('map');
		var x = enemy.style.left;
    	var y = enemy.style.top;
    	x = parseInt(x.substring(0, x.length));
    	y = parseInt(y.substring(0, y.length));
    	
    	x += 21; 
    	//x=524;
    	y -= 80;
    	if(y < 32)
    		y = 32;
    	if(y > 398)
    		y = 398;
    
    	
    	box.style.left = x + 'px';
    	box.style.top = y + 'px';
    }
    
    $scope.checkToggle = function(enemy){
    	enemy = 'viewInfo_' + enemy;
    	if ($scope[enemy] == undefined) { return false; }
    	else { return $scope[enemy]; }
    };
    
    //********************\\
    // FUNCTIONS FOR UNIT \\
    // PAIRUPS            \\
    //********************\\
    
    //Returns true if a character has a position coordinate
    $scope.hasPos = function(index){
    	return charPos[index] != "";
    };
    
    //Returns true if the enemy has a coordinate on the map
    //Units in the back of a pair up should have a coordinate of ""
    $scope.enemyHasPos = function(index){
    	if($scope.enemyData[index][33-1]=="Defeated" || $scope.enemyData[index][33-1]=="Not Deployed"){
    		return 2;
    	}
    	return $scope.enemyData[index][33-1].indexOf(",") != -1;
    };
    
    //Returns true if the currently loaded character is paired up with another character
    $scope.ifPaired = function(){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[57] != "None";
    };
    
    //Returns true if the enemy at index is paired up
    $scope.enemyIsPaired = function(index){
    	var pair = $scope.enemyData[index][32];
    	if(pair.indexOf(",") == -1 && pair.length > 0 && pair != "Defeated" && pair != "Not Deployed") return true;
    	
    	var name = $scope.enemyData[index][0];
    	for(var i = 0; i < $scope.enemyData.length; i++)
    		if($scope.enemyData[i][32] == name)
    			return true;
    	return false;
    };
    
    //Returns true if the unit at index is paired up
    $scope.isPairedAllChars = function(index){
    	return $scope.charaData[index][57] != "None";
    };
    
    //Returns the image URL for the unit in the back of a pairup
    $scope.getPairUnitIcon = function(index){
    	var pairedUnit = $scope.charaData[index][57]; //get paired unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Find paired unit
    	while(!found && inc < $scope.charaData.length){
    		if($scope.charaData[inc][0] == pairedUnit){
    			found = true;
    		}else inc++;
    	}
    	
    	return $scope.charaData[inc][99];
    };

    //Switches char info box to show the stats of the paired unit
    //Triggered when char info box "Switch to Paired Unit" button is clicked
    $scope.findPairUpChar = function(){
    	if($scope.loadedChar == undefined) return false;
    	var pairedUnit = $scope.loadedChar[57]; //get paired unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Find paired unit
    	while(!found && inc < $scope.charaData.length){
    		if($scope.charaData[inc][0] == pairedUnit){
    			$scope.loadedChar = $scope.charaData[inc];
    			found = true;
    		}else inc++;
    	}
    };
    
    /* Triggered when the enemy's "Switch to Paired Unit" button is clicked
     * Finds paired unit, relocates its info box to the same position as the currently
     * open one and displays it. Old info box is hidden.
     * WARNING: DOESN'T WORK PROPERLY IF BOTH UNITS ARE DISPLAYED BECAUSE OF RELIANCE
     * ON SPRITE BEING HIDDEN
     */
    $scope.toggleEnemyPair = function(index){
    	var name = $scope.enemyData[index][0]; //get unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Checks if the enemy the info box belongs to is hidden
    	var spriteHidden;
    	if($scope.enemyData[index][32].indexOf(",") == -1) spriteHidden = true;
    	else spriteHidden = false;
    	
    	if(!spriteHidden){
    		//Find pair for front unit
        	while(!found && inc < $scope.enemyData.length){
        		if($scope.enemyData[inc][32] == name) found = true;
        		else inc++;
        	}
    	}else{
    		//Find pair for back unit
    		name = $scope.enemyData[index][32];
        	while(!found && inc < $scope.enemyData.length){
        		if($scope.enemyData[inc][0] == name) found = true;
        		else inc++;
        	}
    	}
    	//Toggle visibility
    	var id = 'viewInfo_' + index;
    	$scope[id] = !$scope[id];
    	
    	id = 'viewInfo_' + inc;
    	if ($scope[id] == undefined) { $scope[id] = true; }
    	else { $scope[id] = !$scope[id]; }
    	
    	var currBox = document.getElementById('enemy_' + index + '_box');
    	var pairBox = document.getElementById('enemy_' + inc + '_box');
    	pairBox.style.top = currBox.offsetTop + 'px';
        pairBox.style.left = currBox.offsetLeft + 'px';
    };
    
    //***********************\\
    // FUNCTIONS FOR STAT    \\
    // PROCESSING/FORMATTING \\
    //***********************\\
    
    //Returns true if the rate of atk/crit/hit/avo (@ index) is greater than 0
    $scope.checkRate = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return parseInt($scope.loadedChar[index]) >= 0;
    };
    
    //Returns true if the rate of attack/crit/hit/avo (@ stat) is greater than 0
    //for the enemy (@ index)
    $scope.eCheckRate = function(index, stat){
    	return parseInt($scope.enemyData[index][stat]) >= 0;
    };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     */
    $scope.determineStatColor = function(stat){
    	var color = "#E5C68D"; //default tan
    	var debuff, weaponBuff, pairUp;
    	
    	if($scope.loadedChar == undefined) return color; //returns tan
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	switch(stat){
	    	case "str": debuff = 19; weaponBuff = 45; pairUp = 59; break;
	    	case "mag": debuff = 20; weaponBuff = 46; pairUp = 60; break;
	    	case "skl": debuff = 21; weaponBuff = 47; pairUp = 61; break;
	    	case "spd": debuff = 22; weaponBuff = 48; pairUp = 62; break;
	    	case "lck": debuff = 23; weaponBuff = 49; pairUp = 63; break;
	    	case "def": debuff = 24; weaponBuff = 50; pairUp = 64; break;
	    	case "res": debuff = 25; weaponBuff = 51; pairUp = 65; break;
	    	default: return color; break;
    	}
    	
    	if($scope.loadedChar[debuff] == "") debuff = 0;
    	else debuff = parseInt($scope.loadedChar[debuff]);
    	
    	weaponBuff = parseInt($scope.loadedChar[weaponBuff]);
    	
    	if($scope.loadedChar[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt($scope.loadedChar[pairUp]);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		color = "#42adf4"; //blue buff
    	else if(totalBuffs < 0)
    		color = "#960000"; //red debuff
    	return color;
    };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     */
    $scope.determineEnemyStatColor = function(stat, index){
    	var color = "#FFFFFF"; //default tan
    	return color;
    	
    	/*var locs = getEnemyBuffLocs(stat);
    	var debuff = locs[0];
    	var weaponBuff = locs[1]; 
    	var pairUp = locs[2];
    	
    	var enemy = $scope.enemyData[index];
    	debuff = parseInt(enemy[debuff]);
    	weaponBuff = parseInt(enemy[weaponBuff]);
    	if(enemy[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt(enemy[pairUp]);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		color = "#42adf4"; //blue buff
    	else if(totalBuffs < 0)
    		color = "#960000"; //red debuff
    	return color;*/
    };
    
    $scope.determineItemColor = function(index,item){
    	var name = $scope.enemyData[index][item][0];
    	
    	if(name.indexOf("(D)")!=-1){
    		return "#008000";
    	}
    	return "#000000";
    };
    
    $scope.enemyHpDraw = function(index){
    	current = parseInt($scope.enemyData[index][5]);
    	total = parseInt($scope.enemyData[index][4]);
    	if(current<total && current > 0){
    		return 1;
    	}
    	else{
    		return 0;
    	}
    	
    };
    
    $scope.enemyHasMoved = function(index){
    	if($scope.enemyData[index][32-1]==1){
    		return 1;
    	}
    	else
    		return 0;
    };
    
    $scope.determineHPColor = function(index){
    	current = parseInt($scope.enemyData[index][5]);
    	total = parseInt($scope.enemyData[index][4]);
    	if(current<=total/4){
    		return "#FF0000";
    	}else if(current<=total/2){
    		return "#FFFF00";
    	}else{
    		return "#00FF00";
    	}
    };
    
    
    //Helper function
    function getEnemyBuffLocs(stat){
    	var debuff, weaponBuff, pairUp;
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	switch(stat){
	    	case "str": debuff = 16; weaponBuff = 59; pairUp = 66; break;
	    	case "mag": debuff = 17; weaponBuff = 60; pairUp = 67; break;
	    	case "skl": debuff = 18; weaponBuff = 61; pairUp = 68; break;
	    	case "spd": debuff = 19; weaponBuff = 62; pairUp = 69; break;
	    	case "lck": debuff = 20; weaponBuff = 63; pairUp = 70; break;
	    	case "def": debuff = 21; weaponBuff = 64; pairUp = 71; break;
	    	case "res": debuff = 22; weaponBuff = 65; pairUp = 72; break;
    	}
    	
    	return [debuff, weaponBuff, pairUp];
    };
    
    //Checks if there is a value in the index
    $scope.validDebuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index] != "";
    };
    
    //Returns true if the enemy has a non-zero entry for a stat's debuff
    $scope.eValidDebuff = function(enemy, index){
    	return $scope.enemyData[enemy][index] != "0";
    };
    
    //Checks if the value in the index is != 0
    $scope.validWeaponBuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index] != "0";
    };
    
    //Checks if the loaded character is a) paired with someone
    //and b) if the stat has a buff that is != 0
    //Version for characters
    $scope.validPairUpBuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	var value = $scope.loadedChar[index];
    	return value != "" && value != "0";
    };
    
    //Returns true if the enemy's stat (str/mag/etc) has a non-zero value
    //Version for enemies
    $scope.eValidPairUpBuff = function(enemy, stat){
    	var s = $scope.enemyData[enemy][stat];
    	return s != "" && s != "0";
    };
    
    //If a weapon increases a stat (str/mag/etc), append that value with
    //a plus (ex. "5" -> "+5")
    //Version for characters
    $scope.formatWeaponBuff = function(index){
    	var value = parseInt($scope.loadedChar[index]);
    	if(value > 0) return "+" + value;
    	else return value;
    };
    
    //If a weapon increases a stat (str/mag/etc), append that value with
    //a plus (ex. "5" -> "+5")
    //Version for enemies
    $scope.eFormatWeaponBuff = function(index, stat){
    	var value = parseInt($scope.enemyData[index][stat]);
    	if(value > 0) return "+" + value;
    	else return value;
    };
    
    //Calculates the base value for an enemy's stat (str/mag/etc) by subtracting
    //debuff/buffs from the total stat value
    $scope.calcEnemyBaseStat = function(index, stat){
    	var locs = getEnemyBuffLocs(stat);
    	var debuff = locs[0];
    	var weaponBuff = locs[1]; 
    	var pairUp = locs[2];
    	var total;
    	
    	switch(stat){
	    	case "str": total = 7; break;
	    	case "mag": total = 8; break;
	    	case "skl": total = 9; break;
	    	case "spd": total = 10; break;
	    	case "lck": total = 11; break;
	    	case "def": total = 12; break;
	    	case "res": total = 13; break;
    	}
    	
    	var enemy = $scope.enemyData[index];
    	total = parseInt(enemy[total]);
    	debuff = parseInt(enemy[debuff]);
    	weaponBuff = parseInt(enemy[weaponBuff]);
    	if(enemy[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt(enemy[pairUp]);
    	
    	return total - (debuff + weaponBuff + pairUp);
    };
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // WEAPONS PROFICIENCY     \\
    //*************************\\
    
    //Checks if a weapon name is a valid type, so that weapon proficiency can be displayed
    //Version for characters
    $scope.existsWeapon = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return compareWeaponName($scope.loadedChar[index]);
    };
    
    //Checks if a weapon name is a valid type, so that weapon proficiency can be displayed
    //Version for enemies
    $scope.existsEnemyWeapon = function(enemy,index){
    	return $scope.enemyData[enemy][index] != "-";
    };
    
    //Helper function
    function compareWeaponName(weaponName){
    	return weaponName != "" && weaponName != "N/A";
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.weaponIcon = function(index){    	
    	var w = $scope.loadedChar[index];
    	return getIcon(w);
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.enemyWeaponIcon = function(enemy,index){
    	var w = $scope.enemyData[enemy][index];
    	w = w.substring(2, w.length);
    	return getIcon(w);
    };
    
    //Helper function :)
    function getIcon(weaponName){
    	var c = weaponName.toLowerCase();
    	return "IMG/rank_" + c + ".png";
    };
    
    $scope.getTimeOut= function(){
    	return "IMG/time_out.png";
    };
    
    //Returns the first character in the passed string
    $scope.formatWeaponRank = function(str){
    	return str.substring(0,1);
    };
    
    $scope.formatItemRank = function(str){
    	
    	if(str[1]=="Consumable" || str[1]=="Item"|| str[1]=="Equipment"|| str[1]=="None"){
    		return str[1];
    	}
    	else{
    		return str[2] + "-" + str[1];
    	}
    };
    
    $scope.calcExp = function(index){
    	var exp = parseInt($scope.enemyData[index][17]);
    	
    	if($scope.enemyData[index][16] == "40")
    		return "73px";
    		
    	return ((exp/100) * 73) + 'px'; //73 is the max number of pixels
    };
    
    $scope.hasExp = function(index){
    	
    	if($scope.enemyData[index][17] == "-")
    		return false;
    		
    	return true;
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(index, p){
    	var exp = $scope.enemyData[index][p];
    	var progress = 0;
    	var total = 10;
    	if(exp<10){
    		//E
    		progress = exp;
    		total = 10;
    	}
    	else if(exp<30){
    		//D
    		progress = exp-10;
    		total = 20;
    	}
    	else if(exp<60){
    		//C
    		progress = exp-30;
    		total = 30;
    	}
    	else if(exp<100){
    		//B
    		progress = exp-60;
    		total = 40;
    	}
    	else if(exp<150){
    		//A
    		progress = exp-100;
    		total = 50;
    	}
    	else{
    		//S
    		progress = 1;
    		total = 1;
    	}
    	
    	return ((progress/total) * 30) + 'px'; //30 is the max number of pixels
    };
    
    $scope.filterItemName = function(enemy, weapon){
    	var w = $scope.enemyData[enemy][weapon][0];
    	if(w.indexOf("(") == -1) return w;
    	else return w.substring(0, w.indexOf("(")-1);
    };
    
    $scope.filterItemName2 = function(enemy, weapon){
    	var w = $scope.enemyData[enemy][weapon][0];
    	if(w.indexOf("(D)") == -1) return w;
    	else return w.substring(0, w.indexOf("(D)")-1);
    };
    
    $scope.filterItemUses = function(enemy, weapon){
    	var w = $scope.enemyData[enemy][weapon][0];
    	if(w.indexOf("(") == -1) return "-";
    	else return w.substring(w.indexOf("(")+1, w.indexOf(")"));
    };
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(index){
    	if($scope.loadedChar == undefined) return false;
    	
    	var weaponName = $scope.loadedChar[index][0];
    	if(weaponName != "-" && weaponName != "- (-)")
    		return true;
    	else return false;
    };
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for enemies
    $scope.validEnemyWeapon = function(enemy, index){
    	var weaponName = $scope.enemyData[enemy][index][0];
    	if(weaponName != "")
    		return true;
    	else return false;
    };
    
    $scope.validWeakness = function(enemy, index){
    	var weakness = $scope.enemyData[enemy][3][2][index];
    	if(weakness == "" || weakness == undefined || weakness == "NPC-only")
    		return false;
    	else return true;
    };
    
    $scope.getWeakness = function(enemy, index){
    	return "IMG/Weakness/weak_" + $scope.enemyData[enemy][3][2][index] + ".png";
    };
    
    //Returns true if the weapon at the index has a description
    $scope.weaponHasDes = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index].length == 20;
    };
    
    $scope.eWeaponHasDes = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w].length == 20;
    };
    
    //Returns true if the weapon at the index has a listed range
    $scope.hasWeaponRange = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index][18] != "";
    };
    
    $scope.eHasWeaponRange = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w][18] != "";
    };
    
    //Returns true if the weapon at the index has a listed rank
    $scope.hasWeaponRank = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index][4] != "";
    };
    
    $scope.eHasWeaponRank = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w][2] != "";
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for enemies
    $scope.getEnemyWeaponClassIcon = function(enemy,index){
    	var type = $scope.enemyData[enemy][index][1];
    	var name = $scope.enemyData[enemy][index][0];
    	if(type == undefined) return "";
    	if(name.indexOf("(")!=-1){
    		name = name.substring(0,name.indexOf("(")-1);
    	}
    	if(name == "Wind" || name == "Elwind" || name == "Arcwind" || name == "Rexcalibur" || name == "Magnum Gale"){
    		return "IMG/Items/type_tome_wind.png";
    	}
    	if(name == "Fire" || name == "Elfire" || name == "Arcfire" || name == "Bolganone" || name == "Magnum Flare"){
    		return "IMG/Items/type_tome_fire.png";
    	}
    	if(name == "Thunder" || name == "Elthunder" || name == "Arcthunder" || name == "Thoron" || name == "Magnum Bolt"){
    		return "IMG/Items/type_tome_thunder.png";
    	}
    	if(name == "Freeze" || name == "Elfreeze" || name == "Arcfreeze" ||  name == "Niflheim" || name == "Magnum Chill" || name == "Akull"){
    		return "IMG/Items/type_tome_freeze.png";
    	}
    	if(name == "Shadow Shot" || name == "Venom Shot"){
    		return "IMG/Items/type_tome_dark.png";
    	}
    	if(name == "Light"){
    		return "IMG/Items/type_tome_light.png";
    	}
    	if(name == "Brine"){
    		return "IMG/Items/type_tome_water.png";
    	}
    	if(name == "Earthquake"){
    		return "IMG/Items/type_tome_earth.png";
    	}
    	if(name == "Verglas"){
    		return "IMG/Items/type_sword_verglas.png";
    	}
    	if(name == "Torden"){
    		return "IMG/Items/type_tome_torden.png";
    	}
    	if(name == "Solas"){
    		return "IMG/Items/type_tome_solas.png";
    	}
    	
    	
    	if(name == "Dagger" || name == "Throwing Sword" || name == "Kukri" || name == "Kodachi" || name == "Effervescence" || name == "Esurience"){
    		return "IMG/Items/type_sword_dagger.png";
    	}
    	if(name=="Stone Blade"||name=="Metal Blade"||name=="Ivory Blade"){
    		return "IMG/Items/type_sword_blade.png";
    	}
    	if(name == "Javelin" || name == "Short Spear" || name == "Spear" || name == "Nageyari"){
    		return "IMG/Items/type_lance_javelin.png";
    	}
    	if(name=="Stone Greatlance"||name=="Metal Greatlance"||name=="Ivory Greatlance"){
    		return "IMG/Items/type_lance_greatlance.png";
    	}
    	if(name == "Hatchet" || name == "Hand Axe" || name == "Short Axe" || name == "Tomahawk"){
    		return "IMG/Items/type_axe_hatchet.png";
    	}
    	if(name=="Stone Poleaxe"||name=="Metal Poleaxe"||name=="Ivory Poleaxe"){
    		return "IMG/Items/type_axe_poleaxe.png";
    	}
    	if(name=="Wooden Shortbow"||name=="Stone Shortbow"||name=="Metal Shortbow"||name=="Ivory Shortbow"){
    		return "IMG/Items/type_bow_shortbow.png";
    	}
    	if(name=="Wooden Longbow"||name=="Stone Longbow"||name=="Metal Longbow"||name=="Ivory Longbow"){
    		return "IMG/Items/type_bow_longbow.png";
    	}
    	if(name == "Wooden Staff" || name == "Stone Staff" || name == "Metal Staff" || name == "Ivory Staff" || name == "Reaper Staff"){
    		return "IMG/Items/type_staff_wooden.png";
    	}
    	if(name == "Stone Staff"){
    		return "IMG/Items/type_staff_stone.png";
    	}
    	if(name == "Wooden Staff" || name == "Stone Staff" || name == "Metal Staff" || name == "Ivory Staff" || name == "Reaper Staff"){
    		return "IMG/Items/type_staff_wooden.png";
    	}
    	if(name == "Energize" || name == "Shield" || name == "Enfeeble" || name == "Expose" || name == "Poison" || name == "Curse"){
    		return "IMG/Items/type_staff_status.png";
    	}
    	if(name == "Restore" || name == "Unlock" || name == "Rescue" || name == "Warp" || name == "Hammerne" || name == "Vitae"){
    		return "IMG/Items/type_staff_misc.png";
    	}
    	if(name == "Reaper Axes"){
    		return "IMG/Items/type_axe_reaper.png";
    	}
    	if(name == "Devastation"){
    		return "IMG/Items/type_monster_frostbite.png";
    	}
    	if(name == "Evisceration"){
    		return "IMG/Items/type_monster_feather.png";
    	}
    	if(name == "Ravage"){
    		return "IMG/Items/type_monster_ravage.png";
    	}
    	if(name == "Obelisk"){
    		return "IMG/Items/type_sword_obelisk.png";
    	}
    	if(name == "Highlander"){
    		return "IMG/Items/type_sword_highlander.png";
    	}
    	if(name == "Spellfoil"){
    		return "IMG/Items/type_sword_spellfoil.png";
    	}
    	if(name.indexOf("Fior")!=-1){
    		return "IMG/Items/type_relic_fiore.png";
    	}
    	if(name == "Parashu" || name == "Blighted Parashu"){
    		return "IMG/Items/type_axe_parashu.png";
    	}
    	if(name == "Exacerbate"){
    		return "IMG/Items/type_staff_exacerbate.png";
    	}
    	if(name == "Bloom Trophy"){
    		return "IMG/Items/type_none_trophy.png";
    	}
    	if(name == "Calling Card" || name == "Death Arcana"|| name == "Arcana Deck"){
    		return "IMG/Items/type_none_card.png";
    	}
    	
    	if(name == "Dromaero Egg" || name == "Large Dromaero Egg"){
    		return "IMG/Items/type_item_egg.png";
    	}
    	if(name.indexOf("Saeptum")!=-1){
    		return "IMG/Items/type_equipment_saeptum.png";
    	}
    	
    	if(name == "Turkey"){
    		return "IMG/Items/item_turkey.png";
    	}
    	if(name == "Musty Tome" || name == "Unfinished Tome" || name == "Nearly Finished Tome"){
    		return "IMG/Items/item_mustytome.png";
    	}
    	if(name == "Weed" || name == "Not Weed"){
    		return "IMG/Items/item_weed.png";
    	}
    	if(name == "Door Key" || name == "Chest Key" || name == "Master Key"){
    		return "IMG/Items/type_key.png";
    	}
    	
    	type = type.toLowerCase();
    	return "IMG/Items/type_" + type + ".png";
    };
   
    //Returns the image for a character's skill, if they're at the minimum
    //level to obtain it. Otherwise, returns the blank skill image.
    $scope.fetchSkillImage = function(minLvl){
    	if($scope.loadedChar == undefined) return "";
    	/*if(minLvl > parseInt($scope.loadedChar[2]))
    		return "IMG/SKL/skl_blank.png";*/
    	
    	var skillName;
    	
    	switch(minLvl){
	    	case 1: skillName = 105; break;
	    	case 5: skillName = 106; break;
	    	case 10: skillName = 107; break;
	    	case 15: skillName = 108; break;
	    	case 20: skillName = 109; break;
	    	case 25: skillName = 110; break;
	    	case 30: skillName = 111; break;
	    	case 35: skillName = 112; break;
    	}
    	
    	skillName = $scope.loadedChar[skillName][0];
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/SKL/skl_" + skillName + ".png";
    };
    
    $scope.eFetchSkillImage = function(enemy, skl){
		//var skillName = $scope.enemyData[enemy][skl][0];
    	//if(skillName == "-") return "IMG/SKL/skl_blank.png"; //no skill
    	if(skl == 42) return "IMG/SKL/skl_personal.png"; //personal skill
    	
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/type_" + skillName + ".png";
    };
    
    //For displaying enemy skill gems, checks to see if the enemy has a
    //skill name in that slot
    $scope.hasSkill = function(enemy,index){
    	return $scope.enemyData[enemy][index][0] != "None";
    };
    
    $scope.checkShields = function(value){
    	if($scope.loadedChar == undefined) return "IMG/emptyshield.png";
    	var num = parseInt($scope.loadedChar[17]);
    	if(num == 10) return "IMG/blueshield.png";
    	else if(num >= value) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };
    
    //Checks if the shield value for the passed enemy is greater than number
    $scope.checkEShields = function(enemy, value){
    	var num = parseInt($scope.enemyData[enemy][3]);
    	if(num == 10) return "IMG/blueshield.png";
    	else if(num >= value) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };
    
    $scope.enemyHasNum = function(index){
    	var name = $scope.enemyData[index][0];
    	if(name == "Boss" || name == "Scheme" || name == "Slam" || name == "Forthright")
    		return true;
    	if(name.lastIndexOf(" ") == -1 || name == undefined)
    		return false;
    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	if(name.match(/^[0-9]+$/) != null) return true;
    	else return false;
    };
    
    $scope.enemyHasStatus = function(index){
    	var status = $scope.enemyData[index][29][0];
    	//these are statuses that don't display an icon
    	if(status != "None" && status != "Emerging" && status != "Marked" && status != "Defeated" && status != "Disconcerted" && status != "Blessed" && status != "Regenerating") return true;
    	else return false;
    };
    
    $scope.enemyHasStatusU = function(index){
    	var status = $scope.enemyData[index][29][0];
    	if(status != "None" && status != "Defeated") return $scope.enemyData[index][30];
    	else return 0;
    };
    
    $scope.enemyOwnsGold = function(index){
    	var gold = $scope.enemyData[index][15];
    	if(gold != "-" && gold != "" && gold != undefined) return true;
    	else return false;
    };
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
    $scope.getEnemyNum = function(index){
    	var name = $scope.enemyData[index][0];
    	if(name == "Boss" || name == "Enmity" || name == "Forthright")
    		return "IMG/shield_boss.png";
    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	return "IMG/num_" + name + ".png";
    };
    
    $scope.getEnemyStatus = function(index){
    	var status = $scope.enemyData[index][29][0];
    	if(status == "Doomed"){
    		return "IMG/Status/s_" + status + $scope.enemyData[index][30] +".png";
    	}
    	else
    		return "IMG/Status/s_" + status + ".png";
    };
    
    $scope.getEnemyStatusType = function(index){
    	var status = $scope.enemyData[index][29][0];
    	if(status == "None"){
    		return "Normal Status";
    	}
    	else
    		return status;
    };
    
    $scope.getEnemyAtt = function(index){
    	var power = $scope.enemyData[index][23][4];
    	if(power == "-" || power == ""){
    		return "-";
    	}
    	
    	power = parseInt(power);
    	
    	//S-rank power boost
    	if($scope.enemyData[index][38]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][39])>=150)
    		power +=1;
    	if($scope.enemyData[index][40]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][41])>=150)
    		power +=1;
    	if($scope.enemyData[index][42]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][43])>=150)
    		power +=1;
    	
    	var weapon = $scope.enemyData[index][23][1];
    	var effect = $scope.enemyData[index][23][12];
    	if(effect==28||effect==30){
    		return power + parseInt($scope.enemyData[index][6]);
    	}
    	if(effect==29||effect==31){
    		return power + parseInt($scope.enemyData[index][7]);
    	}
    	
    	if(weapon=="Tome"||weapon=="Talisman"||weapon=="Relic"||weapon=="Staff"){
    		//magical
    		return power + parseInt($scope.enemyData[index][7]);
    	}
    	else{
    		//physical
    		return power + parseInt($scope.enemyData[index][6]);
    	}
    };
    
    $scope.getEnemyHit = function(index){
    	var hit = $scope.enemyData[index][23][5];
    	if(hit == "-" || hit == ""){
    		return "-";
    	}
    	
    	hit = parseInt(hit);
    	
    	if($scope.enemyData[index][38]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][39])>=150)
    		hit +=15;
    	if($scope.enemyData[index][40]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][41])>=150)
    		hit +=15;
    	if($scope.enemyData[index][42]==$scope.enemyData[index][23][1]&&parseInt($scope.enemyData[index][43])>=150)
    		hit +=15;
    	
    	return Math.floor(hit + parseInt($scope.enemyData[index][8])*2 + parseInt($scope.enemyData[index][10])/2);
    };
    
    $scope.getEnemyCrit = function(index){
    	var crit = $scope.enemyData[index][23][6];
    	var cls = $scope.enemyData[index][3][0];
    	var bonus = 0;
    	
    	if(cls=="Assassin"||cls=="Rogue"||cls=="Shepherd")
    		bonus+=10;
    	else if(cls=="Berserker"||cls=="Sniper"||cls=="Swordsmaster"||cls=="Halberdier"||cls=="Savior")
    		bonus+=15;
    	
    	if(crit == "-" || crit == ""){ return "-"; }
    	else return Math.floor(parseInt(crit) + parseInt($scope.enemyData[index][8])/2 + bonus);
    };
    
    $scope.getEnemyAvo = function(index){
    	var speed = parseInt($scope.enemyData[index][9]);
    	var loss = $scope.enemyData[index][23][7];
    	
    	if(loss == "-" || loss == "")
    		loss = 0;
    	else
    		loss = parseInt(loss);
    	
    	if ($scope.enemyData[index][13] != "-" && $scope.enemyData[index][13] != undefined && $scope.enemyData[index][13] != "")
    		loss -= parseInt($scope.enemyData[index][13]);
    	if(loss < 0)
    		loss = 0;
    	speed -= loss;
    	
    	var avoBonus = $scope.enemyData[index][33][1];
    	if(avoBonus == "-") avoBonus = 0;
    	else avoBonus = parseInt(avoBonus);
    	
    	return speed*2 + parseInt($scope.enemyData[index][10]) + avoBonus;
    };
    
    //***********************\\
    // POSITION CALCULATIONS \\
    // FOR VARIOUS THINGS    \\
    //***********************\\
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineX = function(index){
    	var pos = $scope.enemyData[index][33-1];
    	if(index == 0) numDefeat = 0;
    	
    	if(pos == "Defeated" || pos == "Not Deployed"){
    		
    		return (((((numDefeat-1)%30)+2)*16))-16 + "px";
    	}
    	
    	var comma = pos.indexOf(",");
    	if(comma == -1) return "-1px";
    	
    	pos = pos.substring(0,comma); //grab first 1-2 chars
    	pos = parseInt(pos);
    	return ((pos*16))-16 + "px";
    };
    
    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineY = function(index){
    	var pos = $scope.enemyData[index][33-1];
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
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	//return (((index+1)*34)+2) + "px";
    	return (index*16) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	//return (index*34) + "px";
    	return (index*16) + "px";
    };
    
    $scope.determineInfoColor = function(index){
    	var aff = $scope.enemyData[index][1];
    	
    	if(aff == "Immolan Guard" || aff == "Gershom" || aff == "Guile" || aff == "Community (Human)" || aff == "Community (Reaper)"){
    		return "#E01616";
    	}
    	else if(aff == "Environment"){
    		return "#FFFFFF";
    	}
    	else if(aff == "Belenus" || aff == "Self"){
    		return "#FF6600";
    	}
    	else if(aff == "Reaper" || aff == "Nadir Reaper" || aff == "Apex Reaper" || aff == "Lettie"){
    		return "#E900E9";
    	}
    	else if(aff == "Loveless"){
    		return "#9D009D";
    	}
    	else if(aff == "Whimsy" || aff == "Cupidity" || aff == "Neutral" || aff == "Prisoner"){
    		return "#089000";
    	}
    	else{
    		return "#3850e0";
    	}
    };
    
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
    	var test = document.getElementById('enemy_0_box');
    	if($scope.enemyData != undefined && test != null){
    		test.addEventListener('dragstart',dragStart,false);
    		
    		//Set event listeners to be activated when the div is dragged
    	    for(var i = 1; i < $scope.enemyData.length; i++){
    	    	var box = document.getElementById('enemy_' + i + '_box');
    	    	box.addEventListener('dragstart',dragStart,false);
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