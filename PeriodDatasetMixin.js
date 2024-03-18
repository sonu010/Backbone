export default class PeriodDatasetMixin {
    defaults() {
        return {
            period: null,
            data: null,
            type: null,
        };
    }

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

    relations() {
        return [
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
        ];
    }
}
