sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/AddOperation",
	"sap/ui/core/mvc/Controller",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, Controller, isEmptyObject, Fragment, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlockController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressAdd: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onFieldChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				fnOperationClick: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},
		_oTable: null,
		_oOperationContext: null,
		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		onInit: function () {
			this.oSmartTable = this.getView().byId("idDemandBlockSmartTable");
			this._oTable = this.oSmartTable.getTable();
		},

		/**
		 * Called when the View has been destroyed (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlocks
		 */
		onExit: function () {

			this.destroyOperationListFragment();
		},

		/* =========================================================== */
		/* Public methods                                              */
		/* =========================================================== */

		/**
		 * On press add operation button inside operation list fragmnet
		 * validate for the operation selection
		 */
		onPressAdd: function (oEvent) {
			var oSmartTable = sap.ui.getCore().byId("idOperationListFragSmartTable"),
				oTable = oSmartTable.getTable(),
				aSelectedItems = oTable.getSelectedItems(),
				aAllOperationsSelected = [];

			if (aSelectedItems.length === 0) {
				this.showMessageToast(this.getResourceBundle().getText("msg.selectAtleast"));
				return;
			}
			//When All the Operations are Selected
			if (this.bOperationSelectAll) {
				aSelectedItems = this.aOprFrgAllOperations;
				aAllOperationsSelected = this.aOprFrgAllOperations;
			}
			this.getModel("viewModel").setProperty("/aAllSelectedOperations", aAllOperationsSelected);
			this.getValidationParameters(aSelectedItems).then(function (oPreparedData) {
				if (oPreparedData && oPreparedData.sOrder && oPreparedData.sOpr) {
					oPreparedData.sPrepPlan = this.getView().getBindingContext().getProperty("PLAN_ID");
					this.triggerFunctionImport(oPreparedData, aSelectedItems, this._afterSuccess.bind(this), this._afterError.bind(this));
				}
			}.bind(this));
			this.onPressOperationListCancel();
		},

		/**
		 * Close operation list frgament
		 * Before close it will remove table selection
		 */
		onPressOperationListCancel: function (oEvent) {
			this.onPressOperationSelectCancel();
			this.destroyOperationListFragment();
		},

		/**
		 * Sends the changed data to backend
		 */
		onPressEdit: function (oEvent) {
			var bEdit = oEvent.getParameter("editable");
			this.getModel("viewModel").setProperty("/bOperationTableMode", bEdit);
			this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			if (!bEdit && !isEmptyObject(this.getModel().getPendingChanges())) {
				this.saveChangesMain({
					state: "success",
					isCreate: false
				}, this._afterSuccess.bind(this), this._afterError.bind(this), this._oSmartTable);
			}
		},

		/**
		 *  Selection Change event on table 
		 */
		handleSelectionChangeOperation: function (oEvent) {
			var oSource = oEvent.getSource(),
				aSelectedItems = oSource.getSelectedItems();
			if (aSelectedItems.length > 0 && this.getModel("viewModel").getProperty("/authorizeCheck")) {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", Boolean(this.getModel("user").getProperty(
					"/ENABLE_IW32_AUTH_CHECK")));
			} else if (aSelectedItems.length >
				0) {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", true);
			} else {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			}
			// check enable or disable the materials status and material information button

			if (this._returnMaterialContext(this.oSmartTable.getTable()).length > 0) {
				this.getModel("viewModel").setProperty("/bMaterialsDemandsBlock", true);
			} else {
				this.getModel("viewModel").setProperty("/bMaterialsDemandsBlock", false);
			}
			// check the enable or disable finalize button in the operations table header
			if (this._returnFinalizeContext(this.oSmartTable.getTable()).length > 0) {
				this.getModel("viewModel").setProperty("/bEnableFinalizePlanDetails", true);
			} else {
				this.getModel("viewModel").setProperty("/bEnableFinalizePlanDetails", false);
			}

		},
		/**
		 * Handle Object list delete operation
		 */
		onPressDeleteOperations: function () {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				aSelectedItems = this._oTable.getSelectedItems(),
				sMsg;

			var successFn = function () {
				var aContext = [];
				this.getModel().setDeferredGroups(["changes"]);
				aSelectedItems.forEach(function (oItem) {
					var oContext = oItem.getPath ? oItem : oItem.getBindingContext();
					if (oContext) {
						this.getModel().setProperty(oContext.getPath() + "/DELETE_ENTRY", "X");
						aContext.push(oContext);
					}
				}.bind(this));
				this.saveChangesMain({
					state: "success",
					isDelete: true,
					aContext: aContext
				}, this._afterSuccess.bind(this), this._afterError.bind(this), this.getView());
				this._oTable.removeSelections();
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			};

			var declineFn = function () {
				this._oTable.removeSelections();
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			};

			if (aSelectedItems.length > 0) {
				if (this._oTable.getItems().length === 1) {
					sMsg = this.getResourceBundle().getText("msg.confirmDeleteLastOperation");
				} else if (this._oTable.getItems().length === aSelectedItems.length) {
					sMsg = this.getResourceBundle().getText("msg.confirmDeleteAllOperation");
				} else if (aSelectedItems.length === 1) {
					sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedOperation");
				} else {
					sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedOperations");
				}
				this.showConfirmDialog(sTitle, sMsg, successFn.bind(this), declineFn.bind(this));
			} else {
				var msgs = this.getView().getModel("i18n").getResourceBundle().getText("msg.selectAtleast");
				this.showMessageToast(msgs);
			}
		},

		/**
		 * Handle operation dates edit validation
		 * @param oEvent
		 */
		onFieldChange: function (oEvent) {
			var oSource = oEvent.getParameter("changeEvent").getSource(),
				oBinding = oSource.getBindingInfo("value")["binding"],
				newDate = new Date(oEvent.getParameter("changeEvent").getParameter("newValue")),
				sMsg = this.getView().getModel("i18n").getResourceBundle().getText("msg.oprDateValidation"),
				oOrigData = this.getModel().getData(oBinding.getContext().getPath()),
				sPath = oBinding.getPath(),
				compareDate, result;
			if (sPath === 'EARLIEST_START_DATE') {
				compareDate = oOrigData.EARLIEST_END_DATE;
				result = Boolean(newDate > compareDate);
			} else if (sPath === 'EARLIEST_END_DATE') {
				compareDate = oOrigData.EARLIEST_START_DATE;
				result = Boolean(newDate < compareDate);
			}
			if (result) {
				this.showMessageToast(sMsg);
				this.getModel().resetChanges();
			}
		},

		/**
		 * On click of operation route to Change Logs page
		 * @param oEvent
		 */
		fnOperationClick: function (oEvent) {
			var oBindCon = oEvent.getParameter("listItem").getBindingContext(),
				sObjectKeyId = oBindCon.getProperty("ObjectKey"),
				sHeaderKeyId = oBindCon.getProperty("HeaderObjectKey");
			if (sObjectKeyId) {
				this.navToLogs(sObjectKeyId, sHeaderKeyId);
			}

		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * After operation edit success callback
		 */
		_afterSuccess: function () {
			this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
			this.getModel().refresh();
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.publish("BaseController", "refreshFullGantt", this._loadGanttData, this);
			oEventBus.publish("BaseController", "refreshUtilizationGantt", this._loadUtilizationGantt, this);
			this.getModel("viewModel").setProperty("/bDependencyCall", true);
		},

		/**
		 * After operation edit error callback
		 */
		_afterError: function () {
			this.getModel().resetChanges();
		}
	});
});