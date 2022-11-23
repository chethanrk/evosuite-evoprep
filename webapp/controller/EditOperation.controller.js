sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/DialogFormController",
	"sap/ui/core/mvc/OverrideExecution"
], function (DialogFormController, OverrideExecution) {
	"use strict";
	return DialogFormController.extend("com.evorait.evosuite.evoprep.controller.EditOperation", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onChangeSmartField: {
					public: true,
					final: true
				}
			}
		},

		_type: {
			edit: true
		},

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when controller initialized
		 */
		onInit: function () {
			DialogFormController.prototype.onInit.apply(this, arguments);
		},

		/**
		 * Called when controller destroyed
		 */
		onExit: function () {
			DialogFormController.prototype.onExit.apply(this, arguments);

		},

		/* =========================================================== */
		/* Events                                                      */
		/* =========================================================== */

		/**
		 * @param oEvent
		 */
		onChangeSmartField: function (oEvent) {
			
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binding has changed in TemplateRenderController
		 * Set new controller context and path
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			DialogFormController.prototype._changedBinding.apply(this, arguments);

			if (!oData || !this.getView().getParent()) {
				return;
			}

			if (oData && oData.viewNameId === this._sViewNameId) {
				this._getDefaultGlobalParameters();
				this._oParentContext = this.getView().getParent().getParent().getBindingContext().getObject();

				//Edit specific logic
				if (this._type.edit) {

				}
			}
		}

	});
});