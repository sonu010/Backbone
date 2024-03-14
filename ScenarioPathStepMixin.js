let ScenarioPathStepMixin={
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
}

export default ScenarioPathStepMixin;