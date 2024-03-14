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
                key: "planScenarioSPS",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenarioRL",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        },
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
            key: "nextStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "previousStep",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        },
        {
            type: Backbone.HasMany,
            key: "inputDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "inputPD",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
        {
            type: Backbone.HasMany,
            key: "scenarioDatasets",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "scenarioPD",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
        {
            type: Backbone.HasMany,
            key: "whatIfConfig",
            relatedModel: "WhatIfConfig",
            reverseRelation: {
                key: "ScenarioPathstepWIC",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        },
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
            type: Backbone.HasMany,
            key: "nextDataset",
            relatedModel: "PeriodDataset",
            reverseRelation: {
                key: "previousDataset",
                includeInJSON: "id",
                type: Backbone.HasOne
            },
        },
    ],
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
const whatIfConfig2 = new WhatIfConfig({
    valueId:"value2",
    valueInstanceId:"instance2"
})

const periodDataset1 = new PeriodDataset({
    period: 1,
    data: {
        value1: 100,
        value2: 200,
    },
});

const periodDataset2 = new PeriodDataset({
    period: 2,
    data: {
        value1: 150,
        value2: 250,
    },
});
const periodDataset3 = new PeriodDataset({
    period:3,
    data:{
        value1:200,
        value2:300
    }
})
// Setting next and previous relationships for PeriodDataset instances
periodDataset1.set("nextDataset", periodDataset2);
periodDataset2.set("previousDataset", periodDataset1);
periodDataset2.set("nextDataset", periodDataset3);
periodDataset3.set("previousDataset", periodDataset2);

periodDataset1.set("type", ScenarioDataType.plan);
periodDataset2.set("type", ScenarioDataType.actual);
periodDataset3.set("type",ScenarioDataType.perception)
const scenarioPathStep1 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 1",
    startPeriod: 0,
    noPeriods: 5,
});

const scenarioPathStep2 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 2",
    startPeriod: 2,
    noPeriods: 3,
});
// Setting next and previous relationships for ScenarioPathStep instances
scenarioPathStep1.set("nextStep", scenarioPathStep2);
scenarioPathStep2.set("previousStep", scenarioPathStep1);
// Add relations
planScenario.set("executionContext", executionContext);
scenarioPathStep1.get("inputDatasets").add(periodDataset1);
scenarioPathStep1.get("scenarioDatasets").add(periodDataset2);
scenarioPathStep2.get("scenarioDatasets").add(periodDataset3);
scenarioPathStep1.get("whatIfConfig").add(whatIfConfig);
scenarioPathStep2.get("whatIfConfig").add(whatIfConfig2);
planScenario.get("scenarioPathSteps").add([scenarioPathStep1, scenarioPathStep2]);

// Log instances
console.log("Plan Scenario:", planScenario.toJSON());
console.log("Scenario Path Steps:");
planScenario.get("scenarioPathSteps").each(step => console.log(step.toJSON()));
console.log("Execution Context:\n", executionContext.toJSON());
console.log("Period Datasets:\n", periodDataset1.toJSON(),
 periodDataset2.toJSON(),periodDataset3.toJSON());
console.log("WhatIfConfig:\n",whatIfConfig.toJSON());
console.log(whatIfConfig2.toJSON())