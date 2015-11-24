bellboyApp.controller('listController', function($scope, $http, $route, $templateCache) {
  $scope.loadData = function() {
    $http.get('/api/bells').success(function(data) {

      $scope.bells = data

    }).error(function(err) {
      console.log(err)
    })
  }

  $scope.reloadView = function() {
		$route.reload();
  }

  $scope.curTime = Date.now()

  $scope.loadData()
  $scope.orderBy = '';
})
