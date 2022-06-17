sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/f/library"
], function (BaseController, library) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanMaster", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		onInit: function () {

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		//	onExit: function() {
		//
		//	}

		/**
		 * Bellow both methods should be remove while actula code implementation
		 * simulate to reouting 
		 */
		onPressDetail: function () {
			this.getView().getParent().getParent().removeAllMidColumnPages();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("PrePlanDetail", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plan: "01"
			});
		},

		onPressComapre: function () {
			this.getView().getParent().getParent().removeAllMidColumnPages();
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("PrePlanCompare", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plans: "01"
			});
		},

		/**
		 * Navigating to Create PrePlan View on Click of Create PrePlan Button
		 */
		onCreatePrePlanPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("createPrePlan");
		}
	});
});