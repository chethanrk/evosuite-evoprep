sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlan", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {

			}
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlan
		 */
		onInit: function () {
			this.getModel("viewModel").setProperty("/isCreatePage", false);
			var oRouter = this.getRouter();
			oRouter.getRoute("PrePlanMaster").attachMatched(this._routeMatchedPlan, this);
			oRouter.getRoute("PrePlanDetail").attachMatched(this._routeMatchedPlan, this);
			oRouter.getRoute("CreatePrePlan").attachMatched(this._routeMatchedCreatePlan, this);

		},
		
		/**
		 * Route match for the create plan page
		*/
		_routeMatchedCreatePlan: function () {
			this.getModel("viewModel").setProperty("/isCreatePage", true);
		},
		
		/**
		 * Route match for the other than the create plan page
		*/
		_routeMatchedPlan: function () {
			this.getModel("viewModel").setProperty("/isCreatePage", false);
		}
	});
});