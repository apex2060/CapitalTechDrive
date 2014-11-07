var it = {};

var app = angular.module('capitalgain', [])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/mix.html',
		controller: 'MainCtrl'
	})
	.when('/board', {
		templateUrl: 'views/board.html',
		controller: 'BoardCtrl'
	})
	.when('/mix', {
		templateUrl: 'views/mix.html',
		controller: 'MainCtrl'
	})
	.when('/mobile', {
		templateUrl: 'views/mobile.html',
		controller: 'MainCtrl'
	})
	.when('/open', {
		templateUrl: 'views/open.html',
		controller: 'OpenCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
}]);

var app2 = angular.module('capitalboard', [])
.config(['$routeProvider', function($routeProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/board.html',
		controller: 'BoardCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
}]);