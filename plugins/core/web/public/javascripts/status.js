bellboyStatusApp.controller('statusController', function($scope, $http, $routeParams, $rootScope, $interval, $route, $location) {

  $scope.loadData = function() {
    $http.get("/api/bells/next").success(function(data) {
      $scope.nextBell = data
    }).then(function() {
      $http.get('/api/bells/all').success(function(data) {
        $scope.bells = data
      })
    })
  }

  $scope.slide = 1
  $interval(function() {
    $scope.slide += 1
    if($scope.slide == 4) {
      $scope.slide = 1
    }
  },5000)


  $interval(function() {
    $scope.time = Date.now()
  }, 100)

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
  $scope.url = $location.host()
  $scope.port = $location.port()
  $scope.loadData()

})
