angular.module('InstagramSearcher', [])

.controller('InstagramCtrl', function($scope) {
    $scope.$on('updateTag', function(event,tag) {
        $scope.$broadcast('handleTag', tag);
    })
})

.controller('FormCtrl', function($scope) {
    $scope.data = {};
    $scope.init = function() {
        $scope.data.searchTag = "";
    }
    $scope.submit = function() {
        if($scope.searchForm.$valid) {
            console.log('The Form is valid: search tag = ' + $scope.data.searchTag);
            $scope.$emit('updateTag', $scope.data.searchTag);
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


.controller('MessageCtrl', function($scope) {
    $scope.tag = null;
    $scope.$on('handleTag', function(event, tag) {
        $scope.tag = tag;
    })
});
