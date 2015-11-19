var bellboyApp = angular.module('bellboyApp', []);

bellboyApp.controller('listController', function ($scope, $http) {
 $http.get('/api/bells').success(function(data) {
    $scope.bells = data
 }).error(function(err) {
   console.log(err)
 })

  $scope.orderby = 'time';
})
