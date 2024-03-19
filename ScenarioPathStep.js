import { ScenarioPathStepMixin } from './ScenarioPathStepMixin.js';
import { customExtends } from './utils.js';
var ScenarioPathStep = Backbone.RelationalModel.extend(customExtends({
    relations: ScenarioPathStepMixin.getMixinRelations(),
    initialize: function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}, new ScenarioPathStepMixin()));
ScenarioPathStep.abstract = false;
export default ScenarioPathStep ;