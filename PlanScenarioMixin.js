export class PlanScenarioMixin {
    defaults() {
        return {
            id: null,
            plan: null,
            startTime: null
        };
    }
    initialize() {
    }
    getPlan(){
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

    static getMixinRelations() {
        return [
            {
                type: Backbone.HasMany,
                key: "scenarioPathSteps",
                relatedModel: "ScenarioPathStep",
                reverseRelation: {
                    type: Backbone.HasOne,
                    key: "scenarioPathStepToPlanScenario",
                    relatedModel:"PlanScenario",
                    includeInJSON: "id"
                }
            },
            {
                type: Backbone.HasOne,
                key: "executionContext",
                relatedModel: "ExecutionContext",
                reverseRelation: {
                    key: "planScenarioExecutionContext",
                    type: Backbone.HasOne,
                    includeInJSON: "id"
                }
            }
        ];
    }

    static getCumulativeMixinRelations() {
        return this.getMixinRelations();
    }

    static getSuperTypes() {
        return [];
    }
}