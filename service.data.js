app.service('DataService', ['$rootScope', function ($rootScope) {
	var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
	var progress = 0;
	var characters = null;
	var enemies = null;
	var terrain = null;
	var map, characterData, characterImages, itemIndex, terrainIndex, terrainLocs, skillIndex, classIndex, statusIndex;
	
	this.getCharacters = function(){ return characters; };
	this.getMap = function(){ return map; };
	this.setMap = function(url){ map = processImageURL(url); };
	this.getTerrainTypes = function(){ return terrainIndex; };
	this.getTerrainMappings = function(){ return terrainLocs; };

	this.loadMapData = function(type){ fetchCharacterData(type); };
	
	//\\//\\//\\//\\//\\//
	// FETCH FUNCTIONS //
	//\\//\\//\\//\\//\\//

    function fetchCharacterData(type) {
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
			fetchPlayerImageData(type);
		});
    };

	function fetchPlayerImageData(type){
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
			fetchEnemyImageData(type);
		});
    };

	function fetchEnemyImageData(type){
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
			fetchWeaponIndex(type);
		});
    };

	function fetchWeaponIndex(type){
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Item Index!A2:M',
		}).then(function(response) {
			itemIndex = response.result.values;
			updateProgressBar();
			fetchSkillDesc(type);
		});
	};

	function fetchSkillDesc(type){
  	  gapi.client.sheets.spreadsheets.values.get({
	  	spreadsheetId: sheetId,
		majorDimension: "ROWS",
		range: 'Skills!A2:E',
	  }).then(function(response) {
		skillIndex = response.result.values;
		updateProgressBar();
		fetchClassData(type);
	  });
    };

	function fetchClassData(type){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Class Stats!A2:AJ',
        }).then(function(response) {
        	classIndex = response.result.values;
         	updateProgressBar();
         	fetchStatusData(type);
        });
    };

	function fetchStatusData(type){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Status Effects!A2:D',
        }).	then(function(response) {
        	statusIndex = response.result.values;
         	updateProgressBar()
			fetchTerrainIndex(type);
        });
    };
	
	function fetchTerrainIndex(type){
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
			fetchTerrainChart(type);
		});
	};

	function fetchTerrainChart(type){
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
					terrainLocs[x+","+y] = {
						'type' : "Plain",
						'count' : 0
					}
			
			//Update terrain types from input list
			var index = "";
			for(var i = 0; i < locs.length; i++){
				index = locs[i][0].replace( /\s/g, "");
				terrainLocs[index].type = locs[i][1];
			}

			terrainLocs["-1,-1"] = { 'type' : "Plain" };
			terrainLocs["Not Deployed"] = { 'type' : "Plain" };
			terrainLocs["Defeated"] = { 'type' : "Plain" };

			updateProgressBar();
			processCharacters(type);
		});
	};	    
    
	//\\//\\//\\//\\//\\//\\//
	// CHARACTER PROCESSING //
	//\\//\\//\\//\\//\\//\\//

	function processCharacters(type){
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

				//Calculate range
				var hasCostSkill = false;
				for(var s in currObj.skills){
					var name = currObj.skills[s].name;
					if(name == "Outdoorsman" || name == "Dauntless"){
						hasCostSkill = true;
						break;
					}
				}
				currObj.range = calculateCharacterRange(currObj.position, currObj.Mov, currObj.class.terrainType, hasCostSkill);

				characters["char_" + i] = currObj;
			}
		}

		updateProgressBar();
	};

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
			'name' : i[0],
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
			'effect' : i[12]
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

	function calculateCharacterRange(pos, range, terrainType, hasCostSkill){
		if(pos.indexOf(",") == -1 || pos == "-1,-1") return []; //if not placed on the map, don't calculate

		var list = [];
		var horz = parseInt(pos.substring(0, pos.indexOf(",")));
		var vert = parseInt(pos.substring(pos.indexOf(",")+1, pos.length));
		range = parseInt(range);

		recurseRange(horz, vert, range, terrainType, hasCostSkill, list);
		return list;
	};

	function recurseRange(horzPos, vertPos, range, terrainType, hasCostSkill, list){
		if(range <= 0) return; //base case

		//Don't calculate cost for starting tile
		if(list.length > 0){
			var cost = 1;
			var classCost = terrainIndex[terrainLocs[horzPos + "," + vertPos].type][terrainType];

			if(classCost == undefined || classCost == "-") return; //unit cannot traverse tile
			else if(!hasCostSkill) cost = parseInt(classCost);
			
			range -= cost;
		}
		
		if(list.indexOf(horzPos + "," + vertPos) == -1) list.push(horzPos + "," + vertPos);

		if(horzPos > 1)
			recurseRange(horzPos-1, vertPos, range, terrainType, hasCostSkill, list);
		if(horzPos < 32)
			recurseRange(horzPos+1, vertPos, range, terrainType, hasCostSkill, list);
		if(vertPos > 1)
			recurseRange(horzPos, vertPos-1, range, terrainType, hasCostSkill, list);
		if(vertPos < 32)
			recurseRange(horzPos, vertPos+1, range, terrainType, hasCostSkill, list);
	};

	//\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
    function updateProgressBar(){
		if(progress < 100){
			progress = progress + 10; //10 calls
    		$rootScope.$broadcast('loading-bar-updated', progress);
		}
    };
    
    function processImageURL(str){
    	return str.substring(8, str.lastIndexOf(",")-1);
    };
}]);