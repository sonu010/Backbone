export default class WhatIfConfigMixin {
    defaults() {
        return {
            valueId: null,
            valueInstanceId: null,
        };
    }

    getValueId() {
        return this.get("valueId");
    }

    setValueId(valueId) {
        return this.set("valueId", valueId);
    }

    getValueInstanceId() {
        return this.get("valueInstanceId");
    }

    setValueInstanceId(valueInstanceId) {
        return this.set("valueInstanceId", valueInstanceId);
    }
    relations(){
        
    }
}
