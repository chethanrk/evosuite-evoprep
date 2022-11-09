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
				entitySet: "PlanHeaderSet",
				path: "com.sap.vocabularies.UI.v1.Facets#PrePlanDetailTabs",
				headerPath: "com.sap.vocabularies.UI.v1.HeaderFacets#CompareHeader"
			});

			var filters = new Filter("CREATED_BY", FilterOperator.EQ, "SMEGHARAJ");

			this.getOwnerComponent().readData("/PlanHeaderSet", [filters], {
				"$expand": "PlanHeaderToPlanItems"
			}).then(function (data) {
				data.results = this.formatTableData(data.results);
				this.formatthecode(data.results);
				this.getModel("compareModel").setProperty("/compare", data.results);
				var y = [];
				y.push(data.results[0]);
				this.getModel("compareModel").setProperty("/compare0", y);
				this.getModel("compareModel").setProperty("/entitySet", "PlanHeaderSet");
				this.getModel("viewModel").setProperty("/fullscreenGantt", false);
				this._getCompareLineItems("PlanItemsSet");
				this._onRouteMatched(sViewName, "PlanHeaderSet");
			}.bind(this));
		},

		formatthecode: function (data) {
			var allData = [];
			data.forEach(function (oItem) {
				allData.push();
			});
		},

		formatTableData: function (aData) {
			var aMain = [];
			aData.forEach(function (oItem) {
				var aOpr = [],
					oItemCopy = deepClone(oItem);

				aOpr = deepClone(oItem.PlanHeaderToPlanItems.results);

				aData.forEach(function (oPlanItem) {
					if (oItem.ObjectKey !== oPlanItem.ObjectKey) {
						//aOpr = aOpr.concat(oPlanItem.PlanHeaderToPlanItems.results);
						var data = deepClone(oPlanItem.PlanHeaderToPlanItems.results);
						data.forEach(function (oInnerData) {
							oInnerData.OPERATION_WORK = "";
							aOpr.push(oInnerData);
						});
					}
				});
				//console.log(aOpr);
				oItemCopy.PlanHeaderToPlanItems.results = deepClone(aOpr);
				aMain.push(oItemCopy);
			}.bind(this));
			return aMain;
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

		/* get line item from compare entityset 
		 * @private
		 */
		_getCompareLineItems: function (sEntitySet) {
			var oTempModel = this.getModel("templateProperties"),
				oModel = this.getModel();

			oTempModel.setProperty("/CompareConfigs", {});
			oTempModel.setProperty("/CompareConfigs/entitySet", sEntitySet);

			//collect all tab IDs
			oModel.getMetaModel().loaded().then(function () {
				var oMetaModel = oModel.getMetaModel(),
					oEntitySet = oMetaModel.getODataEntitySet(sEntitySet),
					oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType),
					aLineItems = oEntityType["com.sap.vocabularies.UI.v1.LineItem"];
				if (aLineItems) {
					oTempModel.setProperty("/CompareConfigs/lineItems", aLineItems);
				}
			}.bind(this));
		}
	});
});