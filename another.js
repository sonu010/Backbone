// Define the PlanScenario model
var PlanScenario = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            id: null,
            Plan: null,
            startTime: null,
        };
    },
    relations: [
        {
            type: Backbone.HasMany,
            key: "scenarioPathSteps",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "planScenarioSPS",
            }
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenarioRL",
                type:Backbone.HasOne,
                includeInJSON:"id"
            }
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
            type: Backbone.HasMany,
            key: "nextStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "previousStep",
                includeInJSON: "id" ,
                type:Backbone.HasOne
            }
        },
        {
            type: Backbone.HasMany,
            key: "inputDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "inputPD",
            }
        },
        {
            type: Backbone.HasMany,
            key: "scenarioDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "scenarioPD",
            }
        },
        {
            type: Backbone.HasMany,
            key: "whatIfConfig",
            relatedModel: "WhatIfConfig",
            reverseRelation: {
                key: "ScenarioPathstepWIC",
            }
        },
        // {
        //     type: Backbone.HasOne,
        //     key: "planScenario",
        //     relatedModel: PlanScenario,
        //     reverseRelation: {
        //         key: "scenarioPathSteps",
        //     }
        // },
    ],
});

// PeriodDataset model
var PeriodDataset = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            period: 0,
            data: null,
            type: null,
        };
    },
    relations: [
        {
            type: Backbone.HasMany,
            key: "nextDataset",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "previousDataset",
                includeInJSON:"id",
                type:Backbone.HasOne
            },
        },
        // {
        //     type: Backbone.HasOne,
        //     key: "parentStep",
        //     relatedModel: ScenarioPathStep,
        //     reverseRelation: {
        //         key: "inputDatasets",
        //     },
        // },
    ],
});

// ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            planId: null,
            data: null,
        };
    },
    // relations: [
    //     {
    //         type: Backbone.HasOne,
    //         key: "planScenario",
    //         relatedModel: "PlanScenario",
    //         reverseRelation: {
    //             key: "executionContextReverse",
    //         }
    //     },
    // ],
});

// WhatIfConfig model
var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            valueId: null,
            valueInstanceId: null,
        };
    },
    // relations: [
    //     {
    //         type: Backbone.HasOne,
    //         key: "parentStep",
    //         relatedModel: ScenarioPathStep,
    //         reverseRelation: {
    //             key: "whatIfConfigRelation",
    //         }
    //     },
    // ],
});


const ScenarioDataType = {
    plan: "plan",
    actual: "actual",
    benchmark: "benchmark",
    norm: "norm",
    target: "target",
    forecast: "forecast",
    perception: "perception",   
};
var GUID = function () {
    return Math.floor(Math.random() * 9000) + 1000;
};
// Create instances of PlanScenario
var planScenario = new PlanScenario({
    id: GUID(),
    Plan: "Sample Plan",
    startTime: new Date("2024-03-07T14:21:35+0530"),
});
// Create instances of ExecutionContext
var executionContext = new ExecutionContext({
    planId: GUID(),
    data: {
        context1: "data1",
        context2: "data2",
    }
});

// Create instances of WhatIfConfig
var whatIfConfig = new WhatIfConfig({
    valueId: "value1",
    valueInstanceId: "instance1",
});

// Create instances of PeriodDataset
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

// Create instances of ScenarioPathStep
var scenarioPathStep1 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 1",
    startPeriod: 1,
    noPeriods: 5,
});

var scenarioPathStep2 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 2",
    startPeriod: 6,
    noPeriods: 3,
});



// Add relations
planScenario.set("executionContext", executionContext);
scenarioPathStep1.get("inputDatasets").add(periodDataset1);
scenarioPathStep1.get("scenarioDatasets").add(periodDataset2);
scenarioPathStep1.get("whatIfConfig").add(whatIfConfig);
planScenario.get("scenarioPathSteps").add([scenarioPathStep1, scenarioPathStep2]);

// Log instances to test the relations
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



// //----------------------------------------------

// var periodDataset3=new PeriodDataset({
//     period:3,
//     data:{
//         value1:500,
//         value2:600
//     },
// })
// periodDataset3.set("type",ScenarioDataType.benchmark);
// scenarioPathStep1.get("inputDatasets").add(periodDataset3);
// console.log("periodDataSet3")
// console.log(periodDataset3.toJSON())

