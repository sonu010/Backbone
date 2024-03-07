// var GUID=function() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
//     .replace(/[xy]/g, function (c) {
//         const r = Math.random() * 16 | 0,
//             v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//     });
// }
var GUID = function () {
    return Math.floor(Math.random() * 9000) + 1000;
};
// Define the PlanScenario model
var PlanScenario = Backbone.RelationalModel.extend({
    defaults: {
        id: null,
        Plan: null,
        startTime: null,
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
    defaults: {
        phase: null,
        alternative: null,
        startPeriod: 0,
        noPeriods: null,
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "nextStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "previousStep",
            },
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
    defaults: {
        period: 0,
        data: null,
        type: null,
    },

    relations: [
        {
            type: Backbone.HasOne,
            key: "nextDataset",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "previousDataset",
            },
        },
    ],
});

// ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: {
        planId: null,
        data: null, // The data is array of InstantiationContext
    },
});
// ExecutionContextView
var ExecutionContextView = Backbone.View.extend({
    defaults: function () {
        return "This is a note";
    },
});

//WhatIfConfig model
var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: {
        valueId: null,
        valueInstanceId: null,
    },
});

//ScenarioDataType enumeration
const ScenarioDataType = {
    plan: "plan",
    actual: "actual",
    benchmark: "benchmark",
    norm: "norm",
    target: "target",
    forecast: "forecast",
    perception: "perception",
};
//ScenarioPathStepCollection
var ScenarioPathStepCollection = Backbone.Collection.extend({
    model: ScenarioPathStep,
});

//PeriodDatasetCollection
var PeriodDatasetCollection = Backbone.Collection.extend({
    model: PeriodDataset,
});

// Creating instances
var planScenario = new PlanScenario({
    id: GUID(),
    Plan: "Sample Plan",
    startTime: new Date("2024-03-07T14:21:35+0530"),
});

var scenarioPathStep1 = new ScenarioPathStep({
    phase: "Phase 1",
    alternative: "Alternative 1",
    startPeriod: 1,
    noPeriods: 5,
});

var scenarioPathStep2 = new ScenarioPathStep({
    phase: "Phase 2",
    alternative: "Alternative 2",
    startPeriod: 6,
    noPeriods: 3,
});

var executionContext = new ExecutionContext({
    planId: GUID(),
    data: {
        context1: "data1",
        context2: "data2",
    },
});

var periodDataset1 = new PeriodDataset({
    period: 1,
    data: {
        value1: 100,
        value2: 200,
    },
});

var periodDataset2 = new PeriodDataset({
    period: 2,
    data: {
        value1: 150,
        value2: 250,
    },
});

periodDataset1.set("type", ScenarioDataType.plan);
periodDataset2.set("type", ScenarioDataType.actual);

var whatIfConfig = new WhatIfConfig({
    valueId: "value1",
    valueInstanceId: "instance1",
});

// Add relations
planScenario
    .get("scenarioPathSteps")
    .add([scenarioPathStep1, scenarioPathStep2]);
planScenario.set("executionContext", executionContext);

scenarioPathStep1.get("inputDatasets").add(periodDataset1);
scenarioPathStep1.get("scenarioDatasets").add(periodDataset2);
scenarioPathStep1.get("whatIfConfig").add(whatIfConfig);

console.log("Plan Scenario:");
console.log(planScenario.toJSON());

console.log("Scenario Path Steps:");
planScenario.get("scenarioPathSteps").each(function (step) {
    console.log(step.toJSON());
});

console.log("Execution Context:");
console.log(executionContext.toJSON());

console.log("Period Datasets:");
console.log(periodDataset1.toJSON());
console.log(periodDataset2.toJSON());

console.log("WhatIfConfig:");
console.log(whatIfConfig.toJSON());
