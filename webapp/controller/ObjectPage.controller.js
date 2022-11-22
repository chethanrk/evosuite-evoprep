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

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 *  on init
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			if (!this.oViewModel.getProperty("/bObjectPageRouteMatchAttached")) {
				this.getRouter().attachRouteMatched(function (oEvent) {
					this.oViewModel.setProperty("/bObjectPageRouteMatchAttached", true);
					var sRouteName = oEvent.getParameter("name"),
						oArgs = oEvent.getParameter("arguments");

					if (this["_set" + sRouteName + "PageInfo"]) {
						this["_set" + sRouteName + "PageInfo"](sRouteName, oArgs);
					}

				}.bind(this));
			}

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
			this.getModel("viewModel").setProperty("/layout", oArgs.layout);
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
			var aPlans = JSON.parse(oArgs.plans),
				sViewName = "";

			this.getModel("viewModel").setProperty("/layout", oArgs.layout);
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
				oFilters;

			aPlans.forEach(function (sPlan) {
				aFilters.push(new Filter("ObjectKey", FilterOperator.EQ, sPlan));
			});

			oFilters = new Filter({
				filters: aFilters,
				and: false
			});
			this.getModel("viewModel").setProperty("/busy", true);
			this.getOwnerComponent().readData("/ComparePlanGeneralSet", [oFilters], {
				"$expand": "PlanCmprGeneralToPlanCmprOperation,PlanCmprGeneralToPlanCmprWorkCenter"
			}).then(function (data) {
				if (data && data.results) {
					data.results = this.formatTableData(data.results);

					this.getModel("compareModel").setProperty("/compare", data.results);
					this.getModel("compareModel").setProperty("/compareProperty", [data.results[0]]);

					this.getModel("compareModel").setProperty("/entitySet", "ComparePlanGeneralSet");
					this.getModel("viewModel").setProperty("/fullscreenGantt", false);
					this.getModel("viewModel").setProperty("/busy", false);

					this._getCompareOPLineItems("ComparePlanOperationSet");
					this._getCompareWCLineItems("ComparePlanWorkcenterSet");

					this._onRouteMatched(sViewName, "ComparePlanGeneralSet");
				}

			}.bind(this)).catch(function (oError) {
				this.getModel("compareModel").setProperty("/compare", []);
				this.getModel("compareModel").setProperty("/compareProperty", []);
				this._onRouteMatched(sViewName, "ComparePlanGeneralSet");
			}.bind(this));
		},

		/**
		 * create pre plan page
		 */
		_setCreatePrePlanPageInfo: function (sRouteName, oArgs) {
			this.getModel("viewModel").setProperty("/layout", oArgs.layout);
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
        
        /**
		 * Change logs page
		 */
		_setChangeLogsPageInfo: function (sRouteName, oArgs) {
			this.getModel("viewModel").setProperty("/layout", oArgs.layout);
			this._setPrePlanDetailPageInfo(sRouteName, oArgs);
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
		 * Format the original data according to compare screen
		 * @[param] - aData data to be proccess
		 * @return [aMain] - formatted data
		 */
		formatTableData: function (aData) {
			var aMain = [];
			aData.forEach(function (oItem) {
				var aOpr = [],
					aWctr = [],
					oItemCopy = deepClone(oItem);
				//copy valid data to the plan
				aOpr = deepClone(oItem.PlanCmprGeneralToPlanCmprOperation.results);
				aWctr = deepClone(oItem.PlanCmprGeneralToPlanCmprWorkCenter.results);

				aData.forEach(function (oPlanItem) {
					if (oItem.ObjectKey !== oPlanItem.ObjectKey) {
						var aOprRes = deepClone(oPlanItem.PlanCmprGeneralToPlanCmprOperation.results);
						var aWcrRes = deepClone(oPlanItem.PlanCmprGeneralToPlanCmprWorkCenter.results);
						//copy additional operations data to the plan
						aOprRes.forEach(function (oInnerData) {
							if (this._findOperationObjectToInsert(aOpr, oInnerData)) {
								oInnerData.SUM_OPR_DURATION = "-";
								aOpr.push(oInnerData);
							}
						}.bind(this));
						//copy additional utilization(workcentre and empty week) data to the plan
						aWcrRes.forEach(function (oInnerData) {
							if (this._findObjectToInsert(aWctr, oInnerData)) {
								oInnerData.UTILIZATION = "-";
								aWctr.push(oInnerData);
							}
						}.bind(this));
					}
				}.bind(this));
				//Prepare new formatted data ina array
				oItemCopy.PlanCmprGeneralToPlanCmprOperation.results = deepClone(aOpr);
				oItemCopy.PlanCmprGeneralToPlanCmprWorkCenter.results = deepClone(aWctr);
				aMain.push(oItemCopy);
			}.bind(this));
			return aMain;
		},

		/**
		 * find the different objects in the array
		 * @param[aData] plan specific data
		 * @param{oItem} other plan items
		 * @return boolean
		 */
		_findObjectToInsert: function (aData, oItem) {
			var bValidate = true;
			aData.forEach(function (oDataItem) {

				if (oDataItem.PLAN_ID !== oItem.PLAN_ID && oDataItem.WORKCENTRE === oItem.WORKCENTRE && oDataItem.MODE === oItem.MODE &&
					bValidate) {
					bValidate = false;
				}
			});
			return bValidate;
		},

		/**
		 * find the different objects in the array
		 * @param[aData] plan specific data
		 * @param{oItem} other plan items
		 * @return boolean
		 */
		_findOperationObjectToInsert: function (aData, oItem) {
			var bValidate = true;
			aData.forEach(function (oDataItem) {

				if (oDataItem.PLAN_ID !== oItem.PLAN_ID && oDataItem.WORKCENTRE === oItem.WORKCENTRE && bValidate) {
					bValidate = false;
				}
			});
			return bValidate;
		}
	});
});