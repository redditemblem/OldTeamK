var app = angular.module('RedditEmblemViewer', ['ngRoute']);
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when("/", {templateUrl: "auth.html", controller: "AuthCtrl"})
		.when("/map", {templateUrl: "home.html", controller: "HomeCtrl"});
}]);

app.directive('convoy', function(){
	return {
		restrict: 'E', 
		scope: {
			//@ reads the attribute value, = provides two-way binding, & works with functions
			title: '@'         },
		templateUrl: 'convoy.html',
		controller: 'ConvoyCtrl', //Embed a custom controller in the directive
		//link: function ($scope, element, attrs) { } //DOM manipulation
	}
});