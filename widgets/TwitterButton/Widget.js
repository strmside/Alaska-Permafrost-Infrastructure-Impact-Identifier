///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Garrett MacKay. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/html',
    'dijit/_WidgetsInTemplateMixin',
    "esri/geometry/Point",
    'esri/SpatialReference',
    'jimu/BaseWidget',
    'jimu/utils',
    'dojo/_base/lang',
    'dojo/on',
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dojo/aspect",
    "dojo/Deferred",
    "esri/tasks/ProjectParameters",
    "esri/tasks/GeometryService",
    "jimu/portalUtils",
    "esri/config",
    "esri/tasks/Geoprocessor",
    "esri/tasks/GeometryService",
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/Color",
    "widgets/TwitterButton/libs/widgets.js"


  ],
  function(
    declare,
    array,
    html,
    _WidgetsInTemplateMixin,
    Point,
    SpatialReference,
    BaseWidget,
    utils,
    lang,
    on,
    domStyle,
    domClass,
    domConstruct,
    DropDownMenu,
    MenuItem,
    CheckedMenuItem,
    aspect,
    Deferred,
    ProjectParameters,
    GeometryService,
    portalUtils,
    esriConfig,
    Geoprocessor,
    GeometryService,
    GraphicsLayer,
    Graphic,
    SimpleMarkerSymbol,
    SimpleLineSymbol,Color,Twitter) {
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

      baseClass: 'garrett-tweet-button',
      name: 'Tweet Button',
      
      constructor:function()
      {
      },
      startup: function() {

      }
    });
    return clazz;
  }); 