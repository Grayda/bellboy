bellboyApp.controller('listController', function($scope, $http) {
  $scope.loadData = function() {
    $http.get('/api/bells').success(function(data) {

      $scope.bells = data

    }).error(function(err) {
      console.log(err)
    })
  }

  $scope.loadData()
  $scope.orderBy = '!TimeDifference';
})
