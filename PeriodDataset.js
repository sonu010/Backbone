import PeriodDatasetMixin from './PeriodDatasetMixin.js';
import { customExtends } from './utils.js';
var PeriodDataset = Backbone.RelationalModel.extend(customExtends({
    relations: PeriodDatasetMixin.prototype.relations(),
    initialize(attributes, options) {
        Backbone.Model.prototype.initialize.apply(this, arguments);
    }
}));
PeriodDataset.abstract = true;
export default PeriodDataset;