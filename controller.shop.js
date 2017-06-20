app.controller('ShopCtrl', ['$scope', 'ShopDataService', function($scope, ShopDataService){
    $scope.items = [];

    //Initialize items list, load it if it hasn't been already
    if(ShopDataService.getItems() == null){
        ShopDataService.loadShopData();

        $scope.$on('shop-load-finished', function(event) {
    	    $scope.items = ShopDataService.getItems();
            $scope.$apply(); //force update of items list
        });
    }else{
        $scope.items = ShopDataService.getItems();
    }

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
    var sortOrder = 'type';
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

    $scope.allChecked = function(){
      return $scope.showSword && $scope.showLance && $scope.showAxe && $scope.showBow && 
          $scope.showTalisman && $scope.showTome && $scope.showRelic && $scope.showStaff && $scope.showOther;
    };

    $scope.setAllCheckboxes = function(){
        var val = !($scope.allChecked());
        $scope.showSword = val;
        $scope.showLance = val;
        $scope.showAxe = val;
        $scope.showBow = val;
        $scope.showTalisman = val;
        $scope.showTome = val;
        $scope.showRelic = val;
        $scope.showStaff = val;
        $scope.showOther = val;
    };

    $scope.closeShop = function() {
      $scope.$parent.$parent.showShop = false;
    };
}]);