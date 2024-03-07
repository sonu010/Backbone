var GUID = function () {
    return Math.floor(Math.random() * 9000) + 1000;
};
// Define the PlanScenario model
var PlanScenario = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            id: null,
            Plan: null,
            startTime:
                "Wed Mar 05 2024 14:50:35 GMT+0530 (India Standard Time)",
        };
    },
    relations: [
        {
            type: Backbone.HasMany,
            key: "scenarioPathSteps",
            relatedModel: "ScenarioPathStep",
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
        },
    ],
});

// Define the ScenarioPathStep model
var ScenarioPathStep = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            phase: null,
            alternative: null,
            startPeriod: 0,
            noPeriods: null,
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "nextStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation:{
                key:"previousStep"
            }
        },
        //PeriodDataset
        {
            type: Backbone.HasMany,
            key: "inputDatasets",
            relatedModel: "PeriodDataset",

        },
        {
            type: Backbone.HasMany,
            key: "scenarioDatasets",
            relatedModel: "PeriodDataset",

        },
        {
            type: Backbone.HasMany,
            key: "whatIfConfig",
            relatedModel: "WhatIfConfig",

        },
    ],
});

// PeriodDataset model
var PeriodDataset = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            period:0,
            JSONObject: {},
            type: null,
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "nextDataset",
            relatedModel: "PeriodDataset",
            reverseRelation:{
                key:"previousDataset"
            }
        },
    ],
    initialize: function() {
        this.relations.push({
            type: Backbone.HasOne,
            key: 'type',
            relatedModel: "ScenarioDataType"
        });
    }
});


// ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            planId: null,
            data: {}, // The data is array of InstantiationContext
        };
    },

});
// ExecutionContextView
var ExecutionContextView = Backbone.View.extend({
    defaults:function(){
        return "This is a note"
    }
});

//WhatIfConfig model
var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            valueId: "",
            valueInstanceId: "",
        };
    },
});

// Define the ScenarioDataType enumeration
var ScenarioDataType = Backbone.Model.extend({
    defaults: function () {
        return {
            plan: "plan",
            actual: "actual",
            benchmark: "benchmark",
            norm: "norm",
            target: "target",
            forecast: "forecast",
            perception: "perception",
        };
    },
});
//ScenarioPathStepCollection
var ScenarioPathStepCollection = Backbone.Collection.extend({
    model: ScenarioPathStep,
});

//PeriodDatasetCollection
var PeriodDatasetCollection = Backbone.Collection.extend({
    model: PeriodDataset,
});
// Instances
var planScenario = new PlanScenario({});
var executionContext = new ExecutionContext({});
var scenarioPathStep = new ScenarioPathStep({});
var whatIfConfig = new WhatIfConfig({});
var periodDataset = new PeriodDataset({});
periodDataset.set('type',scenarioDataType)
var scenarioDataType = new ScenarioDataType({});
// var executionContextView = new ExecutionContextView({});

console.log("PlanScenario", planScenario.toJSON());
console.log("ExecutionContext", executionContext.toJSON());
console.log("ScenarioPathStep", scenarioPathStep.toJSON());
console.log("WhatIfConfig", whatIfConfig.toJSON());
console.log("PeriodDataset", periodDataset.toJSON());
console.log("ScenarioDataType", scenarioDataType.toJSON());
// console.log("executionContextView",executionContextView.toJSON());
