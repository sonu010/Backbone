const ScenarioDataType = {
    plan: "plan",
    actual: "actual",
    benchmark: "benchmark",
    norm: "norm",
    target: "target",
    forecast: "forecast",
    perception: "perception",   
};

const GUID = () => Math.floor(Math.random() * 9000) + 1000;

// Model Definitions
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
            reverseRelation: {
                key: "planScenario",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        }
    ],
});

var ScenarioPathStep = Backbone.RelationalModel.extend({
    defaults: {
        phase: null,
        alternative: null,
        startPeriod: 0,
        noPeriods: null,
    },
    relations: [
        {
            type: Backbone.HasMany,
            key: "inputDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
        {
            type: Backbone.HasMany,
            key: "scenarioDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "scenarioPathStep",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
        {
            type: Backbone.HasMany,
            key: "whatIfConfigs",
            relatedModel: "WhatIfConfig",
            reverseRelation: {
                key: "scenarioPathStep",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        }
    ],
});

var PeriodDataset = Backbone.RelationalModel.extend({
    defaults: {
        period: 0,
        data: null,
        type: null,
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "periodDataset",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        }
    ]
});

var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: {
        planId: null,
        data: null,
    },
});

var WhatIfConfig = Backbone.RelationalModel.extend({
    defaults: {
        valueId: null,
        valueInstanceId: null,
    },
});

// Create instances
const planScenario = new PlanScenario({
    id: GUID(),
    Plan: "Sample Plan",
    startTime: new Date("2024-03-07T14:21:35+0530"),
});

const scenarioPathStep = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 1",
    startPeriod: 0,
    noPeriods: 5,
});

const periodDataset = new PeriodDataset({
    period: 1,
    data: {
        value1: 100,
        value2: 200,
    },
});

const executionContext = new ExecutionContext({
    planId: GUID(),
    data: {
        context1: "data1",
        context2: "data2",
    }
});

const whatIfConfig = new WhatIfConfig({
    valueId: "value1",
    valueInstanceId: "instance1",
});

// Establish composition relationships
planScenario.get("scenarioPathSteps").add(scenarioPathStep);
scenarioPathStep.get("inputDatasets").add(periodDataset);
scenarioPathStep.get("scenarioDatasets").add(periodDataset);
scenarioPathStep.get("whatIfConfigs").add(whatIfConfig);
periodDataset.set("executionContext", executionContext);

// Log instances
console.log("Plan Scenario:", planScenario.toJSON());
console.log("Scenario Path Step:", scenarioPathStep.toJSON());
console.log("Period Dataset:", periodDataset.toJSON());
console.log("Execution Context:", executionContext.toJSON());
console.log("What If Config:", whatIfConfig.toJSON());
