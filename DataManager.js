//define(["require","jquery","underscore","async","asyncsimple","knockout", "backbone", "Lawnchair", //"backbone-lawnchair","bootbox","appcommon/com/vbee/data/ChangeSet","appcommon/com/vbee/data/ChangeObject","appcommon/com/vbee/data/Loc//aleManager","appcommon/com/vbee/rdf/RDFModel","backbone-relational","rdf_store","rdf_interface_api"],

import * as _ from 'underscore'
import * as Lawnchair from '../../../../libs/lawnchair/Lawnchair.js'
import * as fnon from 'fnon';
import { ApplicationInsights } from '@microsoft/applicationinsights-web'
//import * as  backboneLawnchair from 'backbonelawnchair'
import {ChangeSet} from './ChangeSet'
import {ChangeObject} from './ChangeObject'
import {RDFModel} from '../rdf/RDFModel'
import {asyncsimple} from '../../../../libs/asyncsimple/asyncsimple'
import * as async from 'async'
import * as ko from 'knockout'
import * as bootbox from '../../../../libs/bootbox/bootbox'
import {LogLevel} from "@azure/msal-common";
import {PublicClientApplication} from "@azure/msal-browser"
import { data } from 'jquery'
import { object } from 'underscore'
import { Queue } from '../utils/Queue.js';
var jsonata = require("jsonata");
var CURRENT_PLAN_VERSION = 1005;
var CURRENT_VDM_VERSION = 1005;
//var jsonata = require("jsonata");
 //   function (require, $, _, async, asyncsimple, ko, Backbone, Lawnchair, backboneLawnchair, bootbox, ChangeSet, ChangeObject, //LocaleManager, RDFModel) {
    const b2cPolicies={
		names: {
			signUpSignIn: process.env.b2cPolicies_signUpSignIn,
			editProfile: process.env.b2cPolicies_editProfile
		},
		authorities: {
			signUpSignIn: {
				authority: process.env.authorities_authorities_signUpSignIn,
			},
			editProfile: {
				authority: process.env.authorities_authorities_editProfile
			}
		},
		authorityDomain: process.env.authorityDomain
	}
	const apiConfig = {
		b2cScopes: [process.env.REACT_APP_apiConfig_b2cScopes],
		//webApi: "http://localhost:8080/vdmbee"
		webApi: process.env.REACT_APP_apiConfig_webApi
	}
	const msalConfig = {
		auth: {
		clientId: process.env.msalConfig_clientId, // This is the ONLY mandatory field; everything else is optional.
		authority: b2cPolicies.authorities.signUpSignIn.authority, // Choose sign-up/sign-in user-flow as your default.
		knownAuthorities: [b2cPolicies.authorityDomain], // You must identify your tenant's domain as a known authority.
		//redirectUri: "http://localhost:8090", // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".
		redirectUri: process.env.msalConfig_redirectUri, // You must register this URI on Azure Portal/App Registration. Defaults to "window.location.href".	
	},
		cache: {
		cacheLocation: "sessionStorage", // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO between tabs.
		storeAuthStateInCookie: false, // If you wish to store cache items in cookies as well as browser cache, set this to "true".
		},
		system: {
		loggerOptions: {
			loggerCallback: (level, message, containsPii) => {
				if (containsPii) {
					return;
				}
				switch (level) {
					case LogLevel.Error:
						console.error(message);
						return;
					case LogLevel.Info:
						//console.info(message);
						return;
					case LogLevel.Verbose:
						console.debug(message);
						return;
					case LogLevel.Warning:
						console.warn(message);
						return;
				}
			}
		}
		}
	}
	const loginRequest = {
		scopes: ["openid", ...apiConfig.b2cScopes],	
	}
	const tokenRequest = {
		scopes: [...apiConfig.b2cScopes],  // e.g. ["https://fabrikamb2c.onmicrosoft.com/helloapi/demo.read"]
		forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
	}
	function createToggleRouter(featureConfig){
		if(featureConfig == undefined){
			featureConfig = localStorage.getItem("featureConfig") != undefined ? JSON.parse(localStorage.getItem("featureConfig")) : {};
		}
		return {
		  setFeature(featureName,isEnabled){
			featureConfig[featureName] = isEnabled;
		  },
		  featureIsEnabled(featureName){
			return featureConfig[featureName];
		  },
		  getFeatures(){
			return featureConfig;
		  }
		};
	}
    var DataManager = Backbone.Model.extend({
        defaults: function () {
            this.SUPPRESS_LOGGING = 'suppressLogging';
            this.CURRENT_CHANGESET = 'currentChangeSet';
            this.CHANGED_OBJECTS = 'changedObjects';
            this.CHANGED_PARENT_OBJECTS = 'changedParentObjects';
            this.SUPPRESS_CHANGE_LOGGING = 'suppressChangeLogging';
			this.VMP_TRIAL = "f22183c9-62ff-43b3-a186-e2b913ba9623";
			this.VMP_EXPEDITE_PRIVATE = "054f39e5-6d19-45e6-be01-274397d58e28";
			this.VMP_TEMPLATE_USAGE = "c97b7614-1650-40f4-af0c-06479cae385c";
			this.VMP_BUSINESS_MODELING = "1bfc175e-f92a-11ed-be56-0242ac120002";
			this.VMP_PLAN_SLOT = "4f1dac38-f92a-11ed-be56-0242ac120002";
			this.VMP_BMC_SM = "b9ba779a-fae9-11ed-be56-0242ac120002";
			this.VMP_DISCOVER = "b9ba7ace-fae9-11ed-be56-0242ac120002";
			this.VMP_PROTOTYPE = "b9ba7cd6-fae9-11ed-be56-0242ac120002";
			this.VMP_ADOPT = "b9ba7ec0-fae9-11ed-be56-0242ac120002";
			this.VMP_CALC_PLAN_SCE = "b9ba80b4-fae9-11ed-be56-0242ac120002";
			this.VMP_CALC_ACTUALS_FORE= "b9ba8596-fae9-11ed-be56-0242ac120002";
			this.VMP_OPT_SCE= "b9ba8730-fae9-11ed-be56-0242ac120002";
			this.VMP_STORE_READ = "b9ba8866-fae9-11ed-be56-0242ac120002";
			this.VMP_ADMIN_PORTAL = "b9ba89a6-fae9-11ed-be56-0242ac120002";		
        	var ret = {
	            changedParentObjects:new Backbone.Collection(),
	            changedObjects:new Backbone.Collection(),
	            workspacesData:new Backbone.Collection(),
	            modelsToSave:new Backbone.Collection(),
	            suppressLogging: false,
	            suppressChangeLogging:false,
	            currentWorkspace:null,
	            currentWSData:null,
				artifactsDocuments:{},
				artifactsData:{},
	            planScenarios:{},
				workspaceLegal:{},
				workspaceData:{},
				workspaceGroups:{},
				canvasModules:{},
				workspaceAppliedChageSetDateData:{},
	            appNS:{},
				userList:{},
	            localeManager:null,
				products:[],
	            isActive:true,
	            currentPlan:null,
	            lastUsedPlan:null,
				//enterpriseEdition: (new Date().getTime() > 1627929000000) ? false : true,
				readMode: false,
				autoSave: true,
				autoSaveTimer: 4000,
				debugMode: false,	//set true for localhost
				prod: false,
				basicAuthMode: false,
				enterpriseEdition:false,
                appCache: {},
				vmpPyomoServer:"http://localhost:8080/vdmbee/solve",
				//vmpPyomoServer:"http://localhost:5000/api/v1/solve",
				msalConfig:msalConfig,
				lastSavedTime:new Date().getTime(),
				previousChangeSetIds: new Queue(50),
                //lastSession: {},
				currentPlanVersion : CURRENT_PLAN_VERSION,
				currentVDMVersion : CURRENT_VDM_VERSION,
				toggleRouter:createToggleRouter(),
				changeSetsUpdated: 0,
				maxChangeSetsUpdated: 10
                //maximumSessionTime: 1800000 //(60000sec = 1min),
            };
			if(ret.toggleRouter.featureIsEnabled("strategyPlanner2Enabled")){
				ret.currentPlanVersion = CURRENT_PLAN_VERSION + 1000;
				ret.currentVDMVersion = CURRENT_VDM_VERSION + 1000;
			}
			return ret;
        },
		getTokenRequest:function(){
			return tokenRequest;
		},
		authorize: function(callback){
			var dataManager = DataManager.getDataManager();
			const mSALObj = new PublicClientApplication(dataManager.get('msalConfig'));
			mSALObj.loginPopup(loginRequest)
			.then(response => {
				//console.log(response.account)
				dataManager.set('accessToken',response.idToken);
				dataManager.setAccount(response.account);
				
				window.showLoginOption();
				window.utils.stopSpinner('AuthSpinner');
				DataManager.getDataManager().set('offLineMode', false);
				$('#showLogout').show();
				window.showEndAgreement(function(){
					window.showOpeningPage();
					if(callback){
						callback(response);
					}
				});
			})
			.catch(error => {
				if(error && error.errorMessage && error.errorMessage != "User cancelled the flow."){
					bootbox.alert(error.errorMessage);		
				}		
				console.log(error);
				dataManager.set('accessToken',null);
				dataManager.set('email',null);
				dataManager.set('gapiId',null);
			});
			dataManager.set('mSALObj',mSALObj);
		},
		setApplicationInsights:function(){
			const appInsights = new ApplicationInsights({ config: {
			connectionString: 'InstrumentationKey=0b1a9ba7-d3aa-4aaa-8e3a-ed2a46a17e0d;IngestionEndpoint=https://westeurope-5.in.applicationinsights.azure.com/;LiveEndpoint=https://westeurope.livediagnostics.monitor.azure.com/',
			name: 'VMPFrontend'
			/* ...Other Configuration Options... */
			} });
			appInsights.loadAppInsights();
			appInsights.trackPageView(); // Manually call trackPageView to establish the current user/session/pageview
		},
		setAccount:function(account){
			var dataManager = DataManager.getDataManager();
			dataManager.set('email',account.idTokenClaims.emails[0]);
			dataManager.set('gapiDisplayName',account.name);
			dataManager.set('gapiId',account.homeAccountId);
		},
		selectAccount:function() {
			/**
			 * See here for more info on account retrieval: 
			 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
			 */
			var dataManager = DataManager.getDataManager();
			var mSALObj = dataManager.get("mSALObj")
			if(!mSALObj){
				mSALObj = new PublicClientApplication(dataManager.get('msalConfig'));	
				dataManager.set('mSALObj',mSALObj);
			}
			const currentAccounts = dataManager.get("mSALObj").getAllAccounts();
			if (currentAccounts.length < 1) {
				return currentAccounts.length;
			} else if (currentAccounts.length > 1) {
		
				/**
				 * Due to the way MSAL caches account objects, the auth response from initiating a user-flow
				 * is cached as a new account, which results in more than one account in the cache. Here we make
				 * sure we are selecting the account with homeAccountId that contains the sign-up/sign-in user-flow, 
				 * as this is the default flow the user initially signed-in with.
				 */
				const accounts = currentAccounts.filter(account =>
					account.homeAccountId.toUpperCase().includes(b2cPolicies.names.signUpSignIn.toUpperCase())
					&&
					account.idTokenClaims.iss.toUpperCase().includes(b2cPolicies.authorityDomain.toUpperCase())
					&&
					account.idTokenClaims.aud === msalConfig.auth.clientId 
					);
		
				if (accounts.length > 1) {
					// localAccountId identifies the entity for which the token asserts information.
					if (accounts.every(account => account.localAccountId === accounts[0].localAccountId)) {
						// All accounts belong to the same user
						setAccount(accounts[0]);
					} else {
						// Multiple users detected. Logout all to be safe.
						signOut();
					};
				} else if (accounts.length === 1) {
					dataManager.setAccount(accounts[0]);
				}
				return accounts.length;
			} else if (currentAccounts.length === 1) {
				dataManager.setAccount(currentAccounts[0]);
				return currentAccounts.length;
			}
		},
		login: function(callback){
			function authenticateCallback(resp) {
				if (resp) {
					showNotification();
					//DataManager.getDataManager().showActiveUsers();
					//window.showSettings();
					window.utils.stopSpinner('AuthSpinner');
					DataManager.getDataManager().set('offLineMode', false);
					$('#showLogout').show();					
					if(window.appInsights){
						var email = DataManager.getDataManager().get('email');
						var telemetryInitializer = (envelope) => {
							envelope.tags["ai.cloud.role"] = email;
							envelope.tags["ai.cloud.roleInstance"] = email;
						}
						window.appInsights.addTelemetryInitializer(telemetryInitializer);
					}
					window.showEndAgreement(function(){
						window.showOpeningPage();
						if(callback){
							callback(resp);
						}
					});
				}
			}
			var dataManager = DataManager.getDataManager();
			window.getLocalStorage('access_token', function (accessToken) {
				utils.httpRequest("GET", dataManager.get('vmpServerHost') + '/version', function (online) {
					import('../filesystem/Workspace').then(({Workspace})=>{
						if (online) {
							if (accessToken && accessToken !== '') {
								/*if (!window.chrome) {
									Workspace.authenticate(authenticateCallback);
								} else {
									dataManager.set('useAzure', true);*/
									Workspace.authenticateAzureWithChrome(authenticateCallback);
								//}
							} else {
								dataManager.getLastAuthenticatedUser(function (emailOffline) {
									if(!emailOffline){
										$('#loadImage').hide();
										$("#userNameDP").hide();
									}else {
										$('#loadImage').show();
										dataManager.set('email', emailOffline)
										Workspace.getPhoto(null,"",function(){
										})
									}
									self.showRegistration(true);
									//window.showLoginOption(authenticateCallback);
									$('#userFullName').html('Unknown');
									$('#loginHere').remove();
									$('<a style="cursor: pointer;" id="loginHere">Sign In/Sign Up</a>').insertAfter('#userMailId')
									$('#loginHere').on('click',function(){
										self.showRegistration(true);
									})
								});
							}
						} else {
							var offlineMsg = dataManager.get('localeManager').get('offline');
							bootbox.alert(offlineMsg);
							//Workspace.offlineAuthentication();
						}
					})
				});
			});
		},
		getLastAuthenticatedUser : function(callback){
			DataManager.getDataManager().getWorkspaceDataWithId(window.plansKey,function(plansWSData){
				if(callback){
					callback(plansWSData.get('workspace').get('lastAuthenticatedUserEmail'));
				}
			});
		},
		logout:function(){
			var dataManager = DataManager.getDataManager();
			var msalConfig = dataManager.get('msalConfig');
			const logoutRequest = {
				postLogoutRedirectUri: msalConfig.auth.redirectUri,
				mainWindowRedirectUri: msalConfig.auth.redirectUri
			};
			var mSALObj = dataManager.get('mSALObj');
			mSALObj.logoutPopup(logoutRequest);
			$('#userFullName').html('Unknown');
		},
		loadDocumentsOfType: function(results,packageType,documentType,callback){
			var docs = new Backbone.Collection();
			var dataManager = this;
			var docType = documentType.substr(documentType.indexOf('/') + 1);
			docType = docType.replace('/','.');
			var docTypeObj = Backbone.Relational.store.getObjectByName(docType);
            async.each(results,function(result,modelLoaded){
            	if(docTypeObj){
	            	var cachedModel = docTypeObj.find({id:result.id});                
	       			if(cachedModel){
	       				docs.push(cachedModel);
	       				modelLoaded();
	       				return;
	       			}  
            	}
                var parentId = result.parent;
                if(!parentId){
       				modelLoaded();
       				return;                	
                }
                var parentAltId = parentId.substr(0,parentId.lastIndexOf('@')+1);
                var vdmStore = dataManager.getVDMStore(parentAltId);
				if(!result.version){
					result.version = dataManager.get('currentVDMVersion');
				}
                dataManager.fetchDocumentFromPackage(parentId,packageType,result.version,result.id,documentType,vdmStore,{
                        success:function(model){
                            docs.push(model);
                            modelLoaded();
                        },
                        error:function(error){
                            console.log(error);
                            modelLoaded();
                        }
                });            	
            },function(err){
            	callback(docs);
            });
        },
        /*getProductList: function (options) {
            if (window.utils.checkChrome()) {
                google.payments.inapp.getSkuDetails({
                    'parameters': { env: "prod" },
                    'success': options.success,
                    'failure': options.error,
                });
            }
		},*/
        getLicenses: function (options,navigate,getResponse) {
            /*if (window.utils.checkChrome()) {
                google.payments.inapp.getPurchases({
                    'parameters': { env: "prod" },
                    'success': options.success,
                    'failure': options.error
                });
            } else {*/
				if(window.utils.isVMPUser()){
					options.success(DataManager.getDataManager().get('products'));
					return;
				}
				window.removeLocalStorage("server_status");
                DataManager.getDataManager().get('vmpServerService').getAllPromise("/vdmbee/product/getpurchasedproducts").then(function(data) {
                    if (data.subscriptions) {
                        /*for (var i = 0; i < data.subscriptions.length; i++) {
                            data._embedded.product[i].state = 'ACTIVE';
                            var selfLink = data._embedded.product[i]._links.self.href;
                            data._embedded.product[i].sku = selfLink.substr(selfLink.lastIndexOf('/') + 1);
                        }*/
                        DataManager.getDataManager().set('products', data.subscriptions);
                        if (getResponse) {
                            options.success( data.subscriptions);
                        } else if (!getResponse && window.seleniumAuth) {
                            options.success( data.subscriptions);
						}else {
							options.success(data.subscriptions);
						}
						if(navigate && navigate != false) {
							jQuery("#legalEntitySelection").trigger("change");
						}
                    } else {
                        options.success([]);
                    }
                }).catch(function (response) {
					console.log(response);
				});
            //}
		},
		/*buyProduct : function(sku,options) {
		  google.payments.inapp.buy({
		    parameters: {'env': "prod"},
		    'sku': sku,
		    'success': options.success,
		    'failure': options.error
		  });
		},
		consumePurchase : function(sku,options) {
		  google.payments.inapp.consumePurchase({
		    parameters: {'env': "prod"},
		    'sku': sku,
		    'success': options.success,
		    'failure': options.error
		  });
		},*/
		onLicenseUpdate : function(response) {
			//console.log('updated licence in DM:' + JSON.stringify(response));
			var dataManager = DataManager.getDataManager();
		  	dataManager.licenses = response;
		  	var isEnterpriseEdition = dataManager.isEnterpriseEdition();
		  	dataManager.set('enterpriseEdition',isEnterpriseEdition);
		  	/*if(window.vdmModelView && window.vdmModelView.isEnterprise){
		  		window.vdmModelView.isEnterprise(isEnterpriseEdition);
		  	}*/
		},
		onLicenseUpdateFailed : function(response) {
		  console.log("onLicenseUpdateFailed", response);
		  var dataManager = DataManager.getDataManager();
		  //dataManager.set('enterpriseEdition', (new Date().getTime() > 1627929000000) ? false : true);
		  dataManager.set('enterpriseEdition',false);
		},
		isPurchased : function(sku,licence) {
			//return true;
			var dataManager = DataManager.getDataManager();
			if(!licence){
				licence = dataManager.licenses;
			}
			if(licence){
  				for (var i = 0; i < licence.length; i++) {
                        if (licence[i].productId.localeCompare(sku, undefined, { sensitivity: 'accent' }) == 0) {
  						return true;
  					}
  				}
			}
			if(window.utils.isVMPUser()){
				return true;
			}
			return false;
        },
		hasPlanSlots:function(licence){
			var dataManager = DataManager.getDataManager();
			if(!licence){
				licence = dataManager.licenses;
			}
			if(licence){
  				for (var i = 0; i < licence.length; i++) {
                    if (licence[i].productId.localeCompare(dataManager.VMP_PLAN_SLOT, undefined, { sensitivity: 'accent' }) == 0) {
  						if(licence[i].availableSlots > 0) return true;
  					}
  				}
			}
			return false;
		},
		countPlanSlots:function(licence){
			var dataManager = DataManager.getDataManager();
			if(!licence){
				licence = dataManager.licenses;
			}
			var planSlots = 0;
			if(licence){
  				for (var i = 0; i < licence.length; i++) {
                    if (licence[i].productId.localeCompare(dataManager.VMP_PLAN_SLOT, undefined, { sensitivity: 'accent' }) == 0) {
						planSlots = planSlots + licence[i].usedSlots;
  					}
  				}
			}
			return planSlots;
		},
		checkOwnedPackage:function(model,callback){
			var dataManager = DataManager.getDataManager();
			var isEnterprise = dataManager.isEnterpriseEdition();
			if (isEnterprise && !dataManager.get('readMode')) {
                var currentLegalEntity = dataManager.get("currentLegalEntity");
				var packArtDoc = dataManager.get("artifactsDocuments")[model.id];
                var packArtId = packArtDoc ? packArtDoc.artifactId :model.id ;
                var url = '/vdmbee/ip/package/'+packArtId+'?entityId='+currentLegalEntity.entityId;
                dataManager.get('vmpServerService').getAllPromise(url).then(function(resp) {
					if(!resp){//temp
						callback(true);
					} else {
						callback(resp);
					}
					
                });
            } else {
				callback(false);
			}
		},
		setServerUrl: function(){
			var dataManager = DataManager.getDataManager();
			/*if(dataManager.get('debugMode')){
				dataManager.set('vmpServerHost','http://localhost:8080');
				dataManager.set('vmpServerLocation','http://localhost:8080/vdmbee/');
				dataManager.set('vmpSnapshotHost','http://localhost:8085');
				dataManager.set('vmpSnapshotLocation','http://localhost:8085/vdmbee/');
			}else {//staging /prod server*/
				dataManager.set('vmpServerHost',process.env.vmpServerHost);
				dataManager.set('vmpServerLocation',process.env.vmpServerLocation);
				dataManager.set('vmpSnapshotHost',process.env.vmpSnapshotHost);
				dataManager.set('vmpSnapshotLocation',process.env.vmpSnapshotLocation);
				dataManager.set('reactAppUrl',process.env.REACT_APP_redirectUri);
			//}
		},
        getWindowsClientId: function () {  //vmp clientID
			if(DataManager.getDataManager().get('prod')){
				return "1be82f6f-c926-4b7e-b419-8cdffe2336d4";
			}else {
				return "15ba141a-558b-4184-916d-ee68d423a275";
			}
        },
		getWindowsSnapshotClientId: function () {//backend snapshot clientID
			if(DataManager.getDataManager().get('prod')){
				return "eb715e1e-0cfb-4268-b68f-25bf6ec02653";
			}else {
				return "f9bbc8ad-db7c-4312-9dbe-7ef689faad16";
			}
        },
		getWindowsTenant: function () {
			if(DataManager.getDataManager().get('prod')){
				return "vdmbeeprd.onmicrosoft.com";
			}else {
				return "vdmbeeaccounts.onmicrosoft.com";
			}
        },
		getWindowsGraphApiUri: function () { // vmp backend clientId
			if(DataManager.getDataManager().get('prod')){
				return "e2a77d92-6a29-4ce7-97a6-c80ad405aa47";
			}else {
				return "0d71aa27-2250-420a-bac9-24c9f1b663a3";
			}
        },
        checkUniversityEdition: function () {
			//var dataManager = DataManager.getDataManager();
			//return dataManager.isEnterpriseEdition();
			return false;
			/*if ((new Date().getTime() < 1627929000000)) {
                return true;
            }else {
				return false;
			}*/
		},
		navigateToCrmPage: function (pageName) {
			var dataManager = DataManager.getDataManager();
			var currentLegalEntity = dataManager.get("currentLegalEntity");	
			var id = currentLegalEntity?.entityId;
			var url =  dataManager.get('reactAppUrl');
			window.open(url+"dashboard/"+pageName, '_blank');
		},
        isEnterpriseEdition: function (licence) {
			//return true;
			var dataManager = DataManager.getDataManager();
			return dataManager.isPurchased(dataManager.VMP_TEMPLATE_USAGE,licence) || dataManager.isPurchased(dataManager.VMP_BUSINESS_MODELING,licence);
		},
        /*isCanvasPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_BMC_SM);
		},		
        isStrategyMapPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_BMC_SM);
		},*/
		isDiscoverPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_DISCOVER);
		},
		isPrototypePurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_PROTOTYPE);
		},
		isAdoptPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_ADOPT);
		},
		isPlanScenarioCalculationPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_CALC_PLAN_SCE);
		},
		isActualsForecastCalculationPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_CALC_ACTUALS_FORE);
		},
		isOptimizationCalculationPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_OPT_SCE);
		},
		isStoreReadPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_STORE_READ);
		},
		isAdminPortalPurchased: function () {
			var dataManager = DataManager.getDataManager();
			return dataManager.checkUniversityEdition() ? true: dataManager.isPurchased(dataManager.VMP_ADMIN_PORTAL);
		},
		/*getMaxWorkspace:function(){
			var dataManager = DataManager.getDataManager();
		    return dataManager.isEnterpriseEdition() ? true: false;
		},
		getMaxUnlicenssedAlternatives:function(){
			return 1;
		},
		getMaxUnlicenssedPhases:function(){
			return 2;
		},
		getMaxUnlicenssedPlans:function(){
			return 2;
		},
		getMaxUnlicenssedStrategyMaps:function(){
			return 2;
		},
		getMaxUnlicenssedValueStreamMaps: function () {
			return 2;
        },
        getMaxUnlicenssedProcessModels: function () {
            return 2;
        },
        getMaxUnlicenssedCaseModels: function () {
            return 2;
        },
		getMaxUnlicenssedCapabilityMaps: function () {
			return 1;
		},
		getMaxUnlicenssedCapabilityLibrary: function () {
			return 1;
		},
		getMaxUnlicenssedEcomaps: function () {
			return 2;
		},
		getMaxUnlicenssedCanvas: function () {
			return 2;
		},
		getMaxUnlicenssedDashboard: function () {
			return 2;
		},
		getMaxUnlicenssedReport: function () {
			return 2;
		},*/
        getMainScenario:function(beepPackage,alternativeId,callback){
        	var self = this;
        	if(!alternativeId || (alternativeId === window.plansKey && beepPackage.get('type') === 'vdml_ValueDeliveryModel')){
        		alternativeId = self.getRepositoryId(beepPackage.get('id'));
        	}
        	var getAlternativeScenario = function(alternative){
        		if(!alternative){
        			callback();
        			return;
        		}
        		if(beepPackage.get('type') === "transformation_Plan"){
        			callback(alternative.get('phaseObjectiveSet'));
        		}else{
        			var beepPackageParent = beepPackage.getNestedParent();
	        		alternative.getMainScenarioOfBeepPackageWithId(beepPackageParent.get('id'),beepPackageParent.get('version'),function(mainScenario){
	        			callback(mainScenario);
	        		});
        		}        		
        	};
        	var alternative = self.getAlternativeSync(alternativeId);
        	if(alternative){
        		getAlternativeScenario(alternative);
        	}else{
	        	self.getAlternative(alternativeId, getAlternativeScenario);
        	}
        },
        getAlternativeSync:function(alternativeId){
	    	return Backbone.Relational.store.getObjectByName('transformation.Alternative').find({id:alternativeId});
        },
        getAlternative:function(alternativeId,callback){
        	var dataManager = this;
        	var alt = Backbone.Relational.store.getObjectByName('transformation.Alternative').find({id:alternativeId});
    		if(alt){
    			callback(alt);
    		}else{
				var plansRDFModel = dataManager.getRDFModel(window.plansKey);
				plansRDFModel.getPlanPhaseOfAlternative(alternativeId,loadAlternativeDocument);
				function loadAlternativeDocument(planId,phaseId){
					dataManager.getPlansVDMLStore(function(lc){	
						dataManager.fetchDocumentFromPackage(planId,"appbo/transformation/Plan",dataManager.get('currentPlanVersion'),alternativeId,"appbo/transformation/Alternative",lc,{
							success:function(alternative){
								if(callback){
									callback(alternative);
								}
							},
							error:function(){
								if(callback){
									callback();
								}
							}
						});
					});
				}        	
    		}
        },
		showActiveUsers:function(callback){
			var activeUserCount = 1;
			var dataManager = DataManager.getDataManager();
			if(!dataManager.get('vmpServerService') || window.idle || window.checkingAct){
				if(callback){
					callback(activeUserCount);
				}
				return;
			}
			var lastAct = dataManager.get('lastActivity');
			var duration  = 30000;//30sec
			var currentEntityId;
			var currentLegalEntity = dataManager.get("currentLegalEntity");
			if (currentLegalEntity && currentLegalEntity.entityId) {
				currentEntityId = currentLegalEntity.entityId;
			}
			var userList = dataManager.get("userList")[currentEntityId];
			if(userList && Object.keys(userList).length == 1){
				duration  = 180000;//5min
			}
			if(lastAct && (new Date().getTime() - lastAct['key'] < duration)){
				if(callback){
					callback(activeUserCount);
				}
				return;
			}
			window.checkingAct = true;
			dataManager.get('vmpServerService').getAllPromise("/vdmbee/workspace/recentActivity").then(function (response) {
				window.checkingAct = false;
				$(".activeUsersList").remove();
				$("#showNextActiveUsers").remove();
				if(response && response.activity){
					var activeUsers = response.activity;
					$(".activeUsers").append("<span class=\"activeUsersList\"></span>");
					var myEmail = dataManager.get("email");
					var emailList = [myEmail];
					var breadcrumbActivity = dataManager.getBreadCrumbActivity();
					
					for(var key in activeUsers){
						var userEmail = activeUsers[key].email;
						var name = userList?userList[userEmail]:null;
						if(!name && window.vdmbee == currentEntityId){
							name = userEmail;
						}
						if(!emailList.includes(userEmail) && name){
							//var name = userEmail.substring(0,userEmail.lastIndexOf("@")) + key;
							if(breadcrumbActivity == "My Plans" || breadcrumbActivity == activeUsers[key].activity){
								var userDp = userEmail.charAt(0);
								$(".activeUsersList").append("<button class=\"dropdown-toggle\" type=\"button\" id='activeUserImage" + name + "'data-toggle=\"dropdown\" style=\"width: 35px; height: 35px; border-radius: 50%; background: #B2E4BD; color: #0B5D18\"><div activeUsers=" + activeUsers + " email=" + activeUsers[key].email + " title=" + activeUsers[key].email + " id='userNameDP" + name + "' >"+userDp+"</div></button>");
								// $("#userNameDP"+name).text(userDp);
							}//else if(breadcrumbActivity == activeUsers[key].activity){
							//	$(".activeUsersList").append("<button class=\"dropdown-toggle\" type=\"button\" id='activeUserImage" + name + "'data-toggle=\"dropdown\" style=\"width: 35px; height: 35px; border-radius: 50%; background: #B2E4BD; color: #0B5D18\"><div id='userNameDP" + name + "' <abbr title='" + userEmail + "'></abbr></div></button>");
							//}
							emailList.push(userEmail);
							activeUserCount++;
						} else if(userEmail == myEmail){
							var lastAct = {'value':activeUsers[key].activity,'key':new Date().getTime()};
							dataManager.set('lastActivity',lastAct);
						}
					}
					$(".activeUsers").append("<button id=\"showNextActiveUsers\">+</button>");
					var list = $(".activeUsersList button");
					var numToShow = 3;
					var button = $("#showNextActiveUsers");
					var numInList = list.length;
					list.hide();
					button.hide();
					if (numInList != 0 && numInList > numToShow) {
						button.show();
					}
					list.slice(0, numToShow).show();      
				}
				if(callback){
					callback(activeUserCount);
				}
			}).catch(function (response) {
				console.log(response);
				if(callback){
					callback(activeUserCount);
				}
			});
			/*$("#showNextActiveUsers").click(function(){
			});*/
		},
		loadPlan:function(planId,callback){
			var dataManager = this;
			dataManager.getPlansVDMLStore(function(lc){	
				dataManager.fetchDocumentFromPackage(planId,"appbo/transformation/Plan",dataManager.get('currentPlanVersion'),planId,"appbo/transformation/Plan",lc,{
					success:function(plan){
						if(callback){
							callback(plan);
						}
					},
					error:function(){
						if(callback){
							callback();
						}
					}
				});
			});
		}, 
        getRepositoryId:function(documentId){
        	var lI = documentId ? documentId.lastIndexOf('@') : '';
        	if(lI >= 0){
        		return documentId.substr(0,documentId.lastIndexOf('@') + 1);		
        	}else{
        		return window.plansKey;
        	}
        },   
        getAssignments:function(participant,packId,callback,skipDepReferences){
			var self = this;
			var participantId = participant.get('id');
			var alternativeId = packId.substr(0,packId.lastIndexOf('@') + 1);
			function loadAssignments(assObjs){
				self.loadDocumentsOfType(assObjs,'appbo/vdml/ValueDeliveryModel','appbo/vdml/Assignment',callback);
			}
			var alternative = self.getAlternativeSync(alternativeId);
			if(alternative){
				getAlternativeAssignments(alternative);
			}else{
				self.getAlternative(alternativeId,getAlternativeAssignments);		
			}
			function getAlternativeAssignments(alternative){
				alternative.getParticipantAssignments(participantId,[],loadAssignments);
			}
		}, 
       getReverseAssociationInstances:function(model,associationPredicate,refObjectType,namePropertyNS,callback,skipDepReferences){
        	var dataManager = this;
        	var modelId = model.get('id');
        	var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        	var refPath = 'appbo/' + refObjectType.replace('_','/');
        	function loadDocuments(refObjects){
        		dataManager.loadDocumentsOfType(refObjects,'appbo/vdml/ValueDeliveryModel',refPath,callback);
        	}
        	
			if(alternativeId === window.plansKey){
				if(!dataManager.get('currentPlan')){
					loadDocuments([]);
				}else {
					dataManager.get('currentPlan').getReverseAssociationInstances(modelId,associationPredicate,namePropertyNS,[],loadDocuments);
				}
        	}else{
				var alternative = dataManager.getAlternativeSync(alternativeId);
				if(alternative){
					getAltReverseAssociations(alternative)
				}else{
					dataManager.getAlternative(alternativeId,getAltReverseAssociations);		
				}
				function getAltReverseAssociations(alternative){
					if(!alternative){
						loadDocuments([]);
					}else{
						alternative.getReverseAssociationInstances(modelId,associationPredicate,namePropertyNS,[],loadDocuments);	
					}
				}
			}
        },
       getAllDocumentsCollectionOfType: function (pac, type, callback, skipDepReferences, queryExt, refferedTo, nameNS, includeCommonAlt, skipParents, getDesc){
			var dataManager = this;
        	var packId;
        	if(typeof pac === 'string'){
        		packId = pac;
        	}else{
        		packId = pac.get('id');	
        	}
        	 
        	var alternativeId = packId.substr(0,packId.lastIndexOf('@') + 1);
        	if(alternativeId.indexOf('-Common@') > 0){
                dataManager.get('currentPlan').getAllDocumentsCollectionOfType(pac, type, callback, skipDepReferences, queryExt, refferedTo, nameNS, skipParents, getDesc);
        	}else{
				var alternative = dataManager.getAlternativeSync(alternativeId);
				if(alternative){
                    alternative.getAllDocumentsCollectionOfType(type, [], callback, queryExt, refferedTo, nameNS, includeCommonAlt, skipParents, getDesc);	
				} else {
					dataManager.getAlternative(alternativeId,function(alternative){
                        alternative.getAllDocumentsCollectionOfType(type, [], callback, queryExt, refferedTo, nameNS, includeCommonAlt, skipParents, getDesc);	
					});		
				}        		
        	}        
       },
       getAllCommonDocumentsCollectionOfType: function (type, callback, queryExt, filterPackagesIds, nameNS, rdfModels, skipParents, getDesc) {
           DataManager.getDataManager().getWorkspaceDataWithId(DataManager.getDataManager().get('currentPlan').getCommonRepositoryId(), function (wsData) {
               wsData.get('rdfModel').getAllDocumentsCollectionOfType(type, function (modColl) {
                   if (callback) {
                       callback(modColl);
                   }
               }, queryExt, filterPackagesIds, nameNS, rdfModels, skipParents, getDesc);
           });
       },
        getReferencesToModels:function(models,callback,getParents,namePropertyNS){
        	var dataManager = this;
        	var alts = [];
        	async.each(models,function(modelId,modelHandleCallback){
        		var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        		var alternative = dataManager.getAlternativeSync(alternativeId);
        		if(alternative){
					alts = alts.concat(alternative.getAlternativesWhereICanBeReffered());
					modelHandleCallback();
        		}else{
					dataManager.getAlternative(alternativeId,function(alternative){
						alts = alts.concat(alternative.getAlternativesWhereICanBeReffered());
						modelHandleCallback();
					});         		
        		}
        	},function(err){
        		alts = _.uniq(alts);
				var ret = [];
				async.each(alts,function(alt,altHandlerCallback){
					function addResults(result){
						ret = ret.concat(result);
						altHandlerCallback();
					}
					var altRDFModel = this.getRDFModel(alt);
					altRDFModel.getReferencesToModels(models,addResults,getParents,namePropertyNS);
				},
				function(err){
					alts.length = 0;
					if(callback){
						callback(ret);
					}			
				});	        		
        	});
        },
        getReferencesToModelFiltedByParents:function(model,parents,callback,getParents,namePropertyNS){
        	var modelId = model.get('id');
        	var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        	var alternative = this.getAlternativeSync(alternativeId);
        	if(alternative){
        		alternative.getReferencesToModelFiltedByParents(model,parents,callback,getParents,namePropertyNS);	
        	}else{
				this.getAlternative(alternativeId,function(alternative){
					alternative.getReferencesToModelFiltedByParents(model,parents,callback,getParents,namePropertyNS);	
				});        
        	}
        },        
        getReferencesToModel:function(modelId,callback,getParents,namePropertyNS){
        	var dataManager = this;
        	var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        	if(alternativeId === window.plansKey){
        		dataManager.get('currentPlan').getReferencesToModel(modelId,callback,getParents,namePropertyNS);
        	}else{
        		var alternative = this.getAlternativeSync(alternativeId);
        		if(alternative){
        			alternative.getReferencesToModel(modelId,callback,getParents,namePropertyNS);	
        		}else{
					this.getAlternative(alternativeId,function(alternative){
						alternative.getReferencesToModel(modelId,callback,getParents,namePropertyNS);	
					});        
        		}
        	}
        },
        modelHasReferenceToPackage: function(model,packageId,callback){
        	var dataManager = this;
    		var modelId = model.get('id');
    		var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        	if(alternativeId === window.plansKey){
        		dataManager.get('currentPlan').modelHasReferenceToPackage(model,packageId,callback);
        	}else{
        		var alternative = this.getAlternativeSync(alternativeId);
        		if(alternative){
        			alternative.modelHasReferenceToPackage(model,packageId,callback);
        		}else{
					this.getAlternative(alternativeId,function(alternative){
						if(alternative) {
							alternative.modelHasReferenceToPackage(model,packageId,callback);	
						}else {
							console.log('alternative id not found');
							callback();
						}	
					});        
        		}
        	}        	
        },
        getReferencesToModel2:function(model,callback,getParents,namePropertyNS){
        	var dataManager = this;
    		var modelId = model.get('id');
    		var alternativeId = modelId.substr(0,modelId.lastIndexOf('@') + 1);
        	if(alternativeId === window.plansKey || modelId.indexOf('Common') != -1){
        		dataManager.get('currentPlan').getReferencesToModel2(model,callback,getParents,namePropertyNS);
        	}else{
        		var alternative = this.getAlternativeSync(alternativeId);
        		if(alternative){
        			alternative.getReferencesToModel2(model,callback,getParents,namePropertyNS);	
        		}else{
					this.getAlternative(alternativeId,function(alternative){
						alternative.getReferencesToModel2(model,callback,getParents,namePropertyNS);	
					});        
        		}
        	}
        },  
        getReferencesToModel2WithId:function(parentId,parentType,version,modelId,modelType,callback,getParents,namePropertyNS){
        	var dataManager = this;
            var parentAltId = parentId.substr(0,parentId.lastIndexOf('@')+1);
            var vdmStore = dataManager.getVDMStore(parentAltId);        	
			dataManager.fetchDocumentFromPackage(parentId,parentType,version,modelId,modelType,vdmStore,{
				success:function(model){
					dataManager.getReferencesToModel2(model, callback, getParents, namePropertyNS);
				},
				error:function(){
					if(callback){
						callback([]);
					}
				}
			});	        	
        },
        getMeasurementParents:function(measurementId,callback){
        	var alternativeId = measurementId.substr(0,measurementId.lastIndexOf('@') + 1);
        	if(measurementId.indexOf("Common") !== -1) {
        		alternativeId = this.get('currentWorkspace').get("id");
        	}
        	if(measurementId.indexOf(window.plansKey) !== -1) {
        		this.get('currentPlan').getMeasurementParents(measurementId,callback);
        	}else{
        		var alternative = this.getAlternativeSync(alternativeId);
        		if(alternative){
        			alternative.getMeasurementParents(measurementId,callback);	
        		}else{
					this.getAlternative(alternativeId,function(alternative){
						alternative.getMeasurementParents(measurementId,callback);	
					});        
        		}
        	}
        },
		saveAndSwitchWorkspace:function(newWorkspaceName, callback, planWorkspaceId, forceSave){
            var dataManager = this;
            if(planWorkspaceId != dataManager.get("currentWorkspaceId") || forceSave){
				var serverChangeSet = dataManager.get(dataManager.CURRENT_CHANGESET);
				//var changedParentObjects = this.get(this.CHANGED_PARENT_OBJECTS);
				DataManager.getDataManager().saveChangeSetToBackend(serverChangeSet,function(response){
					dataManager.set("currentWorkspaceName", newWorkspaceName);
					planWorkspaceId = planWorkspaceId ? planWorkspaceId : window.uuidGenerator()
					dataManager.set("currentWorkspaceId" , planWorkspaceId);
					callback(true);
				});
            }else{
                callback(false);
            }
        },
		getPlansByWorkspaceId(wsId){
			var plans = [];
			var dataManager = DataManager.getDataManager();
            var artifactsData = dataManager.get("artifactsData");
            if(artifactsData && wsId && artifactsData[wsId]){
				plans = artifactsData[wsId].filter(function(item) {
					if(item.startsWith("@BEEPPlans@")){
						return item;
					}					
				});
			}
			return plans;
		},
        savePlanArifactsData(currenArtifactId,WSId){
            var dataManager = DataManager.getDataManager();
            var artifactsData = dataManager.get("artifactsData");
            if(artifactsData && WSId){
                if(artifactsData[WSId]){
                    var artifactIds = artifactsData[WSId];
                    if(!artifactIds.includes(currenArtifactId)){
                        artifactIds.push(currenArtifactId);
                        artifactsData[WSId] = artifactIds;
                        dataManager.set("artifactsData", artifactsData);
                    }
                }else{
                    var artifactIds = [];
                    artifactIds.push(currenArtifactId);
                    artifactsData[WSId] = artifactIds;
                    dataManager.set("artifactsData", artifactsData);
                }
            }else if(WSId){
                var artifactIds = [];
                artifactIds.push(currenArtifactId);
                artifactsData[WSId] = artifactIds;
                dataManager.set("artifactsData", artifactIds);
            }
        },
        saveWorkspaceNamesData(WSId, WSName){
            var dataManager = DataManager.getDataManager();
            var workspaceNames = dataManager.get("workspaceNames");
            if(workspaceNames){
                if(!workspaceNames[WSId]){
                    workspaceNames[WSId] = WSName;
                    dataManager.set("workspaceNames",workspaceNames)
                }
            }else{
                var workspaceNamesData = {};
                workspaceNamesData[WSId] = WSName;
                dataManager.set("workspaceNames", workspaceNamesData);
            }
        },
        getWorkspaceName(workspaceId){
            var workspacesData = DataManager.getDataManager().get("workspaceNames");
            for(var key in workspacesData){
                if(key == workspaceId){
                    //DataManager.getDataManager().set("currentWorkspaceName", workspacesData[key]);
                    return workspacesData[key];
                }
            }
        },
		getWorkspaceIdByPlanId(currentArtifactId){
            var currentWorkspaceId = null;
            var artifactsJson = DataManager.getDataManager().get("artifactsData");
            for(var key in artifactsJson){
                var artifacts = artifactsJson[key];
                for(var j=0; j< artifacts.length; j++){
                    if(artifacts[j] == currentArtifactId){
                        currentWorkspaceId = key;
						break;
                    }
                }
				if(currentWorkspaceId){
					break;
				}
            }
			if(!currentWorkspaceId){
				console.log("WorkspaceId not found for plan:"+currentArtifactId);
			}
            return currentWorkspaceId;
        },
        /*setAndGetCurrentWorkspaceIdByPlanId(currentArtifactId){
            var currentWorkspaceId = null;
            var artifactsJson = DataManager.getDataManager().get("artifactsData");
            for(var key in artifactsJson){
                var artifacts = artifactsJson[key];
                for(var j=0; j< artifacts.length; j++){
                    if(artifacts[j] == currentArtifactId){
                        currentWorkspaceId = key;
                        if(currentWorkspaceId){
                            DataManager.getDataManager().getWorkspaceName(currentWorkspaceId);
                            DataManager.getDataManager().set("currentWorkspaceId", currentWorkspaceId);
                            return currentWorkspaceId;
                        }
                    }
                }
            }
            return currentWorkspaceId;
        },*/
        getWorkspaceDataWithId:function(workspaceId,callback){
        	var dataManager = this;
        	var retId = workspaceId;
        	if(!retId){
        		var currentWorkspace = dataManager.get('currentWorkspace');
        		if(!currentWorkspace){
        			if(callback){
        				callback(null);	
        			}
        			return;
        		}
        	}
        	var ret = dataManager.get('workspacesData').findWhere({'workspaceId':workspaceId});
        	if(ret){
        		if(callback){
        			callback(ret);
        		}
        		
        	}else{
				var workspaceStore = dataManager.get("workspaceStore");
				function getWorkspaceData(workspace){
					dataManager.getWorkspaceData(workspace,callback);
				};
				function callGetDefaultRepository(workspaceStore){
					window.getDefaultRepository(workspaceStore,getWorkspaceData,workspaceId,"",true);
				}
				if(!workspaceStore){
					this.createWorkspaceStore(callGetDefaultRepository);
				}else{
					callGetDefaultRepository(workspaceStore);
				}
				
        	}
        },
		createWorkspaceStore:function(createWsCallback){
			var dataManager = this;
			if(!dataManager.workspaceStore){
				new Lawnchair({name:"WorkspacesStore",adapter: DataManager.getLanwnchairAdapters()},function(){
					this.projectId = window.plansKey;
					dataManager.workspaceStore = this;
					dataManager.set('workspaceStore',this);
					createWsCallback(this);
				});
			}else{
				createWsCallback(dataManager.workspaceStore);
			}
		},   
		getRDFModel:function(wsId){
			var dataManager = this;
			if(!wsId){
				wsId = dataManager.get('currentWorkspace').get('id');
			}
			var wsData = dataManager.get('workspacesData').findWhere({workspaceId:wsId});
			
			return wsData ? wsData.get('rdfModel') : null;
		},
		getVDMStore:function(wsId){
			var dataManager = this;
			if(!wsId){
				wsId = dataManager.get('currentWorkspace').get('id');
			}
			var wsData = dataManager.get('workspacesData').findWhere({workspaceId:wsId});
			if(wsData){
				return wsData.get('vdmStore');	
			}
			return null;
		},
        getPlanInstance:function(planId,version,callback,docVer){
        	var dataManager = this;
			var planArtDoc = dataManager.get("artifactsDocuments")[planId];
			if(!docVer && planArtDoc){
				docVer = planArtDoc.documentVersion;
			}
        	dataManager.getPlansVDMLStore(getPlanInstanceWithLC);
        	function getPlanInstanceWithLC(lc){
				dataManager.fetchDocumentFromPackage(planId,"appbo/transformation/Plan",version,planId,"appbo/transformation/Plan",lc,{
					success:function(plan){
						if(callback){
							callback(plan);
						}
					},
					error:function(){
						if(callback){
							callback();
						}
					},
					documentVersion:docVer? docVer :0
				});	        	
        	}
        },
		upgradePackageVersion: function(packId,wsId,callback){
        	var dataManager = this;
			window.utils.showSpinnerText('Upgrading...');
        	dataManager.clearSaveInterval();
			dataManager.acquireSaveLock(function(){
				var upgradeUrl = "/vdmbee/workspace/switchplanversion/" + wsId+"/"+packId;
				dataManager.get('vmpServerService').postAllPromise(upgradeUrl, {}).then(function(response) {
					dataManager.releaseSaveLock();
					dataManager.clearSaveInterval();
					callback();
				});
			});
        },
		checkMarketPlacePackageVersion: function(productId,packId,callback){
        	var dataManager = this;
			var docVer;
			var planArtDoc = dataManager.get("artifactsDocuments")[packId];
			if(planArtDoc){
				docVer = planArtDoc.documentVersion;
			}
			var url = '/vdmbee/productVersion/'+productId;
			dataManager.get('vmpServerService').getAllPromise(url).then(function(prodVerList) {
				if(prodVerList){
					var newVersion = false;
					_.each(prodVerList,function(prodVer){
						//Redo this logic
						if(prodVer.lastSubmittedVersion > docVer){
							newVersion = true;
						}
					});
				}
				callback(newVersion);
			});
        },
		getPurchasedProductId: function(packId){
        	var dataManager = this;
			var subscribedList = dataManager.licenses;
			var artId;
			var packArtDoc = dataManager.get("artifactsDocuments")[packId];
			if(packArtDoc){
				artId = packArtDoc.artifactId;
			}
			if(subscribedList && artId){
  				for (var i = 0; i < subscribedList.length; i++) {
                        if (subscribedList[i].main_artifact_id && subscribedList[i].main_artifact_id.localeCompare(artId, undefined, { sensitivity: 'accent' }) == 0) {
  						return licence[i].productId;
  					}
  				}
			}
			return null;
		},
        getWorkspaceDataSync: function(workspace){
        	var dataManager = this;
        	return dataManager.get('workspacesData').findWhere({'workspaceId':workspace.get('id')});
        },
        getWorkspaceDataWithIdSync: function(workspaceId){
        	var dataManager = this;
        	return dataManager.get('workspacesData').findWhere({'workspaceId':workspaceId});
        },        
		
		getWorkspaceData: function(workspace,callback){
			var dataManager = this;
			if(!workspace){
				if(callback){
					callback();	
				}
				return;
			}
			var wsData = dataManager.get('workspacesData').findWhere({'workspaceId':workspace.get('id')});
			if(wsData){  // not completely initialized
				if(callback){
					callback(wsData);	
				}
				return;
			}
			wsData = new Backbone.Model({id:workspace.get('id'),workspaceId:workspace.get('id'),'workspace':workspace,currentChangeSet:null});
			dataManager.get('workspacesData').push(wsData);	
			createWorkspaceStore(setWSData);

			function createWorkspaceStore(createWsCallback){
				if(!dataManager.workspaceStore){
					new Lawnchair({name:"WorkspacesStore",adapter: DataManager.getLanwnchairAdapters()},function(){
						this.projectId = window.plansKey;
						dataManager.workspaceStore = this;
						dataManager.set('workspaceStore',this);
						createVDMStore(createWsCallback);
					});
				}else{
					createVDMStore(createWsCallback);
				}
			}
			function createVDMStore(createVDMCallback){
            	new Lawnchair({name:workspace.get('id') + "VDMLStore",adapter: DataManager.getLanwnchairAdapters()},function(){
            		this.projectId = workspace.get('id');
            		wsData.set('vdmStore',this);
            		createActionStore(createVDMCallback);
				});						
			}
			function createActionStore(createASCallback){
				new Lawnchair({name:workspace.get('id') + "ActionStore",adapter: DataManager.getLanwnchairAdapters()},function(){
					this.projectId = workspace.get('id');
            		wsData.set('actionStore',this);
					//ChangeSet.setDataManager(dataManager);
					//ChangeObject.setDataManager(dataManager);
					//TODO
				   	if(!workspace.get('lastChangeSet')){
						workspace.getAsync('lastChangeSet',{lawnchair:this});
					}
					wsData.set('lastChangeSet',workspace.get('lastChangeSet'));
					workspace.getAsync('lastUndoneChangeSet',{lawnchair:this});
					wsData.set('lastUndoneChangeSet',workspace.get('lastUndoneChangeSet'));	
            		
            		createRdfStore(createASCallback);							
				});
			}
			function createRdfStore(createRDFSCallback){
				if(!dataManager.rdfStore){
					new Lawnchair({name:"RDFStore",adapter: DataManager.getLanwnchairAdapters()},function(){
						this.projectId = window.plansKey;
						dataManager.rdfStore = this;
	            		dataManager.set('rdfStore',this);
	            		setRDFModel(createRDFSCallback);							
					});
				}else{
					setRDFModel(createRDFSCallback);
				}
			}
			function setRDFModel(setRDFModelCallback){
				function setRDFModel(rdfModel){
					wsData.set('rdfModel',rdfModel);
					rdfModel.reloadGraph(function(){
						rdfModel.schemaModel.reloadGraph(function(){
							/*if(!dataManager.saveTimer && dataManager.get('autoSave')){
								dataManager.saveTimer = setInterval(dataManager.callSaveData,dataManager.autoSaveTimer);
							}*/
							if(setRDFModelCallback){
								setRDFModelCallback();
							}
							//loadBeepPackages(rdfModel,setRDFModelCallback);
						});
					});
				};
				//RDFModel.getInstance(workspace.get('name'),dataManager,setRDFModel,workspace.get('resetRDF'));
				RDFModel.getInstance(workspace.get('id'),dataManager,wsData,setRDFModel);				
			}
			function setWSData(){
				if(callback){
					callback(wsData);							
				}
			}
			
		}, 
		loadBeepPackages: function(rdfModel, callback){
			var dataManager = this;
			var wsData = dataManager.getWorkspaceDataWithId(rdfModel.name,function(wsData){
				if(rdfModel.name !== window.plansKey){
					rdfModel.getPackages("",function(result){
						var count = result.length;
						function loadPackage(){
							count--;
							if(count>=0){
								dataManager.fetchDocumentFromPackage(result[count].id,"appbo/vdml/ValueDeliveryModel",dataManager.get('currentVDMVersion'),result[count].id,"appbo/vdml/ValueDeliveryModel",wsData.get('vdmStore'),{
									success:function(vdm){
										dataManager.get('initializedPackages').add({'id':result[count].id,'version':vdm.get('version')});	
										loadPackage();
									},
									error:function(){
										console.log('failde to load package');
										loadPackage();
									}
								});									
							}else{
								if(callback){
									callback();
								}
							}
						}
						loadPackage();
					});								
				}else{
					if(callback){
						callback();
					}
				}					
			});
		
		},	
		loadAllPlanValues:function(dataManager,newValue,callback){
			if(newValue){
				newValue.getAllAlternateScenarios(function(altScenarios){
					if(!dataManager.altScenarios){
						dataManager.altScenarios = {};
						dataManager.altScenarios[newValue.id] = {};
					}
					/*for (var key in altScenarios) {
						var changeScenarioName = true;
						if (altScenarios.hasOwnProperty(key)) {
							var alt = altScenarios[key];
							var altId = key;
							for (var key in alt) {
								if (alt.hasOwnProperty(key)) {
									var scenario = alt[key];
									var expectedScenarioName = scenario.getParent().getNamePath(altId);
									if (scenario.get('name') !== expectedScenarioName + ' Scenario') {
										scenario.set('name', expectedScenarioName + ' Scenario');
										scenario.set('description', expectedScenarioName + ' Scenario');
									} else {
										changeScenarioName = false;
										break;
									}
								}
							}
							if (!changeScenarioName) {
								break;
							}
						}
					}*/
					dataManager.altScenarios[newValue.get('id')] = altScenarios;
					callback();
				});
			}else {
				callback();
			}
        },
        onChangePlan: function (dataManager, newValue) {
            window.utils.showSpinnerPercentage(30);
            //window.setMathParser();
            //require(["appbo/beeppackage/BeepModule", "appbo/canvas/BMCanvasDiagramMixin"], function (BeepModule, BMCanvasDiagramMixin) {
			function loadPlanValues(){
				//import('../../../version1/bo/canvas/BMCanvasDiagramMixin').then(BMCanvasDiagramMixin => {	   
					function loadNewPlanValues() {
						dataManager.loadAllPlanValues(dataManager, newValue, function () {
							//if(window['spinnerPhaseExplorer'] && window['spinnerPhaseExplorer'].el){
								window.utils.showSpinnerPercentage(90);
								if(newValue){
									newValue.applyConcepts(function(){
										window.loadedPackages[newValue.get('id')] = true;
										console.log("loaded all Documents for "+newValue.get('id'));
									});
								}
								//window.utils.stopSpinner('spinnerPhaseExplorer');
							//}
						});
					}
					//BMCanvasDiagramMixin.BMCanvasDiagramMixin.loadMappingModules(function () {
						if (newValue && newValue.get('name') !== window.plansKey) {
							//newValue.applyModuleConcepts(newValue);//Canvas
							//newValue.applyConcepts();
							var lastUsedPlan = dataManager.get('lastUsedPlan');
							if (lastUsedPlan && newValue.id !== lastUsedPlan) {
								dataManager.unloadUnusedPlans(newValue, function () {
									dataManager.set('lastUsedPlan', newValue.id);
									loadNewPlanValues();
								});
							} else {
								dataManager.set('lastUsedPlan', newValue.id);
								loadNewPlanValues();
							}
						} else {
							dataManager.unloadUnusedPlans(null, function () {
								dataManager.get('localeManager').reset();
								loadNewPlanValues();
							});
						}
					//});
				//});
			}
			if(newValue){
				//$('#legalEntitySelection').prop('disabled', true);
				var packList = DataManager.getDataManager().get('planPackages')[newValue.id];
				if(window.loadedPackages[newValue.id] || !packList){
					loadPlanValues();
				} else {
					dataManager.loadAllPlanImages(newValue,function(){
						window.utils.showSpinnerPercentage(40);
						newValue.loadAllPackages(loadPlanValues);
					});
				}
			}else{
				//$('#legalEntitySelection').prop('disabled', false);
				loadPlanValues();
			}
        },
		loadAllPlanImages: function(plan,callback){
			var planId = plan.get('id');
			var dataManager = DataManager.getDataManager();
			var planWorkspaceId = dataManager.getWorkspaceIdByPlanId(planId);
			var legalId = dataManager.get("workspaceLegal")[planWorkspaceId];
			var docVersion = plan.get('documentVersion');
			var CodeContainer = Backbone.Relational.store.getObjectByName("beeppackage.CodeContainer");
			CodeContainer.fetchPlanCodeContainers(plan,function(imgPackages){
				if(imgPackages && imgPackages.length > 0) {
					dataManager.set('suppressLogging', true);
					dataManager.set('suppressChangeLogging', true);
					for(var i in imgPackages){
						var packType = imgPackages[i].type.replace('_', '.');
						var objType = Backbone.Relational.store.getObjectByName(packType);
						if(!objType.find({id:imgPackages[i].id})){
							var copyPck = new objType(imgPackages[i], { silent: true });
							copyPck.set("planId",planId);
							dataManager.get('initializedPackages').add({ 'id': copyPck.get('id'), 'version': parseInt(copyPck.get('version')), 'model': copyPck });
						}
					}
					dataManager.set('suppressLogging', false);
					dataManager.set('suppressChangeLogging', false);
					callback();
				} else {
					callback();
				}
			})

			/*var url = encodeURI("/vdmbee/workspace/"+planWorkspaceId+"/images/"+planId+"/"+docVersion+"/?entityId=" + legalId);
			dataManager.get('vmpServerService').getAllPromise(url).then(function(imgPackages) {
				if(imgPackages && imgPackages.length > 0){
					dataManager.set('suppressLogging', true);
					dataManager.set('suppressChangeLogging', true);
					for(var i in imgPackages){
						var packType = imgPackages[i].content.type.replace('_', '.');
						var objType = Backbone.Relational.store.getObjectByName(packType);
						if(!objType.find({id:imgPackages[i].id})){
							var copyPck = new objType(imgPackages[i].content, { silent: true });
							copyPck.set("planId",planId);
							dataManager.get('initializedPackages').add({ 'id': copyPck.get('id'), 'version': parseInt(copyPck.get('version')), 'model': copyPck });
						}
						//packages = packages.filter(item => item.beepReference !== copyPck.get('id'))
					}
					dataManager.set('suppressLogging', false);
					dataManager.set('suppressChangeLogging', false);
				}
				callback();
			});*/
		},
        initialize: function(attributes, options) {
        	var dataManager = this;
            Backbone.Model.prototype.initialize.apply(this, arguments);
            if (Backbone.Relational.store.dataManager === null || Backbone.Relational.store.dataManager === undefined) {
                Backbone.Relational.store.dataManager = this;
            }
			var appNs = this.get('appNS');
			appNs.com = {};
			appNs.com.vbee = {};
			appNs.com.vbee.data = {};
			appNs.com.vbee.data.DataManager = DataManager;
			appNs.com.vbee.filesystem = {};
			appNs.com.vbee.utils = {};
			appNs.com.vbee.utils.gdocs = {};
			appNs.com.vbee.filesystem.views = {};
			appNs.com.vbee.filesystem.views.properties = {};
			appNs.com.vbee.collaboration = {};
			appNs.com.vbee.collaboration.businessmodel = {};
			Backbone.Relational.store.addModelScope(this.get('appNS'));
			Backbone.Relational.store.addModelScope(this.getAppNs("version1"));

			appNs.com.vbee.data.ChangeSet = ChangeSet;
			appNs.com.vbee.data.ChangeObject = ChangeObject;
			ChangeSet.fetch = Backbone.Model.fetch;	// not getting initialized as they are loaded before Datamanager
			//ChangeObject.fetch = Backbone.Model.fetch;
			appNs.com.vbee.rdf = {};
			this.saveLock = new Backbone.RelationalModel();
            this.saveLock.setAvailablePermits(1);
            this.on('change:currentPlan', this.onChangePlan); 
			this.on('change:autoSave',function(dataManager, newValue){
				console.log("AutoSave:"+newValue);
				if(!newValue){
					$("#offlineIcon").show();
				} else if(!dataManager.get("offLineMode")){
					$("#offlineIcon").hide();
				}
			});
			this.on('change:offLineMode',function(dataManager, newValue){
				console.log("offline:"+newValue);
				if(newValue){
					$("#offlineIcon").show();
					$("#starIcon").hide();
				} else {
					$("#offlineIcon").hide();
                    $("#starIcon").show();
				}
			});
			/*this.on('change:workspaceAppliedChageSetDateData',function(dataManager, newValue){
				console.log("workspaceAppliedChageSetDateData:" + JSON.stringify(newValue));
			});*/
			/*this.on('change:suppressLogging',function(dataManager, newValue){
				debugger
				console.log("suppressLogging:" + JSON.stringify(newValue));
			});
			this.on('change:suppressChangeLogging',function(dataManager, newValue){
				debugger
				console.log("suppressChangeLogging:" + JSON.stringify(newValue));
			});*/
			this.on('change:readMode',function(dataManager, newValue){
				console.log("readMode:" + newValue);
			});
			this.on('change:currentWorkspaceId',function(dataManager, newValue){
				var wsName = dataManager.get("workspaceNames") ? dataManager.get("workspaceNames")[newValue] : null;
				console.log("currentWorkspace:" + newValue + " "+wsName);
				var legalId = dataManager.get("workspaceLegal")[newValue];
				var currentEntityId;
				var currentLegalEntity = dataManager.get("currentLegalEntity");
				if (currentLegalEntity && currentLegalEntity.entityId) {
					currentEntityId = currentLegalEntity.entityId;
				}
				if(legalId && currentEntityId != legalId){
					$('#legalEntitySelection option[value="'+currentEntityId+'"]').attr("selected",null);
					$('#legalEntitySelection option[value="'+legalId+'"]').attr("selected", "selected");
					//$("div.legalEntitySelection select").val(self.selectedOrg()).trigger("change");
				}
				if(wsName){//for new workspace to avoid readMode
					window.legalEntitySelectionChange();
				}
				var lastChangeSet = dataManager.get("workspaceData")[newValue];
				//if(lastChangeSet){
					dataManager.set("lastChangeSet",lastChangeSet);
				//}
				//console.log("suppressLogging:" + newValue);
			})     
			this.on('change:lastChangeSet',function(dataManager, newValue){
				console.log("lastChangeSet:" + newValue);
				var wsId = dataManager.get('currentWorkspaceId');
				dataManager.get("workspaceData")[wsId] = newValue;
			});
			this.on('change:currentLegalEntity',function(dataManager, leObj){
				//console.log("currentLegalEntity:" + newValue);
				var leId = leObj ? leObj.entityId:null;
				if(leId){
					var userList = dataManager.get('userList');
					if(!userList[leId] && leObj.roles.length > 0){
						var url = "/vdmbee/user/usersbylegalentity/" + leId;
						dataManager.get('vmpServerService').getAllPromise(url).then(function(userlist) {
							if(userlist){
								var userList = {};
								var userObjs = userlist._embedded.userResources;
								userObjs.map(function(userObj){
									userList[userObj.email] = userObj.name;
								});
								dataManager.get("userList")[leId] = userList;
							} else {
								console.log("failed to fetch"+leId);
							}
						});
					}
					
				}
				
				
				
			});
			
/*			this.get('workspacesData').on('add',function(){
				
			},this);*/
			/*function enableDisableSave(){
				var len = dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).length;
				var $saveLi = $('#navbarlist #save');
				if(len>0){
					$saveLi.removeClass('disabled');
				}else if(!$saveLi.hasClass('disabled')){
					$saveLi.addClass('disabled');
				}				
			}
			var changedParentObjects = dataManager.get(dataManager.CHANGED_PARENT_OBJECTS);
			changedParentObjects.on("reset",enableDisableSave );
			changedParentObjects.on("add",enableDisableSave );
			changedParentObjects.on("remove",enableDisableSave );*/
        },
		guidGenerator:function(workspace) {
	    	var projectID;
	        var guid = '-xxxx-4xxx-yxxx-xxxxxxxx'.replace(/[xy]/g, function(c) {
	            var r = Math.random() * 16 | 0,
	                v = c === 'x' ? r : (r & 0x3 | 0x8);
	            return v.toString(16);
	        });
	        if((workspace != null) && (typeof workspace === 'string') && (workspace !== '')){
	        	projectID = workspace;
	        }else{
		        var currentWorkspace = workspace;
		        if(!currentWorkspace){
		        	currentWorkspace = this.get('currentWorkspace');	
		        }
		        if(currentWorkspace){
		        	projectID = currentWorkspace.get('id');
		        }else{
		        	projectID = this.get('currentWorkSpaceKey');
		        }
	        }
	        return projectID + guid;
	    },
	    guidGeneratorByOwner:function(owner){
	    	var repId;
	    	if(owner){
	    		var ownerId = owner.get('id');
	    		repId = ownerId.substr(0,ownerId.lastIndexOf('@')+1);
	    	}
	    	return this.guidGenerator(repId);
	    },
        getAppNs:function(version){
        	/*if(!this[version]){
        		this[version] = {};
        	}
        	return this[version];*/
			if(!version){
				version = 1;
			}
        	var appNs = this.get('appNS');
        	if(!appNs[version]){
        		appNs[version] = {};
        	}
        	return appNs[version];
        },
        buildCommonNsPath:function(path){
        	var re=/[\._]/g;
        	var pathElements = path.split(re);
        	var appNs = this.get('appNS');
        	for(var i=0;i<pathElements.length;i++){
        		if(!appNs[pathElements[i]]){
        			appNs[pathElements[i]] = {};
        		}
        		appNs = appNs[pathElements[i]];
        	}
        	return appNs;
        },
        buildAppNsPath:function(path,version){
			if(version == undefined){				
				version = "version1"
			}
        	var re=/[\._]/g;
        	var pathElements = path.split(re);
        	var appNs = this.getAppNs(version);
        	for(var i=0;i<pathElements.length;i++){
        		if(!appNs[pathElements[i]]){
        			appNs[pathElements[i]] = {};
        		}
        		appNs = appNs[pathElements[i]];
        	}
        	return appNs;
        },
        getPlansVDMLStore:function(callback){
        	var dataManager = this;
        	dataManager.getWorkspaceDataWithId(window.plansKey,function(wsData){
        	    callback(wsData ? wsData.get('vdmStore') : null);
        	});
        	/*if(this.get('currentWorkspace').get('id') === window.plansKey){
        		callback(dataManager.get('vdmStore'));
        	}else{
				new Lawnchair({name:window.plansKey + "VDMLStore" ,projectId:window.plansKey ,adapter: DataManager.getLanwnchairAdapters()},function(){
					callback(this);
				}); 
        	}*/
        },
        setWorkspace: function(workspace,callback,skipSavingCurrent) {
        	var dataManager = this;
        	var currentWorkSpace = this.get('currentWorkspace');
        	var workspaceId = workspace.get('id');
        	/*if(!skipSavingCurrent && currentWorkSpace){
        		this.saveData({success:setWorkspaceInternal});
        	}else{*/
        		setWorkspaceInternal();
        	//}
			
        	function setWorkspaceInternal(){
        	    dataManager.getWorkspaceData(workspace, function (wsData) {
        	        if (!wsData) {
        	            if (callback) {
        	                callback();
        	            }
        	            return;
        	        }
		            dataManager.set('currentWorkspace', workspace);
		            dataManager.set('currentWSData',wsData);
		            dataManager.vdmStore = wsData.get('vdmStore');
		            dataManager.actionStore = wsData.get('actionStore');
					function initializeDataManager(){
						var iniPacks = dataManager.get('initializedPackages');
						if(!iniPacks){
							dataManager.set('initializedPackages',new Backbone.Collection);
						}else{
							//iniPacks.reset();		// why reset ?
						}
	
						workspace.lawnchair = dataManager.workspaceStore;
						dataManager.set('workspaceStore',dataManager.workspaceStore);
						dataManager.set('vdmStore',dataManager.vdmStore);
						Backbone.defaultLawnchair = dataManager.vdmStore;
						dataManager.set('actionStore',dataManager.actionStore);
						//dataManager.set('rdfStore',rdfStore);
						dataManager.set('rdfModel',wsData.get('rdfModel'));
						if(callback){
							callback();
						}
					}
					if(currentWorkSpace){
						//dataManager.cleanInstanceData();
						//dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).reset(); commenting to as to save the new alternative while closing.
					}
					initializeDataManager();
					if(window.visualSearch && window.visualSearch.searchBox){
						window.visualSearch.searchBox.searchEvent({});
					}					
				});
            };
        },
        unRegisterCodeContainer:function(codeContainer) {			
	        /*var modelsTosave = this.get('modelsToSave');
	        var changedParentObjects = this.get(this.CHANGED_PARENT_OBJECTS);
	        for(var i=0;i<changedParentObjects.length;i++){
	        	if(changedParentObjects.at(i).id === codeContainer.id){
	        		changedParentObjects.remove(changedParentObjects.at(i));
	        		break;
	        	}
	        }
			var changedObjects = this.get(this.CHANGED_OBJECTS);
			for(var i=0;i<changedObjects.length;i++){
	        	if(changedObjects.at(i).id === codeContainer.id){
	        		changedObjects.remove(changedObjects.at(i));
	        		break;
	        	}
	        }
	        for(var i=0;i<modelsTosave.length;i++){
	        	if(modelsTosave.at(i).id === codeContainer.id){
	        		modelsTosave.remove(modelsTosave.at(i));
	        		break;
	        	}
	        }
	        var initPackage = DataManager.getDataManager().get('initializedPackages').findWhere({ 'id': codeContainer.id });
            if(initPackage){
            	DataManager.getDataManager().get('initializedPackages').remove(initPackage);
            }
	        Backbone.Relational.store.unregister(codeContainer);*/
	    },
        cleanInstanceData:function(){
			var storeColls = Backbone.Relational.store._collections;
			for(var i=0;i<storeColls.length;i++){
				var instances = storeColls[i].models;
				if(instances.length > 0){
					if(instances[0].get('type') !== 'com_vbee_filesystem_Workspace' || instances[0].get('type') !== 'com_vbee_filesystem_PackageReference'){
						while(instances.length>0){
							Backbone.Relational.store.unregister(instances[0]);
						}
					}
				}
			} // not required as the guid contains the workspaceid appended.
			this.get(this.CHANGED_PARENT_OBJECTS).reset();
        },
        cleanInstanceDataOfWorkspaces:function(workspaces){
        	var dataManager = this;
			var storeColls = Backbone.Relational.store._collections;
			for(var i=0;i<storeColls.length;i++){
				storeColls[i].each(function(instance){
					var id = instance.get('id');
					if(id){
						var rep = dataManager.getRepositoryId(id);
						if(_.indexOf(workspaces,rep) >=0){
							Backbone.Relational.store.unregister(instance);
						}
					}
				});
			} // not required as the guid contains the workspaceid appended.
			this.get(this.CHANGED_PARENT_OBJECTS).reset();
			this.get(dataManager.CHANGED_OBJECTS).reset();
        },
        unloadUnusedPlans: function (newPlan, callback) {
        	callback();
           /* var rdfModelsKeys = Object.getOwnPropertyNames(RDFModel.rdfModels);
            var plansRDFModel = DataManager.getDataManager().getRDFModel(window.plansKey);
            var planAlternatives = [];
            if (newPlan) {
                planAlternatives = newPlan.getAlternatives();
            }
            async.eachSeries(rdfModelsKeys, function (rdfModelKey, handeledRdfModel) {
                var rdfModel = RDFModel.rdfModels[rdfModelKey];
                if (rdfModel !== plansRDFModel) {
                    for (var i = 0; i < planAlternatives.length; i++) {
                        if (rdfModelKey === planAlternatives[i]) {
                            handeledRdfModel();
                            return;
                        }
                    }
                    rdfModel.save();
                    delete RDFModel.rdfModels[rdfModelKey];
                    var wsData = DataManager.getDataManager().get('workspacesData').remove(rdfModelKey);
                    wsData.destroy();
                    handeledRdfModel();
                } else {
                    handeledRdfModel();
                }
            }, function () {
                callback();
            });*/
           
           
        	/*var dataManager = this;
        	var oldSpinnerText = $('#SpinnerText').html();
        	window.utils.showSpinnerText('Unloading previous Plan... ');
        	if(lastPlan === window.plansKey){
        		if(dataManager.get('lastUsedPlan')){
        			lastPlan === dataManager.get('lastUsedPlan');
        		}
        	}
			var oldActiveState = dataManager.get('isActive');
			dataManager.set('isActive',false);
			dataManager.saveData({persist:true,
				success:function(){
					function waitAndUnregister(){
						Backbone.skipPersistance = true;
		        		dataManager.getWorkspaceDataWithId(window.plansKey,function(wsData){
		        			wsData.get('rdfModel').getAllDocumentsCollectionOfType('transformation_Plan',function(plans){
					        	async.each(plans.models,function(planModel,handledPackage){
									var plan = Backbone.Relational.store.getObjectByName("transformation.Plan").find({id:planModel.id});
				        			if(plan && plan.id !== lastPlan && plan.id !== window.plansKey){
				        				plan.unregisterPlan(true,handledPackage);
				        			}else{
				        				handledPackage();	
				        			}
					        	},function(){
					        		plans.reset();
					        		if(oldSpinnerText === 'Loading Plan Data...'){
					        			window.utils.showSpinnerText("Fetching View Data... ");
					        		}else {
					        			window.utils.showSpinnerText(""+oldSpinnerText);
					        		}
					        		
					        		function callCallbackWithTimeout(){
						        		Backbone.skipPersistance = false;
						        		dataManager.set('isActive',oldActiveState);
						        		callback();
					        		}
					        		setTimeout(callCallbackWithTimeout);
					        	});        				
		        			},false,null,'vbc:cmof_EObject-name',null,true);
		        		});					
					}
					setTimeout(waitAndUnregister);
				},
				error:function(){
					callback();	
				}}
			);*/
			
        },
        getWorkspace: function() {
            return this.get('currentWorkspace');
        },
        nuke:function(wsData,callback){
	    	var self = DataManager.getDataManager();
	        if(wsData){
				var vdmstore = wsData.get('vdmStore');
				if(!vdmstore){
       				if(callback){
       					callback();
       				}					
					return;
				}
				var actionStore = wsData.get('actionStore');
				var workspace = wsData.get('workspace');
		       	vdmstore.nuke();
		       	self.get("rdfStore").exists(wsData.get('workspaceId'),function(exists){
		       		if(exists){
		       			self.get("rdfStore").remove(wsData.get('workspaceId'));
		       			clearWorkspace();
		       		} else {
		       			var rdfModel = wsData.get('rdfModel');
		       			if(rdfModel){
		       				rdfModel.clean(true,clearWorkspace);	
		       			}else{
		       				clearWorkspace();
		       			}
		       		}
		       		function clearWorkspace(){
				       	actionStore.nuke();
				       	delete RDFModel.rdfModels[wsData.get('id')];
				       	self.get('workspacesData').remove(wsData);
				       	wsData.destroy();
		       			workspace.destroy({silent:true});
	       				if(callback){
	       					callback();
	       				}
		       		}
		       	});
	        }else{
       			if(callback){
       				callback();
       			}	        	
	        }
        },
        checkoutProject: function(){

        },
        asyncEach: function(itemsArray,handleItem,callback){
            var count=0;
            var currentCount = 0;
            if(!itemsArray || itemsArray.length === 0){
            	if(callback){
            		callback();
            	}
            	return;
            }
            function updateCount(){
               	count++;
            }
            function cleanUp(){
            	if(callback){
            		callback();	
            	}
            }
            function checkCount(){
            	if(currentCount === count){
            		handleItem(itemsArray[currentCount],updateCount);
            		currentCount++;
            	}
            	if(count < itemsArray.length){
            		setTimeout(checkCount,0);
            	}else{
            		cleanUp();
            	}
            }
            checkCount();        	
        },
        saveData: function(saveOptions) {
            var dataManager = DataManager.getDataManager();
        	function invokeSaveData(){
				var workspaceChangeset = dataManager.get(dataManager.CURRENT_CHANGESET);
				var lastChange;
				var currentTime;
				if(workspaceChangeset){
					lastChange = dataManager.get(dataManager.CURRENT_CHANGESET).get("timestamp");
					currentTime = (new Date()).getTime();
				}
				
	        	//if(dataManager.saveLock.isLocked() || !workspaceChangeset || (currentTime - lastChange < 2000)){
				if(dataManager.saveLock.isLocked() || (currentTime - lastChange < DataManager.getDataManager().get('autoSaveTimer'))){	// during import workspaceChangeset is null
	        		if(saveOptions && saveOptions.success){
	        			setTimeout(invokeSaveData,500);	
	        		}
	        	}else{
                    setTimeout(function () {
                        if (dataManager.saveLock.isLocked() || $('#SpinnerDiv').attr('spinnerProgress') !== "false" || window.idle) {
                            if (saveOptions && saveOptions.success) {
                                setTimeout(invokeSaveData, 500);
                            }
                        } else {
                            dataManager.acquireLockAndUpdateValues(saveOptions);
                        }
	        		},100);	
	        	}	        		
        	}
        	invokeSaveData();
        },
        acquireLockAndUpdateValues: function(saveOptions){
            var dataManager = this;
            if (dataManager.get('errorOccured' === true)){
                if (saveOptions.error) {
                    saveOptions.error();
                    return;
                }
            }
        	dataManager.saveLock.acquire();
			//console.log("acquired lock");
			//dataManager.invokeValueUpdates(function(){
				try{
					dataManager.saveDataToLocalStorage(saveOptions);
				}catch(e){
					console.log("error:"+e);
					dataManager.releaseSaveLock();
				}
			//});
        },
        acquireSaveLock: function (callback) {
            var dataManager = DataManager.getDataManager();
            if (dataManager.saveLock.isLocked()) {
                setTimeout(dataManager.acquireSaveLock, 50,callback);
            } else {
                dataManager.saveLock.acquire();
				//console.log("acquired lock");
                callback();
            }
        },
        releaseSaveLock: function () {
			if (DataManager.getDataManager().saveLock.isLocked()) {
                DataManager.getDataManager().saveLock.release();
            }
			//console.log("released lock");
        },
    	unRegisterLastChangeset : function(wsData){
    		var oldLastChangeSet = wsData.get(this.CURRENT_CHANGESET);
    		if(oldLastChangeSet && typeof oldLastChangeSet !== 'string' && (oldLastChangeSet instanceof Backbone.Model || oldLastChangeSet instanceof Backbone.Collection) && !this.set('closingApp')){
                while (oldLastChangeSet) {
	        		var changes = oldLastChangeSet.changes;
	        		_.each(changes,function(change){
                         change=null;
                    });
                    oldLastChangeSet.changes = [];
	        		Backbone.Relational.store.unregister(oldLastChangeSet);   
	        		oldLastChangeSet = oldLastChangeSet.get('parent');
    			}
    		}
            wsData.set('lastChangeSet',null);
            wsData.set(this.CURRENT_CHANGESET,null);    		
    	},
		setAccessRights: function(currentLegalEntity){
			var dataManager = DataManager.getDataManager();
			var wsGroups = dataManager.get("workspaceGroups");
			var workspaceGroups = wsGroups?wsGroups[dataManager.get("currentWorkspaceId")]:null;
			var readMode = true;
			if(workspaceGroups){
				for(var i=0; i<workspaceGroups.length; i++){
					var gr = workspaceGroups[i];
					if(gr.LegalEntityId == currentLegalEntity){
						if(gr.UserAccess && gr.RoleType != "REVIEWER"){
							readMode = false;
							break;
						}
					}
				}
			}
			if(!dataManager.get("currentWorkspaceId") && currentLegalEntity){//for new customers without workspace
				readMode = false;
				var legalEntityDetails = dataManager.get("legalEntityDetails");
				dataManager.set("currentLegalEntity" , legalEntityDetails[currentLegalEntity]);
			}
			dataManager.set('readMode',readMode);
		},
		setProductLicence: function(legalEntityId){
			var dataManager = DataManager.getDataManager();
			var products = dataManager.get('products');
			var prodList = [];
			var vmpMember = window.utils.isVMPUser();
			if(!legalEntityId && dataManager.get("currentLegalEntity")){
				legalEntityId = dataManager.get("currentLegalEntity").entityId;
			}
			if(products && legalEntityId){
				for (var i = 0; i < products.length; i++){
					if (vmpMember) {
						prodList.push(products[i]);
					} else {
						if ((products[i].legalEntity === legalEntityId) || (legalEntityId == window.vdmbee)) {
							prodList.push(products[i]);
						}
					}
				}
			}
			if(prodList.length == 0){
				console.log("No Products for le: "+legalEntityId);
			}
			dataManager.onLicenseUpdate(prodList);
		},
		getGroupsFromBackend:function(callback,planWorkspaceId){
			var dataManager = DataManager.getDataManager();
			var planWorkspaceId = planWorkspaceId?planWorkspaceId:dataManager.get("currentWorkspaceId");
			var url = encodeURI("/vdmbee/workspace/group?workspaceId="+planWorkspaceId);
			if(!dataManager.get('vmpServerService') || !planWorkspaceId){
				callback();
				return;
			}
			dataManager.get('vmpServerService').getAllPromise(url).then(function(workspaceObjs) {
				if(workspaceObjs && workspaceObjs.length > 0){
					var workspaceGroupArr = dataManager.get("workspaceGroups")?dataManager.get("workspaceGroups"):{};
                    workspaceObjs.map(function(workspaceObj){
						var groupList = [];
						if(!workspaceGroupArr[workspaceObj.WorkspaceId]){
							workspaceGroupArr[workspaceObj.WorkspaceId] = {};
						} else {
							groupList = workspaceGroupArr[workspaceObj.WorkspaceId];
						}
						var userPresent = workspaceObj.UserAccess ? workspaceObj.UserAccess :false;
                        groupList.push({GroupId:workspaceObj.GroupId,UserAccess:userPresent,UserId:workspaceObj.UserId,UserName:workspaceObj.UserName,PermissionId:workspaceObj.PermissionId,GroupName:workspaceObj.GroupName,RoleType:workspaceObj.RoleType,LegalEntityId:workspaceObj.LegalEntityId});
						workspaceGroupArr[workspaceObj.WorkspaceId] = groupList;
                    });
					dataManager.set("workspaceGroups", workspaceGroupArr);
					if(callback){
						callback();
					}
				}else{
					if(callback){
						callback();
					}
				}
			});
		},
        getWorkspacesFromBackend:function(callback){
			var dataManager = DataManager.getDataManager();
			var isPublic = dataManager.get("public")?dataManager.get("public"):false;
			/*if(!dataManager.isEnterpriseEdition()){
				isPublic = true;
			}*/
			var url = encodeURI("/vdmbee/workspace"+"?isPublic="+isPublic);
			if(!dataManager.get('vmpServerService')){
				callback();
				return;
			}
			dataManager.get('vmpServerService').getAllPromise(url).then(function(workspaceObjs) {
				if(workspaceObjs && workspaceObjs.length > 0){
					var leList = [];
					var prd = dataManager.get("products");
					if(prd){
						for(var i=0; i < prd.length; i++){
							leList.push(prd[i].legalEntity);
						}
						leList = _.uniq(leList);
					}
					var newLegalEntityDetails = {};
					var legalEntityDetails = dataManager.get("legalEntityDetails");
					//var workspaceObjs = data._embedded.workspaceResources;
					var workspaceNameArr = {};
					var workspaceLegalArr = {};
					var currentWorkspaceId;
                    workspaceObjs.map(function(workspaceObj){
                        workspaceNameArr[workspaceObj.id] = workspaceObj.name;
						workspaceLegalArr[workspaceObj.id] = workspaceObj.legalEntityId;
						if(/*workspaceObj.name == dataManager.get("email") + "_Workspace" &&*/ leList.indexOf(workspaceObj.legalEntityId) != -1){
							currentWorkspaceId = workspaceObj.id;
							//dataManager.updateLastSession(currentWorkspaceId);
						}
						if(!legalEntityDetails[workspaceObj.legalEntityId]){
							newLegalEntityDetails[workspaceObj.legalEntityId] = {};
							newLegalEntityDetails[workspaceObj.legalEntityId].entityId = workspaceObj.legalEntityId;
							newLegalEntityDetails[workspaceObj.legalEntityId].name = workspaceObj.legalEntityName;
							newLegalEntityDetails[workspaceObj.legalEntityId].type = "CUSTOMER";
							newLegalEntityDetails[workspaceObj.legalEntityId].roles = [];

							legalEntityDetails[workspaceObj.legalEntityId] = newLegalEntityDetails[workspaceObj.legalEntityId];
						}
                    });
					if(Object.keys(newLegalEntityDetails).length > 0){
						window.fillLegalEntityNode(newLegalEntityDetails);
						dataManager.set("legalEntityDetails", legalEntityDetails);
					}
					dataManager.set("workspaceLegal", workspaceLegalArr);
                    dataManager.set("workspaceNames", workspaceNameArr);
					if(currentWorkspaceId && !dataManager.get("currentWorkspaceId")){
						window.utils.getOrFetchWsGroup(currentWorkspaceId,function(){
							dataManager.set("currentWorkspaceId", currentWorkspaceId);
                    		dataManager.set("currentWorkspaceName", workspaceNameArr[currentWorkspaceId]);
						});
					}
					if(callback){
						dataManager.applyWorkspaceById(currentWorkspaceId,function(){
							dataManager.getSubscribedProducts(callback);
                            //dataManager.getSubmittedProducts(callback);
                            //callback();
						});
					}
				}else{
					if(callback){
						callback();
					}
				}
			});
		},
		applyWorkspaceById:function(wsId,callback){
			var dataManager = DataManager.getDataManager();
			if(!wsId){
				callback();
				return;
			}
			dataManager.clearSaveInterval();
			dataManager.acquireSaveLock(function(){
				var applyurl = "/vdmbee/workspace/" + wsId;
				dataManager.get('vmpServerService').postAllPromise(applyurl, {}).then(function(response) {
					if(response){
						dataManager.get("workspaceAppliedChageSetDateData")[wsId] = response;
                        //dataManager.updateLastSession(wsId);
					} else {
						console.log("failed to apply"+wsId);
					}
					dataManager.releaseSaveLock();
					dataManager.clearSaveInterval();
					callback();
				});
			});
		},
		/*updateLastSession:function(wsId){
			var dataManager = DataManager.getDataManager();
			var lastSessionArr = new Date().getTime();
			var lastSessionData =  dataManager.get("lastSession");
			if(lastSessionData && lastSessionData[wsId]){
				lastSessionData[wsId] = lastSessionArr;
				dataManager.set("lastSession", lastSessionData);
			}else{
				lastSessionData[wsId] = lastSessionArr;
				dataManager.set("lastSession", lastSessionData);
			}
		},*/
		getPlansFromBackend:function(query,callback){
			var dataManager = DataManager.getDataManager();
			if(!dataManager.get('vmpServerService')){
				callback();
				return;
			}
			/*var currentLegalEntity = DataManager.getDataManager().get("currentLegalEntity");
			if (currentLegalEntity && currentLegalEntity.entityId) {
				params.currentEntityId = currentLegalEntity.entityId;
			}*/
			var isPublic = dataManager.get("public")?dataManager.get("public"):false;
			/*if(!dataManager.isEnterpriseEdition()){
				isPublic = true;
			}*/
			var url = encodeURI("/vdmbee/workspace/plan?query=" + JSON.stringify(query,false)+"&isPublic="+isPublic);// + "&entityId=" + params.currentEntityId);
			dataManager.get('vmpServerService').getAllPromise(url).then(function(artifactsObjs) {
				var workspaceData = {};
				var workspaceAppliedChageSetDateData = {};
				var artifactsData = {};
				var planPackages = {};
				var artifactsDocuments = {};
				var canvasData = {};
				for(var key in artifactsObjs){
					var isCanvas = false;
					var artifactIds = [];
					if(artifactsObjs[key].workspaceId && artifactsData[artifactsObjs[key].workspaceId] != null){
						var tempArtifactIds = [];
						tempArtifactIds = (artifactsData[artifactsObjs[key].workspaceId]);
						tempArtifactIds.push(artifactsObjs[key].documentId);
						artifactsData[artifactsObjs[key].workspaceId] = tempArtifactIds; 
					}else{
						artifactIds.push(artifactsObjs[key].documentId);
						artifactsData[artifactsObjs[key].workspaceId] = artifactIds;
					}					
					var content = artifactsObjs[key].planPackage ? artifactsObjs[key].planPackage.content: null;
					var planName =content ? content.name : artifactsObjs[key].id;
					isCanvas = content ? content.type === 'beeppackage_BeepModule' : false;
					if(isCanvas){
						var tempCanvasIds = [];
						if(!canvasData[artifactsObjs[key].workspaceId]) {
							canvasData[artifactsObjs[key].workspaceId] = {};
						} else {
							tempCanvasIds = canvasData[artifactsObjs[key].workspaceId];
						}
						tempCanvasIds.push({"artifactId":artifactsObjs[key].id,config:content,"name":planName,"documentId":artifactsObjs[key].documentId,"documentVersion":artifactsObjs[key].documentVersion ? artifactsObjs[key].documentVersion : 0});
						canvasData[artifactsObjs[key].workspaceId] = tempCanvasIds;
					}
					artifactsDocuments[artifactsObjs[key].documentId] = {"artifactId":artifactsObjs[key].id,"name":planName,"documentId":artifactsObjs[key].documentId,"documentVersion":artifactsObjs[key].documentVersion ? artifactsObjs[key].documentVersion : 0,"workspaceId":artifactsObjs[key].workspaceId,"lastAppliedChangeSetDate":artifactsObjs[key].lastAppliedChangeSetDate,"ref":artifactsObjs[key].ref};
				}
				var artifacts = artifactsObjs.filter(function (obj) { 
					if(!canvasData[obj.workspaceId]){
						return true;
					}
					if(canvasData[obj.workspaceId] && canvasData[obj.workspaceId].filter(e => e.artifactId === obj.id).length > 0){
						return false;
					} else {
						return true;
					}
				}).map(function(artifactObj){
					workspaceData[artifactObj.workspaceId] = artifactObj.lastChangeSet;
					workspaceAppliedChageSetDateData[artifactObj.workspaceId] = artifactObj.lastAppliedChangeSetDate;
					planPackages[artifactObj.documentId] = artifactObj.planPackages;
					if(artifactObj.planPackages) {
						_.each(artifactObj.planPackages,function(pack){
							artifactsDocuments[pack.documentId] = {"artifactId":pack.id,"documentId":pack.documentId,"documentVersion":pack.documentVersion ? pack.documentVersion : 0,"workspaceId":artifactObj.workspaceId,"ref":pack.ref};
						})	
					}			
					return artifactObj.planPackage.content;
				});
				dataManager.set("workspaceData",workspaceData);
				dataManager.set("artifactsData",artifactsData);
				dataManager.set("planPackages",planPackages);
				dataManager.set("artifactsDocuments",artifactsDocuments);
				dataManager.set("canvasModules",canvasData);
				if(!dataManager.get("lastChangeSet")){
					dataManager.set("workspaceAppliedChageSetDateData",workspaceAppliedChageSetDateData);
					var currentWorkspaceId = dataManager.get("currentWorkspaceId");
					var lastChangeSet = currentWorkspaceId ? workspaceData[currentWorkspaceId] : null;
					if(lastChangeSet){
						dataManager.set("lastChangeSet",lastChangeSet);
					}
				} else {
					//TODO multiuser changes on navigation to home page
				}
				callback(artifacts);
			});
		},
		unlinkPackage:function(packId,wsId,callback){
			var dataManager = DataManager.getDataManager();
			var packArtDoc = dataManager.get("artifactsDocuments")[packId];
			if(!packArtDoc){
				callback();
				return;
			}	
			var constUrl = "/vdmbee/workspace/unlinkpackagefromworkspace/"+wsId+"/"+packArtDoc.artifactId;
			dataManager.get('vmpServerService').postAllPromise(constUrl, {}).then(function(response) {
				callback();
			});
		},
        getSubmittedProducts: function(callback) {
            if (DataManager.getDataManager().get('submittedMarketplaceInfo')) {
                callback();
            }
            var currentLegalEntity = DataManager.getDataManager().get("currentLegalEntity");
            if (!currentLegalEntity) {
                callback();
                return;
            }
            var constUrl = "/vdmbee/submittedMarketplaceInfo/" + currentLegalEntity.entityId;
            DataManager.getDataManager().get('vmpServerService').getAllPromise(constUrl).then(function(data) {
                if (data && data._embedded && data._embedded.DetailedMarketPlace) {
                    DataManager.getDataManager().set('submittedMarketplaceInfo', data._embedded.DetailedMarketPlace);
                }
                callback();
            });
        },
		getSubscribedProducts:function(callback){
            if(DataManager.getDataManager().get('subscribed')){
                callback();
            }
            var currentLegalEntity = DataManager.getDataManager().get("currentLegalEntity");
			if(!currentLegalEntity){
				callback();
				return;
			}
			var constUrl = "/vdmbee/subscribedMarketplaceInfo/"+currentLegalEntity.entityId;
			DataManager.getDataManager().get('vmpServerService').getAllPromise(constUrl).then(function(data) {
				if (data && data._embedded && data._embedded.DetailedMarketPlace) {
					DataManager.getDataManager().set('subscribed', data._embedded.DetailedMarketPlace);
				}
				callback();
			});
		},
		saveChangeSetToBackend:function(changeSet,saveCallback){
			var dataManager = this;
			//dataManager.pullServerChanges(function(){
				$("#saveStatus").text("");
				if(!changeSet || changeSet.changes.length == 0 || dataManager.get("offLineMode") == true || !dataManager.get('autoSave')){
					if(saveCallback){
						saveCallback();
					}
					return;
				}
				//var currentChangeSet = dataManager.get(dataManager.CURRENT_CHANGESET);
				var params = {};
				params.changeSet = changeSet;
				params.changes = changeSet.changes;
				if(changeSet){
					changeSet.changes = [];
				}
				var serverService = dataManager.get('vmpServerService');
				
				if(serverService){
					// assuming the workspace of user
                    var workspaceId = dataManager.get("currentWorkspaceId");
					var currentLegalEntity = DataManager.getDataManager().get("currentLegalEntity");
					if (currentLegalEntity && currentLegalEntity.entityId) {
						params.currentEntityId = currentLegalEntity.entityId;
						var legalId = dataManager.get("workspaceLegal")[workspaceId];
						if(legalId && params.currentEntityId != legalId){
							params.currentEntityId = legalId;
						}
					}
					//dataManager.set('lastChangeSet',changeSet.id);
					/*if($("#saveStatus").text().length > 0){
						$("#saveStatus").text("Saving...");
					}*/
                    params.workspaceName = dataManager.get("currentWorkspaceName");
					serverService.postAllPromise("/vdmbee/workspace/" + workspaceId + "/changeset/?workspaceName="+ encodeURIComponent(params.workspaceName) +"&entityId=" + params.currentEntityId, JSON.stringify(params)).then(function (response) {
						var currentChangeSet = dataManager.get(dataManager.CURRENT_CHANGESET);
						$("#saveStatus").text("");
						if(currentChangeSet){
							dataManager.resetWorkspaceChangeset(true,response);
						}
						var changeSetsUpdated = dataManager.get("changeSetsUpdated") + 1;
						dataManager.set("changeSetsUpdated",changeSetsUpdated);
						if(saveCallback){
							saveCallback(response);
						}
					}).catch(function (response) {
						bootbox.alert("Failed Saving to Backend"+response.error);
						if(saveCallback){
							saveCallback(response);
						}
					});	
				}else{
					console.log("skipping posting changeset:" + JSON.stringify(params));
					if(saveCallback){
						saveCallback();
					}
				}
			//});
		},       
        saveDataToLocalStorage: function (saveOptions) {
        	var dataManager = this;
        	dataManager.deletedData = [];
        	dataManager.deletingData = [];
        	var modelsToSave = dataManager.get('modelsToSave')

            var changedParentObjects = this.get(this.CHANGED_PARENT_OBJECTS);
            var changedObjects = this.get(dataManager.CHANGED_OBJECTS);
            for(var i=0;i<changedObjects.length;i++){
            	changedObjects.at(i).set({s:1},{silent: true});
            }
			//console.log("debugger");
        	function removeNextChangeSets(){
				try {
					var workspacesData = dataManager.get('workspacesData');
					for(var i=0;i<workspacesData.length;i++){
						var wsData = workspacesData.at(i);
						var currentChangeSet = wsData.get(dataManager.CURRENT_CHANGESET);
						var lastChangeSet = wsData.get('lastChangeSet');
						if(lastChangeSet && lastChangeSet.getAsync){
							lastChangeSet.getAsync('nextChangeSets',{lawnchair:lastChangeSet.lawnchair});
							var nextChangeSets =  lastChangeSet.get('nextChangeSets');
							if(nextChangeSets.length > 1){
								//console.log("Removing parllel changeset");
								for(var j=0;j<nextChangeSets.length;j++){
									var parllelChangeSet = nextChangeSets.at(j);
									if(currentChangeSet !== parllelChangeSet){
										parllelChangeSet.removeAll();
									}
								}
								//console.log("Done removing parllel changeset");
							}
						}            			
					}
				}catch(err){
					console.log(err);
				}
        	}
        	function packageReferenceHasBeenUpdated(pack, depPack){
        		var wsData = dataManager.getWorkspaceDataWithIdSync(dataManager.getRepositoryId(pack.get('id')));
				var currentChangeSet = wsData?wsData.get(dataManager.CURRENT_CHANGESET):null;
				if(currentChangeSet){
					var changes = currentChangeSet.changes;
					for(var i=0;i<changes.length;i++){
						var changeObj = changes[i];
						var operationType = changeObj.get('operationType');
						if(operationType === 'update' || operationType === 'destroy'){
							var refParents = changeObj.refParents;
							if(refParents){
								for(var j=0;j<refParents.length;j++){
									var changeRelParent = refParents[j];
									if((changeObj.get('parent') === pack.id && changeRelParent === depPack.id)
										|| (changeObj.get('parent') === depPack.id && changeRelParent === pack.id)){
										return true;
									}							
								}
							}
						
						}
					}
				}
				return false;
        	}
        	function checkAndUpdatePackageDependencies(parents){
        		var changed = false;
        		var count = parents.length;
        		function checkDependenciesForPackage(){
        			count--;
        			if(count >=0){
        				var pack = parents[count];
        				var dependencies = pack.get('dependentPackage');
        				if( !dependencies || dependencies.length <= 0){
        					checkDependenciesForPackage();
        					return;
        				}
        				var depCount = dependencies.length;
        				var removeDependencies = [];
        				function checkReferencesToDependency(){
        					var foundDep = false;
        					depCount--;
        					if(depCount>=0){
        						var dependency = dependencies.at?dependencies.at(depCount):null;
        						if(dependency && dependency.get("type") != 'beeppackage_CodeContainer' && packageReferenceHasBeenUpdated(pack,dependency)){
		            				//var repId = dataManager.getRepositoryId(dependency.get('id'));
		            				dataManager.modelHasReferenceToPackage(dependency,pack.get('id'),function(foundDep){
	            						if(!foundDep){
	            							removeDependencies.push(dependency.get('id'));	
	            						}	            					
		            				});
        						}
/*	            				dataManager.getReferencesToModel2(dependency,function(refs){
	            						for(var i=0;i<refs.length;i++){
	            							if((refs[i].parent === pack.get('id')) && (refs[i].predicate !== 'beeppackage_BeepPackage-dependentPackage')){
	            								foundDep = true;
	            								break;
	            							}
	            						}
	            						if(!foundDep){
	            							removeDependencies.push(dependency.get('id'));	
	            						}
	            				},true,repId === window.plansKey ? 'vbc:cmof_EObject-name' :	null);*/
	            				checkReferencesToDependency();
        					}else{
    							for(var j=0;j<removeDependencies.length;j++){
    								dependencies.remove(removeDependencies[j]);
    							}
        						checkDependenciesForPackage();
        					}
        				}
        				checkReferencesToDependency();
        			}else{
        				if(changed){
        					dataManager.clearSaveInterval();
        					dataManager.releaseSaveLock();
							console.log("release lock");
        					dataManager.acquireLockAndUpdateValues();
        				}
        			}
        		}
				checkDependenciesForPackage();
        	}

			function updateChangeSetAndPost(parents,callback){
                if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
                	removeNextChangeSets();
            		var workspacesData = dataManager.get('workspacesData');
            		checkAndUpdatePackageDependencies(parents);

					for(var i=0;i<workspacesData.length;i++){
						var wsData = workspacesData.at(i);	                	
						var currentChangeSet = wsData.get(dataManager.CURRENT_CHANGESET);
						if(currentChangeSet && !currentChangeSet.lawnchair){
							currentChangeSet.lawnchair = wsData.get('actionStore');
						}
						/*currentChangeSet.save();		// TODO remove comment when we want logging
						var changes = currentChangeSet.changes;
						changes.each(function(change){
							delete chage.refParents
						});
						var parentChangeSet = currentChangeSet.get("parent");
						if(parentChangeSet){
							parentChangeSet.save();
						}*/
						//if(currentChangeSet && saveOptions && saveOptions.persist){
						if (currentChangeSet) {
							//var oldLastChangeSet = wsData.get('lastChangeSet');
							dataManager.unRegisterLastChangeset(wsData);
/*			                wsData.set('lastChangeSet',null);
							currentChangeSet.set('parent',null,{silent:true});	
							var workspace = wsData.get('workspace');
							workspace.set('lastChangeSet',currentChangeSet);
							if(!workspace.lawnchair){
								workspace.lawnchair = dataManager.get('workspaceStore');
							}
							workspace.save();
							wsData.set(dataManager.CURRENT_CHANGESET,null);*/
						}
						wsData.set(dataManager.SUPPRESS_CHANGE_LOGGING,false);
						if( false && currentChangeSet && saveOptions && saveOptions.persist){ //skipping saving to localstore
							var rdfModel = wsData.get('rdfModel');
							if(rdfModel){
								function saveRdf(){
									rdfModel.save();
								}
								saveRdf();
							}			            	
						}
					}
					dataManager.saveChangeSetToBackend(dataManager.get(dataManager.CURRENT_CHANGESET),function(response){
						callback(response);
					});
	            } else {
					callback();
				}
            }
			dataManager.pullServerChanges(function(){
				dataManager.showActiveUsers();
				if((changedParentObjects.length > 0) || (saveOptions && saveOptions.persist)) {
					//var changedParentObjectsCopy = new Array();
					/*for(var i=0;i<changedParentObjects.length;i++){
						var nestedModel = changedParentObjects.at(i).getNestedParent();	//this is done as some times parent is added later
						if(!nestedModel.isPersisted || !nestedModel.isPersisted()){
							continue;
						}
						modelsToSave.add(nestedModel);    
					}
					var savingObjectsCount = modelsToSave.length;
					var savedObjs = [];
					//TODO
					var modelsToSaveArr = modelsToSave.models.slice();
					async.each(modelsToSaveArr, function (obj, savedObject) {
						if (false && saveOptions && saveOptions.persist && (saveOptions.isActive == false || dataManager.get('isActive') === false)) {//skipping saving to localstore
							modelsToSave.remove(obj);
							if (obj && obj.getNestedParent && obj.getNestedParent() === obj && obj.save && ((obj.lawnchair !== undefined) || (obj.collection && obj.collection.lawnchair !== undefined))) {
								obj.save(null, {
									success: function (backendSavedObj) {
										backendSavedObj._previousAttributes = null;
										if (_.indexOf(savedObjs, backendSavedObj.get('id')) >= 0) {
											return;
										} else {
											savedObjs.push(backendSavedObj.get('id'));
										}
										savedObject();
									},
									error: function (backendSavedObj) {
										if (_.indexOf(savedObjs, backendSavedObj.get('id')) >= 0) {
											return;
										} else {
											savedObjs.push(backendSavedObj.get('id'));
										}
										savedObject();
									},
									skipChangelog: true
								}, { silent: true, validate: false, parse: false });
							} else {
								savedObject();
							}
						} else {
							savedObject();
						}
					}, function (e) {*/
						dataManager.set("lastSavedTime",new Date().getTime());
						var parentsCopy = changedParentObjects.slice(0);
						changedParentObjects.reset();
						changedObjects.reset();
						updateChangeSetAndPost(parentsCopy,function(res){
							/*if (e) {
								if (saveOptions && saveOptions.error) {
									saveOptions.error();
								}	                    			
							} else {*/
								if (saveOptions && saveOptions.success) {
									saveOptions.success();
								}
							//}
							dataManager.releaseSaveLock();
							if(res){
								/*var sessionDuration = (new Date().getTime() - dataManager.get("lastSession")[currentWSId]);
								if(!isNaN(sessionDuration) && sessionDuration > dataManager.get("maximumSessionTime")){//60000 = 60sec
									window.utils.startSpinner("savingWorkpsace", "Please wait Applying changes...");
									dataManager.applyWorkspaceById(currentWSId, function(){
										window.utils.stopSpinner("savingWorkpsace");
									});
								}*/
								if(dataManager.get("changeSetsUpdated") > dataManager.get("maxChangeSetsUpdated")){
									dataManager.set("changeSetsUpdated",0);
									window.utils.startSpinner("savingWorkpsace", "Please wait Applying changes...");
									dataManager.applyWorkspaceById(dataManager.get("currentWorkspaceId"), function(){
										window.utils.stopSpinner("savingWorkpsace");
									});
								}
							}
							//console.log("release lock");
						});
					//})
				}else{
					dataManager.set("lastSavedTime",new Date().getTime());
					if(changedObjects.length > 0){
						updateChangeSetAndPost([],function(){
							if(saveOptions && saveOptions.success){
								saveOptions.success();
							}
							dataManager.releaseSaveLock();
							//console.log("release lock");
						});
					} else {
						if(saveOptions && saveOptions.success){
							saveOptions.success();
						}
						dataManager.releaseSaveLock();
						//console.log("release lock");
					}
				}
			});			
        },
		invokeValueUpdates: function(callback,updateOtherScenarios){
			var self = this;
			var values = _.values(this.calculateValuesCache);
            async.eachSeries(values, function (valueObj, handledValue) {
                var alts = _.uniq(valueObj.alternatives);
				async.eachSeries(alts,function(alternative,alternativeHandled){
					valueObj.valueElement.updateValueMeasure(alternative,function(skipped){
						if(!skipped){
							alternativeHandled('skipOthers');
						}else{
							alternativeHandled();
						}
					},null,null,null,updateOtherScenarios);
				},function(){
					handledValue();
				});
			},function(){
				self.deletedMesRelDetails = {};
				self.calculateValuesCache = {};
				callback();
			});
		},
		getModelRepositoryId:function(model){
        	var modelLawnchair;
        	var projectId;
        	var dataManager = this;
        	if(model){
        		modelLawnchair = model.lawnchair;
        	}
        	if(modelLawnchair){
        		projectId = modelLawnchair.projectId;
        	}else{
        		//projectId = dataManager.get('currentWorkspace') ? dataManager.get('currentWorkspace').get('id') : window.plansKey;
        		var modelId = model.get('id');
        		projectId = dataManager.getRepositoryId(modelId);
        		if(projectId === modelId){
        			projectId = window.plansKey;
        		}
        	}
        	return projectId;
		},
		getModelInitializedWSDataSync:function(model){
			var projectId = this.getModelRepositoryId(model);
        	var wsData = this.getWorkspaceDataWithIdSync(projectId);
        	if(wsData && wsData.get('rdfModel')){
        		return wsData;
        	}else{
        		return;
        	}
		},
		getModelInitializedWSData:function(model,callback){
			var projectId = this.getModelRepositoryId(model);
			this.getModelIdInitializedWSData(projectId, callback);
		},
		getModelIdInitializedWSData:function(repId,callback){
        	this.getWorkspaceDataWithId(repId,function(wsData){
	        	function checkRDFModelAndCallback(){
		        	var rdfModel = wsData.get('rdfModel');
		        	if(rdfModel){
		        		callback(wsData);					
		        	}else{
		        		setTimeout(checkRDFModelAndCallback,0);
		        	}
	        	}
	        	if(wsData) {
	        		checkRDFModelAndCallback();  
	        	}else {
	        		callback(null);
	        	}
	        	      		
        	});
		},		
        addChangeObjectForFile: function(currentChangeset,model,planPackage,creatingLabel){
			var type = model.type;
			if(!type){
				type = model.get('type');
			}
			if(DataManager.getDataManager().get("readMode") || (type == 'preference_UserPreferences')){
				return;
			}
			try{
				var changeObject = new ChangeObject({changeObjectId: model.id, parent:model.id,changeObjectType: model.type,operationType: "add",version: model.version,timestamp: new Date()})
				changeObject.set("isJsonReferenced",false,{silent:true})
				changeObject.set('beepPackage',model.id,{silent:true});
				changeObject.set('beepPackageType',model.type,{silent:true});
				DataManager.getDataManager().setArtifactIdVersion(model.id,changeObject,creatingLabel,planPackage.documentVersion);
				//setChanges(changeObject,model,"add");
				if(creatingLabel){
					changeObject.set('previousDocumentVersion',planPackage.previousDocumentVersion);
					changeObject.set('versionChange',true);
				}
				model.planId = planPackage.id;
				changeObject.set('change',JSON.stringify(model),{silent:true});
				if(currentChangeset == undefined){
					currentChangeset = this.initilaizeWorkspaceChangeset();
				}
				currentChangeset.changes.push(changeObject);
				currentChangeset.set("timestamp", changeObject.get("timestamp"), {silent:true});
				var seqNo = currentChangeset.get("seqNo") !== undefined ? (currentChangeset.get("seqNo") + 1) : 0;
				currentChangeset.set("seqNo", seqNo , {silent:true});
				changeObject.set("seqNo", seqNo , {silent:true});
				changeObject.set("size",new TextEncoder().encode(JSON.stringify(changeObject.change)).length);
				return currentChangeset;
			}catch(e){
				console.log(e);
			}
        },
		addpackageForDelete: function(currentChangeset,model,planPackage){
			var type = model.type;
			if(!type){
				type = model.get('type');
			}
			if(DataManager.getDataManager().get("readMode") || (type == 'preference_UserPreferences')){
				return;
			}
			try{
				var changeObject = new ChangeObject({changeObjectId: model.id, parent:model.id,changeObjectType: type,operationType: "destroy",version: model.version,timestamp: new Date()})
				changeObject.set("isJsonReferenced",false,{silent:true})
				changeObject.set('beepPackage',model.id,{silent:true});
				changeObject.set('beepPackageType',type,{silent:true});
				DataManager.getDataManager().setArtifactIdVersion(model.id,changeObject);
				//setChanges(changeObject,model,"add");
				model.planId = planPackage.id;
				var modelJson = model.toJSON ? JSON.stringify(model.toJSON()) : JSON.stringify(model);
				changeObject.set('change',modelJson,{silent:true});
				if(currentChangeset == undefined){
					currentChangeset = this.initilaizeWorkspaceChangeset();
				}
				currentChangeset.changes.push(changeObject);
				currentChangeset.set("timestamp", changeObject.get("timestamp"), {silent:true});
				var seqNo = currentChangeset.get("seqNo") !== undefined ? (currentChangeset.get("seqNo") + 1) : 0;
				currentChangeset.set("seqNo", seqNo , {silent:true});
				changeObject.set("seqNo", seqNo , {silent:true});
				changeObject.set("size",new TextEncoder().encode(JSON.stringify(changeObject.change)).length);
			}catch(e){
				console.log(e);
			}
        },
        instantiateChangeSet: function(model,wsData){
			var currentChangeSet = wsData.get(this.CURRENT_CHANGESET);
        	if(!currentChangeSet){
        		var csId = window.guidGenerator();
        		currentChangeSet = new ChangeSet({id:csId,parent:wsData.get('lastChangeSet')},{lawnchair: wsData.get('actionStore'),silent:true});
        		//console.log("creating new changeset:" + currentChangeSet.get('id'));
        		wsData.set(this.CURRENT_CHANGESET,currentChangeSet);
        		currentChangeSet.lawnchair = wsData.get('actionStore');
	        	if(!model || !currentChangeSet.lawnchair && model.get('type') === "com_vbee_filesystem_Workspace"){
					currentChangeSet.lawnchair = wsData.get('actionStore');
	        	}
				this.get("previousChangeSetIds").enqueue(csId);
        	}
        	return currentChangeSet;
        },
        callSaveData: function(){
        	var dataManager = DataManager.getDataManager(); 
			var timeDur = (new Date().getTime() - dataManager.get("lastSavedTime"));  //5 min
			if(timeDur > 300000 && dataManager.get(dataManager.CHANGED_OBJECTS).size() > 0){
				$("#saveStatus").text("Unsaved Data:" + Math.round(timeDur)/1000 + "sec:" + dataManager.get(dataManager.CHANGED_OBJECTS).size() + "objs");
				if(timeDur > 300000 && dataManager.saveLock.isLocked()){
					// debugger
					//dataManager.releaseSaveLock();
				}
			} else{
				//$("#saveStatus").text("");
			}			
        	if(dataManager.saveLock.isLocked()){
        		return;
        	}
            dataManager.saveData.call(dataManager, { persist: true, isActivupdateChangeSete: false });
        },
        clearSaveInterval: function(){
        	var dataManager = DataManager.getDataManager();
			if(dataManager.get('autoSave')){
				clearInterval(dataManager.saveTimer);
        		dataManager.saveTimer = setInterval(this.callSaveData,10000);	
			}
        },
        addObjectToChangedObjects: function (model, related, destroyedObj, reverseKey) {
            
        	var dataManager = DataManager.getDataManager();
        	//dataManager.clearSaveInterval();
            if (!dataManager.get("autoSave") || dataManager.get("readMode") || dataManager.get(dataManager.SUPPRESS_LOGGING) || model instanceof ChangeSet || dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING) ||
        			(model.get('type') && (model.get('type').indexOf("com_vbee_filesystem_Workspace") >= 0 || model.get('type').indexOf("com_vbee_filesystem_PackageReference") >= 0 || model.get('type').indexOf("preference_") >= 0))){
        		return;
        	}
        	var wsData = dataManager.getModelInitializedWSDataSync(model);
        	if(wsData){
        		updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);
        	}else{
        		dataManager.getModelInitializedWSData(model,function(wsData){
	        		if(wsData){
	        			updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);   
	        		}	
        		});
        	}
			function updateChangeSet(changeSet,wsData){
				if (related && related.skipChangelog) {
					return;
				}
				var dataManager = DataManager.getDataManager();
	        	dataManager.get(dataManager.CHANGED_OBJECTS).add(model,{silent:true});
				var modelParent = model.getParent() ? model.getParent() : model;
				
				var nestedModel = model.get("nestedParent");
				if(!nestedModel){
					nestedModel = model;
					if(model.getNestedParent){
						nestedModel = model.getNestedParent();
					}
				}
	            if (!dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).get(nestedModel)) {
	                dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).add(nestedModel);
	            }
	

	        	if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
		        	var changedAttributes = model.changedAttributes();
		        	var previousAttributes = model.previousAttributes();
					if(!related && destroyedObj && destroyedObj.__related && reverseKey){
						changedAttributes ={};
						changedAttributes[reverseKey] = null;
						previousAttributes = {};
						previousAttributes[reverseKey] = destroyedObj.__related;
					}							        	
		        	if(typeof changedAttributes !== "boolean")
		        	{
			            var changeObject = new ChangeObject({changeObjectId: model.get('id'),parent:modelParent.get('id'),changeObjectType: model.get('type'),operationType: "update",version: model.getNestedParent().get('version'),timestamp: new Date()});
						if(nestedModel){
							changeObject.set('beepPackage',nestedModel.get('id'),{silent:true});
							changeObject.set('beepPackageType',nestedModel.get('type'),{silent:true});
							dataManager.setArtifactIdVersion(nestedModel.get('id'),changeObject);
						}else{
							changeObject.set('beepPackage',model.get('id'),{silent:true});
							changeObject.set('beepPackageType',model.get('type'),{silent:true});
							dataManager.setArtifactIdVersion(model.get('id'),changeObject);
						}
			            setChanges(changeObject,model,"update",changedAttributes,previousAttributes);
			            changeObject.lawnchair = changeSet.lawnchair;
			            dataManager.addChangeToChangeset(changeObject,wsData);
                        wsData.get('rdfModel').redoChange(changeObject);
			            //console.log("adding change obj:"+ changeObject.get('id') + " to change set:" +  dataManager.get(dataManager.CURRENT_CHANGESET).get('id'));
			            var changedProperties = Object.getOwnPropertyNames(changedAttributes);
			            for(var i=0;i<changedProperties.length;i++){
			            	var prop = changedAttributes[changedProperties[i]];
			            	if(prop instanceof Backbone.Model && prop.getNestedParent){
			            		var refObjectNestedParent = prop.getNestedParent();
			            		if( refObjectNestedParent !== nestedModel){
									if(refObjectNestedParent.get('type') !== 'transformation_Plan' && nestedModel.get('dependentPackage')){
										nestedModel.get('dependentPackage').add(refObjectNestedParent);	
									}
			            		}
			            	}
			            }
		            }
	            }
			}
        },
        getCollectionKey: function(collection,collectionParent){
        	var collectionParentRels = collectionParent.relations;
        	for(var i=0;i<collectionParentRels.length;i++){
        		if(collectionParent.get(collectionParentRels[i].key) === collection){
        			return collectionParentRels[i].key;
        		}
			}
        },
        addRelatedObjectToChangedObjects:function(model,collection){
        	var changingModel = this; //collection.parent;
        	var dataManager = DataManager.getDataManager();
        	//dataManager.clearSaveInterval();
        	if(!dataManager.get("autoSave") || dataManager.get("readMode") || dataManager.get(dataManager.SUPPRESS_LOGGING) || dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING) || changingModel instanceof ChangeSet || (changingModel.get('type') && (changingModel.get('type').indexOf("com_vbee_filesystem_Workspace") >= 0 || model.get('type').indexOf("preference_") >= 0))){
        		return;
        	}
        	var wsData = dataManager.getModelInitializedWSDataSync(changingModel);
        	if(wsData){
        		updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);
        	}else{
        		dataManager.getModelInitializedWSData(model,function(wsData){
        			if(wsData){
	        			updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);  
	        		}
        		});
        	}        	
			function updateChangeSet(changeSet,wsData){
				var dataManager = DataManager.getDataManager();
	   			dataManager.get(dataManager.CHANGED_OBJECTS).add(changingModel,{silent:true});
				var modelParent = changingModel.getParent() ? changingModel.getParent() : changingModel;
				var nestedModel = changingModel.get("nestedParent");
				if(!nestedModel){
					   nestedModel = changingModel;
					   if(nestedModel.getNestedParent){
						   nestedModel = nestedModel.getNestedParent();
					   }
				   }
	            if (!dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).get(nestedModel)) {
	                dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).add(nestedModel);
	            }
				//TODO unnecessarly Workspace-packageRefernce was coming to rdf and is not deleted so also skipping here..not sure why it was commented earlier

	        	if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
		            var changeObject = new ChangeObject({changeObjectId: changingModel.get('id'),parent:modelParent.get('id'),changeObjectType: changingModel.get('type'),operationType: "update",version: model.getNestedParent().get('version'),timestamp: new Date()});
					if(nestedModel){
						changeObject.set('beepPackage',nestedModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',nestedModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(nestedModel.get('id'),changeObject);
					}else{
						changeObject.set('beepPackage',changingModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',changingModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(changingModel.get('id'),changeObject);
					}
					var refObj = getReferedObject(model,"add",changeObject);
					var modelType = model.get('type');
					var changingModelType = changingModel.get('type');
					if((modelType !== "transformation_Alternative") && (changingModelType !== "transformation_Alternative") && (changingModelType !== "com_vbee_filesystem_Workspace") ){
						var refObjectNestedParent = model;
						if(model.getNestedParent){
							refObjectNestedParent = model.getNestedParent();
						}						
						if(nestedModel !== refObjectNestedParent){
							if(refObjectNestedParent.get('type') !== 'transformation_Plan' && nestedModel.get('dependentPackage')){
								nestedModel.get('dependentPackage').add(refObjectNestedParent);	
							}
						}
					} 
					var change = {};
					var collectionKey = dataManager.getCollectionKey(collection,changingModel);
					change[collectionKey] = refObj;
					changeObject.set('change',JSON.stringify(change),{silent:true});
		            changeObject.lawnchair = wsData.get('actionStore');
					dataManager.addChangeToChangeset(changeObject,wsData);
		            var rdfModel = wsData.get('rdfModel');
		            if(rdfModel){	// sometimes to early called before initialization
		            	rdfModel.redoChange(changeObject);	
		            }
		            //console.log("adding change obj:"+ changeObject.get('id') + " to change set:" +  dataManager.get(dataManager.CURRENT_CHANGESET).get('id'));
	            }
			}
     
        },
		getBreadCrumbActivity:function(){
			var breadCrumbPath = "";
			if(window.breadCrumbItems){
				for(var i=0;i< window.breadCrumbItems.length;i++){
					breadCrumbPath = breadCrumbPath + (i==0? "": "/") + $(window.breadCrumbItems[i]).text();
				}
			}
			if(breadCrumbPath == ""){
				breadCrumbPath = "My Plans"
			}
			return breadCrumbPath;
        },
		addChangeToChangeset:function (changeObject,wsData) {
			var breadCrumbPath = this.getBreadCrumbActivity();
			if($("#newModal > div > div >div > div").length > 0 && !$("#newModal > div > div >div > div").is(":hidden")){
				var dialogId =  $("#newModal > div > div >div > div")[0].id;
				var viewIndex = dialogId.indexOf('View');
				var dialogName = dialogId.substr(0,viewIndex);
				var modelId = dialogId.substr(viewIndex+ 4);
				changeObject.set('description',breadCrumbPath + ":Change done in dialog:" + dialogName + " on model id:" + modelId);
			}else{
				if(window.vdmModelView && window.vdmModelView.model){
					changeObject.set('description',breadCrumbPath + ":Change done in view:" + $("#content > div")[0].id +" for model :" + window.vdmModelView.model.get('id') + " type:"  + window.vdmModelView.model.get('type'));
				}else{
					changeObject.set('description',breadCrumbPath + ":Change done in view:" + $("#content > div")[0].id);
				}
			}
			
			var dataManager = DataManager.getDataManager();
			if(wsData != undefined){
				var currentChangeset = wsData.get(dataManager.CURRENT_CHANGESET)
				if(currentChangeset.changes && currentChangeset.changes.length > 0){
					for(var i=currentChangeset.changes.length; i>0; i--){
						var desc = currentChangeset.changes[i-1].description;
						if(!desc){
							continue;
						}
						if(desc == changeObject.get('description')){
							changeObject.set('description',null);
							break;
						} else {
							break;
						}
					}
				}
				currentChangeset.changes.push(changeObject);
			}
			if(!dataManager.get(dataManager.CURRENT_CHANGESET)){
				dataManager.initilaizeWorkspaceChangeset();
			}
			var workspacehangeset = dataManager.get(dataManager.CURRENT_CHANGESET);
			workspacehangeset.changes.push(changeObject);
			workspacehangeset.set("timestamp", changeObject.get("timestamp"), {silent:true});
			var seqNo = workspacehangeset.get("seqNo") !== undefined ? (workspacehangeset.get("seqNo") + 1) : 0;
			workspacehangeset.set("seqNo", seqNo , {silent:true});
			changeObject.set("seqNo", seqNo , {silent:true});
			changeObject.set("isJsonReferenced",true,{silent:true})// Why was this set to true?
			changeObject.lawnchair = null;
			changeObject.set("size",new TextEncoder().encode(JSON.stringify(changeObject)).length);
		},
		initilaizeWorkspaceChangeset: function(){
			var dataManager =  DataManager.getDataManager();
			var csId = window.guidGenerator();
        	var currentChangeSet = new ChangeSet({id:csId,parent:dataManager.get('lastChangeSet')},{silent:true});
			dataManager.set(dataManager.CURRENT_CHANGESET,currentChangeSet,{silent:true});
			this.get("previousChangeSetIds").enqueue(csId);
			return currentChangeSet;
		},
		resetWorkspaceChangeset: function(resetObjects,responseChangeSet){
			var dataManager =  DataManager.getDataManager();
			var currentChangeSet = dataManager.get(dataManager.CURRENT_CHANGESET);
			var resChangeSetId = responseChangeSet ? responseChangeSet.id : null;
			if(responseChangeSet){
				dataManager.get("workspaceAppliedChageSetDateData")[responseChangeSet.workspaceId] = responseChangeSet.timestamp;
			}
			if(resChangeSetId && currentChangeSet && currentChangeSet.id != resChangeSetId){//special case on brokenchangeset
				dataManager.set("lastChangeSet",resChangeSetId);
			}
			if(resetObjects){
				this.get(this.CHANGED_PARENT_OBJECTS).reset();
				this.get(dataManager.CHANGED_OBJECTS).reset();
			}
			dataManager.initilaizeWorkspaceChangeset();
		},
		getRelation: function(instance,key){
			return instance._relations[key];
		},
		getReverseRelation:function(instance,key){
			var relation = this.getRelation(instance,key);
			if(relation){
				return relation.reverseRelation;
			}
		},		
        addNewObjectToChangedObjects: function(model,addWitoutReferences) {
        	if(!model.isNew()){
        		return;
        	}
			if(Backbone.Relational.instanceofmodel(model,Backbone.Relational.store._types["beeppackage.BeepPackage"])){
				//debugger;
			}
        	var dataManager = DataManager.getDataManager();
        	//dataManager.clearSaveInterval();
        	if(!dataManager.get("autoSave") || dataManager.get("readMode") || dataManager.get(dataManager.SUPPRESS_LOGGING) || model instanceof ChangeSet || dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING) ||
        			(model.get('type') && (model.get('type').indexOf("com_vbee_filesystem_Workspace") >= 0 || model.get('type').indexOf("com_vbee_filesystem_PackageReference") >= 0 || model.get('type').indexOf("preference_") >= 0))){
        		return;
        	}
        	var wsData = dataManager.getModelInitializedWSDataSync(model);
        	if(wsData){
        		updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);
        	}else{
        		dataManager.getModelInitializedWSData(model,function(wsData){
        			if(wsData){
	        			updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);  
	        		}
        		});
        	}        	
        	function updateChangeSet(changeSet,wsData){
        		var dataManager = DataManager.getDataManager();
	        	dataManager.get(dataManager.CHANGED_OBJECTS).add(model,{silent:true});
				var modelParent = model.getParent() ? model.getParent() : model;
	        	var nestedModel = model.get("nestedParent");
				if(!nestedModel){
					nestedModel = model;
					if(model.getNestedParent){
						nestedModel = model.getNestedParent();
					}
				}
	            if (!dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).get(nestedModel)) {
	                dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).add(nestedModel);
	            }
	

				if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
		            var changeObject = new ChangeObject({changeObjectId: model.get('id'),parent:modelParent.get('id'),changeObjectType: model.get('type'),operationType: "add",version: model.getNestedParent().get('version'),timestamp: new Date()})
					if(nestedModel){
						changeObject.set('beepPackage',nestedModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',nestedModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(nestedModel.get('id'),changeObject);
					}else{
						changeObject.set('beepPackage',model.get('id'),{silent:true});
						changeObject.set('beepPackageType',model.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(model.get('id'),changeObject);
					}
		            setChanges(changeObject,model,"add",null,null,addWitoutReferences);
		            changeObject.lawnchair = wsData.get('actionStore');
		            dataManager.addChangeToChangeset(changeObject,wsData);
					if(addWitoutReferences){
						changeObject.set("isJsonReferenced",false,{silent:true})
					}
		            var rdfModel = wsData.get('rdfModel');
		            if(rdfModel && (addWitoutReferences === undefined || addWitoutReferences == false) ){
		            	rdfModel.redoChange(changeObject);	
                    }
		            //console.log("adding change obj for new:"+ changeObject.get('id') + " to change set:" +  dataManager.get(dataManager.CURRENT_CHANGESET).get('id') + " type:" + model.get('type'));
	            }
        	};
        },
		setArtifactIdVersion:function(documentId,changeObject,creatingVersion,revision){
			var dataManager = DataManager.getDataManager();
			var artifactsDocuments = dataManager.get('artifactsDocuments');
			if(artifactsDocuments[documentId]){
				var artDoc = artifactsDocuments[documentId];
				var artId = artDoc.artifactId;
				if(creatingVersion){
					artId = window.uuidGenerator();
				}
				changeObject.set('artifactId',artId,{silent:true});
				changeObject.set('documentVersion',creatingVersion ? revision : artDoc.documentVersion,{silent:true});
			}else{
				changeObject.set('artifactId',changeObject.get('beepPackage'));
				//console.log("Missing artifactsDocument for :" + documentId);
			}
		},
        addDeletedObjectToChangedObjects: function(model,response,options) {
			//console.log("on delete obj:" + model.get("id"));
        	var dataManager = DataManager.getDataManager();
        	//dataManager.clearSaveInterval();
            if (!dataManager.get("autoSave") || dataManager.get("readMode") || dataManager.get(dataManager.SUPPRESS_LOGGING) || (options && options.silent) || model instanceof ChangeSet || dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING) ||
        			(model.get('type') && (model.get('type').indexOf("com_vbee_filesystem_Workspace") >= 0 || model.get('type').indexOf("com_vbee_filesystem_PackageReference") >= 0 || model.get('type').indexOf("preference_") >= 0))){
        		return;
        	}
        	var wsData = dataManager.getModelInitializedWSDataSync(model);
        	if(wsData){
        		updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);
        	}else{
        		dataManager.getModelInitializedWSData(model,function(wsData){
        			if(wsData){
	        			updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);  
	        		}
        		});
        	}        	
        	function updateChangeSet(changeSet,wsData){
        		var dataManager = DataManager.getDataManager();
	        	dataManager.get(dataManager.CHANGED_OBJECTS).add(model,{silent:true});
				var nestedModel = model.get("nestedParent");
				var modelParent = model.getParent() ? model.getParent() : model;
				if(!nestedModel){
					nestedModel = model;
					if(model.getNestedParent){
						nestedModel = model.getNestedParent();
					}
				}
	            if (!dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).get(nestedModel)) {
	                dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).add(nestedModel);
	            }
	

	            if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
		            var changeObject = new ChangeObject({changeObjectId: model.get('id'),parent:modelParent.get('id'),changeObjectType: model.get('type'),operationType: "destroy",version: model.getNestedParent().get('version'),timestamp: new Date()});
					if(nestedModel){
						changeObject.set('beepPackage',nestedModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',nestedModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(nestedModel.get('id'),changeObject);
					}else{
						changeObject.set('beepPackage',model.get('id'),{silent:true});
						changeObject.set('beepPackageType',model.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(model.get('id'),changeObject);
					}
		            setChanges(changeObject,model,"destroy");
		            changeObject.lawnchair = wsData.get('actionStore');
		            dataManager.addChangeToChangeset(changeObject,wsData);
		            var rdfModel = wsData.get('rdfModel');
		            if(rdfModel){
		           		rdfModel.redoChange(changeObject);
/*		           		model.getContainedModels(function(containedModels){
		           			_.each(containedModels,function(containedModel){
		           				rdfModel.removeRDFForModel(containedModel.get('id'));
		           			});
		           		},true);*/
                    }
		            //console.log("adding change obj:"+ changeObject.get('id') + " to change set:" +  dataManager.get(dataManager.CURRENT_CHANGESET).get('id'));
	            }
        	};

        },

        addRelatedDeletedObjectToChangedObjects:function(model,collection){
        	var changingModel = this; //collection.parent;
        	var dataManager = DataManager.getDataManager();
        	//dataManager.clearSaveInterval();
            if (!dataManager.get("autoSave") || dataManager.get("readMode") || dataManager.get(dataManager.SUPPRESS_LOGGING) || dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING) || changingModel instanceof ChangeSet ){// || (changingModel.get('type') && changingModel.get('type').indexOf("com_vbee_filesystem_Workspace") >= 0)){
        		return;
        	} 
        	var wsData = dataManager.getModelInitializedWSDataSync(changingModel);
        	if(wsData){
        		updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);
        	}else{
        		dataManager.getModelInitializedWSData(model,function(wsData){
        			if(wsData){
	        			updateChangeSet(dataManager.instantiateChangeSet(model,wsData),wsData);  
	        		}
        		});
        	}        	
			function updateChangeSet(changeSet,wsData){
				var dataManager = DataManager.getDataManager();
	        	dataManager.get(dataManager.CHANGED_OBJECTS).add(changingModel,{silent:true});
	        	var nestedModel = changingModel;
				var modelParent = changingModel.getParent() ? changingModel.getParent() : changingModel;
	        	if(changingModel.getNestedParent){
	        		nestedModel = changingModel.getNestedParent();
	        	}
	            if (!dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).get(nestedModel)) {
	                dataManager.get(dataManager.CHANGED_PARENT_OBJECTS).add(nestedModel);
	            }
				//TODO as workspace has no HasMany relations, to be changed when they are there

	        	if(!dataManager.get(dataManager.SUPPRESS_CHANGE_LOGGING)){
		            var changeObject = new ChangeObject({changeObjectId: changingModel.get('id'),parent:modelParent.get('id'),changeObjectType: changingModel.get('type'),operationType: "update",version: model.getNestedParent().get('version'),timestamp: new Date()});
					if(nestedModel){
						changeObject.set('beepPackage',nestedModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',nestedModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(nestedModel.get('id'),changeObject);
					}else{
						changeObject.set('beepPackage',changingModel.get('id'),{silent:true});
						changeObject.set('beepPackageType',changingModel.get('type'),{silent:true});
						dataManager.setArtifactIdVersion(changingModel.get('id'),changeObject);
					}
					var refObj = getReferedObject(model,"destroy",changeObject);
					var change = {};
					var collectionKey = dataManager.getCollectionKey(collection,changingModel);
					change[collectionKey] = refObj;
					changeObject.set('change',JSON.stringify(change),{silent:true});
		            changeObject.lawnchair = wsData.get('actionStore');
		            dataManager.addChangeToChangeset(changeObject,wsData);
		            var rdfModel = wsData.get('rdfModel');
		            if(rdfModel){		            
		            	rdfModel.redoChange(changeObject);
                    }
		            var reverseRelationObj = dataManager.getReverseRelation(changingModel,collectionKey);
		            if(reverseRelationObj){
		            	var reverseRelKey = reverseRelationObj.key;
		            	var modelRevRelation = dataManager.getRelation(model,reverseRelKey);
		            	if(modelRevRelation instanceof Backbone.HasOne && modelRevRelation.options.includeInJSON === model.idAttribute){
		            		var modelRepId = dataManager.getRepositoryId(model.get('id'));
		            		var modelRdfModel = dataManager.getRDFModel(modelRepId);
		            		if(modelRdfModel) {
			            		modelRdfModel.removeRefernce(model,reverseRelKey,changingModel,function(){
			            			
			            		});
		            		}
		            	}
		            }		            
		            //console.log("adding change obj:"+ changeObject.get('id') + " to change set:" +  dataManager.get(dataManager.CURRENT_CHANGESET).get('id'));
	            }
			};
        },

        getChangeObject: function(model){
        	var currentChangeSet = this.get(this.CURRENT_CHANGESET);
        	if(!currentChangeSet){
        		return null;
        	}
        	var changes = currentChangeSet.changes;

        },
        undo: function(){
        	//this.saveData();
        	this.set(this.SUPPRESS_CHANGE_LOGGING,true);
        	this.resetData();
        	var lastChangeSet = this.get('currentWSData').get('lastChangeSet');
        	if(lastChangeSet){
	        	var changes = lastChangeSet.changes;
	        	for(var i=(changes.length-1);i>=0;i--){
	        		var change = changes[i];
	        		this.undoChange(change);
	        	}
	        	this.get('currentWSData').set('lastUndoneChangeSet',lastChangeSet);
	        	this.get('currentWSData').set('lastChangeSet',lastChangeSet.get('parent'));
	        	this.get('currentWorkspace').set('lastChangeSet',this.get('currentWSData').get('lastChangeSet'));
	        	this.get('currentWorkspace').set('lastUndoneChangeSet',lastChangeSet);
				this.get("workspaceAppliedChageSetDateData")[this.get("currentWorkspaceId")] = lastChangeSet.get('parent') ? lastChangeSet.get('parent').get("timestamp") : null;
        	}

        	this.saveData();
        	//this.set(this.SUPPRESS_CHANGE_LOGGING,false); //done in save
        },
        undoChange: function(changeObj){
        	var operation = changeObj.get('operationType');
        	if(operation === 'add'){
        		this.undoAdd(changeObj);
        	}else if(operation === 'update'){
        		this.undoUpdate(changeObj);
        	} else {
        		this.undoDelete(changeObj);
        	}
        	this.get('rdfModel').undoChange(changeObj);
        },
		pullServerChanges:function(callback,skipChange){
			var dataManager = this;
			
            var currentWorkspaceId = dataManager.get("currentWorkspaceId");
			if(!currentWorkspaceId || !dataManager.get("autoSave") || dataManager.get("readMode")){
                callback();
				return;
			}
			if(!dataManager.get('lastChangeSet') && (!dataManager.get("workspaceData") || Object.keys(dataManager.get("workspaceData")).length == 0) ){
				if(callback){
					callback();
					return;
				}
			}
			var currentEntityId;
			var currentLegalEntity = dataManager.get("currentLegalEntity");
			if (currentLegalEntity && currentLegalEntity.entityId) {
				currentEntityId = currentLegalEntity.entityId;
				var legalId = dataManager.get("workspaceLegal")[currentWorkspaceId];
				if(legalId && currentEntityId != legalId){
					currentEntityId = legalId;
				}
			}
			var lastChangeSet = dataManager.get('lastChangeSet') ? dataManager.get('lastChangeSet') : dataManager.get("workspaceData")[currentWorkspaceId];
			function checkandGetActivityChange(){
				var activity = dataManager.getBreadCrumbActivity();
				var lastAct = dataManager.get('lastActivity');
				if(lastAct && (/*lastAct['value'] !== activity ||*/ new Date().getTime() - lastAct['key'] < 300000)){//5min
					activity = null;
				}
				return activity;
			}
			var activity = checkandGetActivityChange();
			
			var lastAppliedChangeSetDate = dataManager.get("workspaceAppliedChageSetDateData")[currentWorkspaceId];
			//console.log("getting changeset:" + lastChangeSet);
			//console.log("timestamp:" +(lastAppliedChangeSetDate ? lastAppliedChangeSetDate : 0)  );
			//console.log("current timestamp:" + new Date().getTime());
			//const uri = "/vdmbee/workspace/" + currentWorkspaceId + "/changes/" + lastChangeSet + "/" + (lastAppliedChangeSetDate ? lastAppliedChangeSetDate : 0) + "?activity=" + activity + "&entityId=" + currentEntityId;
			const encodedUri = "/vdmbee/workspace/" + currentWorkspaceId + "/changes/" + lastChangeSet + "/" + (lastAppliedChangeSetDate ? lastAppliedChangeSetDate : 0) + "?activity=" + encodeURIComponent(activity) + "&entityId=" + currentEntityId;
			dataManager.get('vmpServerService').getAllPromise(encodedUri).then(function(data) {
				//dataManager.clearSaveInterval();
				if(data && data._embedded){
					var changeDataModels = data._embedded.changeDataModelResources;
					if(changeDataModels.length > 0 && changeDataModels[0].changeSet.id !== "dummy"){
						var lastChangedSet = changeDataModels[changeDataModels.length - 1].changeSet;
						var lastChangedBy = lastChangedSet.changedBy;
						if(changeDataModels[0].changeSet.description == "copy package to workspace"){
							var msg = "Reloading page due to Package Submission by " + lastChangedBy;
							bootbox.alert(msg, function() { 
                                window.utils.navigatePage(true);
								window.location.reload();
                            });
							return;
						}
						if(/*dataManager.get('email') != lastChangedBy*/ !skipChange && !dataManager.get("previousChangeSetIds").contains(lastChangedSet.id)){
							var msg = "Please Wait...Applying Changes from " + lastChangedBy;
							fnon.Hint.Light(msg,{displayDuration: 4500});
						}
					} else {
						console.log("changes received:" + changeDataModels.length);
					}
					async.eachSeries(changeDataModels,function(changeModel,handledChangeModel){
						var changeSet = changeModel.changeSet;
						if(changeSet.id == "dummy"){
							dataManager.get("workspaceAppliedChageSetDateData")[dataManager.get("currentWorkspaceId")] = changeSet.timestamp;
							handledChangeModel();
							return;	
						}
						if(dataManager.get("previousChangeSetIds").contains(changeSet.id)){
							dataManager.get("workspaceAppliedChageSetDateData")[dataManager.get("currentWorkspaceId")] = changeSet.timestamp;
							handledChangeModel();
							return;
						}else{
							dataManager.get("previousChangeSetIds").enqueue(changeSet.id);
						}
						dataManager.set('lastChangeSet',changeSet.id);
						dataManager.get("workspaceAppliedChageSetDateData")[dataManager.get("currentWorkspaceId")] = changeSet.timestamp;
						if(changeSet.skipped || changeSet.skipped == 'true' || (skipChange && dataManager.get('email') == changeSet.changedBy)){
							handledChangeModel();
							return;
						}
						console.log("pulled from "+lastChangedBy);
						changeSet.changes = changeModel.changes;
						dataManager.redo(changeSet,handledChangeModel);
					},function(err){
						if(callback && !skipChange){
							setTimeout(function(){
								//dataManager.clearSaveInterval();
								dataManager.set(dataManager.SUPPRESS_CHANGE_LOGGING,false);
								callback();
							}, 10);
						}else{
							dataManager.clearSaveInterval();
							dataManager.set(dataManager.SUPPRESS_CHANGE_LOGGING,false);
							callback();
						}
					})
				}else{
					//dataManager.get("workspaceAppliedChageSetDateData")[dataManager.get("currentWorkspaceId")] = (new Date()).getTime();
					if(callback){
						callback();
					}
				}
			});
		},
        getModelTypeByTypeStr: function(type,version,useMixin){
		  	var path = type.substr(0,type.lastIndexOf('_'));
		  	var clsName = type.substr(type.lastIndexOf('_') + 1);
		  	var clsVer = Math.round(version/1000);
		  	var loader;
		  	if(path === "com_vbee_data" || path === "com_vbee_filesystem" || path === "com_vbee_rdf" || path === "com_vbee_utils"){
		  		//loader = eval('this.get(\'appNS\').' + path);
		  		loader = this.buildCommonNsPath(path);
		  	}else{
				//loader = this.buildAppNsPath(path,"version" + Math.round(version/1000));
				loader = this.buildAppNsPath(path,"version1" );
			}
			var className;
			while(clsVer > 1){
				if(useMixin){
					className = clsName +clsVer +  "Mixin";
				}else{
					className = clsName + clsVer;
				}
				var cls = loader[className];
				if(cls != undefined){
					return cls;
				}
				clsVer--;
			}
			if(useMixin){
				className = clsName  +  "Mixin";
			}else{
				className = clsName ;
			}
        	return loader[className];
        },
		getTypeMetadata : function(type){
			var version = this.get("currentVDMVersion");
			var typeMixinCls = this.getModelTypeByTypeStr(type,version,true);
			var ret = null;
			if(typeMixinCls){
				ret = JSON.parse("{}");
				ret["relations"] = {};
				var relations;
				try{
					relations = typeMixinCls.getCumulativeMixinRelations();
					for(var i=0;i<relations.length;i++){
						var relation = JSON.parse("{}");
						relation["includeInJSON"] = relations[i].includeInJSON;
						if(relations[i].type == Backbone.HasMany){
							relation["type"]= "Backbone.HasMany";
						}else{
							relation["type"]= "Backbone.HasOne";
						}
						relation["relatedModel"] = relations[i].relatedModel;
						if(relations[i].reverseRelation){
							relation["reverseRelation"] = JSON.parse("{}")
							relation["reverseRelation"]["includeInJSON"] = relations[i].reverseRelation.includeInJSON;
							relation["reverseRelation"]["key"] = relations[i].reverseRelation.key;
							if(relations[i].reverseRelation.type == Backbone.HasMany){
								relations[i].reverseRelation.type= "Backbone.HasMany";
							}else{
								relations[i].reverseRelation.type= "Backbone.HasOne";
							}
						}
						ret["relations"][relations[i]["key"]] = relation;
					}
					ret["subModelTypes"] = this.getModelTypeByTypeStr(type,version,false).prototype.subModelTypes;
					return ret;
				}catch(e){

				}
			}
			return ret;
		},
		getClassMetadata : function(type){
			var self = this;
			var ret = JSON.parse('{}');
			var keys = Object.keys(Backbone.Relational.store._types);
			for(var i=0;i<keys.length;i++){
				var key = Object.keys(Backbone.Relational.store._types)[i].replaceAll(/\./g,'_');
				var keyMetadata = this.getTypeMetadata(key);
				if(keyMetadata){
					ret[key] = keyMetadata
				}
			}
			self.updateReverseRelations(ret);
			return ret;			
		},
		updateReverseRelations: function(metadata){
			var self = this;
			for(var clsKey in metadata){
				var cls = metadata[clsKey];
				var relations = cls['relations'];
				for(var relKey in relations){
					var relation = relations[relKey];
					var parentIncludeInJson = relation["includeInJSON"];
					if(relation['reverseRelation'] !== undefined ){
						var modelKey = relation['relatedModel'].replaceAll(/\./g,'_');
						self.addReverseRelationForModel(metadata,relation['reverseRelation'],relation['relatedModel'],clsKey,[],parentIncludeInJson,relKey);
					}
				}
			}
		},
		updateClassMetadataWithreverseRelation:function(metadata,reverseRelation,relatedModel,subModelTypes,classesHandled,parentIncludeInJson,ownerKey){
			var self = this;
			relatedModel = relatedModel.replaceAll(/\./g,'_');
			for(var key in subModelTypes){
				self.addReverseRelationForModel(metadata,reverseRelation,relatedModel,key,classesHandled,parentIncludeInJson,ownerKey);
			}
		},
		addReverseRelationForModel:function(metadata,reverseRelation,relatedModel,modelKey,classesHandled,parentIncludeInJson,ownerKey){
			var self = this;
			var relatedClsName = relatedModel.replaceAll(/\./g,'_');
			if(classesHandled.includes(relatedClsName)){
				return;
			}else{
				classesHandled.push(relatedClsName);
			}
			var relatedCls = metadata[relatedClsName];
			
			if(relatedCls){
				if(!relatedCls['relations'][reverseRelation['key']]){
					var rel = JSON.parse('{}');
					if(reverseRelation.type == Backbone.HasMany){
						rel["type"]= "Backbone.HasMany";
					}else{
						rel["type"]= "Backbone.HasOne";
					}
					rel["includeInJSON"] = reverseRelation["includeInJSON"];
					if(!parentIncludeInJson || parentIncludeInJson != 'id'){
						rel["isOwner"] = true;
						rel["ownerKey"] = ownerKey;
					}
					var modelVal = modelKey.replaceAll(/\_/g,'.');
					rel["relatedModel"] = modelVal; 
					relatedCls['relations'][reverseRelation['key']] = rel;
				}
				if(relatedCls['subModelTypes'] != undefined){
					self.updateClassMetadataWithreverseRelation(metadata,reverseRelation,relatedModel,relatedCls['subModelTypes'],classesHandled,parentIncludeInJson,ownerKey);
				}
			}
		},
		isPartOfRelation : function(typeMixinCls,property){
			if(!typeMixinCls){
				return false;
			}
			var relations = typeMixinCls.getCumulativeMixinRelations();
			for(var i=0;i<relations.length;i++){
				if(relations[i].key === property){
					var includeInJSON = relations[i].includeInJSON;
					if(!includeInJSON || includeInJSON === true){
						relations.length = 0;
						return true;
					}else{
						relations.length = 0;
						return false;
					}
				}
			}
			relations.length = 0;
			return false;
		},
        getModelType: function(model,useMixin){
			if(model.get("type") == "vdml_ValueDeliveryModel"){
				//debugger;
			}
        	var parent = model.getNestedParent();
		  	var version = parent.get('version');
		  	if(!version){
		  		if(parent.get('type') === 'transformation_Plan'){
		  			version = this.get('currentPlanVersion');	
		  		}else{
		  			version = this.get('currentVDMVersion');
		  		}
		  	}
		  	var type = model.get('type');
		  	return this.getModelTypeByTypeStr(type,version,useMixin);
        },
        getChangeObjectModelType: function(changeObj,type){
		  	// var version = changeObj.getVersion();
		  	// if(!version){
		  	// 	version = 1;
		  	// }
		  	if(!type){
		  		type = changeObj.get('changeObjectType');
				if(!type){
					return;
				}
		  	}
		  	var path = type.substr(0,type.lastIndexOf('_'));
		  	var clsName = type.substr(type.lastIndexOf('_') + 1);
		  	var loader;
		  	if(path === "com_vbee_data" || path === "com_vbee_filesystem" || path === "com_vbee_rdf" || path === "com_vbee_utils"){
		  		//loader = eval('this.get(\'appNS\').' + path);
		  		loader = this.buildCommonNsPath(path);
		  	}else{
				//loader = this.buildAppNsPath(path,"version" + version);
				loader = this.buildAppNsPath(path,"version1" );
			}
        	return loader[clsName];
        },
		getChangeObjectByType: function(type){
			//var version = 1;
			if(!type){
				type = changeObj.get('changeObjectType');
			}
			var path = type.substr(0,type.lastIndexOf('_'));
			var clsName = type.substr(type.lastIndexOf('_') + 1);
			var loader;
			if(path === "com_vbee_data" || path === "com_vbee_filesystem" || path === "com_vbee_rdf" || path === "com_vbee_utils"){
				//loader = eval('this.get(\'appNS\').' + path);
				loader = this.buildCommonNsPath(path);
			}else{
			  //loader = this.buildAppNsPath(path,"version" + version);
			  loader = this.buildAppNsPath(path,"version1");
		  }
		  return loader[clsName];
	  	},
        undoAdd: function(changeObj){
        	var change = JSON.parse(changeObj.get('change'));
        	var type = change.type;
        	var modelType = this.getChangeObjectModelType(changeObj,type);// eval('this.get(\'appNS\').' + type);
        	var changeObjId = change['id'];
        	var obj = modelType.find({'id': changeObjId});
        	if(obj){
        		this.setLawnchair(obj);
	        	obj.destroy();
	        	obj.destroy({silent: true});
        	}
        },

       undoUpdate: function(changeObj){
        	var prevValue = JSON.parse(changeObj.get('previous'));
        	var change = JSON.parse(changeObj.get('change'));
        	var type = changeObj.get('changeObjectType');
        	var modelType = this.getChangeObjectModelType(changeObj,type); //eval('this.get(\'appNS\').' + type);
        	var changeObjId = changeObj.get('changeObjectId');
        	var obj = modelType.find({'id': changeObjId});
        	if(!obj){
        		return;
        	}
        	this.setLawnchair(obj);
			var changePairs = _.pairs(change);
			for(var i=0;i<changePairs.length;i++){
				var changePair = changePairs[i];
				if(changePair[1].constructor === Array){
					var relation = modelType.getRelation(changePair[0]);
					var relatedModel = relation.relatedModel;
					for(var j=0;j<changePair[1].length;j++){
						//TODO

					}
				}
				else{
					if(changePair[1] instanceof Object){
						if(!changePair[1].relationOperation){
							var objType = this.getChangeObjectModelType(changeObj,changePair[1].type); //eval('this.get(\'appNS\').' + changePair[1].type);
							if(objType){
								if(prevValue[changePair[0]]){
									var val = objType.find({'id': prevValue[changePair[0]].id});
									obj.set(changePair[0],val);
									obj.set(changePair[0],val,{silent: true});
								}else{
									obj.set(changePair[0],null);
									obj.set(changePair[0],null,{silent: true});
								}
							}
						}else{
							var objType = this.getChangeObjectModelType(changeObj,changePair[1].type); //eval('this.get(\'appNS\').' + changePair[1].type);
							var val;
							if(objType){
								val = objType.find({'id': changePair[1].id});
							}
							if(val){
								if(changePair[1].relationOperation === "add"){
									obj.get(changePair[0]).remove(val);
									obj.get(changePair[0]).remove(val,{silent: true});
								}
								else{
									obj.get(changePair[0]).add(val);
									obj.get(changePair[0]).add(val,{silent: true});
								}
							}

						}
					}
					else{
						obj.set(changePair[0],prevValue[changePair[0]]);
						obj.set(changePair[0],prevValue[changePair[0]],{silent: true});
						//console.log("chaned " + changePair[0] + " to :" + prevValue[changePair[0]]);
					}
				}
			}
        },
        undoDelete: function(changeObj){
        	var prevValue = JSON.parse(changeObj.get('previous'));
        	var objType = this.getChangeObjectModelType(changeObj,prevValue.type);// eval('this.get(\'appNS\').' + prevValue.type);
        	var instance = new objType();
        	var instance = new objType({},{silent: true});
        	var attrPairs = _.pairs(prevValue);
        	for(var i=0;i<attrPairs.length;i++){
        		var attrPair = attrPairs[i];
				if(attrPair[1] instanceof Object){
					var objType = this.getChangeObjectModelType(changeObj,attrPair[1].type); //eval('this.get(\'appNS\').' + attrPair[1].type);
					if(objType){
						var val = objType.find({'id': attrPair[1].id});
						instance.set(attrPair[0],val);
						instance.set(attrPair[0],val,{silent: true});
					}
				}
				else{
					instance.set(attrPair[0],attrPair[1]);
					instance.set(attrPair[0],attrPair[1],{silent: true});
				}
        	}
        },
		checkPlanLoaded: function(change){
			var dataManager = this;
			var id = change.get("beepPackage");
			if((change.get("beepPackageType") == "transformation_Plan" && window.loadedPackages[id]) 
				|| ((change.get("changeObjectType") == "transformation_Plan" &&  change.get("operationType") == "add"))){
				return true;
			} else if(change.get("beepPackageType") !== "transformation_Plan"){
				var altId = dataManager.getRepositoryId(id);
				var alt = window.utils.getElementModel(altId,['transformation.Alternative']);
				if(alt){
					return true;
				}
			}
			return false;
		},
        redo: function(nextChangeSet,callback){
			var dataManager = this;
        	//this.saveData();
       		this.set(this.SUPPRESS_CHANGE_LOGGING,true);
        	this.resetData();
			if(!nextChangeSet){
				var lastChangeSet = this.get('currentWSData').get('lastChangeSet');
				if(lastChangeSet){
					lastChangeSet.getAsync('nextChangeSets',{lawnchair:lastChangeSet.lawnchair});
					var nextSets = lastChangeSet.get('nextChangeSets');
					if(nextSets.length > 0){
						nextChangeSet = nextSets.at(0);
					}
				}else{
					nextChangeSet = this.get('currentWSData').get('lastUndoneChangeSet');
				}
			}
        	if(nextChangeSet){
				var skippedChanges = [];
				if(!dataManager.deletedData){
					dataManager.deletedData = [];
					dataManager.deletingData = [];
				}
				var deletedObjects = dataManager.deletedData;
				var unlinkedObjects = [];
	        	var changes = nextChangeSet.changes;
				async.eachSeries(changes,function(change,changeHanded){
					if(!(change instanceof Backbone.Model)){
						change = new ChangeObject(change);
					}
					//var tempType = dataManager.getChangeObjectByType('smm_SmmModel');
					//var obj = tempType.find({'id': '@10ad82@-9706-4028-8b06-62e43ef2'});
	
					try{
						if(dataManager.checkPlanLoaded(change)){
							dataManager.redoChange(change,deletedObjects,unlinkedObjects,changeHanded,skippedChanges);
							console.log("done change:"+ change.get('changeObjectId'));
						} else {
							changeHanded();
						}
						
					}catch(err){
						console.log("skipping change:"+ change.get('changeObjectId'));
						skippedChanges.push(change);
						changeHanded();
					}
				},function(err){
					function updateWorksapceData(){
						var timestamp = nextChangeSet.timestamp;
						if(timestamp){
							dataManager.get("workspaceAppliedChageSetDateData")[dataManager.get("currentWorkspaceId")] = timestamp;
						}
						dataManager.get('currentWSData').set('lastChangeSet',nextChangeSet);
						dataManager.get('currentWorkspace').set('lastChangeSet',nextChangeSet);
						dataManager.saveData(); //TODO remove comment testing	
						if(callback){
							callback();
						}					
					}
					console.log("doing last retry:" + skippedChanges.length);
					if(skippedChanges.length > 0){
						try{
							dataManager.retrySkippedChanges(skippedChanges,function(reskippedChanges1){
								if(reskippedChanges1.length > 0){
									dataManager.retrySkippedChanges(reskippedChanges1,function(reskippedChanges2){
										if(reskippedChanges2.length > 0){
											dataManager.retrySkippedChanges(reskippedChanges1,function(reskippedChanges3,err){
												if(reskippedChanges3.length > 0 ){
													if(err){
														throw err;
													}else{
														console.log("we still have skipped changes...increase rertry...........");
														updateWorksapceData();
													}
													
												}else{
													updateWorksapceData();
												}
											});
										}else{
											updateWorksapceData();
										}
									});
								}else{
									updateWorksapceData();
								}
							});
						}catch(err){
							console.log(err);
							debugger
							var msg = dataManager.get('localeManager').get('mergeConflict');
							msg = msg.concat("<br/>"+err);
							bootbox.alert(msg, function() { 
                                window.utils.navigatePage(false);
								window.location.reload();
                            });
							if(callback){
								callback();
							}
						}
					}else{
						if(callback){
							callback();
						}
					}
				})
        	}else{
				if(callback){
					callback();
				}
			}
	        //this.set(this.SUPPRESS_CHANGE_LOGGING,false); // done in save
        },
		retrySkippedChanges:function(skippedChanges,callback){
			var dataManager = this;
			var reSkippedChanges = [];
			async.eachSeries(skippedChanges,function(change,changeHanded){
				try{
					if(dataManager.checkPlanLoaded(change)){
						dataManager.redoChange(change,deletedObjects,unlinkedObjects,changeHanded,reSkippedChanges);
						console.log("done change:"+ change.get('changeObjectId'));
					} else {
						changeHanded();
					}
					
				}catch(err){
					console.log("skipping change:"+ change.get('changeObjectId'));
					reSkippedChanges.push(change);
					changeHanded();
				}
			},function(err){
				if(callback){
					callback(reSkippedChanges,err);
				}
			});
		},
        redoChange: function(changeObj,deletedObjects,unlinkedObjects,callback,skippedChanges){
			var dataManager = this;
			function handleChangeObject(){
				var operation = changeObj.get('operationType');
				if(operation === 'add'){
					dataManager.redoAdd(changeObj,true);
				}else if(operation === 'update'){
					dataManager.redoUpdate(changeObj,deletedObjects,unlinkedObjects,skippedChanges,true);
				} else {
					dataManager.redoDelete(changeObj,deletedObjects,unlinkedObjects,skippedChanges);
				}
				dataManager.get('rdfModel').redoChange(changeObj);
				if(callback){
					callback();
				}
			}
			var dataManager = DataManager.getDataManager();
			var version = dataManager.get('currentPlanVersion');
			var beepPackage = dataManager.get('initializedPackages').findWhere({ 'id': changeObj.get('beepPackage') });
			if(!beepPackage && changeObj.get('operationType') !== 'add' && changeObj.get('beepPackage') === changeObj.get('changeObjectId') && changeObj.get('beepPackageType')){
				var type = 'appbo/' + changeObj.get('beepPackageType').replace('_','/');
				var wsId = changeObj.get('beepPackage').substr(0,changeObj.get('beepPackage').lastIndexOf('@')+ 1);
	    		var vdmStore = dataManager.getVDMStore(wsId);
				try{
					dataManager.fetchDocumentFromPackage(changeObj.get('beepPackage'),type,version,changeObj.get('beepPackage'),type,vdmStore,{
						success:function(model){
							handleChangeObject();
						},
						error:function(error){
							console.log(error);
							bootbox.alert(dataManager.get('localeManager').get('packageDeleted'));
							//bootbox.alert("Package on server deleted, due to merges done by other user, reloading app");
							window.location.reload();
						},
						create:false
					});            	
				}catch(e){
					console.log(e);
					bootbox.alert(dataManager.get('localeManager').get('packageDeleted'));
					//bootbox.alert("Package on server deleted, due to merges done by other user, reloading app");
					window.location.reload();
				}
			}else{
				handleChangeObject();
			}
        },
       	redoAdd: function(changeObj,doSilent){
        	var changeValue = JSON.parse(changeObj.get('change'));
        	var objType = this.getChangeObjectModelType(changeObj); //eval('this.get(\'appNS\').' + changeObj.get('changeObjectType'));
        	//var instance = new objType({});
			var instance = new objType({'id':changeValue.id},{silent:true});
        	var attrPairs = _.pairs(changeValue);
        	for(var i=0;i<attrPairs.length;i++){
        		var attrPair = attrPairs[i];
				if(attrPair[1] instanceof Object){
					var objType = this.getChangeObjectModelType(changeObj,attrPair[1].type); //eval('this.get(\'appNS\').' + attrPair[1].type);
					if(objType){
						var val = objType.find({'id': attrPair[1].id});
						//instance.set(attrPair[0],val);
						instance.set(attrPair[0],val,{silent:doSilent});
					}
				}
				else{
					//instance.set(attrPair[0],attrPair[1]);
					instance.set(attrPair[0],attrPair[1],{silent:doSilent});
				}
        	}
			if(changeObj.get('beepPackage') === instance.get('id') && changeObj.get('beepPackage') === changeObj.get('changeObjectId')){
				var initPackage = DataManager.getDataManager().get('initializedPackages').findWhere({ 'id': changeObj.get('beepPackage') });
				if(!initPackage){
					DataManager.getDataManager().get('initializedPackages').add({'id':instance.get('id'),'version':parseInt(instance.get('version'))});
				}
				if(Backbone.Relational.instanceofmodel(instance,Backbone.Relational.store._types["beeppackage.BeepPackage"])){
				//if(instance.get('type') == "transformation_Plan"){
					this.savePlanArifactsData(instance.get('id'),DataManager.getDataManager().get("currentWorkspaceId"));
					window.loadedPackages[instance.get('id')] = true;
					//TODO create alternative workspace and rdfstore
					//DataManager.getDataManager().set("planPackages",planPackages);
				}
				
			}
			this.updateRDFWithInstance(changeObj,instance);
        },
		updateRDFWithInstance: function(changeObject,instance){
			var wsData = DataManager.getDataManager().getModelInitializedWSDataSync(instance);
			var rdfModel = wsData.get('rdfModel');
			if(rdfModel){	// sometimes to early called before initialization
				rdfModel.redoChange(changeObject);	
			}
		},
        setLawnchair: function(obj){
        	if(!obj || !(obj instanceof Backbone.Model || obj instanceof Backbone.Collection)){
        		return;
        	}
    		if(obj.get('type') === "com_vbee_filesystem_Workspace"){
        		obj.lawnchair = this.get('workspaceStore');
        	}
        	else if(obj.get('type') === "com_vbee_data_ChangeSet" || obj.get('type') === "com_vbee_data_ChangeObject"){
        		obj.lawnchair = this.get('actionStore');
        	}
        	else{

        		obj.lawnchair = this.get('vdmStore');
        	}
        },
        redoUpdate: function(changeObj,deletedObjects,unlinkedObjects,skippedChanges,doSilent){
        	var change = JSON.parse(changeObj.get('change'));
        	//console.log("rdo changeObj:" + JSON.stringify(changeObj.toJSON()));
        	var type = changeObj.get('changeObjectType');
        	var modelType = this.getChangeObjectModelType(changeObj); //eval('this.get(\'appNS\').' + type);
        	var changeObjId = changeObj.get('changeObjectId');
        	var obj = modelType.find({'id': changeObjId});
        	if(!obj){
				if(deletedObjects.includes(changeObjId) || this.getUnlinkedObjectsById(unlinkedObjects,changeObjId).includes(changeObjId)){
					return;
				}
        		console.log('missing object with id :' + changeObjId + type + ", will retry");
				if(skippedChanges){
					skippedChanges.add(changeObj);
				}else{
					throw "Conflicting merges done by other user, reloading app <br/>"+JSON.stringify(changeObj);
				}
				return;
        	}
        	this.setLawnchair(obj);
			var changePairs = _.pairs(change);
			for(var i=0;i<changePairs.length;i++){
				var changePair = changePairs[i];
				if(!changePair[1]){
					continue;
				}
				if(changePair[1].constructor === Array){
					var relation = modelType.getRelation(changePair[0]);
					var relatedModel = relation.relatedModel;
					for(var j=0;j<changePair[1].length;j++){
						//TODO

					}
				}
				else{
					if(changePair[1] instanceof Object){
						var objType = this.getChangeObjectModelType(changeObj,changePair[1].type); //eval('this.get(\'appNS\').' + changePair[1].type);
						var val;
						if(objType){
							val = objType.find({'id': changePair[1].id});
						}
						if(!changePair[1].relationOperation){
							if(objType){
								this.setLawnchair(obj);
								//obj.set(changePair[0],val);
								this.addUnlinkedObject(unlinkedObjects,obj,obj.get(changePair[0]))
								obj.set(changePair[0],val,{silent:doSilent});
							}
						}else{
							if(val){
								if(changePair[1].relationOperation === "add"){
									//obj.get(changePair[0]).add(val);
									obj.get(changePair[0]).add(val);
								}
								else{
									//obj.get(changePair[0]).remove(val);
									obj.get(changePair[0]).remove(val);
									this.addUnlinkedObject(unlinkedObjects,obj,val);
								}
							}
						}
					}
					else{
						//obj.set(changePair[0],changePair[1]);
						obj.set(changePair[0],changePair[1],{silent:doSilent});
						//console.log("chaned " + changePair[0] + " to :" + changePair[1]);
					}
				}
			}
			if(obj){
				this.updateRDFWithInstance(changeObj,obj);
			}
			
        },
		addUnlinkedObject:function(unlinkedObjects,object,child){
			if(!object || !child){
				return;
			}
			if(!unlinkedObjects[object.get('id')]){
				unlinkedObjects[object.get('id')] = [];
			}
			unlinkedObjects[object.get('id')].push(child.get('id'));
		},
        redoDelete: function(changeObj,deletedObjects,unlinkedObjects,skippedChanges,doSilent){
        	var change = JSON.parse(changeObj.get('previous'));
        	var type = change?change.type:null;
        	var modelType = this.getChangeObjectModelType(changeObj,type); //eval('this.get(\'appNS\').' + type);
        	var changeObjId = change?change['id']:null;
        	var obj = modelType?modelType.find({'id': changeObjId}):null;
			if(!obj){
				if(deletedObjects.includes(changeObjId) || this.getUnlinkedObjectsById(unlinkedObjects,changeObjId).includes(changeObjId)){
					return;
				}
				console.log('missing object with id :' + changeObjId);
				if(!skippedChanges){
					throw "Conflicting merges done by other user, reloading app "+changeObj.toString();
				}else{
					skippedChanges.add(changeObj);
				}
				return;
			}
			if(changeObj.get('beepPackage') === changeObjId && changeObj.get('beepPackage') === changeObj.get('changeObjectId')){
				var initPackage = DataManager.getDataManager().get('initializedPackages').findWhere({ 'id': changeObj.get('beepPackage') });
				if(initPackage){
					DataManager.getDataManager().get('initializedPackages').remove(initPackage);
				}
			}
        	this.setLawnchair(obj);
			/*var jsonObj = obj.toJSON();
			var exp = jsonata("**.id");
			var result;
			try{
				this.removeNestedParentsInJson(jsonObj);
				result = exp.evaluate(jsonObj);
			}catch(e){
				deletedObjects.push(changeObjId);
				console.log(e);
				console.log(JSON.stringify(jsonObj));
			}
			if(result){
				if(typeof(result) == 'string'){
					deletedObjects.push(result);
				}else{
					for(var id in result){
						deletedObjects.push(result[id]);
					}
				}
			}*/
        	obj.destroy({silent:doSilent});
			this.updateRDFWithInstance(changeObj,obj);
        },
		removeNestedParentsInJson: function(jsonObj){
			jsonObj.nestedParent = null;
			for(var key in jsonObj){
				if(jsonObj[key] instanceof Object){
					if(jsonObj[key].nestedParent){
						jsonObj[key].nestedParent = null;
					}
					this.removeNestedParentsInJson(jsonObj[key]);
				}
			}
		},
		getUnlinkedObjectsById:function(unlinkedObjects,id){
			var ret = unlinkedObjects[id];
			if(ret){
				for(var i=0;i<ret.length;i++){
					ret = ret.concat(this.getUnlinkedObjectsById(ret[i]));
				}
			}else{
				ret = [];
			}
			return ret;
		},  
        resetData : function(){
        	/*var changedObjects = this.get(this.CHANGED_OBJECTS);
        	var obj = changedObjects.pop();
        	while(obj){
        		obj.fetch();
        		obj = changedObjects.pop();
        	}
        	var parentObjects = this.get(this.CHANGED_PARENT_OBJECTS);
        	obj = parentObjects.pop();
        	while(obj){
        		obj.fetch();
        		obj = parentObjects.pop();
        	}*/
        },
        fetchDocumentFromStoreCache:function(docId,docTypePackage){
			var docType = docTypePackage.substr(docTypePackage.indexOf('/') + 1);
            docType = docType.replace(/[/_]/g, '.');
			var docTypeObj = Backbone.Relational.store.getObjectByName(docType);
			if(docTypeObj /*&& docTypeObj.length && docTypeObj.length > 0*/){
	        	return docTypeObj.find({id:docId});                
			}
			return null;
        },
        applyPackageCorrections:function(beepPackage,callback){
            var dataManager = this;
            var type = beepPackage.get('type');
            var currentVersion = beepPackage.get('version');
            var currentPackageVersion = (type === 'transformation_Plan') ? dataManager.get('currentPlanVersion') : dataManager.get('currentVDMVersion');
            function migrateToNextVersion() {
                dataManager.migratePackageFromVersion(beepPackage, type, currentVersion, function (obj) {
                    if (obj instanceof Backbone.RelationalModel) {
                        currentVersion++;
                        if (currentVersion < currentPackageVersion) {
                            migrateToNextVersion();
                        } else {
                            beepPackage.set('version', currentPackageVersion);
							dataManager.updatePackageReferenceVersion(beepPackage, currentPackageVersion);
                            if (callback) {
                                callback(beepPackage);
                            }
                        }
                    } else {
                        if (beepPackage.get('version') < currentVersion) {
                            beepPackage.set('version', currentVersion);
                            dataManager.updatePackageReferenceVersion(beepPackage, currentVersion);
                        }
                        bootbox.alert("failed to migrate package:" + beepPackage.get('name') + ". The following error occured: " + obj.toString());
                        console.log('Failed to migrate from version' + currentVersion + " pacakge" + beepPackage.get('name') + " please contact VDMBee.");
                        if (callback) {
                            callback(beepPackage);
                        }
                    }
                });
            }
            //setTimeout(migrateToNextVersion,1000);
            migrateToNextVersion();
        },
        updatePackageReferenceVersion: function(beepPackage,version){
            if (beepPackage.id.indexOf(window.plansKey) < 0) {
                var plan = DataManager.getDataManager().get('migrationPlan');
                if (plan) {
                    var phases = plan.get('phase');
                    phases.each(function (phase) {
                        var alts = phase.get('phaseAlternative');
                        alts.each(function (alt) {
                            var packRef = alt.get('phaseDesignPart').findWhere({beepReference:beepPackage.id});
                            if (packRef) {
                                packRef.set('version', version);
                            }
                        });
                    });
                }                
            }
            var initPackage = DataManager.getDataManager().get('initializedPackages').findWhere({ 'id': beepPackage.id });
            initPackage && initPackage.set('version', version);
        },
        migratePackageFromVersion: function (beepPackage, beepType, currentVersion, callback) {
            var dataManager = this;
            if(/*beepPackage.get('type') === "ecomap_EcoMap" || */beepPackage.get('type') === "beeppackage_CodeContainer" || beepPackage.get('type') === "concept_BeepVocabulary" || beepPackage.get('type') === 'report_BeepReport' || beepPackage.get('type') === "dashboard_Analytics"){
            	callback(beepPackage);
            }else {
	            var libVersion = Math.round(currentVersion / 1000);
	            var pack = beepType.substr(0, beepType.indexOf('_'));
	            var packName = beepType.substr(beepType.indexOf('_') + 1);
				var className = packName + currentVersion;
				//import('../../../../app/DynamicClass').then(DynamicClass => {
				import('../../../../app/DynamicClass').then(({ default: DynamicClass }) => {
					var migrationLibrary = DynamicClass.getView(className);
					//dataManager.get("require" + libVersion)(["require","appbo/" + pack + "/migration/" + packName + currentVersion], function (require,migrationLibrary) {
						if (migrationLibrary) {
							migrationLibrary.migrate(beepPackage, callback);
						} else {
							if (callback) {
								callback(beepPackage);
							}
						}
				 /* }, function (err) {
						if (callback) {
							callback(beepPackage);
						}*/
	            });
            }
        },
        checkForCorrectionSinglePackage: function (beepPackage, callback) {
            var dataManager = this;
            if (beepPackage.get('type') === 'transformation_Plan') {
                if (beepPackage.get('version') < dataManager.get('currentPlanVersion')) {
                    dataManager.applyPackageCorrections(beepPackage,callback);
                    return;
                }
            }else if(beepPackage.get('type') === 'ecomap_EcoMap'){
                if (beepPackage.get('version') < dataManager.get('currentVDMVersion')) {
                    dataManager.applyPackageCorrections(beepPackage, callback);
                    return;
                }
            } else {
                if (beepPackage.get('version') < dataManager.get('currentVDMVersion') && beepPackage.get('type') !== "beeppackage_BeepModule") {
                    dataManager.applyPackageCorrections(beepPackage, callback);
                    return;
                }
            }
            if (callback) {
                callback(beepPackage);
            }
        },
        checkForCorrection: function (beepPackage, dependentPackages, callback) {
            var dataManager = this;
            dataManager.checkForCorrectionSinglePackage(beepPackage, function () {
                async.eachSeries(dependentPackages, function (depPack, depPackageMigrated) {
                    dataManager.checkForCorrectionSinglePackage(depPack, function () {
                        depPackageMigrated();
                    });
                }, function () {
                    dependentPackages.length = 0;
                    if (callback) {
                        callback(beepPackage);
                    }
                });
            });

        },
        fetchDocumentFromPackage: function(beepPackageId,beepPacType,version,docId,docTypePackage,lawnchair,options,isDependent,dependentPackages){
            var dataManager = this;
            if (!dependentPackages) {
                dependentPackages = [];
            }
			var initializedModel = DataManager.getDataManager().get('initializedPackages').find({ id: beepPackageId, 'version': parseInt(version)});
            if (initializedModel && initializedModel.get('model') != null) {
                var cachedModel = dataManager.fetchDocumentFromStoreCache(docId, docTypePackage);
                if (cachedModel) {
                    if (options.success) {
                        options.success(cachedModel);
                    }
                    return;
                }
            }
   			if(_.indexOf(dataManager.deletingData,docId)>=0){
   				options.error();
   				return;
   			}
   			function handleDocumentLoading(vdmPackage, docType) {
   			    if (beepPackageId === docId && options.success) {
                     dataManager.set(dataManager.SUPPRESS_LOGGING, false);
   			        if (isDependent) {
   			            dependentPackages.push(vdmPackage);
   			            if (options.success) {
   			                options.success(vdmPackage);
   			            }
   			        } else {
   			            dataManager.checkForCorrection(vdmPackage, dependentPackages, options.success);
   			        }
   			    } else {
   			        var docTypeInstance = docType ? docType.find({ 'id': docId }) : '';
   			        dataManager.set(dataManager.SUPPRESS_LOGGING, false);
   			        if (docTypeInstance) {
   			            if (isDependent) {
   			                dependentPackages.push(vdmPackage);
   			                if (options.success) {
   			                    options.success(docTypeInstance);
   			                }
   			            } else {
   			                dataManager.checkForCorrection(vdmPackage, dependentPackages, function () {
   			                    if (options.success) {
   			                        options.success(docTypeInstance);
   			                    }
   			                });
   			            }
   			        } else {
   			            if (options.error) {
   			                options.error('Failed to load document');
   			            }
   			        }
   			    }
   			}
   			var fetchDocuments = function (beepPackageType, DM, docType) {
   			    if (docTypePackage === "appbo/vdml/ValueDeliveryModel" ||
                    docTypePackage === "appbo/transformation/Plan" ||
                    docTypePackage === "appbo/report/BeepReport" ||
                    docTypePackage === "appbo/concept/BeepVocabulary" ||
                    docTypePackage === "appbo/ecomap/EcoMap" ||
                    docTypePackage === "appbo/dashboard/Analytics" ||
                    docTypePackage === "appbo/beeppackage/CodeContainer") {
   			        docType = beepPackageType;
   			    }
   			    var initPackage = dataManager.get('initializedPackages').findWhere({ 'id': beepPackageId, 'version': parseInt(version) });
				var tryCount = 0;
   			    function getModel() {
					if(tryCount > 20){
						console.log("failed to get initipackage document "+beepPackageId);
						return
					}
   			        var initModel = initPackage.get('model');
   			        if (initModel) {
   			            handleDocumentLoading(initModel, docType);
   			            return;
   			        } else {
						tryCount++;
   			            setTimeout(getModel, 500);	// To avoid fetching from lawnchair twice
   			        }
   			    }
   			    if (initPackage && initPackage.get('loading') === true) {
   			        getModel();
   			        return;
   			    } else {
   			        initPackage && initPackage.set('loading', true);
   			    }

   			    DM.setDataManager(dataManager);
   			    dataManager.set(dataManager.SUPPRESS_LOGGING, true);
				var documentVersion = dataManager.get("currentPlan") ? dataManager.get("currentPlan").get("documentVersion") : 0;
				if(options.documentVersion){
					documentVersion = options.documentVersion;
				}
				beepPackageType.fetch.apply(beepPackageType, [{ 'id': beepPackageId, 'version': version, 'documentVersion':documentVersion}, lawnchair, {
   			        success: function (vdmPackage) {
						// TODO initialize datamanager.planpackages
                        var altId = window.utils.getPrefix(vdmPackage.get("id"));
                        var packRDFModel = DataManager.getDataManager().getRDFModel(altId);
						if(packRDFModel){
							packRDFModel.addRDFForModel(vdmPackage, function () {
								Backbone.Relational.store.register(vdmPackage);
								if (initPackage) {
									initPackage.set('model', vdmPackage);
									initPackage.set('loading', false);
								}
								// load dependent VDM packages
								handleDocumentLoading(vdmPackage, docType);
							},true);
						}else {
							if (options.error) {
								options.error('Failed to load document');
							}
						}
   			        },
   			        error: function () {
                        initPackage && initPackage.set('loading', false);
                        dataManager.get('initializedPackages').remove(initPackage);
                        var dummpyPackage = beepPackageType.find({ id: beepPackageId });
                        dummpyPackage && dummpyPackage.destroy();
   			            dataManager.set(dataManager.SUPPRESS_LOGGING, false);
   			            if (options.error) {
   			                options.error('Failed to load document');
   			            }
   			        },
					create: options.create
   			    }]);
   			};
			function loadClass(className,callback){
				import('../../../version1/bo/BOLoader').then(({ default: BOLoader }) => {
					callback(BOLoader.getBO(className));
				})
			}
		  	var loadDocument = function(){
				var beepPackageTypeLib;
				var libVersion = Math.round(version/1000);
				if(beepPacType){
					beepPackageTypeLib = dataManager.buildAppNsPath(beepPacType.substr(beepPacType.indexOf('/')+ 1).replace(/[\/]/g,'.'),"version" + libVersion);
				}else {
					beepPackageTypeLib = dataManager.buildAppNsPath('vdml.ValueDeliveryModel',"version" + libVersion);
				}
				
				if(!(beepPackageTypeLib && (beepPackageTypeLib.constructor.prototype !== Object.prototype))){
					beepPackageTypeLib = null;
				}
				//var dmLib = dataManager.get('appNS')['com']['vbee']['data']['DataManager'];
				var dmLib = DataManager;	//can't remember this is also loaded
				/*if(!(dmLib && (dmLib.constructor.prototype !== Object.prototype))){
					dmLib = null;
				}*/
                if (docTypePackage === "appbo/vdml/ValueDeliveryModel" || docTypePackage === "appbo/transformation/Plan" || docTypePackage === "appbo/report/BeepReport" || docTypePackage === "appbo/concept/BeepVocabulary" || docTypePackage === "appbo/ecomap/EcoMap" || docTypePackage === "appbo/dashboard/Analytics" || docTypePackage === "appbo/beeppackage/CodeContainer") {
					if(beepPackageTypeLib && dmLib){
						fetchDocuments(beepPackageTypeLib,dmLib);
					}else{
						//dataManager.get("require" + libVersion)([docTypePackage,"appcommon/com/vbee/data/DataManager"],fetchDocuments);
						var importPath = docTypePackage.replace("appbo","../../../version1/bo");
						loadClass(importPath,function(mod){
							fetchDocuments(mod,dmLib);
						});
					}
				}else{
					var typeLib = dataManager.buildAppNsPath(docTypePackage.substr(docTypePackage.indexOf('/')+ 1).replace(/[\/]/g,'.'),"version" + libVersion);
					if(!(typeLib && (typeLib.constructor.prototype !== Object.prototype))){
						typeLib = null;
					}
					if(beepPackageTypeLib && dmLib && typeLib){
						fetchDocuments(beepPackageTypeLib,dmLib,typeLib);
					}else if(beepPackageTypeLib && dmLib && !typeLib){
						function fetchLibs1(lTypeLib){
							fetchDocuments(beepPackageTypeLib,dmLib,lTypeLib);
						}
						//dataManager.get("require" + libVersion)([docTypePackage],fetchLibs1);
						var importPath = docTypePackage.replace("appbo","../../../version1/bo");
						loadClass(importPath,function(mod){
							fetchLibs1(mod)
						});
					}else if(dmLib && !beepPackageTypeLib && !typeLib){
						function fetchLibs2(lvdmlLib,lTypeLib){
							fetchDocuments(lvdmlLib,dmLib,lTypeLib);
						}
						//dataManager.get("require" + libVersion)([docTypePackage,dmLib],fetchLibs2);
						var importPath = docTypePackage.replace("appbo","../../../version1/bo");
						loadClass(importPath,function(mod){
							fetchLibs2(mod)
						});
					}else{
						//dataManager.get("require" + libVersion)([docTypePackage,"appcommon/com/vbee/data/DataManager",docTypePackage],fetchDocuments);
						var importPath = docTypePackage.replace("appbo","../../../version1/bo");
						loadClass(importPath,function(mod){
							fetchDocuments(mod,dmLib,mod);
						});
					}

				}
			};
			if(dataManager.get('initializedPackages').findWhere({'id':beepPackageId,'version':parseInt(version)})){
				loadDocument();
			}else{
				dataManager.get('initializedPackages').add({'id':beepPackageId,'version':parseInt(version)});
				if(beepPackageId){
				    dataManager.fetchRelatedPackages(beepPackageId, beepPacType, version, dependentPackages, loadDocument);
				}
			}
        },
		/*importWorkspace : function(){
			var dataManager = this;
			var email = dataManager.get("email");
			var currentWorkspaceId = dataManager.get("currentWorkspaceId");
			dataManager.get('vmpServerService').postAllPromise("/vdmbee/workspace/" + currentWorkspaceId).then(function() {
				dataManager.get('vmpServerService').getAllPromise("/vdmbee/workspace/" + currentWorkspaceId).then(function(data) {
					//debugger;
					var artifactsObjs = data._embedded.artifactResources;
					var artifacts = artifactsObjs.map(function(artifactObj){
						return artifactObj.content;
					})
					
					var plans = dataManager.getAllPlan(artifactsObjs);
					window.utils.startSpinner('importPlan', "Importing Plans ... ");	
					import('../../../version1/bo/transformation/PlanMixin').then(({PlanMixin})=>{
						async.eachSeries(plans,function(plan,handledArtifact){
							var planArtifacts =  dataManager.getPlanArtifacts(plan,artifacts);
							PlanMixin.createPlanFromFiles(planArtifacts, null, plan.name, plan.name,false,true, function () {
								Backbone.history.fragment = "";
								//var searchUrl = "search/null/null/null/0/Tag: \"Plan\"";
								//DataManager.getDataManager().get('router').navigate(searchUrl, { trigger: true });
								handledArtifact();
							});
						},function(e){
							window.utils.stopSpinner('importPlan');
						})
					});
				});
			})
		},
		getAllPlan : function(artifacts){
			var planArtifacts = [];
			for(var i=0;i<artifacts.length;i++){
				if(artifacts[i].type == "PLAN"){
					planArtifacts.push(artifacts[i]);
				}
			}
			return planArtifacts;
		},
		getPlanArtifacts : function(plan,artifacts){
			var ret = []
			var planPackages = plan.planPackage;
			for(var  i=0;i<planPackages.length;i++){
				for(var  j=0;j<artifacts.length;j++){
					if(planPackages[i].content.id == artifacts[j].id || plan.id == artifacts[j].id){
						if(!ret.includes(artifacts[j])){
							ret.push(artifacts[j]);
						}
					}
				}
			}
			return ret;
		},*/
        removeInitializedPackage:function(packageId){
			var initPack = DataManager.getDataManager().get('initializedPackages').get(packageId);
			if(initPack){
	        	initPack.destroy();
	        	initPack = null;        	
			}
        },
		setProject: function(project,callback){
			var dataManager = this;
			if(project && project !== ""){
				var currentWorkspace = dataManager.get('currentWorkspace').get('id');
				if(currentWorkspace !== project){
					var workspaceStore = dataManager.get("workspaceStore");
					window.getDefaultRepository(workspaceStore,callback,project,project);
				}else{
					callback();
				}
			}else{
				callback();
			}
		},
	
		fetchRelatedPackages: function (packageId, beepPacType, version, dependentPackages, callback) {
        	var self = this;
        	if(!packageId){
        		callback();
        		return;
        	}        	
        	var wsId = packageId.substr(0,packageId.lastIndexOf('@')+1);
        	var currentWorkspace = self.get('currentWorkspace').get('id');
        	
        	var loadPackages = function(results){
				async.eachSeries(results,function(pack,loadPackageCallback){
					var id = pack.id;
					var depPackType = beepPacType;
					var version = parseInt(pack.version);
					if(self.get('initializedPackages').findWhere({'id':id,'version':version})){
						loadPackageCallback();
						return;
					}
        			var alternativeId = id.substr(0,id.lastIndexOf('@')+1);
        			if(!version){
        				if(beepPacType.indexOf('Plan') > 0){
        					version = self.get('currentPlanVersion');	
        				}else{
        					version = self.get('currentVDMVersion');	
        				}
        			}
        			var vdmStore = self.get('vdmStore');
        			
        			if(currentWorkspace !== alternativeId){
        				self.getWorkspaceDataWithId(alternativeId,setVDMStoreAndFetchDependentPackage);
        			}else{
        				vdmStore = self.get('vdmStore');
        				//var rdfModel = self.get('rdfModel');
        				var rdfModel = self.getRDFModel(self.getRepositoryId(id));
        				if(rdfModel){
	        				rdfModel.getTypeOfSubject(id,function(type){
	        					depPackType = 'appbo/' + type.replace('_','/');
	        					fetchDocument(depPackType);
	        				});
        				}else{
        					fetchDocument(depPackType);	
        				}
        			}
        			function setVDMStoreAndFetchDependentPackage(wsData){
        				if (!wsData) {// can happen during delete of plan , for alt already deleted.
        					loadPackageCallback();
                            return;
                        }
        				vdmStore = wsData.get('vdmStore');
        				var rdfModel = wsData.get('rdfModel');
        				if(rdfModel){
	        				rdfModel.getTypeOfSubject(id,function(type){
	        					if(type){
									depPackType = 'appbo/' + type.replace('_','/');	        						
	        					}else {
	        						depPackType = null;
	        					}
	        					fetchDocument(depPackType);
	        				});
        				}else{
        					fetchDocument(depPackType);
        				}
        			}
        			function fetchDocument(packType){
        				// report condition was not there earlier?? can we test by common repository instead of beepVocabulary and beepreport?
        				/*if(beepPacType === "appbo/transformation/Plan" && packType !== "appbo/concept/BeepVocabulary"&& packType !== "appbo/ecomap/EcoMap" && packType !== "appbo/report/BeepReport"){
        					loadPackageCallback();
        					return;
        				}*/
        				if(!packType){
        					loadPackageCallback();
        					return;
        				}
						self.fetchDocumentFromPackage(id,packType,version,id,packType,vdmStore,{
							success:function(model){
								self.get('initializedPackages').add({'id':packageId,'version':version});
								loadPackageCallback();
							},
							error:function(error){
								console.log('Unable to load selected Package');
								loadPackageCallback();
							}
						}, true, dependentPackages);
        			}
        			
				},function(){
					if(results.length>0){
						setTimeout(callback,100);
					}else{
						callback();	
					}
				});
        	};
        	var count = 0;
			function waitAndInvoke(){
				var rdfModel = self.getRDFModel(wsId);
				if(!rdfModel){
					count++;
					if(count > 200){
						/*DataManager.getDataManager().getModelIdInitializedWSData(wsId,function(){
							waitAndInvoke();
						});*/
						console.log('Unable to load rdf for selected Package'+wsId);
						callback();
						return;
					}else {
						setTimeout(waitAndInvoke,10);
					}
					//setTimeout(waitAndInvoke,10);
				}else{
					rdfModel.getDependentPackages(packageId,version,loadPackages);		
				}
			}
        	waitAndInvoke();
        },
		addContextBarItem: function(label,classes){
			var navbarList = jQuery('#navbarlist');
			var listItemNode = jQuery("<li class=\"menu-item dropdown context\">");
			navbarList.append(listItemNode);
            var anchorNode = jQuery("<a  href=\"#\" class=\"dropdown-toggle" + (classes ? classes : "") + "\" style=\"font-size:medium;\" data-toggle=\"dropdown\">" + label + "<b class=\"caret\"></b></a>");
			listItemNode.append(anchorNode);
            var listNode = jQuery("<ul class=\"dropdown-menu nav navbar-nav\">");
			listItemNode.append(listNode);
			return listNode;
		},
        addContextBarMenu: function(classes,label,handler,signOrReg){
        	var actionsNode = jQuery('#navbarlist');
        	classes = (classes ? classes : "") + " context";
        	var menuId = window.utils.removeSpace(label);
        	if(jQuery("#navbarlist li#"+menuId).length > 0){
        		jQuery("#navbarlist li#"+menuId).remove();
        	}
        	if(signOrReg){
			   var menuItem = jQuery("<li id="+menuId+" title=\""+label+"\"><a class=\"" + classes + "\" style=\"cursor:pointer; font-size: medium;\">"+signOrReg+"</a></li>");
			}else{
			   var menuItem = jQuery("<li id="+menuId+" title=\""+label+"\"><a class=\"" + classes + "\" style=\"cursor:pointer; font-size: x-large;\"></a></li>");
			}
			actionsNode.append(menuItem);
        	menuItem.on('click',handler);
        },
        addContextMenu: function(classes,label,handler,list,customId){
        	var actionsNode = list;
            classes = (classes ? classes : "") + " context";
            var id = "show" + label;
			var id = customId?customId:"show" + label;
			if(actionsNode.find('#'+id).length > 0){
				list.find('#'+id).remove();
			}
			// var menuLabel = label === "Partners" || label === "My Account" ? "Management" : label;
        	var menuItem = jQuery("<li id =\""+ id +"\" title=\""+label+"\" ><a class=\"" + classes + "\"  style=\"cursor:pointer; font-size: medium;\">" + label+ "</a></li>");
        	actionsNode.prepend(menuItem);
        	menuItem.on('click',handler);
        },
        /*addContextSubMenu:function(id,classes,label){
        	var actionsNode = $("#actionsList");
        	classes = classes + " context";
        	var menuItem = $("<li class=\"menu-item dropdown dropdown-submenu\"><a href=\"#\" class=\""+ classes+"\" data-toggle=\"dropdown\">" + label+ "</a></li>");
		 	var listNode = $("<ul id=\"" + id + "\" class=\"dropdown-menu\"></ul>");
		    menuItem.append(listNode);
		    actionsNode.append(menuItem);
		    window.initializeMenus();
		    return listNode;
        },*/
        addContextBarMenuToNode: function(classes,label,id,handler){
        	var actionsNode = $('#'+id);
        	classes = (classes ? classes : "") + " pull-right context";
        	$('#'+id).addClass(classes);
        	$('#'+id).css({'cursor':'pointer','padding':'0px 10px 0px 0px'});
        	$('#'+id).attr('title',label);
        	/*var menuItem = $("<a style='color:white; cursor: pointer;' title="+label+" class=\"" + classes + "\"></a>");
        	actionsNode.append(menuItem);*/
        	actionsNode.on('click',handler);
        },
        clearContextMenus:function(){
        	var contextNode = jQuery(".context");
        	ko.unapplyBindings(contextNode,false);
       		contextNode.off().remove();
			//this.addContextMenu("", "Save", saveData, $('#navbarlist'));   
        },
        /*getAsyncTimer:function(methodName){
        	function asyncTimer(method){
        		this.method = method ? method : "Timer";
        		this.totalTime = 0;
        		this.iteration = 0;
        		this.startTime = 0;
        		this.endTime = 0;
        	}
        	asyncTimer.prototype.startTimer = function(){
        		console.log("startTimer: " + this.method);
        		this.startTime = new Date().getTime();
        		return this;
        	};
        	asyncTimer.prototype.stopTimer = function(){
        		this.endTime = new Date().getTime();
        		this.totalTime = this.totalTime + this.getDuration();
        		this.iteration++;
        		return this;
        	};
        	asyncTimer.prototype.getDuration = function(){
        		return this.endTime - this.startTime;
        	};
        	asyncTimer.prototype.getAverageDuration = function(){
        		return this.totalTime/this.iteration;
        	};
        	asyncTimer.prototype.print = function(){
        		if(this.iteration > 0){
	        		console.log(this.method + " took:" + this.getDuration() + "msec");
	        		if(this.iteration > 1){
	        			console.log(this.method + " took on average:" + this.getAverageDuration() + " msec");	
	        			console.log(this.method + " iterations:" + this.iteration + " iterations");	
	        		}
        		}
        	}
        	return new asyncTimer(methodName);
        },*/
        
		fetch: function() {		//arguments[1] can be an attribute string or object of attributes
		  var dataManager = this;
		  var docType = arguments[0];
		  var docId = arguments[1];
		  var lawnchair = arguments[2];
		  arguments.slice = [].slice;
		  var args = arguments.slice(1);
		  var callback = function(obj){
		  	var version =1000;
		  	if(obj.version){
		  		version = obj.version;
		  	}
		  	var libVersion = Math.round(version/1000);

			var typeLib = dataManager.buildAppNsPath(docType.substr(docType.indexOf('/')+ 1).replace(/[\/]/g,'.'),"version" + libVersion);
			if(!(typeLib && (typeLib.constructor.prototype !== Object.prototype))){
				typeLib = null;
			}
		  	function fetchInternal(docTypeLib,DM){
	  			DM.setDataManager(dataManager);
				docTypeLib.fetch.apply(docTypeLib,args);
		  	}
		  	if(typeLib){
		  		fetchInternal(typeLib,DataManager);
		  	}else{
		  		function fetchInternalWithDM(typeLib){
		  			fetchInternal(typeLib,DataManager);
		  		}
		  		dataManager.get("require" + libVersion)([docType],fetchInternalWithDM);
		  	}
		  };
		  lawnchair.get(docId, callback);
		}
    }, {
        getDataManager: function() {
            if (!Backbone.Relational.store.dataManager) {
                Backbone.Relational.store.dataManager = new DataManager();
            }
            return Backbone.Relational.store.dataManager;
        },
        setDataManager: function(dataManager) {
            if (!Backbone.Relational.store.dataManager || !Backbone.Relational.store.dataManager.getWorkspace()) {
                Backbone.Relational.store.dataManager = dataManager;
            }
        },
        getLanwnchairAdapters :function(){
            return ["html5-filesystem", "indexed-db","memory", "webkit-sqlite", "ie-userdata", "gears-sqlite", "window-name", "dom", "blackberry-persistent-store"];
        }
    });

    var __slice = [].slice;
    Backbone.Model.prototype.isNew = function() {
      if(!this.getNestedParent){	//just to check if its instanceof EObject, is there a better way?
      	return !this.has(this.idAttribute);
      }else{
      	return !this.get('s');
      }

    };
    var array = [];
    var slice = array.slice;
/*	Backbone.Model.prototype.trigger = function(name){
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      //if (allEvents) triggerEvents(allEvents.slice(allEvents.length-1), arguments);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;		
	};*/
	var eventSplitter = /\s+/;
	  // Implement fancy features of the Events API such as multiple event
	  // names `"change blur"` and jQuery-style event maps `{change: action}`
	  // in terms of the existing API.
	  var eventsApi = function(obj, action, name, rest) {
	    if (!name) return true;
	
	    // Handle event maps.
	    if (typeof name === 'object') {
	      for (var key in name) {
	        obj[action].apply(obj, [key, name[key]].concat(rest));
	      }
	      return false;
	    }
	
	    // Handle space separated event names.
	    if (eventSplitter.test(name)) {
	      var names = name.split(eventSplitter);
	      for (var i = 0, l = names.length; i < l; i++) {
	        obj[action].apply(obj, [names[i]].concat(rest));
	      }
	      return false;
	    }
	
	    return true;
	  };	
	  
	  var eObjectContext;
	  var triggerEvents = function(events, args) {
	    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
	    if(!eObjectContext){
	    	eObjectContext = Backbone.Relational.store.getCollection(Backbone.Relational.store.getObjectByName('cmof.EObject'));
	    }
	    switch (args.length) {
	      case 0: while (++i < l){
		      		if(events[i].context === eObjectContext) continue;
		      		(ev = events[i]).callback.call(ev.ctx); 
		      	}
		      	return;
	      case 1: while (++i < l){
		      		if(events[i].context === eObjectContext) continue;
		      		(ev = events[i]).callback.call(ev.ctx, a1); 
		      		}
	      		return;
	      case 2: while (++i < l){
		      		if(events[i].context === eObjectContext) continue;
		      			(ev = events[i]).callback.call(ev.ctx, a1, a2); 
		      		}
	      		return;
	      case 3: while (++i < l) {
	      		if(events[i].context === eObjectContext) continue;
	      		(ev = events[i]).callback.call(ev.ctx, a1, a2, a3); 
	      	}
	      	return;
	      default: while (++i < l){
	      		if(events[i].context === eObjectContext) continue;
	      		(ev = events[i]).callback.apply(ev.ctx, args);
	      	}
	    }
	  };	  
	  
	Backbone.RelationalModel.fetch = function() {	//???TODO why did I change Model.fetch to RelationalModel.fetch
	  var args,_this = this;
	  var docId = arguments[0], lawnchair = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];

	  function fetchFromLawnchair() {
	    var item;
	    var newId;
		var docVer;
	    var version;
	    if(typeof docId ==='object'){
	    	newId = docId.id;
	    	version = docId.version;
			docVer = docId.documentVersion;
	    }else{
	    	newId = docId;
	    }	    
	    item = new _this({s:1,id:newId,documentVersion: docVer ? docVer : 0});
	    item.lawnchair = lawnchair;
	    if(typeof docId ==='object'){
	    	item.version = version;
			item.documentVersion = docVer;
	    }
	    item.fetch.apply(item, args);
	    item.destroy = Backbone.RelationalModel.prototype.destroy;
	    return item;
	  }
	  //var ret = _this.find(docId);
	  var ret;
	  if(typeof docId === 'object'){
          ret = _this.find(docId, { silent: true, create: false});	// making silent to avoid trigggers while fetching
	  }else{
	  	ret = _this.find({id:docId},{silent:true,create:false});	// making silent to avoid trigggers while fetching
	  }

	  if(ret)
	  {
	  	args[0].success(ret);
	  }
	  else
	  {
	  	fetchFromLawnchair(args);
	  }
	};

/*	_.mixin({templateFromUrl: function (url, data, settings) {
	    var templateHtml = "";
	    this.cache = this.cache || {};

	    if (this.cache[url]) {
	        templateHtml = this.cache[url];
	    } else {
	        $.ajax({
	            url: url,
	            method: "GET",
	            async: false,
	            success: function(data) {
	                templateHtml = data;
	            }
	        });

	        this.cache[url] = templateHtml;
	    }

	    return _.template(templateHtml, data, settings);
	}});*/

	function getReferedObject(value,relationOperation,changeObj){
		if(value == undefined){
			return null;
		}
		if(value instanceof Backbone.Model){
			var ret = new Object();
			ret.id = value.get('id');
			ret.type = value.get('type');
			if(!changeObj.refParents){
				changeObj.refParents = [];
			}
			var nestParentId = value.getNestedParent().get('id');
			if(changeObj.refParents.indexOf(nestParentId) == -1){
				changeObj.refParents.push(nestParentId);
			}
			if(relationOperation){
				ret.relationOperation = relationOperation;
			}
			return ret;
		}
		else{
			return value;
		}
	}

	function getPropertyPair(property,propertyPairs){
		if(!propertyPairs){
			return;
		}
		for(var i=0;i<propertyPairs.length;i++){
			var pair = propertyPairs[i];
			if(property === pair[0])
			{
				return pair;
			}
		}
		return null;
	}
	function setChanges(obj,model,operationType,changedAttributes,previousAttributes,addWitoutReferences){
		var ret = {};
		var previousRet = {};

		var changeObj;
		var previousObj;
		if(operationType === 'update'){
			changeObj = changedAttributes;
			if(!changeObj){
				changeObj = model.changedAttributes();
			}
			previousObj = previousAttributes;
			if(!previousObj){
				previousObj	= model.previousAttributes();
			}
			if(changeObj['_previousAttributes']){	//TODO :to avoid circular objs deleting
				delete changeObj['_previousAttributes'];
			}
			if(changeObj['changed']){ //TODO :to avoid circular objs deleting whyis this?
				delete changeObj['changed'];
			}
		}
		else if(operationType === 'add') {
			if(addWitoutReferences){
				obj.set('change',JSON.stringify(model));
				return;
			}
			changeObj = model.attributes;
		}else{
			changeObj = model.attributes;				// contains normal properties
			previousObj = model.previousAttributes();	// for relations that are set to null on delete
		}

		if(typeof changeObj === "boolean"){
			return;
		}
		var propertyPairs = _.pairs(changeObj);
		var previousPropertyPairs;

		if(operationType !== 'add'){
			previousPropertyPairs = _.pairs(previousObj);
		}

		for(var i=0;i<propertyPairs.length;i++){
			var pair = propertyPairs[i];
			var prevPair = getPropertyPair(pair[0],previousPropertyPairs);
			if((pair[0].indexOf('_') === 0) || typeof pair[1] === "function"){
				continue;
			}else
			if ((pair[1] && pair[1].constructor === Array) || (prevPair && prevPair[1] && prevPair[1].constructor === Array)) {
				continue;	//todo
			}
			else
			if((pair[1] && pair[1] instanceof Backbone.Collection) || (prevPair && prevPair[1] && prevPair[1] instanceof Backbone.Collection)){
				ret[pair[0]] = new Array();
				for(var j=0;j< pair[1].length;j++){
					ret[pair[0]].push( getReferedObject(pair[1].at(j),null,obj));
				}
				if(operationType === 'update'){
					previousRet[pair[0]] = new Array();
					if(prevPair){
						for(var j=0;j< prevPair[1].length;j++){
							ret[pair[0]].push(getReferedObject(prevPair[1].at(j),null,obj));
						}
					}
				}
			}
			else{
				if(pair[1] == null && model._relations[pair[0]] && !changedAttributes){	//changedAttributes is special case when model is deleted 
					var key = model._relations[pair[0]].keyContents;
					var refModel;
					if(key instanceof Backbone.Model){
						refModel = key;	
					}else if(jQuery.isPlainObject(key)){
						refModel = model._relations[pair[0]].relatedModel.find({id:key.id});
					}else {
						if(typeof key === 'string'){
							refModel = model._relations[pair[0]].relatedModel.find({id:key});
						}
					}
					if(refModel){
						pair[1]= refModel;
					}
				}
				ret[pair[0]] = getReferedObject(pair[1],null,obj);
				if(operationType === 'update'){
					var prevPair = getPropertyPair(pair[0],previousPropertyPairs);
					if(prevPair){
						previousRet[pair[0]] = getReferedObject(prevPair[1],null,obj);
					}
					else{

					}
				}
			}
		}

		if(operationType === 'destroy'){
			for(var i=0;i<previousPropertyPairs.length;i++){
				var pair = previousPropertyPairs[i];
				if((pair[0].indexOf('_') === 0) || typeof pair[1] === "function"){
					continue;
				}else
				if (pair[1] && pair[1].constructor === Array) {
					continue;	//todo
				}
				else
				if(pair[1] && pair[1] instanceof Backbone.Collection){
					ret[pair[0]] = new Array();
					for(var j=0;j< pair[1].length;j++){
						ret[pair[0]].push(getReferedObject(pair[1].at(j),null,obj));
					}
				}
				else{
					ret[pair[0]] = getReferedObject(pair[1],null,obj);
				}
			}
		}
		if(operationType !== 'destroy'){
			obj.set('change',JSON.stringify(ret),{silent:true});	
		}else{
			obj.set('previous',JSON.stringify(ret),{silent:true}); 
		}

		if(operationType === 'update'){
			obj.set('previous',JSON.stringify(previousRet),{silent:true});		
		}
	}
	/*function customExtendsFunc(obj) {
		var length = arguments.length;
		if (length < 2 || obj == null) return obj;
		for (var index = 1; index < length; index++) {
			var source = arguments[index];
			var proto = Object.getPrototypeOf(source);
			var keys = Object.getOwnPropertyNames(proto);
			for (var key in keys) {
			  var methodName = keys[key];
			  if (obj[methodName] === void 0) obj[methodName] = proto[methodName];
			}
		}
		return obj;
	}
	_ = _.mixin({
		customExtends: customExtendsFunc
	});*/

    //return DataManager;
//});
export {DataManager};