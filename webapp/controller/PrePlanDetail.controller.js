sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/f/library"
], function (BaseController, Fragment, OverrideExecution, library) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanDetail", {
		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onPressHeaderEdit: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onSavePrePlanHeaderEdit: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				submitPrePlanHeaderEditChanges: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				oPressDetailDelete: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressChangeStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onSelectChangeStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		oViewModel: null,
		_oContext: null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onAfterRendering: function () {
			this._initializeView();
		},
		/**
		 * Called when a controller is destroyed
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);

			if (this._actionSheetStatus) {
				this._actionSheetStatus.destroy(true);
				this._actionSheetStatus = null;
			}
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * when view was integrated set additional page parameters
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
		},

		/*
		Validating Header Dates 
		Setting Max and Min Dates for Header Start Date and End Dates
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
		 * @param oEvent
		 */
		onPressHeaderEdit: function (oEvent) {
			var oSource = oEvent.getSource();
			if (oSource.getIcon() === "sap-icon://edit") {
				oSource.setIcon("sap-icon://display");
				this.setFormsEditable(this.aSmartForms, true);
				this._validateDates();
				this.oViewModel.setProperty("/editMode", false);
			} else {
				this.onSavePrePlanHeaderEdit();
			}
			this.oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
			this.oViewModel.setProperty("/fullscreen", false);
		},

		/**
		 * Called before saving edited header data 
		 * Confirmation Pop-Up before Saving Edited Data
		 */
		onSavePrePlanHeaderEdit: function () {
			var successFn = function () {
				this.submitPrePlanHeaderEditChanges();
			};

			var cancelFun = function () {
				this._clearData();
			};

			this.showConfirmDialog("Confirm", this.getResourceBundle().getText("ymsg.savePrePlanHeaderEdit"), successFn.bind(this), cancelFun.bind(
				this));

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
						this.saveChangesMain(mErrors, this._saveSuccess.bind(this));
					} else {
						sap.m.MessageToast.show(oResourceBundle.getText("ymsg.noChangesPrePlanHeaderEdit"));
					}
				} else {
					sap.m.MessageToast.show(oResourceBundle.getText("ymsg.invalidChangesPrePlanHeaderEdit"));
				}
			}
		},
		/**
		 * Event triggered after header data is updated successfully and to refresh the context
		 * @private
		 */
		_saveSuccess: function () {
			var oResourceBundle = this.getResourceBundle();
			sap.m.MessageBox.success(oResourceBundle.getText("ymsg.saveSuccessPrePlanHeaderEdit"));
			this._clearData();
		},

		/*
		Resetting Header Form 
		*/
		_clearData: function () {
			this.getView().byId("idStatusEdit").setIcon("sap-icon://edit");
			this.getModel().resetChanges();
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", true);
		},

		/**
		 * Detail page delete functionality
		 */
		oPressDetailDelete: function () {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedPrepLan");

			if (this._oContext) {
				var successFn = function () {
					this.deleteEntries([this._oContext], null).then(function () {
						this.nav2Master();
					}.bind(this));
				};
				this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
			}
		},

		/**
		 * show ActionSheet of status buttons
		 * @param oEvent
		 */
		onPressChangeStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._actionSheetStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.StatusChange",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetStatus.openBy(oButton);
			}
		},

		/**
		 * Event triggered when user or system status dropdown is clicked/selected
		 * @param oEvent
		 */
		onSelectChangeStatus: function (oEvent) {
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item");
			this.sFunctionKey = oItem ? oItem.data("key") : oSource.data("key");

			this._updateStatus();
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * TemplateRenderer changedBinding Event
		 * set new this._oContext
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoPrep" && sEvent === "changedBinding") {
				var sViewName = this.getView().getViewName() + "#" + this.getView().getId();

				if (!oData) {
					return;
				}

				if (oData.viewNameId === sViewName) {
					this._oContext = this.getView().getBindingContext();
					this._rebindPage();
				}
			}
		},

		/**
		 * Method called to rebind the page with data.
		 * Set View model property with the new bound data.
		 * Fetch System Information and update the View Model.
		 *
		 */
		_rebindPage: function () {
			this._oContext = this.getView().getBindingContext();
			if (!this._oContext) {
				return;
			}
			var objData = this._oContext.getObject();
			//set user status button functions only when it's enabled
			this.getOwnerComponent().oSystemInfoProm.then(function (oUser) {
				this.oViewModel.setProperty("/showStatusButton", false);
				if (oUser.ENABLE_STATUS_CHANGE) { //Formation of mPreplanAllows object
					var mPreplanAllows = {};
					Object.keys(objData).forEach(function (key) {
						if (key.startsWith("ALLOW_")) {
							mPreplanAllows[key] = objData[key];
						}
					});
					this.oViewModel.setProperty("/PrePlanAllows", mPreplanAllows);
					this._setStatusButtonVisibility(mPreplanAllows);
				}

			}.bind(this));
		},

		/* set visibility on user status change dropdown 
		 * items based on allowance from order status
		 * @param oData
		 */
		_setStatusButtonVisibility: function (oData) {
			//when functionSet of status was laoded
			this.getOwnerComponent().oFunctionSetProm.then(function () {
				var aAvailableStatus = this.getModel("templateProperties").getProperty("/functionsSet/userStatus");
				//loop on all ALLOW_ fields in order with user status set from loaded FunctionSet
				for (var key in oData) {
					if (aAvailableStatus && aAvailableStatus.length > 0) {
						aAvailableStatus.forEach(function (oItem) {
							if (key.indexOf(oItem.Function) >= 0 && (oData[key] === true || oData[key] === "X")) {
								this.oViewModel.setProperty("/showStatusButton", true);
							}
						}.bind(this));
					}
				}
			}.bind(this));
		},

		/**
		 * function to update the satus
		 */
		_updateStatus: function () {
			var oData = this._oContext.getObject(),
				sPath = this._oContext.getPath(),
				message = "";
			this._oContext = this.getView().getBindingContext();

			if (oData["ALLOW_" + this.sFunctionKey]) {
				this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);
				this.saveChangesMain({
					state: "success",
					isCreate: false
				}, this._afterUpdateStatus.bind(this));
			} else {
				message = this.getResourceBundle().getText("msg.workorderSubmitFail", oData.PLAN_ID);
				this.addMsgToMessageManager(this.mMessageType.Error, message, "/PreplanList");
			}
		},

		/**
		 * Event triggered when status updated successfully and to refresh the status dropdown
		 * @private
		 */
		_afterUpdateStatus: function (oRes) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showMessageToast(msg);

			this.getOwnerComponent().readData(this._oContext.getPath()).then(function (mResult) {
				if (mResult) {
					this._rebindPage();
					this._setStatusButtonVisibility(mResult);
				}
			}.bind(this));
		}
	});

});