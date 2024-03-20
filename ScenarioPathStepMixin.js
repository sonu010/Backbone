export class ScenarioPathStepMixin {
    defaults() {
        return {
            phase: null,
            alternative: "Base Alternative",
            startPeriod: null,
            noPeriods: null,
        };
    }

    getPhase() {
        return this.get("phase");
    }

    setPhase(phase) {
        this.set("phase", phase);
    }

    getAlternative() {
        return this.get("alternative");
    }

    setAlternative(alternative) {
        this.set("alternative", alternative);
    }

    getStartPeriod() {
        return this.get("startPeriod");
    }

    setStartPeriod(startPeriod) {
        this.set("startPeriod", startPeriod);
    }

    getNoPeriods() {
        return this.get("noPeriods");
    }

    setNoPeriods(noPeriods) {
        this.set("noPeriods", noPeriods);
    }

    static getMixinRelations() {
        return [
            {
                type: Backbone.HasMany,
                key: "nextStep",
                relatedModel: "ScenarioPathStep",
                reverseRelation: {
                    key: "previousStep",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
            {
                type: Backbone.HasMany,
                key: "inputDatasets",
                relatedModel: "PeriodDataset",
                reverseRelation: {
                    key: "inputPD",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
            {
                type: Backbone.HasMany,
                key: "scenarioDatasets",
                relatedModel: "PeriodDataset",
                reverseRelation: {
                    key: "scenarioPD",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
            {
                type: Backbone.HasMany,
                key: "whatIfConfig",
                relatedModel: "WhatIfConfig",
                reverseRelation: {
                    key: "ScenarioPathstepWIC",
                    type: Backbone.HasOne,
                    includeInJSON: "id",
                },
            },
        ];
    }
}