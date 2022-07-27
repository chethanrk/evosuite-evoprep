sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/f/library"
], function (BaseController, library) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanDetail", {
		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onPressHeaderEdit: {
					public: true,
					final: true
				},
				_validateDates: {
					public: true,
					final: true
				},
				onSavePrePlanHeaderEdit: {
					public: true,
					final: true
				},
				submitPrePlanHeaderEditChanges: {
					public: true,
					final: true
				},
				_clearData: {
					public: true,
					final: true
				},
			}
		},

		oViewModel: null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onAfterRendering: function () {
			this._initializeView();
		},

		/**
		 * when view was integrated set additional page parameters
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
		},
		
		/*
		Validating Header Dates 
		*/
		_validateDates: function () {
			var sPath = this.getView().getBindingContext().getPath(),
				sStartDate = this.getModel().getProperty(sPath + "/START_DATE"),
				sEndDate = this.getModel().getProperty(sPath + "/END_DATE"),
				oStartDate = this.getFormFieldByName("idSTART_DATE", this.aSmartForms),
				oEndData = this.getFormFieldByName("idEND_DATE", this.aSmartForms);

			if (oStartDate) {
				oStartDate.getContent().setMaxDate(sStartDate);
			}
			if (oEndData) {
				oEndData.getContent().setMinDate(sEndDate);
			}

		},

		/*On Press of Header Edit Button
		 */
		onPressHeaderEdit: function (oEvent) {
			var oSource = oEvent.getSource();
			if (oSource.getIcon() === "sap-icon://edit") {
				oSource.setIcon("sap-icon://display");
				this.setFormsEditable(this.aSmartForms, true);
				this._validateDates();
			} else {
				this.onSavePrePlanHeaderEdit();
			}
			this.oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
			this.oViewModel.setProperty("/fullscreen", false);

		},

		onSavePrePlanHeaderEdit: function () {
			this._showConfirmMessageBox(this.getResourceBundle().getText("ymsg.savePrePlanHeaderEdit")).then(function (resolve) {
				if (sap.m.MessageBox.Action.YES === resolve) {
					this.submitPrePlanHeaderEditChanges();
				} else {
					this._clearData();
				}
			}.bind(this));
		},

		/*
		Saving Edited Header Data Using Submit Changes	
		*/
		submitPrePlanHeaderEditChanges: function () {
			if (this.aSmartForms.length > 0) {
				var oModel = this.getModel(),
					oResourceBundle = this.getResourceBundle(),
					mErrors = this.validateForm(this.aSmartForms);
				//if form is valid save created entry
				if (mErrors.state === "success") {
					if (oModel.hasPendingChanges()) {
						this.oViewModel.setProperty("/busy", true);
						this.getModel().submitChanges({
							success: function (oData, oResponse) {
								this.oViewModel.setProperty("/busy", false);
								sap.m.MessageBox.success(oResourceBundle.getText("ymsg.saveSuccessPrePlanHeaderEdit"));
								this._clearData();
							}.bind(this),
							error: function (oError) {
								this.oViewModel.setProperty("/busy", false);
							}
						});
					} else {
						sap.m.MessageToast.show(oResourceBundle.getText("ymsg.noChangesPrePlanHeaderEdit"));
					}
				} else {
					sap.m.MessageToast.show(oResourceBundle.getText("ymsg.invalidChangesPrePlanHeaderEdit"));
				}
			}
		},

		/*
		Resetting Header Form 
		*/
		_clearData: function () {
			this.getView().byId("idStatusEdit").setIcon("sap-icon://edit");
			this.getModel().resetChanges();
			this.setFormsEditable(this.aSmartForms, false);
		},
		
		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		//	onExit: function() {
		//
		//	}

	});

});