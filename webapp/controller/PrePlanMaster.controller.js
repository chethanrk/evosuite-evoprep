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
				},

				onPressComapre: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onCopyPrePlanPress: {
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
			var eventBus = sap.ui.getCore().getEventBus();
			this.oSmartTable = this.getView().byId("idPagePrePlanSmartTable");
			this.oViewModel = this.getModel("viewModel");
			this.oViewModel.setProperty("/busy", false);

			//refresh plan list
			eventBus.subscribe("RefreshEvoPrepPlanList", "planlistrefresh", this._refreshPlanTable, this);
		},

		/**
		 * Called when a controller is destroyed 
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanMaster
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("RefreshEvoPrepPlanList", "planlistrefresh", this._refreshPlanTable, this);
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
			this._removeTableSelection();
			var oSource = oEvent.getSource(),
				oTable = this.oSmartTable.getTable();
			oSource.setSelected(true);
			oTable.fireSelectionChange(oSource);
			var sobjectKeyId = oSource.getBindingContext().getProperty("ObjectKey");
			if (sobjectKeyId) {
				this.navToDetail(sobjectKeyId);
			}
			this.getModel("viewModel").setProperty("/bCopyEnabled", false); //added so that copy is disabled even after coming from different view
		},

		/**
		 * Bellow both methods should be remove while actula code implementation
		 * simulate to reouting 
		 */
		onPressComapre: function (oEvent) {
			var oTable = this.oSmartTable.getTable(),
				aListItems = oTable.getSelectedItems(),
				aPlans = [];

			if (aListItems.length === 0 || aListItems.length === 1) {
				this.showMessageToast(this.getResourceBundle().getText("msg.selectatleastTwoPlans"));
			} else if (aListItems.length > 1 && aListItems.length < 4) {
				aListItems.forEach(function (oItem) {
					aPlans.push(oItem.getBindingContext().getObject().ObjectKey);
				});

				//unselect all the selected rows
				this._removeTableSelection();
				this.getModel("viewModel").setProperty("/fullscreenGantt", false);
				this.getRouter().navTo("PrePlanCompare", {
					layout: library.LayoutType.MidColumnFullScreen,
					plans: window.encodeURIComponent(JSON.stringify(aPlans))
				});
			} else {
				this.showMessageToast(this.getResourceBundle().getText("msg.maxPlanSelectionToCompare"));
			}
		},

		/** 
		 * Sending a call to backend for copy with the selected Plan's GuID on click of copy. 
		 * */
		onCopyPrePlanPress: function () {
			var oSelectedItem = this.oSmartTable.getTable().getSelectedItem(),
				sGuid = oSelectedItem.getBindingContext().getProperty("ObjectKey");

			this.copySelectedPlan(sGuid, this.oSmartTable);
			this._removeTableSelection();
			this.getModel("viewModel").setProperty("/bCopyEnabled", false);
		},

		/**
		 * Navigating to Create PrePlan View on Click of Create PrePlan Button
		 */
		onCreatePrePlanPress: function () {
			//unselect all the selected rows
			this._removeTableSelection();
			this.getRouter().navTo("CreatePrePlan", {
				layout: library.LayoutType.MidColumnFullScreen
			});
		},

		/**
		 * Event on selecting/deselecting a row using checkbox
		 * @param oEvent
		 */
		onWPrePlanListSelectionChange: function (oEvent) {
			var isPreplanDeletEnabled = false,
				oSelectedPrePlanContext = this.oSmartTable.getTable().getSelectedContexts(),
				sStatus;
			if (oSelectedPrePlanContext.length > 0) {
				isPreplanDeletEnabled = true;
			}

			if (oSelectedPrePlanContext.length === 1) {
				//enable the copy button only for New & In Progress Status
				sStatus = oSelectedPrePlanContext[0].getProperty("STATUS_SHORT");
				if (sStatus === "INPR" || sStatus === "NEW")
					this.getModel("viewModel").setProperty("/bCopyEnabled", true);
			} else {
				//disable the copy button
				this.getModel("viewModel").setProperty("/bCopyEnabled", false);
			}

			this.getModel("viewModel").setProperty("/isPrePlanSelected", isPreplanDeletEnabled);
			this.oViewModel.setProperty("/bMaterialsDemandsBlock", false);
			this.oViewModel.setProperty("/bEnableFinalizeBtn", false);
			this.oViewModel.setProperty("/bEnableFinalizeBtnGraphicPlan", false);
			this.oViewModel.setProperty("/bEnableMaterialGraphicPlan", false);
		},

		/**
		 * Called when delete button pressed on the preplan table
		 * Validate for the atleast one selection
		 */
		onDeletePrePlanPress: function (oEvent) {
			var oTable = this.oSmartTable.getTable(),
				sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedPrepLan"),
				oSelectedContext = oTable.getSelectedContexts();

			var successFn = function () {
				this.deleteEntries(oSelectedContext, this.oSmartTable).then(function () {
					//unselect all the selected rows
					this._removeTableSelection();
				}.bind(this));
			};
			this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * refresh Plan list forcefully
		 */
		_refreshPlanTable: function () {
			this.oSmartTable.rebindTable();
		},

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
					this._removeTableSelection();
				}.bind(this));
			}
		},

		/**
		 * Remove table selection
		 */
		_removeTableSelection: function () {
			this.oSmartTable.getTable().removeSelections();
			this.getModel("viewModel").setProperty("/isPrePlanSelected", false);
		}
	});
});