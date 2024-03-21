import {PeriodDatasetMixin} from './PeriodDatasetMixin.js';
import { customExtends } from './utils.js';
let  PeriodDataset = Backbone.RelationalModel.extend(customExtends({
    relations: PeriodDatasetMixin.getMixinRelations(),
    initialize:function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}));
PeriodDataset.abstract = true;
console.log(Backbone.Relational.store.addModelScope("PeriodDataset",PeriodDataset));
Backbone.Relational.store.addModelScope("PeriodDataset");
// Backbone.Relational.store.addModelScope("ScenarioPathStep");
// Backbone.Relational.store.addModelScope("ExecutionContext");
// Backbone.Relational.store.addModelScope("WhatIfConfig");
// Backbone.Relational.store.addModelScope("PlanScenario")
// Backbone.Relational.store._modelScopes.push(PeriodDataset);
export default PeriodDataset;