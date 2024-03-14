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


var planScenario = new PlanScenario({
	plan: "Plan 1",
	startTime: new Date(),
	scenarioPathSteps: [scenarioPathStep],
	executionContext: executionContext,
});
var executionContext = new ExecutionContext({
	planId: GUID(),
	data: {
		context1: "data1",
		context2: "data2",
	},
});
var scenarioPathStep = new ScenarioPathStep({
	phase: "Phase 1",
	alternative: "Alternative 1",
	startPeriod: 0,
	noPeriods: 5,
	nextStep: [],
	inputDatasets: [periodDataset1, periodDataset2, periodDataset3],
	scenarioDatasets: [],
	whatIfConfig: [whatIfConfig, whatIfConfig2],
});
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


console.log("Plan Scenario:", planScenario.toJSON());
console.log("Execution Context:", executionContext.toJSON());
console.log("Scenario Path Step:", scenarioPathStep.toJSON());
console.log("WhatIfConfig 1:", whatIfConfig.toJSON());
console.log("WhatIfConfig 2:", whatIfConfig2.toJSON());
console.log("Period Dataset 1:", periodDataset1.toJSON());
console.log("Period Dataset 2:", periodDataset2.toJSON());
console.log("Period Dataset 3:", periodDataset3.toJSON());
