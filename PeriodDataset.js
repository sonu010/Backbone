import PeriodDatasetMixin from './PeriodDatasetMixin.js';
import { customExtends } from './utils.js';
var  PeriodDataset = Backbone.RelationalModel.extend(customExtends({
    relations: PeriodDatasetMixin.getMixinRelations(),
    initialize:function(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}));
PeriodDataset.abstract = false;
export {PeriodDataset};