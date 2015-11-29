bellboyApp.controller('statusController', function($scope, $http, $routeParams, $rootScope) {

  $scope.loadData = function() {
    $http.get('/api/bells/get/' + $routeParams.id).success(function(data) {
      $scope.bell = data
    }).error(function(err) {
      console.log(err)
    })

    $http.get("/api/bells/next").success(function(data) {
      $scope.nextBell = data
    }).error(function(err) {
      console.log(err)
    })
  }

  $scope.trigger = function(bell) {
    $http.post('/api/bells/trigger/' + bell)
  }

  $scope.reloadView = function() {
    $route.reload();
  }

  $scope.toggleBell = function(bell, status) {
    $http.post('/api/bells/toggle/' + bell.ID + '/' + status)
    if (status == true) {
      $scope.toast("success", "Bell Enabled", bell.Name + " has been enabled!")
    } else {
      $scope.toast("success", "Bell Disabled", bell.Name + " has been disabled!")
    }

  }

  // $scope.toast = function(toastclass, title, body, duration) {
  //   if (typeof duration === "undefined") {
  //     duration = 2000
  //   }
  //   toaster.pop(toastclass, title, body, duration)
  // }


  $scope.loadData()
})
