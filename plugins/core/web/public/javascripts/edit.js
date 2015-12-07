bellboyApp.controller('editController', function($scope, $http, $routeParams, $rootScope, $route, $timeout) {
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



  $scope.deleteBell = function(bell) {
    $http.delete('/api/bells/delete/' + bell)
  }

  $scope.updateBell = function(bell) {
    $http.put('/api/bells/update/' + bell, $scope.bell, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  $scope.reloadData = function() {
    $scope.$digest()
  }

  $scope.trigger = function(bell) {
    $http.post('/api/bells/trigger/' + bell)
  }

  // $scope.toast = function(toastclass, title, body, duration) {
  //   if (typeof duration === "undefined") {
  //     duration = 2000
  //   }
  //   toaster.pop(toastclass, title, body, duration)
  // }

  $scope.reloadView = function() {
    $route.reload();
  }

  $scope.toggleBell = function(bell, status) {
    $http.post('/api/bells/toggle/' + bell.ID + '/' + (status === "true"))
    if (status == true) {
      $scope.toast("success", "Bell Enabled", bell.Name + " has been enabled!")
    } else {
      $scope.toast("success", "Bell Disabled", bell.Name + " has been disabled!")
    }
  }



  $scope.loadData()
  $scope.schema = $rootScope.schema
  $scope.form = $rootScope.form

  $scope.curTime = Date.now()
  $scope.formData = {}
})
