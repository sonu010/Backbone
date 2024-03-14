let PeriodDatasetMixin={
    defaults: {
		period: 0,
		data: null,
		type: null,
	},
	getPeriod: function () {
		return this.get("period");
	},
	setPeriod: function (period) {
		this.set("period", period);
	},
	getData: function () {
		return this.get("data");
	},
	setData: function (data) {
		this.set("data", data);
	},
	getType: function () {
		return this.get("type");
	},
	setType: function (type) {
		this.set("type", type);
	},
	relations: [
		{
			type: Backbone.HasMany,
			key: "nextDataset",
			relatedModel: "PeriodDataset",
			reverseRelation: {
				key: "previousDataset",
				includeInJSON: "id",
				type: Backbone.HasOne,
			},
		},
	],
}
export default PeriodDatasetMixin;