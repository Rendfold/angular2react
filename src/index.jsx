/**
 * Angular2React demo
 *
 * DOM structure:
 *
 * #App           (Container)
 *  One           (Angular component)
 *    Two         (React component)
 *      Three     (Angular component)
 *        Four    (React component)
 */

import angular from 'angular'
import React from 'react'
import { render } from 'react-dom'
import { ThreeAngular, DynamicSelect } from './DynamicSelect'
import { lazyInjector } from './lazyInjector'

// Expose components to Angular

angular
  .module('Demo')
  .component('threeAngular', ThreeAngular)
  .run(['$injector', function (_$injector) {
    lazyInjector.$injector = _$injector
    reactBootstrap()
  }])

angular.bootstrap(document.createElement('div'), ['Demo'])

function reactBootstrap () {
  render(<DynamicSelect data={ [{id: 1, name: 'a'}, {id: 2, name: 'a'}] } />, document.querySelector('#App'))
}
