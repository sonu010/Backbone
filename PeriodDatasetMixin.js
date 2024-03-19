export default class PeriodDatasetMixin {
    defaults() {
        return {
            period: null,
            data: null,
            type: null,
        };
    }
    initialize(){}
    getPeriod() {
        return this.get("period");
    }

    setPeriod(period) {
        this.set("period", period);
    }

    getData() {
        return this.get("data");
    }

    setData(data) {
        this.set("data", data);
    }

    getType() {
        return this.get("type");
    }

    setType(type) {
        this.set("type", type);
    }

    static getMixinRelations() {
        return [
            {
                type: Backbone.HasMany,
                key: "nextDataset",
                relatedModel: "PeriodDataset",
                reverseRelation: {
                    type: Backbone.HasOne,
                    key: "previousDataset",
                    includeInJSON: "id",
                },
            },
        ];
    }
    static getCumulativeMixinRelations() {
        return this.getMixinRelations();
    }

    static getSuperTypes() {
        return [];
    }
}
