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
                    key: "planScenarioScenarioPathStep",
                    type: Backbone.HasOne,
                    includeInJSON: Backbone.Model.prototype.idAttribute
                }
            },
            {
                type: Backbone.HasOne,
                key: "executionContext",
                relatedModel: "ExecutionContext",
                reverseRelation: {
                    key: "planScenarioExecutionContext",
                    type: Backbone.HasOne,
                    includeInJSON: Backbone.Model.prototype.idAttribute
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