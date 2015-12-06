var bellboyStatusApp = angular.module('bellboyStatusApp', ["ngRoute", "ngFitTextDynamic"]);

bellboyStatusApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/status', {
      templateUrl: "partials/status.html",
      controller: "statusController"
    }).
    when('/help', {
      templateUrl: "partials/status_help.html"
    }).
    otherwise({
      redirectTo: '/status'
    });
  }
]);
