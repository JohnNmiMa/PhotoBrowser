angular.module('InstagramSearcher', [])

.controller('ImageDisplayCtrl', function($scope, $timeout, $q, $http) {
    $scope.tag = null;
    $scope.searching = false;
    $scope.numPhotos = 0;
    $scope.photos = [];
    $scope.image = null;
    $scope.showControls = false;

    $scope.$on('fetchPhotos', function(event, tag) {
        $scope.tag = tag
        notifySearching(tag)
        .then(notifyNumResults)
        .finally(function() {
            $scope.tag = null;
        });
    })

    function notifySearching(tag) {
        var defer = $q.defer();
        $scope.searching = true;
        searchInstagram(tag)
        .then(function(data) {
            defer.resolve(data.data.data.length);
        })
        .catch(function() {
            defer.reject(0);
        })
        .finally(function() {
            $scope.searching = false;
        });
        return defer.promise;
    }

    function searchInstagram(tag) {
        return $http({
            method: 'JSONP',
            url: "https://api.instagram.com/v1/tags/" + tag + "/media/recent",
            params: {
                client_id: "f207767e49df4dc8923d8dd39ae934ff",
                callback: "JSON_CALLBACK"
            }
        })
        .success(function(results) {
            $scope.photos = results.data;
            $scope.displayPhoto($scope.photos[0].images.standard_resolution.url);
        })
        .error(function() {
            alert('error');
        })
    }

    function notifyNumResults(num) {
        var defer = $q.defer();
        $scope.numPhotos = num;
        $timeout(function() {
            $scope.numPhotos = 0;
            defer.resolve();
        }, 5000);
        return defer.promise;
    }

    $scope.displayPhoto = function(imageUrl) {
        $scope.image = imageUrl;
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

