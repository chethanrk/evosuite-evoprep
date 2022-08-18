sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/base/util/isEmptyObject"
], function (BaseController, Controller, isEmptyObject) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlockController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				addOperations: {
					public: true,
					final: true
				},
				onPressEdit: {
					public: true,
					final: true
				}
			}
		},

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

		/* =========================================================== */
		/* Public methods                                              */
		/* =========================================================== */

		/**
		 * Opens popup to add operation in demand list
		 */
		addOperations: function () {},

		/**
		 * Sends the changed data to backend
		 */
		onPressEdit: function (oEvent) {
			var bEdit = oEvent.getParameter("editable");
			if (!bEdit && !isEmptyObject(this.getModel().getPendingChanges())) {
				this.saveChangesMain({
					state: "success",
					isCreate: false
				}, this._afterEditSuccess.bind(this), this._afterEditError.bind(this), this._oSmartTable);
			}
		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * After operation edit success callback
		 */
		_afterEditSuccess: function () {
			this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
			if (this._oSmartTable) {
				this._oSmartTable.rebindTable(true);
			}
			this.getModel().resetChanges();
		},

		/**
		 * After operation edit error callback
		 */
		_afterEditError: function () {
			if (this._oSmartTable) {
				this._oSmartTable.rebindTable(true);
			}
			this.getModel().resetChanges();
		},
	});

});