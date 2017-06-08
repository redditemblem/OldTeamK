app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
	var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
    $scope.ready = false;
    var checkGapi = $interval(checkAuth, 250);
    $scope.loadingIcon = "IMG/loadingImage.gif";
	$scope.loadingText = pickLoadingQuote();
    var bar = document.getElementById('progress'); 
    
    //Set div visibility
    var authorizeDiv = document.getElementById('authorize-div');
    var loadingDiv = document.getElementById('loading-div');
    var bar = document.getElementById('progress');
    loadingDiv.style.display = 'none';
    bar.style.value = '0px';
    
    //Continue to check gapi until it's loaded
    function checkAuth() {
    	if(gapi.client != undefined){
    		$scope.ready = true;
    		$interval.cancel(checkGapi);
    	}
    }

    //Initiate auth flow in response to user clicking authorize button.
    $scope.loadAPI = function(event, type) {
    	gapi.client.init({
    		'apiKey': id, 
    		'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    	}).then(function(){
			fetchMapURL(type);
    	});
    };

	function fetchMapURL(type){
		var dataRangeName;
		if(type == 1) dataRangeName = "Current Map!A:A";
		else dataRangeName = "Gaiden Current Map!A:A";

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "COLUMNS",
			valueRenderOption: "FORMULA",
			range: dataRangeName,
			}).then(function(response) {
				var url = response.result.values[0][5];
				
				//Display loading bar
				authorizeDiv.style.display = "none";
				loadingDiv.style.display = "inline";

				DataService.setMap(url);
				DataService.loadMapData(type);
			});
    };

	function pickLoadingQuote(){
		var num = Math.floor((Math.random() * 22) + 1);
		switch(num){
			case 1 : return 'Loading map data...';
			case 2 : return 'Trying to not crash...';
			case 3 : return 'They see me loading...';
			case 4 : return 'Installing virus.exe...';
			case 5 : return 'ERROR: 404 (jk)';
			case 6 : return 'RIP In Peace, Mercenary 04...';
			case 7 : return 'Soon (TM)';
			case 8 : return 'Fixing stuff IronPegasus broke...';
			case 9 : return 'Breaking the game balance even more...';
			case 10 : return 'Rotating pointless image...';
			case 11 : return 'Distributing ice to Damian\'s victims...';
			case 12 : return 'Praising the Son...';
			case 13 : return 'F L A C E L A O D I G N';
			case 14 : return 'Taping Soldier 01 back together...';
			case 15 : return 'Attacking defenseless soldiers...';
			case 16 : return 'Blaming Deme for Dea\'s mistakes...';
			case 17 : return 'Telling Iron she\'s the best...';
			case 19 : return 'Scouring the ground for more Weeds...';
			case 20 : return 'Duncan will remember this...';
			case 21 : return 'You went full anime. Never go full anime...';
		}
	};
    
    function fetch(){
    	var request = new XMLHttpRequest();
    	request.open('GET', 'LIB/text.txt', false);
    	request.send();
    	if (request.status == 200)
    		return request.responseText;
    };

    //Redirect user to the map page once data has been loaded
    function redirect(){
    	$location.path('/map').replace();
    	$scope.$apply();
    };

    $scope.$on('loading-bar-updated', function(event, data) {
    	bar.value = data;
		if(data >= 100){
			redirect();
		}	
    });
}]);