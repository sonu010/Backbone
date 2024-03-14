let WhatIfConfigMixin={
    defaults: {
		valueId: null,
		valueInstanceId: null,
	},
	getValueId: function () {
		return this.get("valueId");
	},
	setValueId: function (valueId) {
		this.set("valueId", valueId);
	},
	getValueInstanceId: function () {
		return this.get("valueInstanceId");
	},
	setValueInstanceId: function (valueInstanceId) {
		this.set("valueInstanceId", valueInstanceId);
	},
}
export default WhatIfConfigMixin;