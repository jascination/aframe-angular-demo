
var auto = false;


angular

.module('ar', ['ngSanitize'])

.controller('homeCtrl', ['$scope', '$http', '$sce', '$interval', function($scope, $http, $sce, $interval) {

    $scope.frames = {
        w: 12,
        h: 6,
        d: 1,
        spacebetween: 3
    };

    $scope.carouselPos = '0 0 0';

    var animating = false,
        currentFocusIndex = 0;


    $scope.go = function(){
        $scope.loading = true;

        $http.get('http://services.realestate.com.au/services/listings/' + $scope.search)
             .then(
             (res) => {
                
                $scope.imgs = createImgs(res.data.images);

                $scope.agent = {
                    name: res.data.agency.name,
                    img : 'http://127.0.0.1:8080/'  + res.data.agency.logo.images[0].server + res.data.agency.logo.images[0].uri 
                }

                $scope.ready = true;

                clickSetup();
             }, () => {
                $scope.error = "Error loading your results. Try again."
             });
    }


    function createImgs(data){
        var d = data.filter(function(e){
                    return e.server.indexOf('youtube') === -1 ? true : false; 
                });

        return  d.map(function(e, index){
                    return {
                        url: 'http://127.0.0.1:8080/' + e.server + '/1010x570-fit' + e.uri,
                        position: calcPos(d.length, index) + ' 0 -10'
                    }
                })
    }


    function calcPos(total, index, mid){

        !mid ? mid = Math.round(total / 2) : '';    

        var xPos = (mid - index) * ($scope.frames.w + $scope.frames.spacebetween);
        
        return xPos
    }




    function clickSetup(){

        AFRAME.registerComponent('cursor-listener', {
          init: function () {

            this.el.addEventListener('click', function focusCarousel() {
                var currUrl    = this.getAttribute('src'),
                    clickedInd = 0,
                    midPoint   = Math.round($scope.imgs.length / 2),
                    diffInd;

                if(!animating){

                    animating = true;

                    $scope.imgs.forEach(function(el, ind){
                        if(el.url === currUrl){

                            clickedInd = ind;
                            diffInd = - (midPoint - clickedInd);

                        } 
                    });

                    loopImgs(diffInd);
                }
              
            });
          }
        });
    }


    function loopImgs(diff){

        var timesToRun = Math.abs(diff); 

        if(timesToRun === 0){ animating = false; return;}

        for(var i = 0; i<timesToRun; i++){
            spliceImgs();

            if(i === timesToRun -1){
                
                var framesDone = 0;

                $scope.imgs.forEach(function(e, index){
                    var oldPos = Number(e.position.split(' ')[0]);
                    var newPos = calcPos($scope.imgs.length, index);
                    
                    animateFrame(e, oldPos, newPos, function(){
                        framesDone++;
                        
                        if(framesDone === $scope.imgs.length){
                            animating = false;
                        }
                    })
                })

            }
        }
        
        function spliceImgs(){
            var orphan;
                
            if(diff < 0){
                orphan = $scope.imgs.pop();
                $scope.imgs.unshift(orphan);
            } else if(diff > 0){
                orphan = $scope.imgs.shift();
                $scope.imgs.push(orphan);
            }

        }
    }


    function animateFrame(el, pos1, pos2, cb){
        var diff = pos2 - pos1;
        var distancePerFrame = diff / 10;
        var currentPos = pos1;

        var promise = $interval(function(){
            var newPos = currentPos += distancePerFrame;
                el.position = String(newPos) + ' 0 -10';
                currentPos = newPos;

            if(newPos === pos2){
                animating = false;
                cb();
                $interval.cancel(promise);
            }

        },10);

    }

    if(auto){
        $scope.search = 7695087;
        $scope.go();
    }


    $scope.trustSrc = function(src) {
        return $sce.trustAsResourceUrl(src);
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
                    '<a-entity class="carousel" position="0 3 0" >' +
                        '<a-box ' + 
                            'ng-repeat="im in imgs track by $index" ' +
                            'color="#fff" ' +
                            'ng-attr-width="{{frames.w}}" ' +
                            'ng-attr-height="{{frames.h}}" ' +
                            'ng-attr-depth="{{frames.d}}" ' +
                            'ng-attr-position="{{im.position}}" ' +
                            'rotation="0 0 0" ' +
                            'ng-attr-src="{{trustSrc(im.url)}}" ' +
                            'cursor-listener ' +
                        '></a-box>' +
                    '</a-entity>' +
                    '<a-entity>' + 
                        '<a-image position="0 -2 -10" width="5" height="2" ng-attr-src="{{trustSrc(agent.img)}}"></a-image>' +
                        '<a-entity position="-10 -5 -10"><a-entity scale="4 4 4" ng-attr-bmfont-text="{{\'align: center; text:\' + agent.name}}"></a-entity></a-entity>' +
                    '</a-entity>' +
                    '<a-entity>' + 
                        '<a-camera look-controls>' +
                            '<a-cursor color="#2E3A87"></a-cursor>' +
                        '</a-camera>' +
                    '</a-entity>' +
                  '</a-scene>'
    }
}])

