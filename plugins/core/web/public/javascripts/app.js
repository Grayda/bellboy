var bellboyApp = angular.module('bellboyApp', ["ngRoute"]);

bellboyApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/bells', {
        templateUrl: 'partials/list.html',
        controller: 'listController'
      }).
      when('/bells/edit/:id', {
        templateUrl: "partials/edit.html",
        controller: 'editController'
      }).
      when('/bells/view/:id', {
        templateUrl: "partials/view.html",
        controller: 'editController'
      }).
      otherwise({
        redirectTo: '/bells'
      });
  }]);
