angular

.module('ar', ['ngSanitize'])

.controller('homeCtrl', ['$scope', '$http', '$sce', function($scope, $http, $sce) {
    
    $scope.message = "Hello there";

    $scope.frames = {
        w: 12,
        h: 6,
        d: 1,
        spacebetween: 3
    };

    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
    }

    $scope.go = function(){
        $scope.loading = true;

        $http.get('http://services.realestate.com.au/services/listings/' + $scope.search)
             .then(
             (res) => {
                console.log(res.data);
                $scope.imgs = createImgs(res.data.images);
                console.log($scope.imgs);
                $scope.ready = true;
             }, () => {
                $scope.error = "Error loading your results. Try again."
             });
    }




    function createImgs(data){
        var d = data
                .filter(function(e){
                    return e.server.indexOf('youtube') === -1 ? true : false; 
                });

        return  d.map(function(e, index){
                    return {
                        url: 'http://127.0.0.1:8080/' + e.server + '/1010x570-fit' + e.uri,
                        position: calcPos(d.length, index)
                    }
                })
    }


    function calcPos(total, index){
        // Calculating where the initial carousel should be

        // total = 10
        // width = 20
        
        var mid = Math.round(total / 2);
        var xPos = (mid - index) * ($scope.frames.w + $scope.frames.spacebetween);
        return xPos + ' 0 -10';
    }

}])

.directive('search', [function(){
    return {
        restrict: 'E',
        replace: true,
        template: 
        '<div class="search-bar" ng-if="!ready">' +
            '<form ng-submit="go()">' +
                '<input ng-model="$parent.search" placeholder="Enter Property ID"/>' +
            '</form>' +
            '<div ng-if="$parent.loading"> ' + 
                '<p class="loading">Loading Results...</p>' +
            '</div>' +
        '</div>'
    }
}])

.directive('scene', [function(){
    return {
        restrict: 'E',
        replace: true,
        template: '<a-scene>' +
                    '<a-box ' + 
                        'ng-repeat="im in imgs track by $index" ' +
                        'color="#fff" ' +
                        'ng-attr-width="{{frames.w}}" ' +
                        'ng-attr-height="{{frames.h}}" ' +
                        'ng-attr-depth="{{frames.d}}" ' +
                        'ng-attr-position="{{im.position}}" ' +
                        'rotation="0 0 0" ' +
                        'ng-attr-src="{{trustSrc(im.url)}}"' +
                    '></a-box>' +
                  '</a-scene>'
    }
}])