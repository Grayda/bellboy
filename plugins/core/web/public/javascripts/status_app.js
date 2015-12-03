var bellboyStatusApp = angular.module('bellboyStatusApp', ["ngRoute", "ngFitTextDynamic"]);

bellboyStatusApp.run(function($rootScope) {


});

bellboyStatusApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
    when('/status', {
      templateUrl: "partials/status.html",
      controller: "statusController"
    }).
    otherwise({
      redirectTo: '/status'
    });
  }
]);
