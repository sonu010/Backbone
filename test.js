var PlanScenario = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            id: null,
            Plan: null,
            startTime: null,
        };
    },
    relations: [
        // {
        //     type: Backbone.HasMany,
        //     key: "scenarioPathSteps",
        //     relatedModel: "ScenarioPathStep",
        //     reverseRelation: {
        //         key: "planScenarioSPS",
        //     }
        // },
        {
            type: Backbone.HasOne,
            key: "executionContext",
            relatedModel: "ExecutionContext",
            reverseRelation: {
                key: "planScenarioRL",
                type:Backbone.HasOne,
                includeInJSON:"id"
            }
        },
    ],
});

// ExecutionContext model
var ExecutionContext = Backbone.RelationalModel.extend({
    defaults: function () {
        return {
            planId: null,
            data: null,
        };
    },
    relations: [
        {
            type: Backbone.HasOne,
            key: "planScenario",
            relatedModel: "PlanScenario",
            reverseRelation: {
                key: "",
            }
        },
    ],
});
var GUID = function () {
    return Math.floor(Math.random() * 9000) + 1000;
};

// Create instances of PlanScenario
var planScenario = new PlanScenario({
    id: GUID(),
    Plan: "Sample Plan",
    startTime: new Date("2024-03-07T14:21:35+0530"),
});
// Create instances of ExecutionContext
var executionContext = new ExecutionContext({
    planId: GUID(),
    data: {
        context1: "data1",
        context2: "data2",
    }
});

console.log(planScenario.toJSON())
console.log(executionContext.toJSON())
