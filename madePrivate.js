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
var PlanScenario = (() => {
    class PlanScenario extends Backbone.RelationalModel {
        constructor(attributes, options) {
            super(attributes, options);
            this.defaults = {
                id: null,
                Plan: null,
                startTime: null,
            };
            this._scenarioPathSteps = new Backbone.Collection();
            this._executionContext = null;
        }

        get scenarioPathSteps() {
            return this._scenarioPathSteps;
        }

        set scenarioPathSteps(steps) {
            this._scenarioPathSteps = steps;
        }

        get executionContext() {
            return this._executionContext;
        }

        set executionContext(context) {
            this._executionContext = context;
        }
    }

    PlanScenario.prototype.relations = [
        {
            type: Backbone.HasMany,
            key: "scenarioPathSteps",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "planScenarioSPS",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenarioRL",
                type: Backbone.HasOne,
                includeInJSON: "id"
            }
        },
    ];

    return PlanScenario;
})();

var ScenarioPathStep = (() => {
    class ScenarioPathStep extends Backbone.RelationalModel {
        constructor(attributes, options) {
            super(attributes, options);
            this.defaults = {
                phase: null,
                alternative: null,
                startPeriod: 0,
                noPeriods: null,
            };
            this._nextStep = new Backbone.Collection();
            this._inputDatasets = new Backbone.Collection();
            this._scenarioDatasets = new Backbone.Collection();
            this._whatIfConfig = new Backbone.Collection();
        }

        get nextStep() {
            return this._nextStep;
        }

        set nextStep(step) {
            this._nextStep = step;
        }

        get inputDatasets() {
            return this._inputDatasets;
        }

        set inputDatasets(datasets) {
            this._inputDatasets = datasets;
        }

        get scenarioDatasets() {
            return this._scenarioDatasets;
        }

        set scenarioDatasets(datasets) {
            this._scenarioDatasets = datasets;
        }

        get whatIfConfig() {
            return this._whatIfConfig;
        }

        set whatIfConfig(config) {
            this._whatIfConfig = config;
        }
    }

    ScenarioPathStep.prototype.relations = [
        {
            type: Backbone.HasMany,
            key: "nextStep",
            relatedModel: "ScenarioPathStep",
            reverseRelation: {
                key: "previousStep",
                includeInJSON: "id",
                type: Backbone.HasOne
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
                includeInJSON:"id"
            }
        },
    ];

    return ScenarioPathStep;
})();

var PeriodDataset = (() => {
    class PeriodDataset extends Backbone.RelationalModel {
        constructor(attributes, options) {
            super(attributes, options);
            this.defaults = {
                period: 0,
                data: null,
                type: null,
            };
            this._nextDataset = new Backbone.Collection();
        }

        get nextDataset() {
            return this._nextDataset;
        }

        set nextDataset(dataset) {
            this._nextDataset = dataset;
        }
    }

    PeriodDataset.prototype.relations = [
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
    ];

    return PeriodDataset;
})();

var ExecutionContext = (() => {
    class ExecutionContext extends Backbone.RelationalModel {
        constructor(attributes, options) {
            super(attributes, options);
            this.defaults = {
                planId: null,
                data: null,
            };
        }
    }

    return ExecutionContext;
})();

var WhatIfConfig = (() => {
    class WhatIfConfig extends Backbone.RelationalModel {
        constructor(attributes, options) {
            super(attributes, options);
            this.defaults = {
                valueId: null,
                valueInstanceId: null,
            };
        }
    }

    return WhatIfConfig;
})();

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

periodDataset1.set("type", ScenarioDataType.plan);
periodDataset2.set("type", ScenarioDataType.actual);

const scenarioPathStep1 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 1",
    startPeriod: 1,
    noPeriods: 5,
});

const scenarioPathStep2 = new ScenarioPathStep({
    phase: GUID(),
    alternative: "Alternative 2",
    startPeriod: 6,
    noPeriods: 3,
});

// Add relations
planScenario.set("executionContext", executionContext);
// planScenario.setExecutionContext(executionContext)
scenarioPathStep1.get("inputDatasets").add(periodDataset1);
scenarioPathStep1.get("scenarioDatasets").add(periodDataset2);
scenarioPathStep1.get("whatIfConfig").add(whatIfConfig);
scenarioPathStep1.get("whatIfConfig").add(whatIfConfig2);
planScenario.get("scenarioPathSteps").add([scenarioPathStep1, scenarioPathStep2]);

// Log instances
console.log("Plan Scenario:", planScenario.toJSON());
console.log("Scenario Path Steps:");
planScenario.get("scenarioPathSteps").each(step => console.log(step.toJSON()));
console.log("Execution Context:\n", executionContext.toJSON());
console.log("Period Datasets:\n", periodDataset1.toJSON(), periodDataset2.toJSON());
console.log("WhatIfConfig:\n",whatIfConfig.toJSON());
console.log(whatIfConfig2.toJSON());
