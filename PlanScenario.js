import * as Backbone from 'backbone'
// import * as  from './js/bower_components/backbone-relational/backbone-relational.js';

import PlanScenarioMixin from './PlanScenarioMixin.js';
// import GUID from './guidMixin.js'
var PlanScenario = Backbone.RelationalModel.extend(PlanScenarioMixin);

export default PlanScenario;

const planScenario = new PlanScenario({
    id: 1234, // Assuming GUID is defined elsewhere
    Plan: "Sample Plan",
    startTime: new Date("2024-03-07T14:21:35+0530"),
});
console.log(planScenario.toJSON())