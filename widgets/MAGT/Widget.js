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
    SimpleLineSymbol,Color) {
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

      baseClass: 'garrett-widget-magt',
      name: 'Mean Average Ground Temperature',
      graphicsLayer:{},
      layer1:{},
      layer2:{},
      finalResult:{
        risk:"",
        description:'',
        values:{
          current:-1,
          future:-1,
          alt:-1
        }
        },
      canClick:false,
      constructor:function()
      {

      },
      startup: function() {
        lang.hitch(this,this._sliderInit());
        var x = document.getElementById('map_zoom_slider');
        domStyle.set(x,'background-color','#70DB70')
        domStyle.set(x,'color','#104110');
        domStyle.set(x,'opacity','.85');
        domStyle.set(x,'bottom','7');
        this.inherited(arguments);
        this.graphicsLayer = new GraphicsLayer({id:'magt-widget'})
        this.map.addLayer(this.graphicsLayer);
        on(this.map,'click',lang.hitch(this,this._mapClick));

        window.onmousemove = lang.hitch(this,function (e) {
         
            var x = e.clientX,
                y = e.clientY;
            this.tooltip.style.top = (y + 20) + 'px';
            this.tooltip.style.left = (x + 20) + 'px';
        });

      },
      _layersCheck:function(e){
        if(e.target.checked)
        {
          this.layer1.setVisibility(true);
          this.layer2.setVisibility(true);

        }
        else
        {
          this.layer1.setVisibility(false);
          this.layer2.setVisibility(false);
        }
      },
      _enableClick:function(e)
      {
        if(this.canClick)
        {
          domClass.add(this.resultsDiv,'hidden');
          this.canClick = false;
          domClass.add(this.tooltip,'hidden');
        }
        else{
          this.canClick = true;
          domClass.remove(this.tooltip,'hidden');
        }
      },
      _getLocation:function()
      {
        this.canClick = false;
        domClass.add(this.tooltip, 'hidden');
        if (navigator.geolocation) {
          var location = navigator.geolocation.getCurrentPosition(lang.hitch(this,function(e){
            var coords = e.coords;
            var wgs1984 = new SpatialReference(4326);
            var latitude = coords.latitude;
            var longitude = coords.longitude;
            var point = new Point(longitude,latitude, wgs1984);
            console.log(point);
            var gs = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            var webMercator = new SpatialReference(3857)
            gs.project([point],webMercator,lang.hitch(this,function(e){
              console.log(e);

              var foo = {
                mapPoint:e[0]

              }
              this.canClick =true;
              this._mapClick(foo)
              this.canClick = false;

            }))
            
          }));
        }
      },
      _sliderInit:function(){
        var p = this.slider,
            res = this.result;
        var layerIds = this.map.layerIds;
        for(var i =0; i<layerIds.length; i++)
        {
            var id = layerIds[i];
            var layer = this.map.getLayer(id);
            if (layer.url == this.config.slider.layer1.url)
            {
                this.layer1 = layer;
            }
            if( layer.url == this.config.slider.layer2.url)
            {
                this.layer2  = layer;
            }
        }
        this.layer1.setOpacity(1);
        this.layer2.setOpacity(0);

        p.addEventListener("input", lang.hitch(this,function(e) {
            
            this.layer1.setOpacity((100-e.target.value)/100);
            this.layer2.setOpacity((e.target.value)/100);
        }), false); 
      },
      _mapClick:function(e)
      {
        if(this.canClick)
        {
          this.graphicsLayer.clear();
         var sms =  new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 10,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color('#104110'), 1),
            new Color([0,255,0,0.25]));
          var graphic = new Graphic(e.mapPoint,sms)
          this.graphicsLayer.add(graphic);
          // this.map.centerAndZoom(e.mapPoint,7)
          var outSR = new SpatialReference(4326);
          var pointString = e.mapPoint.x.toString() + " " + e.mapPoint.y.toString();
          var params ={
            Point:pointString
          }
          var taskURL = "http://www.akpermafrost.com:6080/arcgis/rest/services/AppChallenge/AppChallenge/GPServer/MAGT";
          var task = new Geoprocessor(taskURL);
          task.execute(params,lang.hitch(this,function(e){
            if(e.length>-1)
            {

              var currentResultValue = e[0].value;
              var futureResultValue = e[2].value;
              var altResultValue = e[1].value;

              this.finalResult.values.current = currentResultValue;
              this.finalResult.values.future = futureResultValue;
              this.finalResult.values.alt = altResultValue;
              var current = this._getCurrentCondition(currentResultValue);
              var projected = this._getProjectedCondition(futureResultValue);
              
              console.log(currentResultValue, futureResultValue,altResultValue);
              console.log(current.index, projected.index)
              this.finalResult.risk="No Data";
              this.finalResult.description = "No data was found for this location. Permafrost forecast available only for the State of Alaska."
              if(current.index == 0 && projected.index == 0)
              {
                this.finalResult.risk= "No Risk";
                this.finalResult.description = "Current conditions identify no permafrost layer so infrastructure impacts due to degradation of permafrost are not a concern.";
              }
              if(current.index == 1 && projected.index == 2 && altResultValue<50)
			  {
				this.finalResult.risk = "Medium Risk";
				this.finalResult.description = "Active degradation of permafrost will begin in the near-term, begin mitigating for effects now.";
			  }
			  if(current.index == 1 && projected.index == 2 && altResultValue>50)
			  {
				this.finalResult.risk = "High Risk";
				this.finalResult.description = "Active degradation of permafrost will begin in the near-term.  In addition, a large increase in the thickness of the active layer is expected, begin mitigating for effects now. If no mitigation is done, impacts to infrastructure such as buckling and leaning will be common.";
			  }
			  if(current.index ==1 && projected.index ==1 && altResultValue <50)
			  {
				this.finalResult.risk = "No Risk";
				this.finalResult.description = "No degradation of permafrost is predicted so there is no risk to infrastructure.";
			  }
			  if(current.index ==1 && projected.index ==1 && altResultValue >50)
			  {
				this.finalResult.risk = "Medium Risk";
				this.finalResult.description = "No degradation of permafrost is predicted but there is risk to infrastructure because a large increase in the thickness of the active layer is detected."
			  }
			  if(current.index ==1 && projected.index ==0 && altResultValue <50)
			  {
				this.finalResult.risk = "High Risk";
				this.finalResult.description = "Complete loss of permafrost is expected in the near-term future, act now to mitigate impacts to infrastructure.  If no mitigation is done, impacts to infrastructure such as buckling and leaning will be common.";
			  }
			  if(current.index ==1 && projected.index ==0 && altResultValue >50)
			  {
				this.finalResult.risk = "High Risk";
				this.finalResult.description = "Complete loss of permafrost is expected in the near-term future, act now to mitigate impacts to infrastructure.  If no mitigation is done, impacts to infrastructure such as buckling and leaning will be common."
			  }
			  
              if(this.finalResult.risk == "Low Risk")
              {
                domStyle.set(this.riskText,'color',"#0066FF")
              }
              if(this.finalResult.risk == "No Risk" || this.finalResult.risk == "No Data")
              {
                domStyle.set(this.riskText,'color','#104110')
              }
              if(this.finalResult.risk == "Medium Risk")
              {
                domStyle.set(this.riskText,'color','#FFFF00')
              }
              if(this.finalResult.risk == "High Risk")
              {
                domStyle.set(this.riskText,'color','red')
              }
              this.riskText.innerHTML = this.finalResult.risk;
              this.detailsText.innerHTML = this.finalResult.description;
              // this.statCurrent.innerHTML = this.finalResult.values.current;
              // this.altChange.innerHTML = this.finalResult.values.alt;
              // this.statFuture.innerHTML = this.finalResult.values.future;
              domClass.remove(this.resultsDiv,'hidden')
              domClass.add(this.tooltip, 'hidden');
            }

            // alert("2010-2019: " + e[0].value + '\n\r' + "2040-2049: " + e[1].value + "\n\r" + "2090-2099: " + e[2].value)
          }))
        }
      },
      _hideMe:function(e)
      {
        domClass.add(this.resultsDiv,'hidden')
      },
	  _getCurrentCondition:function(value){
		var result = {
			value:value,
			condition:'',
			index:-1
		}
		if(value > 0.0)
		{
			result.condition = "No Permafrost";
			result.index = 0;
		}
		if(value < 0.0)
		{
			result.condition = "Permafrost";
			result.index = 1;
		}
		console.log(value);
		return result;
	  },
      _getProjectedCondition:function(value)
      {
       
        var result ={
          value:value,
          condition:'',
          index:-1
        }
        if(value > 5.0 && value < 10.0)
        {
          result.condition = "No Permafrost";
          result.index = 0;
        }
        if(value < 0 && value >-10.0)
        {
          result.condition = 'Permafrost';
          result.index = 1;
        }
        if(value > 0 && value < 5.0)
        {
          result.condition = "Active Degradation";
          result.index = 2;
        }
        return result;
      }

    });
    return clazz;
  }); 