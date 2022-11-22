sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, Fragment, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.DialogFormController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				isSmartFieldEditable: {
					public: true,
					final: false
				}
			}
		},

		oTemplateModel: null,

		_oDialog: null,

		_aSmartForms: [],

		_oContext: null,

		_sPath: null,

		_mParams: {},

		_type: {},

		_selectedEntitySet: null,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Dialog form on init
		 */
		onInit: function () {
			this.oTemplateModel = this.getModel("templateProperties");

			//SmartForm is editable
			this._aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));

			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
		},

		/**
		 * life cycle event for view destroy
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
		},

		/* =========================================================== */
		/* Events                                                      */
		/* =========================================================== */

		/**
		 * formatter function
		 */
		isSmartFieldEditable: function () {
			return true;
		},

		/**
		 * Dialog default properties
		 */
		setDefaultDialogProps: function () {
			var mDialogParams = {
				draggable: false,
				resizable: false,
				verticalScrolling: true,
				horizontalScrolling: true,
				stretch: false
			};
			this.getModel("viewModel").setProperty("/dialog", mDialogParams);

		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * Binding has changed in TemplateRenderController
		 * Set new controller context and path
		 * and load plant and new operation number when required
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoPrep" && sEvent === "changedBinding") {
				this._sViewNameId = this.getViewUniqueName();

				if (oData.viewNameId === this._sViewNameId) {
					//SmartForm is editable
					this._aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
					this.setFormsEditable(this._aSmartForms, true);
				}
			}
		},

		/**
		 * Set all controller globals information for dialog
		 * like context and dialog control
		 */
		_getDefaultGlobalParameters: function () {
			//get new binding context
			this._oContext = this.getView().getBindingContext();
			if (!this._oContext) {
				return;
			}
			this._sPath = this._oContext.getPath();

			//global parameters
			this._mParams = this.oTemplateModel.getProperty("/tempData");
			//is it add, edit, copy or split
			for (var key in this._type) {
				if (this._type.hasOwnProperty(key)) {
					this._type[key] = key === this._mParams.type;
				}
			}

			// Selected entity set
			this._selectedEntitySet = this._mParams.entitySet;
			//get dialog control
			this._oDialog = this.getView().getParent();
			if (this._oDialog) {
				this._oDialog.setContentWidth("auto");
			}
		}

	});
});