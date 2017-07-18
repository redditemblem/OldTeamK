app.service('MapDataService', ['$rootScope', function ($rootScope) {
	var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
	var progress = 0;
	var characters = null;
	var enemies = null;
	var terrain = null;
	var type, map, characterData, characterImages, itemIndex, terrainIndex, terrainLocs, skillIndex, classIndex, statusIndex, convoy;
	
	this.getCharacters = function(){ return characters; };
	this.getTerrainTypes = function(){ return terrainIndex; };
	this.getTerrainMappings = function(){ return terrainLocs; };
	this.getMap = function(){ return map; };
	this.getMapType = function(){ return type; };

	this.loadMapData = function(t){
		progress = 0;
		type = t;
		fetchMapURL();
	};
	
	//\\//\\//\\//\\//\\//
	// FETCH FUNCTIONS //
	//\\//\\//\\//\\//\\//

	function fetchMapURL(){
		var sheet;
		if(type == 1) sheet = "Current Map!A:A";
		else sheet = "Gaiden Current Map!A:A";

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "COLUMNS",
			valueRenderOption: "FORMULA",
			range: sheet,
		}).then(function(response) {
			map = processImageURL(response.result.values[0][5]);
			updateProgressBar();
			fetchCharacterData();
		});
	};

    function fetchCharacterData() {
		var sheet;
    	if(type==1) sheet = 'Stats!A1:ZZ';
		else sheet = 'Gaiden Stats!A1:ZZ';

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "COLUMNS",
			range: sheet,
		}).then(function(response) {
			characterData = response.result.values;
			updateProgressBar();
			fetchPlayerImageData();
		});
    };

	function fetchPlayerImageData(){
		var sheet;
		if(type==1) sheet = 'Player Stats!B3:3';
		else sheet = 'Gaiden Player Stats!B3:3';

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			valueRenderOption: "FORMULA",
			range: sheet,
		}).then(function(response) {
			characterImages = response.result.values[0];
			updateProgressBar();
			fetchEnemyImageData();
		});
    };

	function fetchEnemyImageData(){
		var sheet;
		if(type==1) sheet = 'Enemy Stats!B3:3';
		else sheet = 'Gaiden Enemy Stats!B3:3';

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			valueRenderOption: "FORMULA",
			range: sheet,
		}).then(function(response) {
			characterImages = characterImages.concat(response.result.values[0]);
			
			for(var i = 0; i < characterImages.length && i < characterData.length; i++)
				characterData[i][2] = processImageURL(characterImages[i]);

			updateProgressBar();
			fetchWeaponIndex();
		});
    };

	function fetchWeaponIndex(){
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Item Index!A2:V',
		}).then(function(response) {
			itemIndex = response.result.values;
			updateProgressBar();
			fetchSkillDesc();
		});
	};

	function fetchSkillDesc(){
  	  gapi.client.sheets.spreadsheets.values.get({
	  	spreadsheetId: sheetId,
		majorDimension: "ROWS",
		range: 'Skills!A2:E',
	  }).then(function(response) {
		skillIndex = response.result.values;
		updateProgressBar();
		fetchClassData();
	  });
    };

	function fetchClassData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Class Stats!A2:AJ',
        }).then(function(response) {
        	classIndex = response.result.values;
         	updateProgressBar();
         	fetchStatusData();
        });
    };

	function fetchStatusData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Status Effects!A2:D',
        }).	then(function(response) {
        	statusIndex = response.result.values;
         	updateProgressBar()
			fetchTerrainIndex();
        });
    };
	
	function fetchTerrainIndex(){
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Terrain Chart!A2:K',
		}).then(function(response) {
			var rows = response.result.values;
			terrainIndex = {};

			for(var i = 0; i < rows.length; i++){
				var r = rows[i];
				terrainIndex[r[0]] = {
					'avo' : parseInt(r[1]),
					'def' : parseInt(r[2]),
					'Foot' :  r[3],
					'Armour' : r[4],
					'Mounted' : r[5],
					'Barbarian' :  r[6],
					'Mage' :  r[7],
					'Flier' : r[8],
					'effect' : r[9],
					'desc' : r[10]
				}
			}

			updateProgressBar();
			fetchTerrainChart();
		});
	};

	function fetchTerrainChart(){
		var sheet;
		if(type==1) sheet = 'Terrain Locations!A2:B';
		else sheet = 'Gaiden Terrain Locations!A2:B';

	    gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: sheet,
	    }).then(function(response) {
			var locs = response.result.values;
			terrainLocs = {};

			for(var y = 1; y <= 32; y++)
				for(var x = 1; x <= 32; x++)
					terrainLocs[x+","+y] = getDefaultTerrainObj();
			
			//Update terrain types from input list
			var index = "";
			for(var i = 0; i < locs.length; i++){
				index = locs[i][0].replace( /\s/g, ""); //remove spaces
				if(locs[i][1] != "Treasure") terrainLocs[index].type = locs[i][1];
				else terrainLocs[index].treasure = true;
			}

			terrainLocs["-1,-1"] = getDefaultTerrainObj();
			terrainLocs["Not Deployed"] = getDefaultTerrainObj();
			terrainLocs["Defeated"] = getDefaultTerrainObj();

			updateProgressBar();
			processCharacters();
		});
	};
    
	//\\//\\//\\//\\//\\//\\//
	// CHARACTER PROCESSING //
	//\\//\\//\\//\\//\\//\\//

	function processCharacters(){
		characters = {};
		for(var i = 0; i < characterData.length; i++){
			var c = characterData[i];
			if(c[0] != ""){
				var currObj = {
					'name' : c[0],
					'affiliation' : c[1],
					'spriteUrl' : c[2],
					'class' : fetchClass(c[0], c[1], c[3]),
					'maxHp' : c[4],
					'currHp' : c[5],
					'Str' : c[6],
					'Mag' : c[7],
					'Skl' : c[8],
					'Spd' : c[9],
					'Lck' : c[10],
					'Def' : c[11],
					'Res' : c[12],
					'Con' : c[13],
					'Mov' : c[14],
					'gold' : c[15],
					'lvl' : c[16],
					'exp' : c[17],
					'skills': {},
					'inventory': {},
					'status': fetchStatus(c[29]),
					'turnsLeft' : c[30],
					'moved' : c[31],
					'position' : c[32],
					'weaponRanks' : {
						'wpn1' : {
							'class': c[38],
							'rank': c[34],
							'exp': c[39]
						},
						'wpn2' : {
							'class': c[40],
							'rank': c[35],
							'exp': c[41]
						},
						'wpn3' : {
							'class': c[42],
							'rank': c[36],
							'exp': c[43]
						}
					},
					'blurb' : c[104] != undefined ? c[104] : ""
				};
				
				for(var j = 18; j < 23; j++)
					currObj.skills["skl"+(j-17)] = fetchSkill(c[j]);

				for(var k = 23; k < 28; k++)
					currObj.inventory["itm"+(k-22)] = fetchItem(c[k]);

				//Set terrain information with character affiliation
				var hasInsurmountable = false;
				var hasObstruct = false;
				for(var s in currObj.skills){
					var name = currObj.skills[s].name;
					if(name == "Insurmountable") hasInsurmountable = true;
					if(name == "Obstruct") hasObstruct = true;
				}


				if(currObj.position.indexOf(",") != -1 && currObj.position != "-1,-1"){
					terrainLocs[currObj.position].occupiedAffiliation = currObj.affiliation;
					if(hasInsurmountable) terrainLocs[currObj.position].insurmountable = true;

					if(hasObstruct){
						var horz = parseInt(currObj.position.substring(0, currObj.position.indexOf(",")));
						var vert = parseInt(currObj.position.substring(currObj.position.indexOf(",")+1, pos.length));

						terrainLocs[(horz-1) + "," + vert].obstruct = true;
						terrainLocs[(horz-1) + "," + vert].obstructAffl = currObj.affiliation;

						terrainLocs[(horz+1) + "," + vert].obstruct = true;
						terrainLocs[(horz+1) + "," + vert].obstructAffl = currObj.affiliation;

						terrainLocs[horz + "," + (vert-1)].obstruct = true;
						terrainLocs[horz + "," + (vert-1)].obstructAffl = currObj.affiliation;

						terrainLocs[horz + "," + (vert+1)].obstruct = true;
						terrainLocs[horz + "," + (vert+1)].obstructAffl = currObj.affiliation;
					}
				}

				characters["char_" + i] = currObj;
			}
		}

		updateProgressBar();
		updateCharacterRanges();
	};

	function updateCharacterRanges(){
		for(var char in characters){
			var currObj = characters[char];

			//Determine if character has any skills that affect range
			var hasCostSkill = false;
			var hasPass = false;
			var hasWaterWings = false;
			var hasStaffSavant = false;
			var hasSwordSavant = false;
			var hasLanceSavant = false;
			var hasAxeSavant = false;
			var hasBowSavant = false;

			for(var s in currObj.skills){
				var name = currObj.skills[s].name;
				switch(name){
					case "Outdoorsman" : 
					case "Dauntless" : hasCostSkill = true; break;
					case "Pass" : hasPass = true; break;
					case "Water Wings" : hasWaterWings = true; break;
					case "Staff Savant" : hasStaffSavant = true; break;
					case "Sword Savant" : hasSwordSavant = true; break;
					case "Lance Savant" : hasLanceSavant = true; break;
					case "Axe Savant" : hasAxeSavant = true; break;
					case "Bow Savant" : hasBowSavant = true; break;
				}
			}

			var maxAtkRange = 0;
			var maxHealRange = 0;

			for(var i in currObj.inventory){
				var item = currObj.inventory[i];
				if(canUseItem(currObj.weaponRanks, item.class)){
					var range = formatItemRange(item.range);

					if((hasSwordSavant && item.class == "Sword") ||
					   (hasLanceSavant && item.class == "Lance") ||
					   (hasAxeSavant && item.class == "Axe"))
					{ range = 2; }
					else if((hasBowSavant && item.class == "Bow" && range < 3) ||
							(hasStaffSavant && item.class == "Staff"))
				    { range += 1; }

					if(isAttackingItem(item.class, item.desc) && range > maxAtkRange){ maxAtkRange = range; maxAtkItemClass = item.class; }
					else if(range > maxHealRange){ maxHealRange = range; maxHealItemClass = item.class; }
				}
			}
			
			var params = {
				'atkRange' : maxAtkRange,
				'healRange' : maxHealRange > maxAtkRange ? maxHealRange : 0,
				'terrainClass' : currObj.class.terrainType,
				'affiliation' : currObj.affiliation,
				'hasCostSkill' : hasCostSkill,
				'hasPass' : hasPass,
				'hasWaterWings' : hasWaterWings
			};

			var ranges = calculateCharacterRange(currObj.position, currObj.Mov, params);
			currObj.range = ranges.movRange;
			currObj.atkRange = ranges.atkRange;
			currObj.healRange = ranges.healRange;
		}

		updateProgressBar();
	};

	//\\//\\//\\//\\//\\//
	// FETCH FUNCTIONS  //
	//\\//\\//\\//\\//\\//

	function fetchClass(char, affl, cName){
		var c = findClass(cName);

		var weaknesses = c[3].split(",");
		if(affl != undefined && char != undefined){
			if(affl.indexOf("Reaper") != -1 || char == "Fallacy" || char == "Dolour")
				weaknesses.push("Reaper");
			if(affl == "Loveless")
				weaknesses.push("Loveless");
			if(affl == "Lettie")
				weaknesses.push("Cloud");
			if(char == "Ravager")
				weaknesses.push("Beast");
			if(char == "Devastator")
				weaknesses.push("Reptile");
			if(char == "Eviscerator")
				weaknesses.push("Flying");
		}

		var weakObj = {};
		for(var i = 0; i < 4; i++){
			if(weaknesses[i] == "NPC-only") weaknesses.splice(i,1);
			if(weaknesses.length > i) weakObj["weak_"+i] = weaknesses[i].trim();
			else weakObj["weak_"+i] = "";
		}

		return {
			'name' : c[0],
			'desc' : c[1],
			'terrainType' : c[2],
			'weaknesses' : weakObj
		}
	};

	function fetchStatus(status){
		var s = findStatus(status);
		return {
			'name' : s[0], 
			'desc' : s[2],
			'class': s[3],
			'turns': s[4]
		}
	};

	function fetchSkill(skill){
		var s = findSkill(skill);
		return {
			'name' : s[0],
			'type' : s[1],
			'trigger' : s[2],
			'desc' : s[4]
		};
	};

	function fetchItem(item){
		var i = findItem(item);
		return{
			'name' : item,
			'class' : i[1],
			'rank' : i[2],
			'might' : i[4],
			'hit' : i[5],
			'crit' : i[6],
			'weight' : i[7],
			'range' : i[8],
			'effect' : i[9],
			'desc' : i[10],
			'notes' : i[11],
			'effect' : i[12] != undefined ? i[12] : "-1",
			'altIcon' : i[21] != undefined ? i[21] : ""
		};
	};

	//\\//\\//\\//\\//\\
	// FIND FUNCTIONS \\
	//\\//\\//\\//\\//\\

	function findClass(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", ""];

		name = name.trim();
		for(var i = 0; i < classIndex.length; i++)
			if(name == classIndex[i][0])
				return [classIndex[i][0], classIndex[i][34], classIndex[i][35], classIndex[i][24]];
		
		return [name, "This class could not be located.", "", ""];
	}

	function findStatus(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", "", ""];

		name = name.trim();
		for(var i = 0; i < statusIndex.length; i++)
			if(name == statusIndex[i][0])
				return statusIndex[i];
		
		return [name, "", "This status could not be located.", "-", "-"];
	};

	function findSkill(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", "", ""];

		name = name.trim();
		for(var i = 0; i < skillIndex.length; i++)
            if(skillIndex[i][0] == name)
                return skillIndex[i];

        return [skill, ,"???","???", "?", "Skill data could not be found."];
	};

	function findItem(name){
		if(name == undefined || name.length == 0)
    		return ["", "Unknown", "-", "-", "-", "-", "-", "-", "-", "-|-", "Could not locate item. Please contact Deallocate", "", ""];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
		name = name.trim();
    	//Locate item
    	for(var i = 0; i < itemIndex.length; i++)
    		if(itemIndex[i][0] == name)
    			return itemIndex[i];

    	return [name, "Unknown", "-", "-", "-", "-", "-", "-", "-", "-|-", "Could not locate item. Please contact Deallocate", "", ""];
	};

	//\\//\\//\\//\\//\\//
	// CHARACTER RANGE  //
	//\\//\\//\\//\\//\\//

	function calculateCharacterRange(pos, range, params){
		if(pos.indexOf(",") == -1 || pos == "-1,-1")
			return { 'movRange' : [], 'atkRange' : [], 'healRange' : [] }; //if not placed on the map, don't calculate

		var horz = parseInt(pos.substring(0, pos.indexOf(",")));
		var vert = parseInt(pos.substring(pos.indexOf(",")+1, pos.length));
		range = parseInt(range);

		var list = [];
		var atkList = [];
		var healList = [];

		recurseRange(0, horz, vert, range, params, list, atkList, healList, "_");
		return { 'movRange' : list, 'atkRange' : atkList, 'healRange' : healList };
	};

	//MODES
	//0 = mov, 1 = atk, 2 = heal
	function recurseRange(mode, horzPos, vertPos, range, params, list, atkList, healList, trace){
		//Don't calculate cost for starting tile
		var coord = horzPos + "," + vertPos;
		var tile = terrainLocs[coord];

		//Mov mode calcs
		if(trace.length > 1 && mode == 0){
			var classCost = terrainIndex[tile.type][params.terrainClass];

			//Determine traversal cost
			if( classCost == undefined
			   || (classCost == "-" && !(params.hasWaterWings && tile.type.indexOf("Water") != -1))
			   || tile.insurmountable
			   || (tile.occupiedAffiliation.length > 0 && tile.occupiedAffiliation != params.affiliation && !params.hasPass && !tile.insurmountable)
			){
				if(params.atkRange > 0){ range = params.atkRange; mode = 1; }
				else if(params.healRange > 0){ range = params.healRange; mode = 2; }
				else return;
			}
			else if(params.hasWaterWings && tile.type.indexOf("Water") != -1) range -= 1;
			else if(tile.obstruct && tile.obstructAffl != params.affiliation && !params.hasPass) range -= 99;
			else if(!params.hasCostSkill) range -= parseFloat(classCost);
			else range -= 1;
		}

		//Attack/heal mode calcs
		if(mode > 0){
			var classCost = terrainIndex[terrainLocs[coord].type].Flier;
			if(classCost == undefined || classCost == "-") return;
			range -= 1;
		}

		if(mode == 0 && list.indexOf(coord) == -1) list.push(coord);
		else if(mode == 1 && atkList.indexOf(coord) == -1) atkList.push(coord);
		else if(healList.indexOf(coord) == -1) healList.push(coord);
		
		trace += coord + "_";

		if(range <= 0){ //base case
			if(mode == 0 && params.atkRange > 0){ range = params.atkRange; mode = 1; }
			else if(mode != 2 && params.healRange > 0){ 
				if(mode == 0) range = params.healRange;
				else range = params.healRange - params.atkRange;
				mode = 2; 
			}
			else return;
		} 

		if(horzPos > 1 && trace.indexOf("_"+(horzPos-1)+","+vertPos+"_") == -1 &&
			(mode == 0 || (list.indexOf("_"+(horzPos-1)+","+vertPos+"_") == -1 && 
				(mode == 1 || atkList.indexOf("_"+(horzPos-1)+","+vertPos+"_") == -1))))
			recurseRange(mode, horzPos-1, vertPos, range, params, list, atkList, healList, trace);

		if(horzPos < 32 && trace.indexOf("_"+(horzPos+1)+","+vertPos+"_") == -1 &&
			(mode == 0 || (list.indexOf("_"+(horzPos+1)+","+vertPos+"_") == -1 && 
				(mode == 1 || atkList.indexOf("_"+(horzPos+1)+","+vertPos+"_") == -1))))
			recurseRange(mode, horzPos+1, vertPos, range, params, list, atkList, healList, trace);

		if(vertPos > 1 && trace.indexOf("_"+horzPos+","+(vertPos-1)+"_") == -1 &&
			(mode == 0 || (list.indexOf("_"+horzPos+","+(vertPos-1)+"_") == -1 && 
				(mode == 1 || atkList.indexOf("_"+horzPos+","+(vertPos-1)+"_") == -1))))
			recurseRange(mode, horzPos, vertPos-1, range, params, list, atkList, healList, trace);

		if(vertPos < 32 && trace.indexOf("_"+horzPos+","+(vertPos+1)+"_") == -1 &&
			(mode == 0 || (list.indexOf("_"+horzPos+","+(vertPos+1)+"_") == -1 && 
				(mode == 1 || atkList.indexOf("_"+horzPos+","+(vertPos+1)+"_") == -1))))
			recurseRange(mode, horzPos, vertPos+1, range, params, list, atkList, healList, trace);
	};

	//\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
	function getDefaultTerrainObj(){
		return {
			'type' : "Plain",
			'movCount' : 0,
			'atkCount' : 0,
			'healCount' : 0,
			'occupiedAffiliation' : '',
			'insurmountable' : false,
			'obstruct' : false,
			'obstructAffl' : '',
			'treasure' : false
		}
	};

	function formatItemRange(range){
		if(range.indexOf("-") != -1 && range.length > 1)
			range = range.substring(range.indexOf("-")+1, range.length);
		range = range.trim();
		return range.match(/^[0-9]+$/) != null ? parseInt(range) : 0;
	};

	function isAttackingItem(wpnClass, desc){
		if(wpnClass == "Staff" || 
			(wpnClass == "Consumable" && 
				(desc.indexOf("Restores") != -1 || desc.indexOf("Heals") != -1)
		))
			return false;
		else return true;
	};

	function canUseItem(wpnRanks, cls){
		return cls == wpnRanks.wpn1.class 
			|| cls == wpnRanks.wpn2.class 
			|| cls == wpnRanks.wpn3.class 
			|| ("NoneConsumableItemEquipment").indexOf(cls) != -1;
	};

    function updateProgressBar(){
		if(progress < 100){
			progress = progress + 8.5; //12 calls
    		$rootScope.$broadcast('loading-bar-updated', progress);
		}
    };
    
    function processImageURL(str){
    	return str.substring(str.indexOf("\"")+1, str.lastIndexOf("\""));
    };
}]);