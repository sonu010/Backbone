import { ExecutionContextMixin } from './ExecutionContextMixin.js';
import { customExtends } from './utils.js';
var ExecutionContext = Backbone.RelationalModel.extend(customExtends({
    relations: ExecutionContextMixin.getMixinRelations(),
    initialize: function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}, new ExecutionContextMixin()));

ExecutionContext.abstract = false;

export default  ExecutionContext ;