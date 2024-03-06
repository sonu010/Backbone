// Generate a random GUID
var GUID = function () {
    return Math.floor(Math.random() * 10000) + 1000;
};

// Define the ScenarioDataType enumeration
var ScenarioDataType = {
    plan: "plan",
    actual: "actual",
    benchmark: "benchmark",
    norm: "norm",
    target: "target",
    forecast: "forecast",
    perception: "perception",
};

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
            reverseRelation: {
                key: "planScenario",
            },
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenario",
            },
        },
    ],
    initialize: function () {},
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
            key: "periodDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "scenarioPathStep",
            },
        },
        {
            type: Backbone.HasMany,
            key: "whatIfConfig",
            relatedModel: "WhatIfConfig",
            reverseRelation: {
                key: "scenarioPathStep",
            },
        },
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
        {
            type: Backbone.BelongsTo,
            key: "dataType",
            relatedModel: function () {
                return ScenarioDataType;
            },
        },
    ],
});

// Define the ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            planId: null,
            data: "",
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "planScenario",
            relatedModel: "PlanScenario",
            reverseRelation: {
                key: "executionContext",
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
    relations: [
        {
            type: Backbone.HasOne,
            key: "scenarioPathStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "whatIfConfig",
            },
        },
    ],
});

var InstantiationContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {};
    },
});

// Instances
var planScenario = new PlanScenario({});
var executionContext = new ExecutionContext({});
var scenarioPathStep = new ScenarioPathStep({});
var whatIfConfig = new WhatIfConfig({});

// planScenario.set("executionContext", executionContext);

// Set up the relations
// scenarioPathStep.get("periodDatasets").add(new PeriodDataset());
// scenarioPathStep.get("periodDatasets").add(new PeriodDataset());
// scenarioPathStep.get("whatIfConfig").add(whatIfConfig);

console.log(planScenario.toJSON());
console.log(executionContext.toJSON());
console.log(scenarioPathStep.toJSON());
console.log(whatIfConfig.toJSON());
