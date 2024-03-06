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

// Define the PlanScenario model
var PlanScenario = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            id: GUID(),
            Plan: GUID(),
            startTime:
                "Wed Mar 05 2024 14:50:35 GMT+0530 (India Standard Time)",
        };
    },
    relations: [
        {
            type: Backbone.HasMany,
            key: "scenarioPathSteps",
            relatedModel: "ScenarioPathStep",
            // reverseRelation: {
                
            // },
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                type:Backbone.HasOne
            },
        },
    ],
});

// Define the ScenarioPathStep model
var ScenarioPathStep = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            phase: GUID(),
            alternative: GUID(),
            startPeriod: 0,
            noPeriods: 5,
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "next",
            relatedModel: "ScenarioPathStep",
        },
        {
            type: Backbone.HasOne,
            key: "previous",
            relatedModel: "ScenarioPathStep",
        },
        {
            type: Backbone.HasMany,
            key: "input",
            relatedModel: "PeriodDataset",
            // reverseRelation: {
            //     key: "scenarioPathStep",
            // },
        },
        {
            type:Backbone.HasMany,
            key:"scenario",
            relatedModel:"PeriodDataSet",
            // reverseRelation:{
            //     key:"periodDataset"
            // }
        },
        {
        type:Backbone.HasMany,
        key:'whatIfConfig',
        relatedModel:'WhatIfConfig',
        reverseRelation:{
            type:Backbone.HasOne
        }
        }
    ],
});

// Define the PeriodDataset model
var PeriodDataset = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            period: null,
            JSONObject: null,
            type: null,
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "next",
            relatedModel: "PeriodDataset",
        },
        {
            type: Backbone.HasOne,
            key: "previous",
            relatedModel: "PeriodDataset",
        },
        // {
        //     type:Backbone.HasMany,
        //     key:

        // }
    ],
});

// Define the ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            planId: GUID(),
            data: "",
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "planScenario",
            relatedModel: "PlanScenario",
            reverseRelation: {
                type: Backbone.HasOne,
                key: "planScenario",
            },
        },
    ],
});

// Define the WhatIfConfig model
var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            valueId: null,
            valueInstanceId: "",
        };
    },
    relations:[{
        type:Backbone.HasOne,
        key:'scenarioPathStep',
        relatedModel:'ScenarioPathStep'
    }]
});

var InstantiationContext = Backbone.Model.extend({
    defaults: function () {
        return {};
    },
});

// Instances
var planScenario = new PlanScenario({});
var executionContext = new ExecutionContext({});
var scenarioPathStep = new ScenarioPathStep({});
var whatIfConfig = new WhatIfConfig({});
planScenario.set("executionContext", executionContext);
// scenarioPathStep.set('next',WhatIfConfig);
scenarioPathStep.set("periodDataset", PeriodDataset);
scenarioPathStep.set("periodDataset", PeriodDataset);
console.log(planScenario.toJSON());
console.log(executionContext.toJSON());
console.log(scenarioPathStep.toJSON());
console.log(whatIfConfig.toJSON());

