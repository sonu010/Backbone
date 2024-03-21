import GUID from './guid.js';
import ScenarioDataType from './ScenarioDataType.js';
import ExecutionContext from './ExecutionContext.js'
import WhatIfConfig from './WhatIfConfig.js';
import PeriodDataset from './PeriodDataset.js'
import ScenarioPathStep from './ScenarioPathStep.js' 
import PlanScenario from './PlanScenario.js';

const planScenarioId = GUID();
Backbone.Relational.store.addModelScope("ScenarioPathStep");
Backbone.Relational.store.addModelScope("ExecutionContext");
Backbone.Relational.store.addModelScope("WhatIfConfig");
Backbone.Relational.store.addModelScope("PeriodDataset")
Backbone.Relational.store.addModelScope("PlanScenario")
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
var periodDataset2 = new PeriodDataset({
    period: 2,
    data: {
        value1: 150,
        value2: 250,
    },
    type: ScenarioDataType.actual,
});
var periodDataset1 = new PeriodDataset({
    period: 1,
    data: {
        value1: 100,
        value2: 200,
    },
    type: ScenarioDataType.plan,
    // nextDataset:[periodDataset2],
});

periodDataset1.set('nextDataset',periodDataset2)
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
    inputDatasets: [periodDataset1],
    whatIfConfig: [whatIfConfig, whatIfConfig2],
});

var scenarioPathStep2 = new ScenarioPathStep({
    phase: "Phase 2",
    alternative: "Alternative 2",
    startPeriod: 6,
    noPeriods: 3,
    // inputDatasets: [periodDataset2],
    // scenarioDatasets: [periodDataset4],
});
var scenarioPathStep3 = new ScenarioPathStep({
    phase: "Phase 3",
    alternative: "Alternative 3",
    startPeriod: 6,
    noPeriods: 3,
});

// scenarioPathStep1.set('nextStep', scenarioPathStep2);
// scenarioPathStep2.set('previousStep',scenarioPathStep3);
 // Create PlanScenario
var planScenario = new PlanScenario({
    id: planScenarioId,
    plan: "Plan 1",
    startTime: new Date(),
    scenarioPathSteps: [scenarioPathStep1],
    executionContext: executionContext,
});


//  Backbone.RelationalModel.Store.getObjectByName("planScenario")

console.log("Plan Scenario:\n", planScenario.toJSON());
console.log("Execution Context:\n", executionContext.toJSON());
console.log("Scenario Path Step 1:\n", scenarioPathStep1.toJSON());
console.log("Scenario Path Step 2:\n", scenarioPathStep2.toJSON());
console.log("ScenarioPathStep 3:\n",scenarioPathStep3.toJSON())
console.log("WhatIfConfig 1:\n", whatIfConfig.toJSON());
console.log("WhatIfConfig 2:\n", whatIfConfig2.toJSON());
console.log("Period Dataset 1:\n", periodDataset1.toJSON());
console.log("Period Dataset 2:\n", periodDataset2.toJSON());
console.log("Period Dataset 3:\n", periodDataset3.toJSON());
