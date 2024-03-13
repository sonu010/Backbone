// PlanScenarioMixin.js
import * as Backbone from 'backbone'

const PlanScenarioMixin = {
    defaults: function() {
        return {
            id: null,
            Plan: null,
            startTime: null,
        };
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
            }
        },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenarioRL",
                type: Backbone.HasOne,
                includeInJSON: "id",
            }
        },
    ],
};

export default PlanScenarioMixin;
