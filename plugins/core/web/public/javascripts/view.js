bellboyApp.controller('viewController', function ($scope, $http, $routeParams) {
 $http.get('/api/bells/get/' + $routeParams.id).success(function(data) {

   $scope.bell = data

 }).error(function(err) {
   console.log(err)
 })

  $scope.orderBy = '!Time';
})
