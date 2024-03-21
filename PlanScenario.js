import { PlanScenarioMixin } from './PlanScenarioMixin.js';
import { customExtends } from './utils.js';
import ExecutionContext from './ExecutionContext.js'
import WhatIfConfig from './WhatIfConfig.js';
import PeriodDataset from './PeriodDataset.js'
import ScenarioPathStep from './ScenarioPathStep.js' 
let PlanScenario = Backbone.RelationalModel.extend(customExtends({
    relations: PlanScenarioMixin.getMixinRelations(),
    initialize: function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    },
}, new PlanScenarioMixin()));
PlanScenario.abstract = true;
Backbone.Relational.store.addModelScope("PlanScenario");
Backbone.Relational.store.addModelScope("ScenarioPathStep");
Backbone.Relational.store.addModelScope("ExecutionContext");
Backbone.Relational.store.addModelScope("WhatIfConfig");
Backbone.Relational.store.addModelScope("PeriodDataset")
// Backbone.Relational.store.addModelScope("PlanScenario")
export default PlanScenario ;