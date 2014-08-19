angular.module('InstagramSearcher', ['ngAnimate'])
.constant('IMAGE_TRANSITION', 400)

.controller('ImageDisplayCtrl', function($scope, $timeout, $q, $http, IMAGE_TRANSITION) {
    $scope.tag = null;
    $scope.photos = [];
    $scope.currentPhoto = null;
    $scope.imageUrl = null;
    $scope.userImageUrl = null;
    $scope.showControls = true;
    $scope.showImage = false;
    $scope.searchCaption = null;
    $scope.loadCaption = null;


    /********************************/
    /* Process instagram tag search */
    /********************************/

    $scope.$on('fetchPhotos', function(event, tag) {
        $scope.tag = tag
        $scope.loadCaption = null;
        $scope.currentPhoto = null;
        notifySearching(tag)
        .then(notifyNumResults)
        .finally(function() {
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


    /********************************/
    /* React to thumbnail selection */
    /********************************/

    $scope.displayPhoto = function(photo) {
        var imageUrl = photo.images.standard_resolution.url;
        if (($scope.currentPhoto == null) || ($scope.currentPhoto.id != photo.id)) {
            $scope.currentPhoto = photo;
            if ($scope.searchCaption == null) {
                $scope.userImageUrl = null;
                $scope.loadCaption = "Loading image from \"" + $scope.tag + "\"";
            }
            $scope.showImage = false;
            if ($scope.currentPhoto == null) {
                // It's the first picture from a search - don't need to wait to fade out
                $scope.imageUrl = photo.images.standard_resolution.url;
            } else {
                // Let the current pic face out before we look at a new pic
                $timeout(function() {
                    $scope.imageUrl = photo.images.standard_resolution.url;
                }, IMAGE_TRANSITION);
            }
        }
    }


    /****************************************************/
    /* React to loading of image from ng-src directive  */
    /****************************************************/

    /* React to main image being loaded - from custom imageonload directive */
    $scope.$on('imageLoaded', function(event) {
        $scope.$apply(function() {
            $scope.showImage = true;
            $scope.loadCaption = null;
            notifyPhoto();
        });
    })

    /* Load the user's profile image */
    function notifyPhoto() {
        $scope.userImageUrl = $scope.currentPhoto.user && $scope.currentPhoto.user.profile_picture;
    }

    /* React to the user's profile image being loaded - from custom userimageonload directive */
    $scope.$on('userImageLoaded', function(event) {
        $scope.$apply(function() {
            var text = $scope.currentPhoto.user.username + ": ";
            if ($scope.currentPhoto.caption && ($scope.currentPhoto.caption.text != null)) {
                var caption = $scope.currentPhoto.caption.text,
                    regexp = new RegExp('#([^\\s]*)','g');
                /* uncomment the following to remove tags from the caption string */
                //caption = caption.replace(regexp, '');
                if (caption != '') {
                    text += caption;
                }
            }
            $scope.loadCaption = text;
            console.log("Loaded photo info");
        });
    })
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
