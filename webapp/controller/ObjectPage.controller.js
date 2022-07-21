sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/TemplateRenderController",
	"sap/ui/core/mvc/OverrideExecution"
], function (TemplateRenderController, OverrideExecution) {
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
				};

			if (oArgs.plan) {
				sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanDetail#Plan_" + oArgs.plan;
				this.getModel("templateProperties").setProperty("/annotationPath", {
					entitySet: "PlanHeaderSet",
					path: "com.sap.vocabularies.UI.v1.Facets#PrePlanDetailTabs_" + oArgs.plan,
					headerPath: "com.sap.vocabularies.UI.v1.HeaderFacets#PrePlanDetailHeader_" + oArgs.plan
				});
			}
			//wait for backend request
			this.getOwnerComponent().oSystemInfoProm.then(function () {
				this._onRouteMatched(sViewName, "PlanHeaderSet", mParams);
			}.bind(this));
		},

		/**
		 * pre plan compare page
		 */
		_setPrePlanComparePageInfo: function (sRouteName, oArgs) {
			oArgs.plan = "00000000000000000005";
			this.getModel("viewModel").setProperty("/layout", oArgs.layout);
			var sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanCompare#Plans",
				mParams = {
					ObjectKey: oArgs.plan
				};

			if (oArgs.plan) {
				sViewName = "com.evorait.evosuite.evoprep.view.templates.PrePlanCompare#Plans_" + oArgs.plan;
				this.getModel("templateProperties").setProperty("/annotationPath", {
					entitySet: "PlanHeaderSet",
					path: "com.sap.vocabularies.UI.v1.Facets#PrePlanCompareTabs_" + oArgs.plan,
					headerPath: "com.sap.vocabularies.UI.v1.HeaderFacets#PrePlanCompareHeader_" + oArgs.plan
				});
			}
			//wait for backend request
			this.getOwnerComponent().oSystemInfoProm.then(function () {
				this._onRouteMatched(sViewName, "PlanHeaderSet", mParams);
			}.bind(this));
		},

		/**
		 * create pre plan page
		 */
		_setCreatePrePlanPageInfo: function (sRouteName, oArgs) {
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
		}
	});
});