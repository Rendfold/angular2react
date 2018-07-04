import angular from 'angular'
import { angular2react } from 'angular2react'
import { lazyInjector } from './lazyInjector'
import utils from './utils'
import angularUIBootstrap from 'angular-ui-bootstrap'
import angularUIRouter from 'angular-ui-router'
/* global current */
/* global angular */
/* global utils */
/* global Tether */

angular.module('Demo', [angularUIBootstrap, angularUIRouter]).directive('selector', ['$injector', '$q', '$timeout', '$http', function (injector, q, timeout, http) {
  return {
      restrict: 'E',
      template: `<div class="cd-dynamic-select" ng-class="expanded ? 'cd-expanded' : null">
      <fieldset class="cd-head form-control focus-style-on-error" id="cd-dynamic-select-head-{{::$id}}" ng-disabled="disabled" ng-click="expanded = !expanded" tabindex="0">
          <!-- Multiple selection -->
          <div ng-if="multiple" class="cd-multiple">
              <div ng-if="!(selection | filter: { _destroy: '!true' }).length" class="cd-placeholder">     <!-- && !isDisabled() is removed from ng-if -->
                  <span ng-bind="placeholder"></span>
              </div>
              <div ng-repeat="item in selection | filter: { _destroy: '!true' }" class="cd-tag" ng-style="multiselectFullSize_width100">
                  <div ng-style="multiselectFullSize_width100">
                      <span class="cd-caption" ng-bind="getCaption(item)" ng-style="multiselectFullSize_maxWidthNone"></span>
                  </div>
                  <div ng-style="multiselectFullSize_paddingRight10px">
                      <button class="cd-remove" ng-click="remove(item)" cd-stop-propagation>×</button>
                  </div>
              </div>
          </div>
          <!-- Single selection -->
          <div ng-if="!multiple" class="cd-single">
              <div class="cd-selected-text" ng-class="!selection ? 'cd-placeholder' : null">
                  <span ng-bind="selection ? getCaption(selection) : expanded ? null : placeholder"></span>     <!-- placeholder instead of (isDisabled() ? null : placeholder) -->
              </div>
          </div>
          <div class="cd-buttons">
              <table boder="0">
                  <tr>
                      <td ng-repeat="button in options.buttons">
                          <button type="button" class="cd-button cd-button-dynamic" cd-partial="button" tabindex="-1">
                              <span class="fa fa-search"></span>
                          </button>
                      </td>
                      <td ng-if="!multiple && selection && !disabled">
                          <button type="button" class="cd-button cd-button-clear btn-not-style" ng-click="clear();" cd-stop-propagation tabindex="-1">
                              <span style="font: bold 16px Arial, sans-serif; line-height: 1.2;" class="fa">×</span>
                          </button>
                      </td>
                      <td>
                          <button type="button" class="cd-button cd-button-collapse btn-not-style" tabindex="-1">
                              <span class="fa fa-caret-down"></span>
                          </button>
                      </td>
                  </tr>
              </table>
          </div>
      </fieldset>
      <!-- Tether.js ამოიღებს ამ ნაწილს და გაიტანს body ში -->
      <div class="cd-dynamic-select-body {{bodyClassName}}" ng-class="{ 'cd-expanded': expanded }"
          id="cd-dynamic-select-body-{{::$id}}"
          cd-outside-click="expanded = false;"
          cd-outside-click-active="expanded"
          cd-outside-click-selector="#cd-dynamic-select-head-{{$id}}, #cd-dynamic-select-body-{{$id}}"
          cd-stop-propagation>
          <div class="cd-search cd-searching" ng-class="searching ? 'cd-searching' : null;" ng-if="options.allowSearch !== false;">
              <input type="text" ng-model="options.search" ng-change="onSearchChange()" cd-focus-when="expanded" />
          </div>
          <ul class="cd-records scroll vertical hard" ng-if="options.records.length" cd-on-bottom-scroll="onBottomScroll()" cd-on-bottom-scroll-distance="100">
              <li tabindex="0" class="cd-record group-result {{record.view_priority ? 'priority' : ''}}" ng-repeat="record in options.records" ng-click="select(record)">
                  <span ng-init="optionPartial = getOptionPartial(record);" cd-partial="::optionPartial"></span>
              </li>
          </ul>
          <div style="overflow: hidden;">
              <div class="cd-no-records pull-left" ng-if="searching || scrolling || !options.records.length">
                  <div class="cd-text" ng-bind="searching ? 'ძებნა...' : (scrolling ? 'იტვირთება მონაცემები' : 'მონაცემები არ მოიძებნა')"></div>
                  <div class="cd-loading" ng-if="scrolling">...</div>
              </div>
              <div class="cd-footer pull-right" ng-if="options.footer" cd-partial="options.footer"></div>
          </div>
      </div>
  </div>
  `,
      replace: true,
      require: 'ngModel',
      scope: {
          data: '=cdData',
          dataWithFiltering: '=cdDataWithFiltering',
          options: '=?cdOptions',
          disabled: '=ngDisabled',
          required: '=ngRequired',
          expanded: '=?cdExpanded',
          placeholder: '@cdPlaceholder',
          idField:'@cdIdField',
          keyProp: '@cdKeyProp',
          displayProp: '@cdDisplayProp',
          comparerProp: '@cdComparerProp',
          optionCaptionProp: '@cdOptionCaptionProp',
          locals: '=cdLocals',
          appendToBody: '=cdAppendToBody',
          multiple: '=cdMultiple',
          beforeChange: '&cdBeforeChange',
          loadData: '&cdLoadData',
          allowSearch: '=cdAllowSearch',
          optionPartial: '=cdOptionPartial',
          bodyClassName: '@cdBodyClassName',
          multiselectWithDestroy:'=multiselectWithDestroy',
          multiselectFullSize:'=multiselectFullSize',
          withoutTotal:'=cdWithoutTotal'
      },
      link: function (scope, element, attrs, modelCtrl) {
        debugger;
          if (attrs.cdLocals) {
              console.warn('cdLocals is deprecated. Use cdLoadData instead of options.reload and pass data');
          }

          if (scope.multiselectFullSize){
              scope.multiselectFullSize_width100={width:'100%'};
              scope.multiselectFullSize_maxWidthNone={'max-width':'none'};
              scope.multiselectFullSize_paddingRight10px={'padding-right':'10px'};
          }

          /**
           * Extend options from attrs
           */
          scope.options = angular.extend({
              allowSearch: angular.isDefined(scope.allowSearch) ? scope.allowSearch : true
          }, scope.options || {});

          if (!scope.options.limit){
              scope.options.limit = 25;
          }


          /**
           * Validation
           */
          function setValidityForMultiselect(){
              if (scope.multiple && scope.required){
                  modelCtrl.$setValidity('required', !!(modelCtrl.$modelValue && modelCtrl.$modelValue.filter(function(v){return !v._destroy;}).length));
              }
          }

          scope.$watch(function () {
              return modelCtrl.$modelValue;
          },function(){
              setValidityForMultiselect();
          });
          scope.$watch('[required,multiple]',function(){
              setValidityForMultiselect();
          },true);


          /*if (scope.multiple && scope.required) {
              //console.log(scope,scope.ngModel,modelCtrl,modelCtrl.$modelValue);
              scope.$watch(function () {
                  return modelCtrl.$modelValue;
              },function(val){
                  modelCtrl.$setValidity('required', !!(val && val.filter(function(v){return !v._destroy;}).length));
              });
          }*/

          /*scope.$watchCollection(function () {
           return modelCtrl.$modelValue;
           }, function (val) {
           console.log(modelCtrl,val && val.filter(function(v){return !v._destroy;}).length);
           //modelCtrl.$setValidity('required', !!(val && val.filter(function(v){return !v._destroy;}).length));
           //modelCtrl.$setValidity('required', !!(val && val.length));
           });*/

          /**
           * Get selection caption. Default display property is `name`.
           * Custom display property can be set via `cd-display-prop` attribute
           * @param  {Object} record
           */
          scope.getCaption = function (selection) {
              return utils.getProp(selection, scope.displayProp || 'name');
          };

          /**
           * Get option caption
           * @param  {Object} record
           */
          scope.getOptionCaption = function (record) {
              return utils.getProp(record, scope.optionCaptionProp || scope.displayProp || 'name');
          };

          /**
           * Get option caption
           * @param  {any} option
           */
          scope.getOptionPartial = function (record) {
              if (scope.optionPartial) {
                  return scope.optionPartial;
              }

              let caption = scope.getOptionCaption(record)

              return {
                  template: '<span ng-bind="caption"></span>'
              };
          };

          /**
           * Clear model value (only for single)
           */
          scope.clear = function () {
              checkBeforeChange(null).then(function () {
                  modelCtrl.$setViewValue(null);
                  modelCtrl.$render();
              });
          };

          /**
           * Remove tag
           * @param  {Object} item
           */
          scope.remove = function (item) {
              var futureValue = modelCtrl.$modelValue.filter(function (val) {
                  if (scope.multiselectWithDestroy){
                      if (val==item){
                          val._destroy=true;
                      }
                      if (scope.multiselectWithDestroy===true || val[scope.multiselectWithDestroy]){
                          return true;
                      }
                  }
                  return val !== item;
              });

              checkBeforeChange(futureValue).then(function () {
                  modelCtrl.$setViewValue(futureValue);
                  modelCtrl.$render();
              });
          };

          scope.searching = false;
          scope.scrolling = false;

          /**
           * Invokes method and injects parameters from `cd-locals` attribute
           * @param  {Function} fn
           */
          scope.invoke = function (fn, locals) {
              return q.when(injector.invoke(fn, scope.options, angular.extend({}, scope.locals || {}, locals)));
          };

          /**
           * Reload options
           */
          var canceler;
          scope.reload = function () {
              // Canceller promise
              if (canceler) {
                  canceler.resolve();
                  canceler = null;
              }

              canceler = q.defer();

              // Backwards compatibility (deprecated)
              if (scope.options.reload) {
                  return q.when(scope.invoke(scope.options.reload, { canceler: canceler.promise }));
              }

              /*
               * Best method for getting data
               * 1. Object data source:
               *
               * data: {
               *    records: [Object],
               *    total: Number
               * }
               *
               * 2. Array data source:
               *
               * data: [Object]
               *
               * 3. Promise data source:
               *
               * data: $q.resolve(
               *     // 1st or 2nd option
               * );
               *
               * 4. Function as data source:
               *
               * data: function () {
               *     return; // 1st, 2nd or 3rd option
               * }
               */
              if (attrs.cdData) {
                  var dataPromise;

                  if (typeof scope.data === 'function') {
                      dataPromise = q.when(scope.data(canceler.promise));
                  }
                  else {
                      dataPromise = q.when(scope.data);
                  }

                  return dataPromise.then(function (data) {
                      if (!data) {
                          return {
                              records: [],
                              total: 0
                          };
                      }
                      else if (data instanceof Array) {
                          if (!scope.dataWithFiltering || !scope.options.search){
                              return {
                                  records: data,
                                  total: data.length
                              };
                          } else {
                              var filteredData = data.filter(function(v){
                                  //mxolod name-ze mushaobs, momavalshi gadasaketebelia universalurze
                                  return v.name.toString().indexOf(scope.options.search) != -1;
                              })
                              return {
                                  records: filteredData,
                                  total: filteredData.length
                              };
                          }
                      }
                      else if ('records' in data && 'total' in data) {
                          return data;
                      }
                      else {
                          throw 'Invalid data type';
                      }
                  });
              }

              // Backwards compatibility (deprecated)
              return q.when(scope.loadData(canceler.promise));
          };

          /**
           * Update displayed selection
           */
          modelCtrl.$render = function () {
              if (utils.isNullOrUndefined(modelCtrl.$modelValue)) {
                  scope.selection = null;
              } else {
                  if (scope.keyProp) {
                      (scope.options.records ? q.resolve() : scope.reload().then(function (result) {
                          scope.options.records = result.records;
                          scope.options.total = result.total;
                          //setDontLoadMore(scope.options.records);
                      })).then(function () {
                          if (scope.multiple) {
                              scope.selection = modelCtrl.$modelValue.map(function (value) {
                                  var query = {};
                                  utils.setProp(query, scope.keyProp, value);
                                  return utils.findOne(scope.options.records, query);
                              });
                          } else {
                              var query = {};
                              utils.setProp(query, scope.keyProp, modelCtrl.$modelValue);
                              scope.selection = utils.findOne(scope.options.records, query);
                          }
                      });
                  } else {
                      scope.selection = modelCtrl.$modelValue;
                  }
              }
          };

          /**
           * Get value from record by `keyProp` option
           * @param  {any} record
           */
          function getValue(record) {
              if (scope.keyProp) {
                  return utils.getProp(record, scope.keyProp);
              } else {
                  return record;
              }
          }


          /**
           * Compare records. `comparerProp` is ignored if `keyProp` exists.
           * @param  {any} a
           * @param  {any} b
           */
          function compare(a, b) {
              var comparerProp;
              if (scope.idField){
                  comparerProp = scope.idField;
              } else if (scope.keyProp) {
                  comparerProp = scope.keyProp;
              } else if (scope.comparerProp) {
                  comparerProp = scope.comparerProp;
              } else {
                  comparerProp = 'id';
              }

              return utils.getProp(a, comparerProp) === utils.getProp(b, comparerProp);
          }

          /**
           * If beforeChange returns false, then promise is rejected. Otherwise success is called
           */
          function checkBeforeChange(futureValue) {
              var args = {
                  futureValue: futureValue,
                  currentValue: modelCtrl.$modelValue
              };

              return q.when(scope.beforeChange({
                  $args: args
              })).then(function (passed) {
                  return passed === false ? q.reject() : null;
              });
          }

          /**
           * Update model controller with new value
           * @param  {Object} record
           */
          scope.select = function (record) {
              // get value
              var value = getValue(record);

              // if value not set
              if (!modelCtrl.$modelValue) {
                  value = scope.multiple ? [value] : value;
                  return checkBeforeChange(value).then(function () {
                      modelCtrl.$setViewValue(value);
                      modelCtrl.$render();
                  }).finally(collapse);
              }

              // push item to array if does not exist
              if (scope.multiple) {
                  if (!modelCtrl.$modelValue.some(function (selection) {
                          //console.log(selection)
                      return !selection._destroy && compare(selection, record);
                  })) {
                      return checkBeforeChange(value).then(function () {
                          modelCtrl.$setViewValue(modelCtrl.$modelValue.concat(value));
                          modelCtrl.$render();
                      }).finally(collapse);
                  }

                  // If value is already selected just return promise
                  return q.resolve();
              }

              // select if not selected
              if (!compare(modelCtrl.$modelValue, record)) {
                  return checkBeforeChange(value).then(function () {
                      modelCtrl.$setViewValue(value);
                      modelCtrl.$render();
                  }).finally(collapse);
              }

              function collapse() {
                  // collapse
                  scope.expanded = false;

                  // focus current input
                  setTimeout(function () {
                      element.get(0).focus();
                  });
              }
          };

          scope.isDisabled = function () {
              return scope.disabled || element.children('fieldset').is(':disabled');
          };

          // Prevent focus when disabled
          element.on('focus', function () {
              if (scope.isDisabled()) {
                  element.blur();
              }
          });

          // Reference to select body
          var bodyElement;

          // Expand on enter
          element.on('keypress', function (e) {
              if (!scope.expanded && e.which === 13) {
                  scope.$apply(function () {
                      scope.expanded = true;
                  });
              }
          });

          /**
           * Handles document keydown event
           * @param  {any} e
           */
          function onKeyDown(e) {
              // Move focus to options when up or down keys are pressed
              if (e.which === 40 || e.which === 38) {
                  if (e.which === 40) {
                      focusOption(1);
                  } else if (e.which === 38) {
                      focusOption(-1);
                  }
                  // Prevent document scroll
                  e.preventDefault();
                  return false;
              }

              // Select option on enter key
              if (e.which === 13) {
                  debugger;
                  var focusedRecordScope = bodyElement.find('.cd-records > .cd-record:focus').scope();
                  if (focusedRecordScope) {
                      scope.$apply(function () {
                          scope.select(focusedRecordScope.record);
                      });
                  }
                  // Prevent reopen
                  e.preventDefault();
                  return false;
              }

              // Close on Tab
              if (e.which === 9) {
                  scope.$apply(function () {
                      scope.expanded = false;
                  });
              }
          }

          /**
           * If diff is 1 then next option is focused.
           * If diff is -1 then previous option is focused.
           * @param  {any} diff
           */
          function focusOption(diff) {
              setTimeout(function () {
                  var options = bodyElement.find('.cd-records > .cd-record');
                  if (!options.length) {
                      return;
                  }

                  if (options.is(':focus')) {
                      var i, el;
                      for (i = 0; i < options.length; i++) {
                          el = options[i];
                          if (document.activeElement === el) {
                              if (i + diff >= 0 && i + diff < options.length) {
                                  options.get(i + diff).focus();
                                  return;
                              }
                          }
                      }

                      // focus search input if none of inputs are focused
                      if (scope.options.allowSearch !== false) {
                          bodyElement.find('.cd-search > input').get(0).focus();
                      }
                  } else {
                      options.get(0).focus();
                  }
              });
          }

          scope.$watch('expanded', function (expanded) {
              if (expanded) {
                  scope.searching = true;
                  scope.reload().then(function (result) {
                      scope.searching = false;
                      scope.options.records = result.records;
                      scope.options.total = result.total;

                      setDontLoadMore(scope.options.records);

                      // bind events
                      angular.element(document).on('keydown', onKeyDown);

                      // focus search input
                      if (scope.options.allowSearch !== false) {
                          bodyElement.find('.cd-search > input').get(0).focus();
                      }
                  });
                  /*if(bodyElement && element.find('.cd-head').eq(0)){
                      bodyElement.outerWidth(element.find('.cd-head').eq(0).outerWidth());
                  }*/
                  if (tether && tether.position){
                      tether.position();
                  }
              } else {
                  scope.options.search = null;
                  scope.options.records = null;
                  scope.options.total = 0;
                  scope.options.page = 1;
                  scope.dontLoadMore = false;

                  // unbind events
                  angular.element(document).off('keydown', onKeyDown);
              }
          });

          (function () {
              var timer;

              scope.onSearchChange = function () {
                  if (timer) {
                      timeout.cancel(timer);
                      timer = null;
                  }

                  if (canceler) {
                      canceler.resolve();
                      canceler = null;
                  }

                  scope.options.records = null;
                  scope.options.total = 0;
                  scope.options.page = 1;
                  scope.searching = true;
                  scope.dontLoadMore = false;

                  timer = timeout(function () {
                      scope.reload().then(function (result) {
                          scope.options.records = result.records;
                          scope.options.total = result.total;
                          setDontLoadMore(scope.options.records);
                      }).finally(function () {
                          scope.searching = false;
                      });
                  }, 500);
              };
          })();

          // scope.$watch('options.search', function () {
          //     if (scope.expanded) {
          //         scope.searching = true;
          //         scope.options.page = 1;
          //         scope.reload().then(function (result) {
          //             scope.searching = false;
          //             scope.options.records = result.records;
          //             scope.options.total = result.total;
          //         });
          //     }
          // });
          scope.dontLoadMore = false;

          function setDontLoadMore (records) {
              if (records.length < scope.options.limit) {
                  scope.dontLoadMore = true;
              }
          }

          scope.onBottomScroll = function () {
              if (!scope.scrolling && !scope.dontLoadMore/*(scope.options.records.length < scope.options.total || (scope.withoutTotal && !scope.dontLoadMore))*/) {
                  scope.options.page++;
                  scope.scrolling = true;
                  scope.reload().then(function (result) {
                      scope.scrolling = false;
                      if (!scope.options.records) {
                          scope.options.records = [];
                      }
                      Array.prototype.push.apply(scope.options.records, result.records);
                      scope.options.total = result.total;
                      if (!result.records.length) {
                          scope.dontLoadMore = true;
                      }
                      else {
                          setDontLoadMore(result.records);
                      }
                  },
                  function () {
                      scope.scrolling = false;
                  });
              }
          };
          var tether;
          timeout(function () {
              // dropdown
              bodyElement = element.find('.cd-dynamic-select-body');

              bodyElement.css('max-width','700px');

              if (scope.appendToBody) {
                  // create tether
                  tether = new Tether({
                      element: bodyElement.get(0),
                      target: element.find('.cd-head').get(0),
                      attachment: 'top left',
                      targetAttachment: 'bottom left',
                      classes: {
                          element: 'my-box'
                      },
                      constraints: [{
                          to: 'window',
                          //attachment: 'together'
                          attachment: 'bottom'
                      }]
                  });

                  // clean when scope destroyed
                  scope.$on('$destroy', function () {
                      tether.destroy();
                      bodyElement.remove();
                  });
              }
          });
      }
  }
}]);

angular.module('Demo').directive('cdPartial', [
	'$compile',
	'$controller',
	'$http',
	'$templateCache',
	'$q',
	'$state',
	'$resolve',
	function (compile, controller, http, templateCache, q, state, resolve) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var resolvePromises,
					templatePromise,
					tmplScope,
					tmplCtrl,
					resolveFns,
					attrLocals;

				scope.$watch(attrs[current.name], function (options) {
					resolvePromises = [];
					resolveFns = angular.extend({}, options.resolve || {});
					attrLocals = scope.$eval(attrs[current.name + 'Locals']);

					// extend resolves
					if (attrLocals) {
						Object.keys(attrLocals).forEach(function (attrLocalKey) {
							resolveFns[attrLocalKey] = function () {
								return attrLocals[attrLocalKey];
							};
						});
					}

					// destroy previous scope
					if (tmplScope) {
						tmplScope.$destroy();
					}

					// load template
					if(options.templateUrl) {
						templatePromise = http.get(options.templateUrl, { cache: templateCache }).then(function (result) {
							return result.data;
						});
					} else {
						templatePromise = q.when(options.template);
					}

					// resolve promises
					resolve.resolve(resolveFns, state.$current.locals.globals).then(function (locals) {
						return templatePromise.then(function (template) {
							return {
								locals: angular.extend({}, locals, attrLocals),
								template: template
							};
						});
					}).then(function (data) {
						init(data, options)
					}, function (err) {
						console.error('Resolve failed', err);
					});
				});

				// init controller
				function init(data, options) {
					// create child scope
					tmplScope = scope.$new();

					// add content
					element.html(data.template);

					// assign controller if available
					if (options.controller) {
						tmplCtrl = controller(options.controller, angular.extend({ $scope: tmplScope }, data.locals));
						element.children().data('$ngControllerController', tmplCtrl);
					}

					// compile element contents with child scope
					compile(element.contents())(tmplScope);

					// call on init callback
					var onInitCallback = attrs[current.name + 'Oninit'];
					if (onInitCallback) {
						tmplScope.$eval(onInitCallback);
					}
				}
			}
		};
	}
]);

export let ThreeAngular = {
  bindings: {
    data: '<',
    dataWithFiltering: '<cdDataWithFiltering',
    options: '<?cdOptions',
    disabled: '<ngDisabled',
    required: '<ngRequired',
    expanded: '<?cdExpanded',
    placeholder: '<cdPlaceholder',
    idField:'<cdIdField',
    keyProp: '<cdKeyProp',
    displayProp: '<cdDisplayProp',
    comparerProp: '<cdComparerProp',
    optionCaptionProp: '<cdOptionCaptionProp',
    locals: '<cdLocals',
    appendToBody: '<cdAppendToBody',
    multiple: '<cdMultiple',
    beforeChange: '&cdBeforeChange',
    loadData: '&cdLoadData',
    allowSearch: '<cdAllowSearch',
    optionPartial: '<cdOptionPartial',
    bodyClassName: '<cdBodyClassName',
    multiselectWithDestroy:'<multiselectWithDestroy',
    multiselectFullSize:'<multiselectFullSize',
    withoutTotal:'<cdWithoutTotal'

  },
  template: `
    <div>
      three: {{this.$ctrl.three}}
      <selector cd-data="this.$ctrl.data"
      name="sendBackStep"
      id="sendBackStep"
      cd-placeholder="უკან გაგზავნის ნაბიჯი"
      ng-model="three"
      ng-required="true"></selector>
    </div>
  `
}

export let DynamicSelect = angular2react('threeAngular', ThreeAngular, lazyInjector.$injector)
