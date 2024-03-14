class WhatIfConfigMixin{
	constructor(){
		this.defaults={
			valueId: null,
			valueInstanceId:null,
		};
		this.initialize();
	}
	getValueId(){
		return this.get("valueId");
	}
	setValueId(){
		return this.set("valueId",valueId);
	}
	getValueInstanceId(){
		return this.get("valueInstanceId");
	}
	setValueInstanceId(){
		return this.set("valueInstanceId",valueInstanceId);
	}
}
export default WhatIfConfigMixin;