sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/f/library",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, library, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanMaster", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				showLongText: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onClickTableRow: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onCreatePrePlanPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onDeletePrePlanPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onWPrePlanListSelectionChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		oSmartTable: null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		onInit: function () {
			this.oSmartTable = this.getView().byId("idPagePrePlanSmartTable");
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * Called on click of Long text indicator
		 * @param oEvent
		 */
		showLongText: function (oEvent) {
			var oContext = oEvent.getSource().getBindingContext();
			var longText = oContext.getProperty("NOTES");
			this.displayLongText(longText);
		},

		/**
		 * Event for the table row click
		 * Navigate to detail page with selected plan details
		 */
		onClickTableRow: function (oEvent) {
			var sobjectKeyId = oEvent.getSource().getBindingContext().getProperty("ObjectKey");
			this.getRouter().navTo("PrePlanDetail", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plan: sobjectKeyId
			});
		},

		/**
		 * Bellow both methods should be remove while actula code implementation
		 * simulate to reouting 
		 */
		onPressComapre: function (oEvent) {
			this.getRouter().navTo("PrePlanCompare", {
				layout: library.LayoutType.TwoColumnsMidExpanded,
				plans: "01"
			});
		},

		/**
		 * Navigating to Create PrePlan View on Click of Create PrePlan Button
		 */
		onCreatePrePlanPress: function () {
			this.getRouter().navTo("CreatePrePlan");
		},

		/**
		 * Event on selecting/deselecting a row using checkbox
		 * @param oEvent
		 */
		onWPrePlanListSelectionChange: function (oEvent) {
			var isPreplanDeletEnabled = false;
			this.selectedFunction = "";
			var oSelectedPrePlanContext = this.oSmartTable.getTable().getSelectedContexts();
			if (oSelectedPrePlanContext.length > 0) {
				isPreplanDeletEnabled = true;
			}
			this.getModel("viewModel").setProperty("/isPrePlanSelected", isPreplanDeletEnabled);
		},

		/**
		 * Called when delete button pressed on the preplan table
		 * Validate for the atleast one selection
		 */
		onDeletePrePlanPress: function (oEvent) {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedPrepLan");

			var successcallback = function () {
				this._massPrePlanDelete();
			};

			var cancelCallback = function () {};
			this.showConfirmDialog(sTitle, sMsg, successcallback.bind(this), cancelCallback.bind(this));

		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * delete multiple preplan delete
		 * prepare with promises
		 */
		_massPrePlanDelete: function () {
			var oSelectedContext = this.oSmartTable.getTable().getSelectedContexts(),
				aPromises = [],
				aPaths = [];

			if (oSelectedContext.length > 0) {
				//get more order details from backend
				//so collect all requests in Promise and wait when all finished
				for (var i = 0; i < oSelectedContext.length; i++) {
					var sPath = oSelectedContext[i].getPath();
					aPaths.push(sPath);
					aPromises.push(this.getOwnerComponent().readData(sPath, []));
				}
				//finished all reads from backend
				Promise.all(aPromises).then(function () {
					aPaths.forEach(function (path) {
						this._updateDeleteIndicator(path);
					}.bind(this));
					if (this.getModel().hasPendingChanges()) {
						//response of merge call is handle in ErrorHandler.js
						this.saveChanges(this.oSmartTable);
					} else {
						this.showSaveErrorPrompt(this.getResourceBundle().getText("msg.prePlanDeleteError"));
					}
					//unselect all the selected rows
					this.oSmartTable.getTable().removeSelections();
					this.getModel("viewModel").setProperty("/isPrePlanSelected", false);
				}.bind(this));
			}
		},

		/**
		 * Update status if the it is allowed to change 
		 */
		_updateDeleteIndicator: function (sPath) {
			var message = "",
				oPrePlan = this.getModel().getProperty(sPath),
				isDeleteAllowed = oPrePlan["ALLOW_DELETE"];

			if (isDeleteAllowed) {
				this.getModel().setProperty(sPath + "/DELETE_ENTRY", "X");
			} else {
				message = this.getResourceBundle().getText("msg.prePlanSubmitFail", oPrePlan.PLAN_ID);
				this.addMsgToMessageManager(this.mMessageType.Error, message, "/PrePlanList");
			}
		}
	});
});