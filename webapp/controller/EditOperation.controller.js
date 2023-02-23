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
			var oSource = oEvent.getSource(),
				oBinding = oSource.getBindingInfo("value")["binding"],
				newDate = new Date(oEvent.getParameter("newValue")),
				sMsg = this.getView().getModel("i18n").getResourceBundle().getText("msg.oprDateValidation"),
				oOrigData = this.getModel().getData(oBinding.getContext().getPath()),
				sPath = oBinding.getPath(),
				compareDate, result;

			if (sPath === 'START_DATE') {
				compareDate = oOrigData.EARLIEST_END_DATE;
				result = Boolean(newDate > compareDate);
			} else if (sPath === 'END_DATE') {
				compareDate = oOrigData.EARLIEST_START_DATE;
				result = Boolean(newDate < compareDate);
			}
			if (result) {
				this.showMessageToast(sMsg);
				this.getModel().resetChanges();
				return;
			}
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

				//Edit specific logic
				if (this._type.edit) {
					//any firther logic related edit functionality
				}
			}
		}

	});
});