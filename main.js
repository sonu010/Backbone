import PlanScenarioMixin from './PlanScenarioMixin.js';
import ScenarioPathStepMixin from './ScenarioPathStepMixin.js';
import PeriodDatasetMixin from './PeriodDatasetMixin.js';
import ExecutionContextMixin from './ExecutionContextMixin.js';
import WhatIfConfigMixin from './WhatIfConfigMixin.js';
import GUID from './GUID.js';
import ScenarioDataType from './ScenarioDataType.js';

// Define Backbone models
var PlanScenario = Backbone.RelationalModel.extend(PlanScenarioMixin);
var ExecutionContext = Backbone.RelationalModel.extend(ExecutionContextMixin);
var ScenarioPathStep = Backbone.RelationalModel.extend(ScenarioPathStepMixin);
var PeriodDataset = Backbone.RelationalModel.extend(PeriodDatasetMixin);
var WhatIfConfig = Backbone.RelationalModel.extend(WhatIfConfigMixin);

const planScenarioId = GUID();

// Create ExecutionContext
var executionContext = new ExecutionContext({
    planId: planScenarioId,
    data: {
        context1: "executionContextData1",
        context2: "executionContextData2",
    },

});

// Create WhatIfConfigs
var whatIfConfig = new WhatIfConfig({
    valueId: GUID(),
    valueInstanceId: GUID(),
});

var whatIfConfig2 = new WhatIfConfig({
    valueId: GUID(),
    valueInstanceId: GUID(),
});
var periodDataset1 = new PeriodDataset({
    period: 1,
    data: {
        value1: 100,
        value2: 200,
    },
    type: ScenarioDataType.plan,
    nextDataset:[periodDataset2]
});
var periodDataset2 = new PeriodDataset({
    period: 2,
    data: {
        value1: 150,
        value2: 250,
    },
    type: ScenarioDataType.actual,
});
var periodDataset3 = new PeriodDataset({
    period: 3,
    data: {
        value1: 200,
        value2: 300,
    },
    type: ScenarioDataType.perception,
});
var scenarioPathStep1 = new ScenarioPathStep({
    phase: "Phase 1",
    alternative: "Alternative 1",
    startPeriod: 0,
    noPeriods: 5,
    nextStep: [],
    previousStep: [],
    inputDatasets: [periodDataset1, periodDataset2, periodDataset3],
    scenarioDatasets: [],
    whatIfConfig: [whatIfConfig, whatIfConfig2],
});

var scenarioPathStep2 = new ScenarioPathStep({
    phase: "Phase 2",
    alternative: "Alternative 2",
    startPeriod: 6,
    noPeriods: 3,
    nextStep: [scenarioPathStep1],
    previousStep: [], 
    inputDatasets: [periodDataset1, periodDataset2],
    scenarioDatasets: [],
    whatIfConfig: [whatIfConfig],
});

var periodDataset4 = new PeriodDataset({
    period: 4,
    data: {
        value1: 300,
        value2: 400,
    },
    type: ScenarioDataType.plan,
});

scenarioPathStep1.set('nextStep', [scenarioPathStep2]);

// Create PlanScenario
var planScenario = new PlanScenario({
    id: planScenarioId,
    plan: "Plan 1",
    startTime: new Date(),
    scenarioPathSteps: [scenarioPathStep1, scenarioPathStep2],
    executionContext: executionContext,
});

console.log("Plan Scenario:", planScenario.toJSON());
console.log("Execution Context:", executionContext.toJSON());
console.log("Scenario Path Step 1:", scenarioPathStep1.toJSON());
console.log("Scenario Path Step 2:", scenarioPathStep2.toJSON());
console.log("WhatIfConfig 1:", whatIfConfig.toJSON());
console.log("WhatIfConfig 2:", whatIfConfig2.toJSON());
console.log("Period Dataset 1:", periodDataset1.toJSON());
console.log("Period Dataset 2:", periodDataset2.toJSON());
console.log("Period Dataset 3:", periodDataset3.toJSON());
console.log()