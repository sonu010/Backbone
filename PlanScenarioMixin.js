import GUID from "./GUID.js";
let PlanScenarioMixin = {
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
}

export default PlanScenarioMixin;