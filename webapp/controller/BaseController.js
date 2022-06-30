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
	"sap/ui/core/Fragment"
], function (Controller, History, Dialog, Button, Text, MessageToast, MessageBox, OverrideExecution, formatter, deepClone, library,
	Fragment) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evoprep.controller.BaseController", {

		formatter: formatter,

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
		}
	});
});