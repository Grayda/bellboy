var bellboyApp = angular.module('bellboyApp', ["toaster", "ngRoute", "schemaForm"]);

bellboyApp.run(function($rootScope, toaster) {
  $rootScope.toast = function(toastclass, title, body, duration) {
    if (typeof duration === "undefined") {
      duration = 2000
    }
    toaster.pop(toastclass, title, body, duration)
  }
});

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
    when('/status', {
      templateUrl: "partials/status.html",
      controller: "statusController"
    }).
    otherwise({
      redirectTo: '/bells'
    });
  }
]);
