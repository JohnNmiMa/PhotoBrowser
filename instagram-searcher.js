angular.module('InstagramSearcher', ['ngAnimate'])

.controller('ImageDisplayCtrl', function($scope, $timeout, $q, $http) {
    $scope.tag = null;
    $scope.photos = [];
    $scope.currentPhoto = null;
    $scope.imageUrl = null;
    $scope.userImageUrl = null;
    $scope.showControls = false;
    $scope.showImage = true;
    $scope.searchCaption = null;
    $scope.loadCaption = null;

    $scope.$on('imageLoaded', function(event) {
        $scope.$apply(function() {
            if ($scope.searchCaption == null) {
                $scope.loadCaption = null;
                notifyPhoto();
            }
        });
    })

    function notifyPhoto() {
        $scope.userImageUrl = $scope.currentPhoto.user && $scope.currentPhoto.user.profile_picture;
    }

    $scope.$on('userImageLoaded', function(event) {
        $scope.$apply(function() {
            var text = $scope.currentPhoto.user.username + ": ";
            if ($scope.currentPhoto.caption && ($scope.currentPhoto.caption.text != null)) {
                var caption = $scope.currentPhoto.caption.text,
                    regexp = new RegExp('#([^\\s]*)','g');
                caption = caption.replace(regexp, '');
                if (caption != '') {
                    text += caption;
                }
            }
            $scope.loadCaption = text;
            console.log("Loaded photo info");
        });
    })

    $scope.$on('fetchPhotos', function(event, tag) {
        $scope.tag = tag
        $scope.loadCaption = null;
        $scope.currentPhoto = null;
        notifySearching(tag)
        .then(notifyNumResults)
        .finally(function() {
            $scope.searchCaption = null;
        });
    })

    function notifySearching(tag) {
        var defer = $q.defer();
        $scope.searchCaption = "Searching Instagram for photos tagged with \"" + tag +"\"";
        searchInstagram(tag)
        .then(function(data) {
            defer.resolve(data.data.data.length);
        })
        .catch(function() {
            defer.reject(0);
        })
        .finally(function() {
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
            $scope.displayPhoto($scope.photos[0]);
        })
        .error(function() {
            alert('error');
        })
    }

    function notifyNumResults(num) {
        var defer = $q.defer();
        $scope.searchCaption = num + " results for \"" + $scope.tag + "\" were found";
        $timeout(function() {
            $scope.searchCaption = null;
            defer.resolve();
        }, 500);
        return defer.promise;
    }

    $scope.displayPhoto = function(photo) {
        var imageUrl = photo.images.standard_resolution.url;
        if (($scope.currentPhoto == null) || ($scope.currentPhoto.id != photo.id)) {
            $scope.currentPhoto = photo;
            if ($scope.searchCaption == null) {
                $scope.userImageUrl = null;
                $scope.loadCaption = "Loading image from \"" + $scope.tag + "\"";
            }
            $scope.imageUrl = imageUrl;
        }
    }
    $scope.tsi = function() {
        $scope.showImage = !$scope.showImage;
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
})

.directive('imageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$emit('imageLoaded');
            });
        }
    };
})

.directive('userimageonload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                scope.$emit('userImageLoaded');
            });
        }
    };
});
