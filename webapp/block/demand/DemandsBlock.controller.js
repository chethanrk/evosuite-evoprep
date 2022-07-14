sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlock", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				addOperations: {
					public: true,
					final: true
				}
			}
		}

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		onInit: function () {
			this._oSmartTable = this.getView().byId("idDemandBlockSmartTable");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		//	onExit: function() {
		//
		//	}

		/* =========================================================== */
		/* Public methods                                           */
		/* =========================================================== */

		/**
		 * Opens popup to add operation in demand list
		 */
		addOperations: function () {
			// var mParams = {
			// 	viewName: this.setViewNameWithOrderType("com.evorait.evosuite.evoprep.view.templates.DialogContentWrapper#AddEditTime"),
			// 	// annotationPath: this.setViewNameWithOrderType("com.sap.vocabularies.UI.v1.Facets#AddOperation"),
			// 	entitySet: "PlanItemsSet",
			// 	controllerName: "PrePlanDetail",
			// 	title: "tit.addOperation",
			// 	type: "add",
			// 	section: "demand",
			// 	smartTable: this._oSmartTable
			// };
			// this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
		}

	});

});