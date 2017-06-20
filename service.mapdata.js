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
			range: 'Item Index!A2:W',
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
				index = locs[i][0].replace( /\s/g, "");
				terrainLocs[index].type = locs[i][1];
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
				for(var s in currObj.skills){
					var name = currObj.skills[s];
					if(name == "Insurmountable"){
						hasInsurmountable = true;
						break;
					}
				}
				if(currObj.position.indexOf(",") != -1 && currObj.position != "-1,-1"){
					terrainLocs[currObj.position].occupiedAffiliation = currObj.affiliation;
					if(hasInsurmountable) terrainLocs[currObj.position].insurmountable = true;
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
			for(var s in currObj.skills){
				var name = currObj.skills[s].name;
				if(name == "Outdoorsman" || name == "Dauntless") hasCostSkill = true;
				if(name == "Pass") hasPass = true;
			}

			var ranges = calculateCharacterRange(currObj.position, currObj.Mov, currObj.inventory.itm1.range, currObj.class.terrainType, currObj.affiliation, hasCostSkill, hasPass);
			currObj.range = ranges.movRange;
			currObj.atkRange = ranges.atkRange;
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
			'altIcon' : i[22] != undefined ? i[22] : ""
		};
	};

	//\\//\\//\\//\\//\\
	// FIND FUNCTIONS \\
	//\\//\\//\\//\\//\\

	function findClass(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", ""];

		for(var i = 0; i < classIndex.length; i++)
			if(name == classIndex[i][0])
				return [classIndex[i][0], classIndex[i][34], classIndex[i][35], classIndex[i][24]];
		
		return [name, "This class could not be located.", "", ""];
	}

	function findStatus(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", "", ""];

		for(var i = 0; i < statusIndex.length; i++)
			if(name == statusIndex[i][0])
				return statusIndex[i];
		
		return [name, "", "This status could not be located.", "-", "-"];
	};

	function findSkill(name){
		if(name == undefined || name.length == 0)
			return ["", "", "", "", ""];

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
    	
    	//Locate item
    	for(var i = 0; i < itemIndex.length; i++)
    		if(itemIndex[i][0] == name)
    			return itemIndex[i];

    	return [name, "Unknown", "-", "-", "-", "-", "-", "-", "-", "-|-", "Could not locate item. Please contact Deallocate", "", ""];
	};

	//\\//\\//\\//\\//\\//
	// CHARACTER RANGE  //
	//\\//\\//\\//\\//\\//

	function calculateCharacterRange(pos, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass){
		var list = [];
		var itemList = [];

		if(pos.indexOf(",") == -1 || pos == "-1,-1")
			return { 'movRange' : list, 'atkRange' : itemList }; //if not placed on the map, don't calculate

		var horz = parseInt(pos.substring(0, pos.indexOf(",")));
		var vert = parseInt(pos.substring(pos.indexOf(",")+1, pos.length));
		range = parseInt(range);

		if(itemRange.indexOf("-") != -1 && itemRange.length > 1)
			itemRange = itemRange.substring(itemRange.indexOf("-")+1, itemRange.length);
		itemRange = itemRange.trim();
		itemRange = itemRange.match(/^[0-9]+$/) != null ? parseInt(itemRange) : 0;

		recurseRange(horz, vert, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, "_");
		return { 'movRange' : list, 'atkRange' : itemList };
	};

	function recurseRange(horzPos, vertPos, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, trace){
		//Don't calculate cost for starting tile
		if(trace.length > 1){
			var cost = 1;
			var occupiedAff = terrainLocs[horzPos + "," + vertPos].occupiedAffiliation;
			var insur = terrainLocs[horzPos + "," + vertPos].insurmountable;
			var classCost = terrainIndex[terrainLocs[horzPos + "," + vertPos].type][terrainType];

			//Unit cannot traverse tile if it has no cost or it is occupied by an enemy unit
			if(   classCost == undefined
			   || classCost == "-"
			   || insur
			   || (occupiedAff.length > 0 && occupiedAff != affiliation && !hasPass && !insur)
			)
				return;
			else if(!hasCostSkill) cost = parseInt(classCost);
			
			range -= cost;
		}
		
		if(list.indexOf(horzPos + "," + vertPos) == -1) list.push(horzPos + "," + vertPos);
		trace += horzPos + "," + vertPos + "_";

		if(range <= 0){ //base case
			recurseItemRange(horzPos, vertPos, itemRange, list, itemList, "_");
			return;
		} 

		if(horzPos > 1 && trace.indexOf("_"+(horzPos-1)+","+vertPos+"_") == -1)
			recurseRange(horzPos-1, vertPos, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, trace);
		if(horzPos < 32 && trace.indexOf("_"+(horzPos+1)+","+vertPos+"_") == -1)
			recurseRange(horzPos+1, vertPos, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, trace);
		if(vertPos > 1 && trace.indexOf("_"+horzPos+","+(vertPos-1)+"_") == -1)
			recurseRange(horzPos, vertPos-1, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, trace);
		if(vertPos < 32 && trace.indexOf("_"+horzPos+","+(vertPos+1)+"_") == -1)
			recurseRange(horzPos, vertPos+1, range, itemRange, terrainType, affiliation, hasCostSkill, hasPass, list, itemList, trace);
	};

	function recurseItemRange(horzPos, vertPos, range, list, itemList, trace){
		if(range <= 0) return; //base case

		//Don't check cost for starting tile
		if(trace.length > 1){
			//Make sure tile can be traversed by some unit
			var classCost = terrainIndex[terrainLocs[horzPos + "," + vertPos].type].Flier;
			if(classCost == undefined || classCost == "-") return;
			range -= 1;

			if(list.indexOf(horzPos + "," + vertPos) == -1 && itemList.indexOf(horzPos + "," + vertPos) == -1) 
				itemList.push(horzPos + "," + vertPos);
		}

		trace += horzPos + "," + vertPos + "_";

		if(horzPos > 1 && trace.indexOf("_"+(horzPos-1)+","+vertPos+"_") == -1)
			recurseItemRange(horzPos-1, vertPos, range, list, itemList, trace);
		if(horzPos < 32  && trace.indexOf("_"+(horzPos+1)+","+vertPos+"_") == -1)
			recurseItemRange(horzPos+1, vertPos, range, list, itemList, trace);
		if(vertPos > 1 && trace.indexOf("_"+horzPos+","+(vertPos-1)+"_") == -1)
			recurseItemRange(horzPos, vertPos-1, range, list, itemList, trace);
		if(vertPos < 32 && trace.indexOf("_"+horzPos+","+(vertPos+1)+"_") == -1)
			recurseItemRange(horzPos, vertPos+1, range, list, itemList, trace);
	};

	//\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
	function getDefaultTerrainObj(){
		return {
			'type' : "Plain",
			'movCount' : 0,
			'atkCount' : 0,
			'staffCount' : 0,
			'occupiedAffiliation' : '',
			'insurmountable' : false
		}
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