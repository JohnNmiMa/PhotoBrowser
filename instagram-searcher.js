angular.module('InstagramSearcher', [])

.controller('ImageDisplayCtrl', function($scope, $http) {
    $scope.tag = null;
    $scope.numPhotos = 0;
    $scope.photos = [];
    $scope.image = null;
    $scope.$on('fetchPhotos', function(event, tag) {
        $scope.tag = tag;
        $http({
            method: 'JSONP',
            url: "https://api.instagram.com/v1/tags/" + tag + "/media/recent",
            params: {
                client_id: "f207767e49df4dc8923d8dd39ae934ff",
                callback: "JSON_CALLBACK"
            }
        })
        .success(function(results) {
            $scope.photos = results.data;
            $scope.tag = null;
        })
        .error(function() {
            alert('error');
        })
    })
    $scope.displayPhoto = function(imageUrl) {
        $scope.image = imageUrl;
    }
    $scope.showControls = function() {
    }
})

.controller('FormCtrl', function($scope) {
    $scope.data = {};
    $scope.init = function() {
        $scope.data.searchTag = "";
    }
    $scope.submit = function() {
        if($scope.searchForm.$valid) {
            $scope.$emit('fetchPhotos', $scope.data.searchTag);
            $scope.resetForm();
        } else {
            if ($scope.searchForm.$error.required) {
                console.log('Please supply a tag value to search');
            } 
            $scope.submitted = true;
        }
    }
    $scope.resetForm = function() {
        $scope.init();
        $scope.searchForm.$setPristine();
    }
    $scope.init();
});

