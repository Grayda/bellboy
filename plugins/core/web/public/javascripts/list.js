bellboyApp.controller('listController', function($scope, $http, $route, $rootScope) {
  $scope.loadData = function() {
      $http.get('/api/bells/get').success(function(data) {
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
  $scope.orderBy = '';
})
