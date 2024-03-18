import WhatIfConfigMixin from './WhatIfConfigMixin.js';
import { customExtends } from './utils.js';
export const WhatIfConfig = Backbone.RelationalModel.extend(customExtends({
    relations: WhatIfConfigMixin.prototype.relations(),
    initialize(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}));

WhatIfConfig.abstract = true;
export default WhatIfConfig;