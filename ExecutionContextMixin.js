let ExecutionContextMixin={
    defaults: {
		planId: null,
		data: null,
	},
	getPlanId: function () {
		return this.get("planId");
	},
	setPlanId: function (planId) {
		this.set("planId", planId);
	},
	getData: function () {
		return this.get("data");
	},
	setData: function (data) {
		this.set("data", data);
	},
}
export default ExecutionContextMixin;