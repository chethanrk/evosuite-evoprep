/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/core/mvc/OverrideExecution",
	"com/evorait/evosuite/evoprep/model/formatter",
	"sap/base/util/deepClone",
	"sap/f/library",
	"sap/ui/core/Fragment",
], function (Controller, History, Dialog, Button, Text, MessageToast, MessageBox, OverrideExecution, formatter, deepClone, library,
	Fragment) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evoprep.controller.BaseController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {

				getRouter: {
					public: true,
					final: true
				},

				getModel: {
					public: true,
					final: true
				},

				setModel: {
					public: true,
					final: true
				},

				getResourceBundle: {
					public: true,
					final: true
				},

				clearAllMessages: {
					public: true,
					final: true
				},

				openMessageManager: {
					public: true,
					final: true
				},

				showMessageToast: {
					public: true,
					final: true
				},
				onNavBack: {
					public: true,
					final: true
				},
				confirmEditCancelDialog: {
					public: true,
					final: true
				},
				nav2Master: {
					public: true,
					final: true
				},
				onAboutIconPress: {
					public: true,
					final: true
				},
				open: {
					public: true,
					final: true
				},
				onCloseDialog: {
					public: true,
					final: true
				},
				onMessageManagerPress: {
					public: true,
					final: true
				},

				displayLongText: {
					public: true,
					final: true
				},
				onShowDemandsPress: {
					public: true,
					final: true
				},
				onPressFullScreen: {
					public: true,
					final: true
				},
				onPressClose: {
					public: true,
					final: true
				},
				getAllSmartForms: {
					public: true,
					final: true
				},
				setFormsEditable: {
					public: true,
					final: true
				},
				validateForm: {
					public: true,
					final: true
				},
				getFormFieldByName: {
					public: true,
					final: true
				},
				CreatePrePlan: {
					public: true,
					final: true
				},
				showConfirmDialog: {
					public: true,
					final: true
				},
				getBatchChangeResponse: {
					public: true,
					final: true
				}
			}
		},

		formatter: formatter,

		onInit: function () {
			//Bind the message model to the view and register it
			if (this.getOwnerComponent) {
				this.getOwnerComponent().registerViewToMessageManager(this.getView());
			}
		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			if (this.getOwnerComponent()) {
				return this.getOwnerComponent().getModel(sName);
			}
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @vesrion 2.0
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Clear all message present in the MessageManager
		 */
		clearAllMessages: function () {
			// does not remove the manually set ValueStateText we set in onValueStatePress():
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		/**
		 * On click, open Message Popover
		 * @param oView  -- view which message popover open
		 * @param oEvent  -- button press event
		 */
		openMessageManager: function (oView, oEvent) {
			this.getOwnerComponent().MessageManager.open(oView, oEvent);
		},

		/**
		 * show a message toast for 5 seconds
		 * @param msg
		 */
		showMessageToast: function (msg) {
			sap.m.MessageToast.show(msg, {
				duration: 5000, // default
				my: "center center", // default
				at: "center center", // default
				of: window, // default
				offset: "0 0", // default
				collision: "fit fit", // default
				onClose: null, // default
				autoClose: true, // default
				animationTimingFunction: "ease", // default
				animationDuration: 1000, // default
				closeOnBrowserNavigation: true // default
			});
		},

		/**
		 * Nav back function 
		 * Check for the previous history
		 * else navigate to master page
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.nav2Master();
			}
		},

		/**
		 * Show dialog when user wants to cancel order change/creations
		 */
		confirmEditCancelDialog: function () {
			var sTitle = this.getResourceBundle().getText("tit.cancelCreate"),
				sMsg = this.getResourceBundle().getText("msg.leaveWithoutSave");

			var successcallback = function () {
				var oContext = this.getView().getBindingContext();

				//delete created entry
				this.nav2Master();
				this.getModel().deleteCreatedEntry(oContext);
				this.getModel("CreateModel").getData().results = [];
				this.getModel("CreateModel").refresh();
			};

			var cancelCallback = function () {};
			this.showConfirmDialog(sTitle, sMsg, successcallback.bind(this), cancelCallback.bind(this));
		},

		/**
		 * Navigation to master page from any other page
		 */
		nav2Master: function () {
			var oRouter = this.getOwnerComponent().getRouter(),
				oModel = this.getModel("viewModel");
			oModel.setProperty("/layout", library.LayoutType.OneColumn);
			oRouter.navTo("PrePlanMaster", {}, true);
		},

		/**
		 * Initialize and open the Information dialog with necessary details
		 * @param oEvent Button press event
		 */
		onAboutIconPress: function (oEvent) {
			// create popover
			if (!this._infoDialog) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.InformationPopover",
					controller: this
				}).then(function (oDialog) {
					this._infoDialog = oDialog;
					this.open(oDialog);
				}.bind(this));
			} else {
				this.open(this._infoDialog);
			}
		},

		/**
		 * Open information popover 
		 * @param {oDialog}  -- information dialog instance
		 */
		open: function (oDialog) {
			var oView = this.getView();
			oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oView.addDependent(oDialog);
			oDialog.open();
		},

		/**
		 * Closes the information dialog
		 */
		onCloseDialog: function () {
			this._infoDialog.close();
		},

		/**
		 * Open Message Manager on click
		 * @param oEvent
		 */
		onMessageManagerPress: function (oEvent) {
			this.openMessageManager(this.getView(), oEvent);
		},

		/**
		 * Display Long text on MessageBox
		 * @param longText
		 */
		displayLongText: function (longText) {
			var title = this.getView().getModel("i18n").getResourceBundle().getText("tit.longText");
			MessageBox.show(longText, {
				title: title,
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				actions: [MessageBox.Action.OK]
			});
		},

		/**
		 * Navigating to Demand View on Click of Show Demands Button
		 */
		onShowDemandsPress: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("demandList");
		},

		/**
		 * handle detail/compare page full scrren
		 * validate based on the icon pressed
		 */
		onPressFullScreen: function (oEvent) {
			var oSource = oEvent.getSource(),
				oViewModel = this.getModel("viewModel");
			if (oSource.getIcon() === "sap-icon://full-screen") {
				oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				oViewModel.setProperty("/fullscreen", false);
			} else {
				oViewModel.setProperty("/layout", library.LayoutType.TwoColumnsMidExpanded);
				oViewModel.setProperty("/fullscreen", true);
			}
		},

		/**
		 * onpress detail page close
		 */
		onPressClose: function (oEvent) {
			this.nav2Master();
		},

		/**
		 * get all forms of different tabs in one page 
		 */
		getAllSmartForms: function (aGroups) {
			var aForms = [];
			for (var i = 0; i < aGroups.length; i++) {
				if (aGroups[i] instanceof sap.ui.comp.smartform.SmartForm) {
					aForms.push(aGroups[i]);
				}
			}
			return aForms;
		},

		/**
		 * set editable true/false for all forms in one page
		 */
		setFormsEditable: function (aForms, isEditable) {
			if (aForms) {
				aForms.forEach(function (oForm) {
					oForm.setEditable(isEditable);
				});
			}
		},

		/**
		 * returns a SmartField from a SmartForm by name
		 * @param sName
		 * @param aForms
		 */
		getFormFieldByName: function (sName, aForms) {
			if (!sName || !aForms) {
				return null;
			}
			for (var j = 0; aForms.length > j; j++) {
				var aSmartFields = aForms[j].getSmartFields();
				for (var i = 0; aSmartFields.length > i; i++) {
					if (aSmartFields[i].getName() === sName) {
						return aSmartFields[i];
					}
				}
			}
			return null;
		},

		/**
		 * Validate smartForm with custom fields
		 * @public
		 */
		validateForm: function (aForms) {
			if (!aForms) {
				return {
					state: "error"
				};
			}
			var aCustomFields = this.getView().getControlsByFieldGroupId("CustomFormField"),
				validatedSmartFields = [];

			aForms.forEach(function (oForm) {
				var validated = oForm.check(); //SmartForm validation
				validatedSmartFields = validatedSmartFields.concat(validated);
			});

			var isValid = validatedSmartFields.length === 0,
				invalidFields = validatedSmartFields;

			//validate custom input fields
			for (var i = 0; i < aCustomFields.length; i++) {
				if (aCustomFields[i].getValue) {
					var sValue = aCustomFields[i].getValue();
					try {
						if (aCustomFields[i].getRequired() && aCustomFields[i].getEditable() && (!sValue || sValue.trim() === "")) {
							aCustomFields[i].setValueState(sap.ui.core.ValueState.Error);
							isValid = false;
							invalidFields.push(aCustomFields[i]);
						} else {
							aCustomFields[i].setValueState(sap.ui.core.ValueState.None);
						}
					} catch (e) {
						//do nothing
					}
				}
			}

			if (isValid) {
				return {
					state: "success"
				};
			} else {
				return {
					state: "error",
					fields: invalidFields
				};
			}
		},

		/**
		 * Save changes method to handle post request
		 * @param {oPayload}     --- Payload data to save updated network
		 * @param successCallback  --- success callback function
		 * @param errorCallback  --- error callback function
		 */
		CreatePrePlan: function (oPayload, successCallback, errorCallback) {
			this.oViewModel.setProperty("/busy", true);
			this.getOwnerComponent().postData("/PlanHeaderSet", oPayload).then(function (oResult) {
				if (successCallback) {
					successCallback(oResult);
				}

				this.oViewModel.setProperty("/busy", false);
			}.bind(this), function (error) {
				if (errorCallback) {
					errorCallback(error);
				}
				this.oViewModel.setProperty("/busy", false);
			}.bind(this));
		},

		/**
		 * show confirm dialog where user needs confirm some action
		 * @param sTitle
		 * @param sMsg
		 * @param successCallback
		 * @param cancelCallback
		 */
		showConfirmDialog: function (sTitle, sMsg, successCallback, cancelCallback, sState) {
			var dialog = new sap.m.Dialog({
				title: sTitle,
				type: "Message",
				state: sState || "None",
				content: new sap.m.Text({
					text: sMsg
				}),
				beginButton: new sap.m.Button({
					text: this.getResourceBundle().getText("btn.confirm"),
					press: function () {
						dialog.close();
						if (successCallback) {
							successCallback();
						}
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: this.getResourceBundle().getText("btn.no"),
					press: function () {
						if (cancelCallback) {
							cancelCallback();
						}
						dialog.close();
					}.bind(this)
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
			dialog.open();
		},
		/**
		 * picks out the change response data from a batch call
		 * Need for create entries 
		 * Example: CreateNotification saveCreateSuccessFn
		 * @param oResponse
		 */
		getBatchChangeResponse: function (oResponse) {
			var batch = oResponse.__batchResponses[0];
			//success
			if (batch.__changeResponses) {
				if (batch && (batch.__changeResponses[0].data)) {
					return batch.__changeResponses[0].data;
				}
			}
			return null;
		},

		/**
		 * Method to call Function Import
		 * @param oParams {object} parameter to be passed to function import
		 * @param sFuncName {string} function import name
		 * @param sMethod {string} method of the function import, default is "POST"
		 * @param fCallback {function} callback function when function import return value
		 */
		callFunctionImport: function (oParams, sFuncName, sMethod, fCallback) {
			var oModel = this.getModel(),
				oViewModel = this.getModel("viewModel"),
				oResourceBundle = this.getResourceBundle();
			oViewModel.setProperty("/busy", true);
			oModel.callFunction("/" + sFuncName, {
				method: sMethod || "POST",
				urlParameters: oParams,
				refreshAfterChange: false,
				success: function (oData) {
					//Handle Success
					oViewModel.setProperty("/busy", false);
					fCallback(oData);
				}.bind(this),
				error: function (oError) {
					//Handle Error
					oViewModel.setProperty("/busy", false);
					this.showMessageToast(oResourceBundle.getText("errorText"));
				}.bind(this)
			});

		},
	});
});