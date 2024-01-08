sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/TemplateRenderController",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/util/deepClone"
], function (TemplateRenderController, OverrideExecution, Filter, FilterOperator, deepClone) {
	"use strict";

	return TemplateRenderController.extend("com.evorait.evosuite.evoprep.controller.ObjectPage", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {

			}
		},

		oViewModel: null,
		oEventBus: null,
		sRouteName: null,
		oArgs: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 *  on init
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			this.oEventBus = sap.ui.getCore().getEventBus();
			if (!this.oViewModel.getProperty("/bObjectPageRouteMatchAttached")) {
				this.getRouter().attachRouteMatched(function (oEvent) {
					this.oViewModel.setProperty("/bObjectPageRouteMatchAttached", true);
					this.sRouteName = oEvent.getParameter("name");
					this.oArgs = oEvent.getParameter("arguments");

					if (this["_set" + this.sRouteName + "PageInfo"]) {
						this["_set" + this.sRouteName + "PageInfo"](this.sRouteName, this.oArgs);
					}
					this.oViewModel.setProperty("/sCurrentView", this.sRouteName);
				}.bind(this));
			}
			this.oEventBus.subscribe("ObjectPage", "refreshComparePlanPage", this._refreshComparePlanPage, this);
		},

		/**
		 * life cycle event before view rendering
		 */
		onBeforeRendering: function () {},

		/**
		 * Object after rendering
		 */
		onAfterRendering: function () {},

		/**
		 * Object on exit
		 */
		onExit: function () {
			TemplateRenderController.prototype.onExit.apply(this, arguments);
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * route matching
		 * @param oEvent
		 * @param sViewName
		 * @param sEntitySet
		 * @param mParams
		 * @private
		 */
		_onRouteMatched: function (sViewName, sEntitySet, mParams) {
			this.oViewModel.setProperty("/fullscreen", true);
			this.oViewModel.setProperty("/busy", true);
			this.getModel().metadataLoaded().then(function () {
				var sPath = null;
				if (mParams) {
					mParams = mParams === "new" ? null : mParams;
					sPath = this.getEntityPath(sEntitySet, mParams);
				}

				//get template and create views
				this.insertTemplateFragment(sPath, sViewName, "ObjectPageWrapper", this._afterBindSuccess.bind(this));
			}.bind(this));
		},

		_afterBindSuccess: function () {
			this.oViewModel.setProperty("/busy", false);
		},

		/**
		 * pre plan detail page
		 */
		_setPrePlanDetailPageInfo: function (sRouteName, oArgs) {
			this.oViewModel.setProperty("/layout", oArgs.layout);
			var sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanDetail#Plan",
				mParams = {
					ObjectKey: oArgs.plan
				},
				sEntitySet = "GanttHierarchySet";

			if (oArgs.plan) {
				sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanDetail#Plan";
				this.getModel("templateProperties").setProperty("/annotationPath", {
					entitySet: "PlanHeaderSet",
					path: "com.sap.vocabularies.UI.v1.Facets#PrePlanDetailTabs",
					headerPath: "com.sap.vocabularies.UI.v1.HeaderFacets#PrePlanDetailHeader"
				});
			}
			//wait for backend request
			this.getOwnerComponent().oSystemInfoProm.then(function () {
				this._onRouteMatched(sViewName, "PlanHeaderSet", mParams);
				this._getGanttLineItems(sEntitySet);
				this._getUtilizationGanttLineItems("WorkCenterSet");
			}.bind(this));
		},

		/**
		 * pre plan compare page
		 */
		_setPrePlanComparePageInfo: function (sRouteName, oArgs) {
			var aPlans = JSON.parse(window.decodeURIComponent(oArgs.plans)),
				sViewName = "";

			this.oViewModel.setProperty("/layout", oArgs.layout);
			sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanCompare#Plans" + new Date().getTime();

			this.getModel("templateProperties").setProperty("/annotationPath", {
				entitySet: "ComparePlanGeneralSet",
				path: "com.sap.vocabularies.UI.v1.Facets#PlanCompareTabs",
				headerPath: "com.sap.vocabularies.UI.v1.HeaderFacets#CompareHeader"
			});

			this._getCompareData(aPlans, sViewName);
		},

		/**
		 * Get compare details with filter
		 * @[param] aPlans - array of selected plan 
		 * @ sViewName - sViewName view to navigate
		 */
		_getCompareData: function (aPlans, sViewName) {
			var aFilters = [],
				oFilters,
				oCompareModel = this.getModel("compareModel"),
				bdefaultExpandMode;

			aPlans.forEach(function (sPlan) {
				aFilters.push(new Filter("ObjectKey", FilterOperator.EQ, sPlan));
			});

			oFilters = new Filter({
				filters: aFilters,
				and: false
			});
			this.oViewModel.setProperty("/busy", true);
			this.getOwnerComponent().readData("/ComparePlanGeneralSet", [oFilters], {
				"$expand": "PlanCmprGeneralToPlanCmprOperation,PlanCmprGeneralToPlanCmprWorkCenter"
			}).then(function (data) {
				if (data && data.results) {
					bdefaultExpandMode = this.getModel("user").getProperty("/DEFAULT_COMPARE_EXPAND");
					
					this._getCollapsedData(deepClone(data.results));
					oCompareModel.setProperty("/compareOriginal", data.results);
					
					oCompareModel.setProperty("/compare", bdefaultExpandMode ? oCompareModel.getProperty("/compareOriginal") : oCompareModel.getProperty(
						"/compareCollapsed"));
					oCompareModel.setProperty("/compareProperty", bdefaultExpandMode ? [oCompareModel.getProperty("/compareOriginal")[0]] : [
						oCompareModel.getProperty("/compareCollapsed")[0]
					]);

					oCompareModel.setProperty("/entitySet", "ComparePlanGeneralSet");
					this.oViewModel.setProperty("/fullscreenGantt", false);
					this.oViewModel.setProperty("/busy", false);

					this._getCompareOPLineItems("ComparePlanOperationSet");
					this._getCompareWCLineItems("ComparePlanWorkcenterSet");

					this._onRouteMatched(sViewName, "ComparePlanGeneralSet");
				}
			}.bind(this)).catch(function (oError) {
				this.oViewModel.setProperty("/fullscreenGantt", false);
				this.oViewModel.setProperty("/busy", false);
				this._onRouteMatched(sViewName, "ComparePlanGeneralSet");
			}.bind(this));
		},

		/**
		 * create pre plan page
		 */
		_setCreatePrePlanPageInfo: function (sRouteName, oArgs) {
			this.oViewModel.setProperty("/layout", oArgs.layout);
			this._getCretaeOpAnnotations().then(function () {
				var sViewName = "com.evorait.evosuite.evoprep.view.templates.CreatePrePlan#CreatePrePlan";
				this.getModel("templateProperties").setProperty("/annotationPath", {
					entitySet: "PlanHeaderSet",
					path: "com.sap.vocabularies.UI.v1.Facets#Create"
				});
				this._onRouteMatched(sViewName, "PlanHeaderSet", "new");
			}.bind(this));
		},

		/**
		 * set in oDataModel different batch groups 
		 * for handling create requests of notification and children
		 */
		_getCretaeOpAnnotations: function () {
			return new Promise(function (resolve) {
				this.getOwnerComponent().oTemplatePropsProm.then(function () {
					var oTempModel = this.getModel("templateProperties"),
						mTabs = oTempModel.getProperty("/Configs/Tabs"),
						oModel = this.getModel();

					//collect all tab IDs
					oModel.getMetaModel().loaded().then(function () {
						mTabs.forEach(function (tab, idx) {
							var sEntitySet = tab.entitySet,
								oMetaModel = oModel.getMetaModel(),
								oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
								oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
								aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];

							if (aLineItems) {
								oTempModel.setProperty("/Configs/Tabs/" + idx + "/lineItems", aLineItems);
							}
						});
					}.bind(this));
				}.bind(this));
				resolve();
			}.bind(this));
		},

		/* get line item from Gantt entityset 
		 * @private
		 */
		_getGanttLineItems: function (sEntitySet) {
			var oTempModel = this.getModel("templateProperties"),
				oModel = this.getModel();

			oTempModel.setProperty("/ganttConfigs", {});
			oTempModel.setProperty("/ganttConfigs/entitySet", sEntitySet);

			//collect all tab IDs
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				if (aLineItems) {
					oTempModel.setProperty("/ganttConfigs/lineItems", aLineItems);
				}
			}.bind(this));
		},

		/* get line item from Utilization Gantt entityset 
		 * @private
		 */
		_getUtilizationGanttLineItems: function (sEntitySet) {
			var oTempModel = this.getModel("templateProperties"),
				oModel = this.getModel();

			oTempModel.setProperty("/ganttUtilizationConfigs", {});
			oTempModel.setProperty("/ganttUtilizationConfigs/entitySet", sEntitySet);

			//collect all tab IDs
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				if (aLineItems) {
					oTempModel.setProperty("/ganttUtilizationConfigs/lineItems", aLineItems);
				}
			}.bind(this));
		},

		/* get line item from compare entityset 
		 * @private
		 */
		_getCompareOPLineItems: function (sEntitySet) {
			var oTempModel = this.getModel("templateProperties"),
				oModel = this.getModel();

			oTempModel.setProperty("/OperationConfigs", {});
			oTempModel.setProperty("/OperationConfigs/entitySet", sEntitySet);

			//collect all tab IDs
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				if (aLineItems) {
					oTempModel.setProperty("/OperationConfigs/lineItems", aLineItems);
				}
			}.bind(this));
		},

		/* get line item from compare entityset 
		 * @private
		 */
		_getCompareWCLineItems: function (sEntitySet) {
			var oTempModel = this.getModel("templateProperties"),
				oModel = this.getModel();

			oTempModel.setProperty("/WorkcenterConfigs", {});
			oTempModel.setProperty("/WorkcenterConfigs/entitySet", sEntitySet);

			//collect all tab IDs
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				if (aLineItems) {
					oTempModel.setProperty("/WorkcenterConfigs/lineItems", aLineItems);
				}
			}.bind(this));
		},

		/**
		 * Manage collapse and expand data
		 * @param [aData] compare plan data
		 */
		_getCollapsedData: function (aData) {
			var aWcr = [];
			return new Promise(function (resolve) {
				aData.forEach(function (oPlan) {
					oPlan.PlanCmprGeneralToPlanCmprWorkCenter.results.forEach(function (oItem) {
						if (!oItem.MODE) {
							aWcr.push(oItem);
						}
					}.bind(this));
					oPlan.PlanCmprGeneralToPlanCmprWorkCenter.results = aWcr;
					aWcr = [];
				});
				this.getModel("compareModel").setProperty("/compareCollapsed", aData);
			}.bind(this));
		},

		/**
		 * This is a event bus method to refresh the compare plan page
		 */
		_refreshComparePlanPage: function(){
			this._setPrePlanComparePageInfo(this.sRouteName, this.oArgs);
		}
	});
});