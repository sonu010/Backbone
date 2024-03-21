import { ScenarioPathStepMixin } from './ScenarioPathStepMixin.js';
import { customExtends } from './utils.js';
let ScenarioPathStep = Backbone.RelationalModel.extend(customExtends({
    relations: ScenarioPathStepMixin.getMixinRelations(),
    initialize: function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}, new ScenarioPathStepMixin()));
ScenarioPathStep.abstract = true;
// Backbone.Relational.store.addModelScope("ScenarioPathStep",ScenarioPathStep);
Backbone.Relational.store.addModelScope("ScenarioPathStep");
Backbone.Relational.store.addModelScope("ExecutionContext");
Backbone.Relational.store.addModelScope("WhatIfConfig");
Backbone.Relational.store.addModelScope("PeriodDataset")
Backbone.Relational.store.addModelScope("PlanScenario")
export default ScenarioPathStep ;