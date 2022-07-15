sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/f/library",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, library, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanMaster", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				showLongText: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onClickTableRow: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onCreatePrePlanPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		onInit: function () {

		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * Called on click of Long text indicator
		 * @param oEvent
		 */
		showLongText: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var longText = oContext.getProperty("NOTES");
			this.displayLongText(longText);
		},

		/**
		 * Event for the table row click
		 * Navigate to detail page with selected plan details
		 */
		onClickTableRow: function (oEvent) {
			var sPlanId = oEvent.getSource().getBindingContext().getProperty("PLAN_ID");
			this.getRouter().navTo("PrePlanDetail", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plan: sobjectKeyId
			});
		},

		/**
		 * Bellow both methods should be remove while actula code implementation
		 * simulate to reouting 
		 */
		onPressComapre: function (oEvent) {
			this.getRouter().navTo("PrePlanCompare", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plans: "01"
			});
		},

		/**
		 * Navigating to Create PrePlan View on Click of Create PrePlan Button
		 */
		onCreatePrePlanPress: function () {
			this.getRouter().navTo("CreatePrePlan");
		}
	});
});