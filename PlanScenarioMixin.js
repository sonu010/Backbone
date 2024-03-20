export class PlanScenarioMixin {
    defaults() {
        return {
            id: null,
            plan: null,
            startTime: null
        };
    }
    initialize() {
    }
    relations(){
        
    }
    getPlan(){
        return this.get('plan');
    }

    setPlan(plan) {
        this.set('plan', plan);
    }

    getStartTime() {
        return this.get('startTime');
    }

    setStartTime(startTime) {
        this.set('startTime', startTime);
    }

    static getMixinRelations() {
        return _.union([
            {
                type: Backbone.HasMany,
                key: 'scenarioPathSteps',
                relatedModel: "ScenarioPathStep",
                reverseRelation: {
                    type: Backbone.HasOne,
                    key: 'scenarioPathStepToPlanScenario',
                    includeInJSON: 'id'
                }
            },
            {
                type: Backbone.HasOne,
                key: 'executionContext',
                relatedModel: 'ExecutionContext',
                addModelScope:true,
                reverseRelation: {
                    key: 'planScenarioExecutionContext',
                    type: Backbone.HasOne,
                    includeInJSON: 'id'
                }
            }
        ]);
    }

    static getCumulativeMixinRelations() {
        return this.getMixinRelations();
    }

    static getSuperTypes() {
        return [];
    }
//     getContainedModels(isDestroyed){
// 		var containedModels = [];
// 		var self = this;
// 		var typeMixinCls = DataManager.getDataManager().getModelTypeByTypeStr(self.get('type'),DataManager.getDataManager().get('currentVDMVersion'),true );
// 		if(!typeMixinCls){
// 			return containedModels;
// 		}		
// 		var relations = typeMixinCls.getCumulativeMixinRelations();
// 		_.each(relations,function(relation){
// 			var isPartOfRelation = self.isPartOfRelation(typeMixinCls,relation.key);
// 			if(isPartOfRelation){
// 				var relatedModel;
// 				if(isDestroyed){
// 					relatedModel = self.previousAttributes()[relation.key];	
// 				}else{
// 					relatedModel = self.get(relation.key);	
// 				}
				
// 				if(relatedModel){
// 					if(relatedModel instanceof Backbone.Model){
// 						if(relatedModel.getContainedModels){
// 							var subModels = relatedModel.getContainedModels();
// 							containedModels.push(relatedModel);
// 							containedModels = containedModels.concat(subModels);
// 						}else{
// 							containedModels.push(relatedModel);
// 						}
// 					}else{
// 						_.each(relatedModel.models,function(model){
// 							if(model.getContainedModels){
// 								var subModels = model.getContainedModels();
// 								containedModels.push(model);
// 								containedModels = containedModels.concat(subModels);
// 							}else{
// 								containedModels.push(model);	
// 							}
// 						});
// 					}
// 				}
// 			}
// 		});
// 		return containedModels;
//     };
}
