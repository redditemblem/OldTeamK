app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
	var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
    $scope.ready = false;
    var checkGapi = $interval(checkAuth, 250);
    $scope.loadingIcon = "IMG/loadingImage.gif";
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
		if(type == 1) dataRangeName = "Current Map!A:B";
		else dataRangeName = "Gaiden Current Map!A:A";

		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "COLUMNS",
			valueRenderOption: "FORMULA",
			range: dataRangeName,
			}).then(function(response) {
				var url = response.result.values[0][5];
				
				if(response.result.values.length > 1){
					var quotes = response.result.values[1];
					$scope.loadingText = quotes[Math.floor((Math.random() * quotes.length) + 1)];
				}

				DataService.setMap(url);
				DataService.loadMapData(type);
			});
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