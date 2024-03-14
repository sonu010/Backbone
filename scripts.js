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
		plan: null,
		startTime: null,
	},

	initialize: function () {
		this.set("id", GUID());
	},
	getPlan: function () {
		return this.get("plan");
	},

	setPlan: function (plan) {
		this.set("plan", plan);
	},

	getStartTime: function () {
		return this.get("startTime");
	},

	setStartTime: function (startTime) {
		this.set("startTime", startTime);
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
			},
		},
		{
			type: Backbone.HasOne,
			key: "executionContext",
			relatedModel: "ExecutionContext",
			reverseRelation: {
				key: "planScenarioRL",
				type: Backbone.HasOne,
				includeInJSON: "id",
			},
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
	getPhase: function () {
		return this.get("phase");
	},

	setPhase: function (phase) {
		this.set("phase", phase);
	},

	getAlternative: function () {
		return this.get("alternative");
	},

	setAlternative: function (alternative) {
		this.set("alternative", alternative);
	},

	getStartPeriod: function () {
		return this.get("startPeriod");
	},

	setStartPeriod: function (startPeriod) {
		this.set("startPeriod", startPeriod);
	},

	getNoPeriods: function () {
		return this.get("noPeriods");
	},

	setNoPeriods: function (noPeriods) {
		this.set("noPeriods", noPeriods);
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
			},
		},
		{
			type: Backbone.HasMany,
			key: "inputDatasets",
			relatedModel: "PeriodDataset",
			reverseRelation: {
				key: "inputPD",
				type: Backbone.HasOne,
				includeInJSON: "id",
			},
		},
		{
			type: Backbone.HasMany,
			key: "scenarioDatasets",
			relatedModel: "PeriodDataset",
			reverseRelation: {
				key: "scenarioPD",
				type: Backbone.HasOne,
				includeInJSON: "id",
			},
		},
		{
			type: Backbone.HasMany,
			key: "whatIfConfig",
			relatedModel: "WhatIfConfig",
			reverseRelation: {
				key: "ScenarioPathstepWIC",
				type: Backbone.HasOne,
				includeInJSON: "id",
			},
		},
	],
});

var PeriodDataset = Backbone.RelationalModel.extend({
	defaults: {
		period: 0,
		data: null,
		type: null,
	},
	getPeriod: function () {
		return this.get("period");
	},
	setPeriod: function (period) {
		this.set("period", period);
	},
	getData: function () {
		return this.get("data");
	},
	setData: function (data) {
		this.set("data", data);
	},
	getType: function () {
		return this.get("type");
	},
	setType: function (type) {
		this.set("type", type);
	},
	relations: [
		{
			type: Backbone.HasMany,
			key: "nextDataset",
			relatedModel: "PeriodDataset",
			reverseRelation: {
				key: "previousDataset",
				includeInJSON: "id",
				type: Backbone.HasOne,
			},
		},
	],
});

var ExecutionContext = Backbone.RelationalModel.extend({
	defaults: {
		planId: null,
		data: null,
	},
	getPlanId: function () {
		return this.get("planId");
	},
	setPlanId: function (planId) {
		this.set("planId", planId);
	},
	getData: function () {
		return this.get("data");
	},
	setData: function (data) {
		this.set("data", data);
	},
});

var WhatIfConfig = Backbone.RelationalModel.extend({
	defaults: {
		valueId: null,
		valueInstanceId: null,
	},
	getValueId: function () {
		return this.get("valueId");
	},
	setValueId: function (valueId) {
		this.set("valueId", valueId);
	},
	getValueInstanceId: function () {
		return this.get("valueInstanceId");
	},
	setValueInstanceId: function (valueInstanceId) {
		this.set("valueInstanceId", valueInstanceId);
	},
});

var executionContext = new ExecutionContext({
	planId: GUID(),
	data: {
		context1: "data1",
		context2: "data2",
	},
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
var planScenario = new PlanScenario({
	plan: "Plan 1",
	startTime: new Date(),
	scenarioPathSteps: [scenarioPathStep],
	executionContext: executionContext,
});
console.log("Plan Scenario:", planScenario.toJSON());
console.log("Execution Context:", executionContext.toJSON());
console.log("Scenario Path Step:", scenarioPathStep.toJSON());
console.log("WhatIfConfig 1:", whatIfConfig.toJSON());
console.log("WhatIfConfig 2:", whatIfConfig2.toJSON());
console.log("Period Dataset 1:", periodDataset1.toJSON());
console.log("Period Dataset 2:", periodDataset2.toJSON());
console.log("Period Dataset 3:", periodDataset3.toJSON());
