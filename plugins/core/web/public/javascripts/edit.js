bellboyApp.controller('editController', function ($scope, $http, $routeParams) {
 $http.get('/api/bells/' + $routeParams.id).success(function(data) {

   $scope.bell = data

 }).error(function(err) {
   console.log(err)
 })

  $scope.orderBy = '!Time';
})
