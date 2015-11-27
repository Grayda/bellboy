var bellboyApp = angular.module('bellboyApp', ["toaster", "ngRoute"]);

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
        controller: 'viewController'
      }).
      when('/bells/toggle/:id', {
        redirectTo: "/bells"
      }).
      otherwise({
        redirectTo: '/bells'
      });
  }]);
