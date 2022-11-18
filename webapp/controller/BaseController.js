/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/evorait/evosuite/evoprep/model/Constants",
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
	"sap/ui/core/message/Message"
], function (Controller, Constants, History, Dialog, Button, Text, MessageToast, MessageBox, OverrideExecution, formatter, deepClone,
	library,
	Fragment, Message) {
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
				},
				showSaveErrorPrompt: {
					public: true,
					final: true
				},
				checkDuplicate: {
					public: true,
					final: true
				},
				saveChanges: {
					public: true,
					final: true
				},
				saveChangesMain: {
					public: true,
					final: true
				},
				addMsgToMessageManager: {
					public: true,
					final: true
				},
				deleteEntries: {
					public: true,
					final: true
				},
				navToDetail: {
					public: true,
					final: true
				},
				openApp2AppPopover: {
					public: true,
					final: true
				},
				openEvoAPP: {
					public: true,
					final: true
				},
				callFunctionImport: {
					public: true,
					final: true
				},
				onPressAddOperations: {
					public: true,
					final: true
				},
				onPressOperationSelectCancel: {
					public: true,
					final: true
				},
				destroyOperationListFragment: {
					public: true,
					final: true
				},
				copySelectedPlan: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		formatter: formatter,
		oViewModel: null,
		oCreateModel: null,

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

			this.showConfirmDialog(sTitle, sMsg, successcallback.bind(this));
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
		showConfirmDialog: function (sTitle, sMsg, successCallback, cancelCallback, sState, beginAction, endAction) {
			var dialog = new sap.m.Dialog({
				title: sTitle,
				type: "Message",
				state: sState || "None",
				content: new sap.m.Text({
					text: sMsg
				}),
				beginButton: new sap.m.Button({
					text: beginAction || this.getResourceBundle().getText("btn.confirm"),
					press: function () {
						dialog.close();
						if (successCallback) {
							successCallback();
						}
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: endAction || this.getResourceBundle().getText("btn.no"),
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
		 * save error dialog
		 */
		showSaveErrorPrompt: function (message) {
			var oBundle = this.getModel("i18n").getResourceBundle();
			var sTitle = oBundle.getText("errorTitle");
			var sMsg = oBundle.getText("errorText");
			var sBtn = oBundle.getText("close");

			var dialog = new Dialog({
				title: sTitle,
				type: "Message",
				state: "Error",
				content: new Text({
					text: sMsg + "\n\n" + message
				}),
				beginButton: new Button({
					text: sBtn,
					press: function () {
						dialog.close();
					}
				}),
				afterClose: function () {
					dialog.destroy();
				}
			});
			dialog.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
			dialog.open();
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
				oViewModel = this.getModel("viewModel");
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
					this.showSaveErrorPrompt(this._extractError(oError));
				}.bind(this)
			});

		},

		/**
		 * check dulicate entires 
		 * @{param} oData - create model operation data
		 * @param ObjectKey - object key to compare
		 */
		checkDuplicate: function (oData, ObjectKey) {
			var bIndicator = true;
			oData.forEach(function (oItem) {
				if (oItem.ObjectKey === ObjectKey) {
					bIndicator = false;
					return;
				}
			});
			return bIndicator;
		},

		/**
		 * send changes to backend
		 */
		saveChanges: function (oTable) {
			this.getModel().submitChanges({
				success: function () {
					if (oTable) {
						oTable.rebindTable(true);
					}
					this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
					this.getModel().resetChanges();
				}.bind(this)
			});
		},

		/**
		 * loop through collection of selected table items 
		 * and set delete property
		 * @param aSelected
		 * @param successFn
		 * @param errorFn
		 */
		deleteEntries: function (aSelected, oTable) {
			return new Promise(function (resolve) {
				var oModel = this.getModel(),
					aContext = [];
				aSelected.forEach(function (oItem) {
					var oContext = oItem.getPath ? oItem : oItem.getBindingContext();
					if (oContext) {
						oModel.setProperty(oContext.getPath() + "/DELETE_ENTRY", "X");
						aContext.push(oContext);
					}
				}.bind(this));
				this.saveChangesMain({
					state: "success",
					isDelete: true,
					aContext: aContext
				}, function (oResponse) {
					this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
					if (oTable) {
						oTable.rebindTable();
					}
					resolve();
				}.bind(this), this._errorCallBackForPlanHeaderSet.bind(this), oTable);
			}.bind(this));
		},

		/**
		 * Form is valid now so send to sap
		 * @param mParams
		 * @param oSuccessCallback
		 * @param oErrorCallback
		 * @param oCtrl
		 */
		saveChangesMain: function (mParams, oSuccessCallback, oErrorCallback, oCtrl) {
			if (mParams.state === "success") {
				this._setBusyWhileSaving(oCtrl, true);

				this.getModel().submitChanges({
					success: function (oResponse) {
						this._setBusyWhileSaving(oCtrl, false);
						if (oResponse.__batchResponses && oResponse.__batchResponses[0].response && (oResponse.__batchResponses[0].response.statusCode ===
								"400" || oResponse.__batchResponses[0].response.statusCode ===
								"500")) {
							if (oErrorCallback) {
								oErrorCallback(oResponse);
							}
						} else {
							//on error don't delete created entry as its still needed when create entry dialog is open 
							//and form needs stay with pre-filled values and send maybe again
							this._deleteCreatedLocalEntry(mParams);
							if (oSuccessCallback) {
								oSuccessCallback(oResponse);
							}
						}
						if (mParams.isDelete) {
							this._deleteCreatedLocalDeleteEntry(mParams);
						}
						this.getModel().resetChanges();
					}.bind(this),
					error: function (oError) {
						this.getModel().resetChanges();
						this._setBusyWhileSaving(oCtrl, false);
						this.showSaveErrorPrompt(oError);
						if (oErrorCallback) {
							oErrorCallback(oError);
						}
					}.bind(this)
				});
			} else if (mParams.state === "error") {
				//var aErrorFields = mParams.fields;
			}
		},

		/**
		 * Create Success, Warning, Info, Error message and add to MessageManager
		 * @param sType
		 * @param sMessage
		 * @param sTarget
		 */
		addMsgToMessageManager: function (sType, sMessage, sTarget) {
			var oMessage = new Message({
				message: sMessage,
				type: sType,
				target: sTarget,
				processor: this.getModel("messageManager"),
				technical: true
			});
			sap.ui.getCore().getMessageManager().addMessages(oMessage);
		},

		/**
		 * Navigate to detail page with selected plan
		 */
		navToDetail: function (sPlanObject) {
			var sLayout = library.LayoutType.TwoColumnsMidExpanded;
			if (this.getModel("user").getProperty("/DEFAULT_PLAN_DET_FULLSC")) {
				sLayout = library.LayoutType.MidColumnFullScreen
			}
			this.getRouter().navTo("PrePlanDetail", {
				layout: sLayout,
				plan: sPlanObject
			});
		},

		/**
		 * render a popover with button inside
		 * @param oSource
		 * @param sProp
		 */
		openApp2AppPopover: function (oSource, sProp) {
			var oNavLinks = this.getModel("templateProperties").getProperty("/navLinks"),
				oContext = oSource.getBindingContext();

			if (oContext && oNavLinks[sProp]) {
				var sPath = oContext.getPath() + "/" + oNavLinks[sProp].Property;
				var oPopover = new sap.m.ResponsivePopover({
					placement: sap.m.PlacementType.Auto,
					showHeader: false,
					showCloseButton: true,
					afterClose: function () {
						oPopover.destroy(true);
					}
				});
				var oButton = new sap.m.Button({
					text: this.getResourceBundle().getText("btn.App2App", oNavLinks[sProp].ApplicationName),
					icon: "sap-icon://action",
					press: function () {
						oPopover.close();
						oPopover.destroy(true);
						this.openEvoAPP(this.getModel().getProperty(sPath), oNavLinks[sProp].ApplicationId);
					}.bind(this)
				});
				oPopover.insertContent(oButton);
				oPopover.openBy(oSource);
			}
		},

		/**
		 *	Navigates to evoOrder detail page with static url.
		 * @param sParamValue
		 * @param sAppID
		 */
		openEvoAPP: function (sParamValue, sAppID) {
			var sUri, sSemanticObject, sParameter,
				sAction,
				sAdditionInfo,
				sLaunchMode = this.getModel("viewModel").getProperty("/launchMode"),
				oAppInfo = this._getAppInfoById(sAppID);
			// if there is no configuration maintained in the backend
			if (oAppInfo === null) {
				return;
			}

			if (sLaunchMode === Constants.LAUNCH_MODE.FIORI) {
				sAdditionInfo = oAppInfo.Value1 || "";
				sSemanticObject = sAdditionInfo.split("\\\\_\\\\")[0];
				sAction = sAdditionInfo.split("\\\\_\\\\")[1] || "Display";
				sParameter = sAdditionInfo.split("\\\\_\\\\")[2];
				if (sSemanticObject && sAction) {
					this._navToApp(sSemanticObject, sAction, sParameter, sParamValue);
				}
			} else {
				sAdditionInfo = oAppInfo.Value1;
				sUri = sAdditionInfo.replace("\\\\place_h1\\\\", sParamValue);
				window.open(sUri, "_blank");
			}
		},

		/**
		 * Opens popup to add operation in demand list
		 */
		onPressAddOperations: function (oEvent) {
			// create popover
			if (!this._addOperationsDetail) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.OperationList",
					controller: this
				}).then(function (oDialog) {
					this._addOperationsDetail = oDialog;
					this.getView().addDependent(oDialog);
					this.open(oDialog);
					this._addOperationsDetail.attachAfterOpen(function () {
						var oOpSmartTable = sap.ui.getCore().byId("idOperationListFragSmartTable");
						oOpSmartTable.getTable().removeSelections();
						oOpSmartTable.rebindTable();
					}.bind(this));
				}.bind(this));
			} else {
				this.open(this._addOperationsDetail);
			}
		},

		/**
		 * Close operation list frgament
		 * Before close it will remove table selection
		 */
		onPressOperationSelectCancel: function (oEvent) {
			this._addOperationsDetail.close();
		},

		/**
		 * destroy the created fragment on exit
		 * @param oEvent
		 */
		destroyOperationListFragment: function () {
			if (this._addOperationsDetail) {
				this._addOperationsDetail.destroy(true);
				this._addOperationsDetail = null;
			}
		},

		/**
		 * Used in both master and detail for copying the selected plan
		 * @Params GUID - Old GUID used for copying it
		 * */

		copySelectedPlan: function (sGuid, oTable) {
			//getting the GUID of selected Plan
			var oResourceBundle = this.getModel("i18n").getResourceBundle(),
				sFunctionName = "CopyPlan",
				oParams = {
					OldPlanGuid: sGuid
				},
				newPlanGuid;
			var sTitle = oResourceBundle.getText("xtit.confirm"),
				sContinueAction = oResourceBundle.getText("btn.successMsgBxBtnContinueEditing"),
				sPlanDetailAction = oResourceBundle.getText("btn.successMsgBxBtnPlanDetail"),
				sMsg;

			var fnContinueCallBack = function () {
				if (oTable) {
					oTable.rebindTable();
				}
			};

			var fnPlanDetailCallBack = function (oData) {
				this.navToDetail(newPlanGuid);
			};
			this._setBusyWhileSaving(oTable, true);
			var callBackFunction = function (oData) {
				this._setBusyWhileSaving(oTable, false);
				sMsg = oData.Messagebap;
				newPlanGuid = oData.NewPlanGuid;
				this.showConfirmDialog(sTitle, sMsg, fnContinueCallBack.bind(this), fnPlanDetailCallBack.bind(this), "None", sContinueAction,
					sPlanDetailAction);
			}.bind(this);

			this.callFunctionImport(oParams, sFunctionName, "GET", callBackFunction);

		},

		navToLogs: function (sObjectKey, sHeaderKeyId) {
			this.getRouter().navTo("ChangeLogs", {
				layout: library.LayoutType.ThreeColumnsMidExpanded,
				operationKey: sObjectKey,
				plan: sHeaderKeyId
			});
		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * get respective navigation details
		 * @param sAppID
		 */
		_getAppInfoById: function (sAppID) {
			var aNavLinks = this.getModel("templateProperties").getProperty("/navLinks");
			for (var i in aNavLinks) {
				if (aNavLinks.hasOwnProperty(i)) {
					if (aNavLinks[i].ApplicationId === sAppID) {
						return aNavLinks[i];
					}
				}
			}
			return null;
		},

		/*
		 * function to deleted recent created context if exist
		 *
		 */
		_deleteCreatedLocalEntry: function (mParams) {
			var oContext = mParams.oContext || this.getView().getBindingContext();
			if (oContext && mParams.isCreate) {
				this.getModel().deleteCreatedEntry(oContext);
			}
		},

		/*
		 * function to deleted recent created delete context if exist
		 *@param mParams
		 *mParams.isDelete - to check if it is delete operation
		 *mParams.aContext - will have all context of delete entries
		 *
		 */
		_deleteCreatedLocalDeleteEntry: function (mParams) {
			var aContext = mParams.aContext;
			if (aContext) {
				aContext.forEach(function (oContext) {
					if (oContext && mParams.isDelete) {
						this.getModel().deleteCreatedEntry(oContext);
					}
				}.bind(this));
			}

		},

		/**
		 * set busy state for control while saving
		 */
		_setBusyWhileSaving: function (oCtrl, bIsInProgress) {
			if (oCtrl) {
				oCtrl.setBusy(bIsInProgress);
			} else {
				this.getView().getModel("viewModel").setProperty("/busy", bIsInProgress);
			}
		},

		/**
		 * In Fiori Launchpad navigate to another app
		 * @param sSemanticObject
		 * @param sAction
		 * @param sParameter
		 * @param sParamValue
		 * @private
		 */
		_navToApp: function (sSemanticObject, sAction, sParameter, sParamValue) {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation"),
				mParams = {};

			mParams[sParameter] = [sParamValue];
			oCrossAppNavigator.toExternal({
				target: {
					semanticObject: sSemanticObject,
					action: sAction
				},
				params: mParams
			});
		},

		/**
		 * loop trough all nested array of children
		 * When max level for search was reached execute callbackFn
		 * @param aChildren
		 * @param iMaxLevel
		 * @param callbackFn
		 * @returns aChildren
		 */
		_recurseChildren2Level: function (aChildren, iMaxLevel, callbackFn) {
			function recurse(aItems, level) {
				for (var i = 0; i < aItems.length; i++) {
					var aChilds = aItems[i].children;
					if (level === (iMaxLevel - 1)) {
						if (callbackFn) {
							callbackFn(aItems[i]);
						}
					} else if (aChilds && aChilds.length > 0) {
						recurse(aChilds, level + 1);
					}
				}
			}
			recurse(aChildren, 0);
			return aChildren;
		},

		/**
		 * loop trough all nested array of children
		 * and execute callback function for each child
		 * @param {Array} aChildren
		 * @param {Object} callbackFn
		 * @param {(string|Array|Object)} data
		 * @returns aChildren
		 */
		_recurseAllChildren: function (aChildren, callbackFn, data) {
			aChildren.forEach(function (oItem, idx) {
				if (callbackFn) {
					callbackFn(oItem, data, idx);
				}
				if (oItem.children) {
					this._recurseAllChildren(oItem.children, callbackFn, data);
				}
			}.bind(this));
			return aChildren;
		},

		/**
		 * Extract errors from a backend message class
		 * either messages from the backend message class or return the initial error object
		 * @param oResponse
		 * @returns {{responseText}|*|string|string|{responseText}|*}
		 * @private
		 */
		_extractError: function (oResponse) {
			if (!oResponse) {
				return this.getResourceBundle().getText("errorText");
			}
			if (oResponse.responseText) {
				var parsedJSError = null;
				try {
					parsedJSError = jQuery.sap.parseJS(oResponse.responseText);
				} catch (err) {
					return oResponse;
				}
				if (parsedJSError && parsedJSError.error && parsedJSError.error.code) {
					var strError = "";
					//check if the error is from our backend error class
					if (parsedJSError.error.innererror && parsedJSError.error.innererror.errordetails) {
						var aInnerDetails = parsedJSError.error.innererror.errordetails;
						if (aInnerDetails.length > 0) {
							for (var i = 0; i < aInnerDetails.length; i++) {
								if (aInnerDetails[i].severity === "warning") {
									this._addWarningMessageToMessageManager(aInnerDetails[i].message);
								} else {
									strError += String.fromCharCode("8226") + " " + aInnerDetails[i].message + "\n\n";
								}
							}
						} else {
							strError = parsedJSError.error.code + ": " + parsedJSError.error.message.value;
						}
					} else {
						//if there is no message class found
						return oResponse;
					}
					return strError;
				}
			} else if (oResponse.body) {
				return oResponse.body;
			}
			return oResponse;
		},

		/**
		 * Display the error messages from the backend for the
		 * PlanHeaderSet entity set incase some error is returned
		 * from backend
		 * @param oError - This is a error object returned from backend. 
		 * @private
		 */
		_errorCallBackForPlanHeaderSet: function (oError) {
			var oResourceBundle = this.getResourceBundle(),
				sErrortext = oResourceBundle.getText("errorText"),
				sMessage = this._extractError(oError.response),
				sFinalMessage;
			if (oError.hasOwnProperty("__batchResponses")) {
				sMessage = this._extractError(this._extractError(oError.__batchResponses[0].response));
				var parsedMessage, aInnerDetails, strError = "";
				parsedMessage = jQuery.sap.parseJS(sMessage);
				aInnerDetails = parsedMessage.error.innererror.errordetails;
				if (aInnerDetails.length > 0) {
					for (var i = 0; i < aInnerDetails.length; i++) {
						if (aInnerDetails[i].severity === "warning") {
							this._addWarningMessageToMessageManager(aInnerDetails[i].message);
						} else {
							strError += String.fromCharCode("8226") + " " + aInnerDetails[i].message + "\n\n";
						}
					}
				} else {
					strError = parsedMessage.error.code + ": " + parsedMessage.error.message.value;
				}
				sFinalMessage = strError;
			} else {
				sFinalMessage = sMessage;
			}
			MessageBox.error(
				sErrortext, {
					details: typeof (sFinalMessage) === "string" ? sFinalMessage.replace(/\n/g, "<br/>") : sFinalMessage,
					styleClass: this.getOwnerComponent().getContentDensityClass(),
					actions: [MessageBox.Action.CLOSE],
					onClose: function () {

					}.bind(this)
				}
			);
		}

	});
});