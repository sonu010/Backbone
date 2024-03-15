import GUID from './GUID.js';

class PlanScenarioMixin {
    constructor() {
        this.defaults = {
            id: null,
            plan: null,
            startTime: null,
        };

        this.initialize();
    }

    initialize() {
        this.set("id", GUID());
    }

    getPlan() {
        return this.get("plan");
    }

    setPlan(plan) {
        this.set("plan", plan);
    }

    getStartTime() {
        return this.get("startTime");
    }

    setStartTime(startTime) {
        this.set("startTime", startTime);
    }

    relations() {
        return [
            {
                type: Backbone.HasMany,
                key: "scenarioPathSteps",
                relatedModel: "ScenarioPathStep",
                reverseRelation: {
                    key: "planScenarioScenarioPathStep",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
            {
                type: Backbone.HasOne,
                key: "executionContext",
                relatedModel: "ExecutionContext",
                reverseRelation: {
                    key: "planScenarioExecutionContext",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
        ];
    }
}

export default PlanScenarioMixin;
