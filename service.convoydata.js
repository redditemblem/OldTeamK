app.service('ConvoyDataService', ['$rootScope', function ($rootScope) {
    var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
    var inventory;

    this.getItems = function(){ return inventory; };

    this.loadConvoyData = function(){
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Convoy!A:O',
	    }).then(function(response) {
			var items = response.result.values;
			inventory = [];

			for(var i = 1; i < items.length; i++){
				var c = items[i];
				if(c[0].length > 0){
					inventory.push({
						'name' : c[0],
						'owner' : c[1],
						'uses' : c[2].match(/^-?[0-9]+$/) != null ? parseInt(c[2]) : "",
						'type' : c[4],
						'rank' : c[5],
						'might' : c[6],
						'hit' : c[7],
						'crit' : c[8],
						'weight' : c[9],
						'range' : c[10],
						'value' : c[11].match(/^-?[0-9]+$/) != null ? parseInt(c[11]) : "",
						'effect' : c[13],
						'desc' : c[14] != undefined ? c[14] : ""
					})
				}
			}

            $rootScope.$broadcast('convoy-load-finished'); //signal end of load
		});
	};	    
}]);