sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/TemplateRenderController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution"
], function (TemplateRenderController, Fragment, OverrideExecution) {
	"use strict";

	return TemplateRenderController.extend("com.evorait.evosuite.evoprep.controller.DialogTemplateRenderController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {

				constructor: {
					public: true,
					final: true
				},

				open: {
					public: true,
					final: true
				},

				onPressClose: {
					public: true,
					final: true
				},

				onPressSave: {
					public: true,
					final: true
				}
			}
		},


		_oDialog: null,

		_oResourceBundle: null,

		_oView: null,

		_oModel: null,

		_mParams: {},

		/**
		 * overwrite constructor
		 * set manuel owner component for nested xml views
		 */
		constructor: function (oComponent) {
			this.setOwnerComponent(oComponent);
			TemplateRenderController.apply(this, arguments);

			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.subscribe("DialogTemplateRendererEvoPrep", "savingConfirmed", this._savingConfirmed, this);
		},

		/**
		 * open dialog 
		 * and render annotation based SmartForm inside dialog content
		 */
		open: function (oView, mParams) {
			this._oView = oView;
			this._oModel = oView.getModel();
			this._oViewController = oView.getController();
			this._oResourceBundle = this._oViewController.getOwnerComponent().getModel("i18n").getResourceBundle();
			this._mParams = mParams;

			//set annotation path and other parameters
			this.setTemplateProperties(mParams);
			var mDialogParams = {
				draggable: false,
				resizable: false,
				verticalScrolling: true,
				horizontalScrolling: true,
				stretch: false
			};
			oView.getModel("viewModel").setProperty("/dialog", mDialogParams);

			this._loadDialog();
		},

		/**
		 * load dialog fragment
		 * or get bacl already loaded dialog fragment
		 */
		onPressClose: function () {
			this._oContext = this._oDialog.getBindingContext();
			this._oModel.resetChanges();

			if (this._oContext) {
				var oData = this._oContext.getObject();
				if ((oData && !oData.ObjectKey) || this._oContext.bCreated === true) {
					this._oModel.deleteCreatedEntry(this._oContext);
				}
			}
			this._oDialog.close();
		},

		/**
		 * Save SmartForm
		 */
		onPressSave: function (oEvent) {
			this._saveDialogChanges(this._mParams);
		},

		onExit: function () {
			TemplateRenderController.prototype.onExit.apply(this, arguments);
			this._oDialog.destroy(true);
			this._oDialog = undefined;
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * trigger saving for this dialog
		 * @param mParams
		 */
		_saveDialogChanges: function (mParams) {
			var oContentView = this._oDialog.getContent()[0],
				oContentContext = oContentView.getBindingContext(),
				oViewController = oContentView.getController(),
				aForms = oViewController.getAllSmartForms(oContentView.getControlsByFieldGroupId("smartFormTemplate"));

			if (aForms.length > 0 && oViewController.validateForm) {
				var mErrors = oViewController.validateForm(aForms);
				if (mParams) {
					//special cases when there is a confirm dialog between
					for (var key in mParams) {
						mErrors[key] = mParams[key];
					}
				}
				if (oContentContext && (oContentContext.getPath().indexOf("('id-") > 0)) {
					mErrors.isCreate = true;
					mErrors.oContext = oContentContext;
				}
				//if form is valid save created entry
				oViewController.saveChanges(mErrors, this._saveSuccessFn.bind(this, mErrors), this._saveErrorFn.bind(this), this._oDialog);
			}
		},

		/*
		 * init dialog with right fragment name
		 * and set context to the view
		 * @returns {sap.ui.core.Control|sap.ui.core.Control[]}
		 * @private
		 */
		_loadDialog: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.FormDialog",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._oDialog = oFragment;
					this._oDialog.addStyleClass(this._oView.getModel("viewModel").getProperty("/densityClass"));
					this._setFragmentViewBinding();
				}.bind(this));
			} else {
				this._setFragmentViewBinding();
			}
		},

		/**
		 * load new template and set inside dialog
		 * Bind dialog view to generated path
		 */
		_setFragmentViewBinding: function () {
			var sPath = this.getEntityPath(this._mParams.entitySet, this._mParams.pathParams, this._oView, this._mParams.sPath);

			this._oDialog.setBusy(true);
			this._oDialog.unbindElement();
			this._oDialog.bindElement(sPath);
			this._oDialog.setTitle(this._oResourceBundle.getText(this._mParams.title));
			this._oView.addDependent(this._oDialog);

			//Set save button text if different text needs to be displayed using param saveButtonText
			sap.ui.getCore().byId("formDialogSaveBtn").setText(this._oResourceBundle.getText(this._mParams.saveButtonText ? this._mParams.saveButtonText :
				"btn.save"));

			this._oModel.metadataLoaded().then(function () {
				//get template and create views
				this._mParams.oView = this._oView;
				this.insertTemplateFragment(sPath, this._mParams.viewName, "FormDialogWrapper", this._afterBindSuccess.bind(this), this._mParams);
			}.bind(this));

			this._oDialog.open();
		},

		/**
		 * show confirm dialog in special cases
		 * @params mParams
		 */
		_savingConfirmed: function (sChannel, sEvent, oData) {
			this._saveDialogChanges(oData.mParams);
		},

		/**
		 * What should happen after binding changed
		 */
		_afterBindSuccess: function () {
			this._oDialog.setBusy(false);
		},

		/**
		 * Saving was successful
		 * do further things after save
		 * @param oResponse
		 */
		_saveSuccessFn: function (oParam, oResponse) {
			this._oDialog.close();
		},

		/**
		 * Saving failed
		 * do further things after save
		 * @param oError
		 */
		_saveErrorFn: function (oError) {}

	});
});