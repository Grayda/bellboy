var bellboyApp = angular.module('bellboyApp', ["toaster", "ngRoute", "schemaForm"]);

bellboyApp.run(function($rootScope, $http, toaster) {
  $rootScope.toast = function(toastclass, title, body, duration) {
    if (typeof duration === "undefined") {
      duration = 2000
    }
    toaster.pop(toastclass, title, body, duration)
  }

  $rootScope.loadSchema = function() {

    $http.get("/api/schema").success(function(data) {
      $rootScope.schema = data.schema
      $rootScope.form = data.form[0]
      console.dir(data)
      $rootScope.model = {}
    })
  }

  $rootScope.loadSchema()
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
