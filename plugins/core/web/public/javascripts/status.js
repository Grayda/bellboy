bellboyStatusApp.controller('statusController', function($scope, $http, $routeParams, $rootScope) {

  $scope.loadData = function() {
    $http.get("/api/bells/next").success(function(data) {
      $scope.nextBell = data
    }).then(function() {
      $http.get('/api/bells/get/' + $scope.nextBell[0].id).success(function(data) {
        $scope.bell = data
      })
    })

  }

  $scope.reloadData = function() {
    $scope.$digest()
  }

  $scope.trigger = function(bell) {
    $http.post('/api/bells/trigger/' + bell)
  }

  // $scope.toast = function(toastclass, title, body, duration) {
  //   if(typeof duration === "undefined") { duration = 2000 }
  //   toaster.pop(toastclass, title, body, duration)
  // }

  $scope.reloadView = function() {
    $route.reload();
  }

  $scope.curTime = Date.now()

  $scope.loadData()
})
