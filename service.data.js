app.service('DataService', ['$location', function ($location) {
	var characters;
	var enemies;
	var map;
	
	this.getCharacters = function(){ return characters; };
	this.setCharacters = function(s){ characters = s; };
	
	this.getEnemies = function(){ return enemies; };
	this.setEnemies = function(s){ enemies = s; };
	
	this.getMap = function(){ return map; };
	this.setMap = function(s){ map = s; };
	
	this.getTerrain = function(){ return terrainData;};
	this.setTerrain = function(s){ terrainData = s;};
}]);