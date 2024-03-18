import { PlanScenarioMixin } from './PlanScenarioMixin.js';
import { customExtends } from './utils.js';
var PlanScenario = Backbone.RelationalModel.extend(customExtends({
    relations: PlanScenarioMixin.getMixinRelations(),
    initialize: function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    },
}, new PlanScenarioMixin()));
PlanScenario.abstract = true;
export default PlanScenario ;