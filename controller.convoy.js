app.controller('ConvoyCtrl', ['$scope', 'DataService', function($scope, DataService){
    $scope.items = DataService.getConvoy();

    //Color Constants
    const ROW_COLORS = {
      'Sword' : '#ff8282',
      'Lance' : '#8290ff',
      'Axe' : '#5eba60',
      'Bow' : '#fccc7e',
      'Talisman' : '#fafc7e',
      'Tome' : '#fc7eaa',
      'Relic' : '#d67efc',
      'Staff' : '#ceebed'
    }

    //Filter settings
    var sortOrder = 'name';
    $scope.showSword = true;
    $scope.showLance = true;
    $scope.showAxe = true;
    $scope.showBow = true;
    $scope.showTalisman = true;
    $scope.showTome = true;
    $scope.showRelic = true;
    $scope.showStaff = true;
    $scope.showOther = true;

    $scope.getItemSortOrder = function(){
      return sortOrder;
    };

    $scope.displayItemType = function(type){
      if(type == "None" || type == "Consumable" || type == "Equipment" || type == "Item") return $scope.showOther;
      return $scope["show" + type] == true;
    };

    $scope.updateSortOrder = function(newOrder){ sortOrder = newOrder; };

    $scope.getRowColor = function(type){
      var color = ROW_COLORS[type];
      if(color != undefined) return color;
      else return 'lightgray';
    };

    $scope.closeConvoy = function() {
      $scope.$parent.$parent.showConvoy = false;
    };
}]);