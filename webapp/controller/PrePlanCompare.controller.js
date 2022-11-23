sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanCompare", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onPressClose: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanCompare
		 */
		onInit: function () {
			this.getModel("viewModel").setProperty("/busy", false);
		},

		/**
		 * Called when close comapre page 
		 */
		onPressClose: function (oEvent) {
			BaseController.prototype.onPressClose.apply(this, arguments);
			this.getModel("compareModel").setProperty("/compare", []);
			this.getModel("compareModel").setProperty("/compare0", []);
		}

	});

});