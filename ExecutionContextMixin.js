export class ExecutionContextMixin {
    defaults() {
        return {
            planId: null,
            data: null
        };
    }

    getPlanId() {
        return this.get("planId");
    }

    setPlanId(planId) {
        this.set("planId", planId);
    }

    getData() {
        return this.get("data");
    }

    setData(data) {
        this.set("data", data);
    }

    static getMixinRelations() {
        return [];
    }

    static getCumulativeMixinRelations() {
        return this.getMixinRelations();
    }

    static getSuperTypes() {
        return [];
    }
}