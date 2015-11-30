var bellboyApp = angular.module('bellboyStatusApp', ["ngRoute"]);

bellboyStatusApp.run(function($rootScope, toaster) {
  $rootScope.toast = function(toastclass, title, body, duration) {
    if (typeof duration === "undefined") {
      duration = 2000
    }
    toaster.pop(toastclass, title, body, duration)
  }
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
