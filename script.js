// import * as $ from 'jquery'
// import * as _ from 'underscore'
// import * as Backbone from 'backbone'
// // import * as BR from 'backbone-relational'
// import * as ko from 'knockout'
// import * as kb from 'knockback'

// Zoo = Backbone.RelationalModel.extend({
// 	relations: [{
// 		type: Backbone.HasMany,
// 		key: 'animals',
// 		relatedModel: 'Animal',
// 		collectionType: 'AnimalCollection',
// 		reverseRelation: {
// 			key: 'livesIn',
// 			includeInJSON: 'id'
// 		}
// 	}]
// });

// Animal = Backbone.RelationalModel.extend({
// 	urlRoot: '/animal/'
// });

// AnimalCollection = Backbone.Collection.extend({
// 	model: Animal
// });
// var artis = new Zoo( { name: 'Artis' } );
// var lion = new Animal( { species: 'Lion', livesIn: artis } );
// alert( artis.get( 'animals' ).pluck( 'species' ) );
// var amersfoort = new Zoo( { name: 'Dierenpark Amersfoort', animals: [ lion ] } );
// alert( lion.get( 'livesIn' ).get( 'name' ) + ', ' + artis.get( 'animals' ).length );



var PlanScenario = Backbone.RelationalModel.extend({
    relations: [{
      type: Backbone.HasMany,
      key: 'scenarioPathStep',
      relatedModel: 'ScenarioPathStep',
      reverseRelation: {
        key: 'planScenario'
      }
    }],
    defaults: {
      id: ()=>guid(),
      plan: ()=>guid(),
      startTime: 0
    }
  });
  
 var ExecutionContext = Backbone.RelationalModel.extend({
    relations: [{
      type: Backbone.HasOne,
      key: 'planScenario',
      relatedModel: 'whatIfConfig',
      reverseRelation: {
        key: 'executionContext'
      }
    }],
    defaults: {
      planId: null,
      data: null
    }
  });
  
  var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: {
      valueId: null,
      valueInstanceId: null
    }
  });
  
  var PeriodDataset = Backbone.RelationalModel.extend({
    defaults: {
      period: null,
      data: null,
      type: 'ScenarioDataType'
    }
  });
  
  // Define Backbone collections
  var ScenarioPathStepCollection = Backbone.Collection.extend({
    model: ScenarioPathStep
  });
  
  var ScenarioDataType = Backbone.Collection.extend({
    model: PeriodDataset
  });
  
  // Set up relationships
  PlanScenario.setup();
  ExecutionContext.setup();
  whatIfConfig.setup();
  PeriodDataset.setup();


  function guid(){
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }