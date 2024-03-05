// Define Backbone models
var PlanScenario = Backbone.RelationalModel.extend({
  relations: [
    //relation with ScenarioPathStep
    {
      type: Backbone.HasMany,
      key: "scenarioPathSteps",
      relatedModel: "ScenarioPathStep",
      reverseRelation: {
        key: "planScenario",
      },
    },
    //relation with ExecutionContext
    {
      type:Backbone.HasOne,
      key:"executionContext",
      relatedModel:"ExecutionContext",
      reverseRelation:{
        key:"planScenario",
      }
    },
  ],
  defaults: {
    id: () => guid(),
    plan: () => guid(),
    startTime: Date(),
  },
});
// console.log("planScenario")

var ScenarioPathStep = Backbone.RelationalModel.extend({
  defaults: {
    phase: ()=>guid(),
    alternative: ()=>guid(),
    startPeriod: null,
    endPeriods: [],
  },
});

var ExecutionContext = Backbone.RelationalModel.extend({
  relations: [
    {
      type: Backbone.HasOne,
      key: "whatIfConfig",
      relatedModel: "planScenario",
      reverseRelation: {
        key: "executionContext",
      },
    },
  ],
  defaults: {
    planId:()=>guid(),
    data: null,
  },
});
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    "-" +
    s4() +
    s4() +
    s4()
  );
}


var whatIfConfig = Backbone.RelationalModel.extend({
  defaults: {
    valueId: null,
    valueInstanceId: null,
  },
});

var PeriodDataset = Backbone.RelationalModel.extend({
  defaults: {
    period: null,
    data: null,
    type: "ScenarioDataType",
  },
});

//Backbone collections
var ScenarioPathStepCollection = Backbone.Collection.extend({
  model: ScenarioPathStep,
});

var ScenarioDataType = Backbone.Collection.extend({
  model: PeriodDataset,
});

// Set up relationships
PlanScenario.setup();
ScenarioPathStep.setup();
ExecutionContext.setup();
whatIfConfig.setup();
PeriodDataset.setup();

var planScenario = new PlanScenario({
  id: 1,
  plan: "Plan A",
  startTime: Date("March 05 , 2024 11:13:00"),
});
console.log(planScenario);
var scenarioPathStep1 = new ScenarioPathStep({
  phase: () => guid(),
  alternative: () => guid(),
  startPeriod: 1,
  endPeriods: [2, 3],
});
console.log(scenarioPathStep1);
var scenarioPathStep2 = new ScenarioPathStep({
  phase: "GUID",
  alternative: "GUID",
  startPeriod: 4,
  endPeriods: [5, 6],
});

planScenario
  .get("scenarioPathSteps")
  .add([scenarioPathStep1, scenarioPathStep2]);

