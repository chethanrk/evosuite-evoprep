sap.ui.define([
	//	"sap/ui/core/mvc/Controller"
	"com/evorait/evosuite/evoprep/controller/BaseController"
], function (BaseController) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.block.planning.PlanningsBlockController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onClickExpandCollapse: {
					public: true,
					final: true
				},
				onShowDependencies: {
					public: true,
					final: true
				}
			}
		},
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		onInit: function () {
			this._treeTable = this.getView().byId("idPlanningGanttTreeTable");
			this._axisTime = this.getView().byId("idPlanningGanttZoom");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onExit: function() {
		//
		//	}

		/* =========================================================== */
		/* Public methods                                           */
		/* =========================================================== */

		/**
		 * On click on expand the tree nodes gets expand to level 1
		 * On click on collapse all the tree nodes will be collapsed to root.
		 * @param oEvent
		 */
		onClickExpandCollapse: function (oEvent) {
			var oButton = oEvent.getSource(),
				oCustomData = oButton.getCustomData();
			if (oCustomData[0].getValue() === "EXPAND" && this._treeTable) {
				this._treeTable.expandToLevel(1);
			} else {
				this._treeTable.collapseAll();
			}
		},

		/**
		 * On click on Hide/Show Dependencies, Relationships will be hidden and shown
		 * @param oEvent
		 */
		onShowDependencies: function (oEvent) {
			var oSource = oEvent.getSource(),
				sButtonText = oSource.getText(),
				oResourceBundle = this.getResourceBundle();
			if (sButtonText === oResourceBundle.getText("xbut.hideDependencies")) {
				this.getModel("viewModel").setProperty("/bShowDependencies", false);
				oSource.setText(oResourceBundle.getText("xbut.showDependencies"));
			} else {
				this.getModel("viewModel").setProperty("/bShowDependencies", true);
				oSource.setText(oResourceBundle.getText("xbut.hideDependencies"));
			}
		},

	});

});