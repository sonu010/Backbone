import {WhatIfConfigMixin} from './WhatIfConfigMixin.js';
import { customExtends } from './utils.js';
export let WhatIfConfig = Backbone.RelationalModel.extend(customExtends({
    relations: WhatIfConfigMixin.getMixinRelations(),
    initialize:function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
},new WhatIfConfigMixin()));
WhatIfConfig.abstract = false;
Backbone.Relational.store.addModelScope("ScenarioPathStep");
Backbone.Relational.store.addModelScope("ExecutionContext");
Backbone.Relational.store.addModelScope("WhatIfConfig");
Backbone.Relational.store.addModelScope("PeriodDataset")
Backbone.Relational.store.addModelScope("PlanScenario")
export default WhatIfConfig;