/**
 * Created by panma on 11/8/15.
 */
(function(window, angular, undefined){
  "use strict";


  var amC = angular.module('amCalendar',[]);

  amC.directive('amCalendar', ['$timeout','$document',function ($timeout,$document) {

    var template = '\
    <div class="am-cal-wrapper">\
    <input class="am-cal-input {{inputClass}}" ng-model="ngModel">\
    <am-calendar-modal ng-show="openCalendarModal"></am-calendar-modal>\
    </div>\
    \
    \
    \
    ';


        return {
          restrict: 'E',
          scope:{
            ngModel:'=',
            format:'@',
            inputClass:'@',
            dateModalPosition:'@'
          },
          template:template,
          replace:true,
          controller:function($scope, $element){

            var year,
                month,
                day,
                hour,
                minute;

            this.inputHeight = function(){
              if($scope.dateModalPosition){
                return $scope.dateModalPosition;
              }
            };
            this.setYearMonthDay = function(y,m,d){

              year = y;
              month = m;
              day = d;
              asyncTime();

            };
            this.setHour = function (h) {

              hour = h;
              asyncTime();

            };
            this.setMinute = function (min) {

              minute = min;
              asyncTime();

            };

            /**
             * 同步时间数据
             */
            function asyncTime(){
              var time = {
                year:year,
                month:month,
                day:day,
                hour:hour,
                minute:minute
              };
              if(angular.isDefined(year) && angular.isDefined(month) &&
                  angular.isDefined(day) && angular.isDefined(hour) && angular.isDefined(minute)){
                $timeout(function(){

                  $scope.ngModel = Date.parse(year + '-' + formatTwoSpace(month) + '-' + formatTwoSpace(day) + 'T' + formatTwoSpace(hour) + ':' + formatTwoSpace(minute) + ':00').toString($scope.format);

                });
              }
            }

          },
          link: function (scope, element, attrs) {

            var inputElem = element.find('.am-cal-input');
            scope.openCalendarModal = false;

            inputElem.bind('focus',inputFocused);
            inputElem.bind('click',function(){
              return false;
            });

            function inputFocused(){
              scope.openCalendarModal = true;
              scope.$apply();
            }
            $document.bind('click',function(){
              if(scope.openCalendarModal){
                scope.openCalendarModal = false;
                scope.$apply();
              }
            });
          }
        }
      }])
      .directive('amCalendarModal', [function () {

        var template = '\
    <div class="am-cal-modal">\
    <am-calendar-modal-time></am-calendar-modal-time>\
    </div>\
    \
    ';

        return {
          restrict: 'EA',
          template:template,
          replace:true,
          require:'^amCalendar',
          link: function (scope, element, attrs,amCalendarController) {

            var position = amCalendarController.inputHeight().split('-');
            element.css({
              top:position[0] + 'px',
              left:position[1] + 'px'
            });

            element.bind('click',function(){
              return false;
            });


          }
        }
      }])
      .directive('amCalendarModalTime', [function () {
        var template = '\
    <div class="am-cal-modal-time">\
    <div class="am-cal-modal-time-header">\
    <a href="" style="float: left;" ng-click="prev()">\
    <svg style="width:24px;height:24px" viewBox="0 0 24 24">\
       <path fill="#000000" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />\
      </svg>\
    </a>\
    <div class="am-year-month-title" style="display: inline-block;">\
    <span>{{currentMonth}} /</span>\
    <span>{{currentYear}}</span>\
    </div>\
    <a href="" style="float: right;" ng-click="next()">\
        <svg style="width:24px;height:24px" viewBox="0 0 24 24">\
      <path fill="#000000" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />\
      </svg>\
    </a>\
    </div>\
    <div class="am-cal-modal-time-body">\
    <div style="display: inline-block;vertical-align: top;"><table class="am-cal-modal-time-body-table" style="display: inline-block;">\
    <thead>\
    <tr>\
    <th>Su</th>\
    <th>Mo</th>\
    <th>Tu</th>\
    <th>We</th>\
    <th>Th</th>\
    <th>Fr</th>\
    <th>Sa</th>\
    </tr>\
    </thead>\
    <tbody class="am-cal-table-body">\
    \
    </tbody>\
    </table></div>\
    <div style="display: inline-block;">\
    <am-calendar-modal-hour></am-calendar-modal-hour>\
    <am-calendar-modal-minute></am-calendar-modal-minute>\
    </div>\
    \
    </div>\
    </div>\
    \
    ';
        return {
          restrict: 'EA',
          template:template,
          require:'^amCalendar',
          link: function (scope, element, attrs, amCalendarCtrl) {

            var today = Date.today(),
                year = today.toString('yyyy'),
                dm = today.toString('M-d').split('-'),
                month = dm[0],
                day = dm[1],
                daysOfMonthAndYear = Date.getDaysInMonth(year,month),
                tableBodyElem = element.find('.am-cal-table-body'),
                selectedTdElem;
            scope.currentYear = year;
            scope.currentMonth = today.toString('MMM');
            scope.prev = prev;
            scope.next = next;

            tableBodyElem.bind('click',tdDelegateCallback);


            drawDaysUi(year,month,daysOfMonthAndYear,day);






            /**
             * 选择上一个月
             */
            var adjustRange = 0;
            var time;

            function prev(){
              adjustRange--;
              reRenderUi();
            }

            /**
             * 选择下一个月
             */
            function next(){
              adjustRange++;
              reRenderUi();
            }

            function reRenderUi(){

              tableBodyElem.empty();

              time = angular.copy(today).addMonths(adjustRange);
              scope.currentMonth = time.toString('MMM');
              scope.currentYear = time.toString('yyyy');


              var m = time.toString('M'),
                  y = time.toString('yyyy');
              if(m === month && y === year){
                drawDaysUi(y,m,Date.getDaysInMonth(y,m),day);
              } else {
                drawDaysUi(y,m,Date.getDaysInMonth(y,m));
              }
            }






            /**
             * 点击td
             */
            function tdDelegateCallback(ev){

              if(ev.target.nodeName.toLowerCase() !== 'a') return;

              if(selectedTdElem && selectedTdElem.hasClass('am-td-active')){
                selectedTdElem.removeClass('am-td-active');
              }
              selectedTdElem =angular.element(ev.target.parentElement);
              var time = selectedTdElem.attr('class').split('-');
              year = time[0];
              month = time[1];
              day = time[2];

              amCalendarCtrl.setYearMonthDay(year,month,day);
              selectedTdElem.addClass('am-td-active');
            }

            /**
             * 绘制天数至table中
             *
             */
            function drawDaysUi(yr ,mt, ds, d){

              //计算本月份的1号是周几？
              var startDay = startOfFirstDayTheMonth(yr,mt),
                  minTd  = startDay + ds; //需要占据的最少的td
              var cols = minTd > 35 ? 6 : 5;

              //将内容装入数组中
              var tdValues = [],
                  count = 1;
              for (var k = 0; k < cols*7 ; k++) {
                if(k < startDay || count > ds){
                  tdValues.push('&nbsp;');
                } else {
                  tdValues.push(count);
                  count++;
                }
              }



              var tdValueIndex = 0;
              for (var i = 0; i < cols; i++) {
                var trElem = angular.element('<tr></tr>');
                for (var j = 0; j < 7; j++) {
                  var tdElem;
                  if(angular.isNumber(tdValues[tdValueIndex])){
                    tdElem = angular.element('<td class="'+ yr + '-' + mt + '-' + tdValues[tdValueIndex] +'"><a href="">'+ tdValues[tdValueIndex] +'</a></td>');
                  } else {
                    tdElem = angular.element('<td>'+ tdValues[tdValueIndex] +'</td>');
                  }
                  trElem.append(tdElem);
                  tdValueIndex++;
                }
                tableBodyElem.append(trElem);
              }

              //激活当前时间
              //当前天在td数组中的index
              if(d){
                var currentIndex;
                for (var i = 0; i < tdValues.length; i++) {
                  var obj = tdValues[i];
                  if(obj === parseInt(d)){
                    currentIndex = i;
                  }
                }
                selectedTdElem = tableBodyElem.find('.'+  yr + '-' + mt + '-' + tdValues[currentIndex]);

                amCalendarCtrl.setYearMonthDay(yr,mt,d);
                selectedTdElem.addClass('am-td-active');
              }



              //console.log(ds);

            }









          }
        }
      }])
      .directive('amCalendarModalHour', [function () {

        var template = '<div style="display: inline-block;">\
    <div class="am-hm-title">Hour :</div>\
    <div  class="am-ul-wrapper"><ul class="am-calendar-ul">\
    </div>\
    </ul>\
    </div>\
    ';

        return {
          restrict: 'EA',
          template:template,
          require:'^amCalendar',
          link: function (scope, element, attrs,amCalendarCtrl) {
            var ulWrapper = element.find('.am-ul-wrapper'),
                ulElem = ulWrapper.find('.am-calendar-ul');
            ulWrapper.css({
              height:'110px'
            });



            var currentHour = new Date().toString('H'),
                itemH = 23;
            var count = 0, //为li 添加索引
                commonCss = {
                  'height':itemH + 'px',
                  'lineHeight':itemH + 'px'
                };

            for (var i = 0; i <= 23; i++) {
              var liE;
              if(i === parseInt(currentHour)){
                amCalendarCtrl.setHour(i);
                liE =  angular.element('<li class="am-calendar-li am-li-active"><a href="">' +  formatTwoSpace(i) + '</a></li>');
              } else {
                liE =  angular.element('<li class="am-calendar-li"><a href="">' + formatTwoSpace(i) + '</a></li>');
              }
              liE.attr('data-hour-index',count);
              liE.attr('data-hour-number',i);
              liE.css(commonCss);
              count ++;
              ulElem.append(liE);
            }

            var initTansY = currentHour * itemH;

            //修复Bug
            if( (count - currentHour) * itemH <= 110 ){
              initTansY = count * itemH - 110;
            }
            ulElem.css({
              'transform':'translate(0,-'+ initTansY +'px)'
            });



            ulElem.bind('wheel',wheelHour);
            ulElem.bind('click',selectHour);



            var transY = 0;
            function wheelHour(e){

              var oldTransY = getTransXAndY(getMatrix(ulElem)).transY;
              transY = e.originalEvent.deltaY*0.215;
              var newTransY = oldTransY - transY;

              if(newTransY >= 0){
                newTransY = 0;
              } else if( -newTransY >= (itemH*count - 110)){
                newTransY =   -(itemH*count - 110);
              }
              ulElem.css({
                'transform':'translate(0,' + newTransY +'px)'
              });
              return false;
            }


            function selectHour(ev){

              if(ev.target.nodeName.toLowerCase() !== 'a') return;

              ulElem.find('li').removeClass('am-li-active');
              var liElem = angular.element(ev.target.parentElement);
              amCalendarCtrl.setHour(liElem.attr('data-hour-number'));
              liElem.addClass('am-li-active');
              scope.$apply();
            }



          }
        }
      }])
      .directive('amCalendarModalMinute', [function () {
        var template = '<div style="display: inline-block;">\
    <div class="am-hm-title">Minute</div>\
    <div class="am-ul-wrapper">\
      <ul class="am-calendar-ul">\
    </div>\
    </ul>\
    </div>\
    ';
        return {
          restrict: 'EA',
          template:template,
          require:'^amCalendar',
          link: function (scope, element, attrs, amCalendarCtrl) {
            var ulWrapper = element.find('.am-ul-wrapper'),
                ulElem = ulWrapper.find('.am-calendar-ul');
            ulWrapper.css({
              height:'110px'
            });


            var currentMinute = new Date().toString('H:m').split(':')[1],
                itemH = 23;
            var count = 0, //为li 添加索引
                commonCss = {
                  'height':itemH + 'px',
                  'lineHeight':itemH + 'px'
                };

            for (var i = 0; i <= 59; i++) {
              var liE;
              if(i === parseInt(currentMinute)){
                amCalendarCtrl.setMinute(i);
                liE =  angular.element('<li class="am-calendar-li am-li-active"><a href="">' +  formatTwoSpace(i) + '</a></li>');
              } else {
                liE =  angular.element('<li class="am-calendar-li"><a href="">' + formatTwoSpace(i) + '</a></li>');
              }
              liE.attr('data-minute-index',count);
              liE.attr('data-minute-number',i);
              liE.css(commonCss);
              count ++;
              ulElem.append(liE);
            }

            var initTansY = currentMinute * itemH;
            //修复Bug
            if( (count - currentMinute) * itemH <= 110 ){
              initTansY = count * itemH - 110;
            }
            ulElem.css({
              'transform':'translate(0,-'+ initTansY +'px)'
            });



            ulElem.bind('wheel',wheelMinute);
            ulElem.bind('click',selectMinute);



            var transY = 0;
            function wheelMinute(e){

              var oldTransY = getTransXAndY(getMatrix(ulElem)).transY;
              transY = e.originalEvent.deltaY*0.215;
              var newTransY = oldTransY - transY;

              if(newTransY >= 0){
                newTransY = 0;
              } else if( -newTransY >= (itemH*count - 110)){
                newTransY =   -(itemH*count - 110);
              }
              ulElem.css({
                'transform':'translate(0,' + newTransY +'px)'
              });
              return false;
            }


            function selectMinute(ev){

              if(ev.target.nodeName.toLowerCase() !== 'a') return;

              ulElem.find('li').removeClass('am-li-active');
              var liElem = angular.element(ev.target.parentElement);
              amCalendarCtrl.setMinute(liElem.attr('data-minute-number'));
              liElem.addClass('am-li-active');
              scope.$apply();
            }


          }
        }
      }]);


  function startOfFirstDayTheMonth(year,month){
    var parse = Date.parse(month+'/1/'+year);
    var dayName = parse.toString('dddd'),
        startDay;
    switch (dayName) {
      case 'Monday':
        startDay = 1;
        break;
      case 'Tuesday':
        startDay = 2;
        break;
      case 'Wednesday':
        startDay = 3;
        break;
      case 'Thursday':
        startDay = 4;
        break;
      case 'Friday':
        startDay = 5;
        break;
      case 'Saturday':
        startDay = 6;
        break;
      case 'Sunday':
        startDay = 7;
        break;
    }

    return 7-startDay;
  }

  /**
   * 使个位数占两位
   */
  function formatTwoSpace(num){
    if(num < 10){
      return '0' + num;
    } else {
      return num;
    }
  }

  /**
   * 获取transform的matrix的值
   * @param obj
   * @returns {*}
   */
  function getMatrix(obj) {
    var matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform")    ||
        obj.css("-ms-transform")     ||
        obj.css("-o-transform")      ||
        obj.css("transform");
    return matrix;
  }

  /**
   * 获取transfor的值
   * @param matrix
   */
  function getTransXAndY(matrix){

    var values = matrix.split('(')[1].split(')')[0].split(',');

    return {
      transX:values[values.length - 2],
      transY:values[values.length - 1]
    }

  }



})(window,angular);


