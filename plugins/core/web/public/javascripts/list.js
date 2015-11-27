bellboyApp.controller('listController', function($scope, $http, $route, $timeout, toaster) {
  $scope.loadData = function() {
      $http.get('/api/bells').success(function(data) {
        $scope.bells = data
      }).error(function(err) {
        console.log(err)
      })

    $http.get("/api/bells/next").success(function(data) {
      $scope.nextBell = data
    }).error(function(err) {
      console.log(err)
    })


  }

  $scope.reloadData = function() {
    $scope.$digest()
  }

  $scope.toast = function(toastclass, title, body, duration) {
    if(typeof duration === "undefined") { duration = 2000 }
    toaster.pop(toastclass, title, body, duration)
  }

  $scope.reloadView = function() {
		$route.reload();
  }

  $scope.toggleBell = function(bell, status) {
    $http.post('/api/bells/toggle/' + bell + '/' + !!status)
    if(status == true) {
      $scope.toast("success","Bell Enabled","Bell has been enabled!")
    } else {
      $scope.toast("success","Bell Disabled","Bell has been disabled!")
    }

      $scope.loadData()
  }

  $scope.curTime = Date.now()

  $scope.loadData()
  $scope.orderBy = '';
})
