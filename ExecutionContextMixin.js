class ExecutionContextMixin {
    constructor() {
        this.defaults = {
            planId: null,
            data: null,
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
}

export default ExecutionContextMixin;
