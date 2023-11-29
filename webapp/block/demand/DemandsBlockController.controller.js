sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/OperationTableController",
	"sap/ui/core/mvc/Controller",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/f/library",
	"sap/ui/model/Filter"
], function (OperationTableController, Controller, isEmptyObject, Fragment, OverrideExecution, library, Filter) {
	"use strict";

	return OperationTableController.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlockController", {

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
				onPressOperationListCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				handleSelectionChangeOperation: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressDeleteOperations: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onFieldChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				fnChangeIconClick: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				fnApplyFilterToGraphic: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onTableUpdating: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		allFiltersNotCopied: false,

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlock
		 */
		onInit: function () {
			OperationTableController.prototype.onInit.apply(this, arguments);
			var eventBus = sap.ui.getCore().getEventBus();
			this.oSmartTable = this.getView().byId("idDemandBlockSmartTable");
			this.oTable = this.oSmartTable.getTable();

			//refresh detail page operation list
			eventBus.subscribe("RefreshEvoPrepDetailOPerationTable", "detailoperationrefresh", this._refreshDetailOperationTable, this);
		},

		/**
		 * Called when the View has been destroyed (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.block.demand.DemandsBlocks
		 */
		onExit: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			this.destroyOperationListFragment();
			eventBus.unsubscribe("RefreshEvoPrepDetailOPerationTable", "detailoperationrefresh", this._refreshDetailOperationTable, this);
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
				}, this._afterSuccess.bind(this), this._afterError.bind(this), this.getView());
			}
		},

		/**
		 *  Selection Change event on table 
		 */
		handleSelectionChangeOperation: function (oEvent) {
			var oSource = oEvent.getSource(),
				aSelectedItems = oSource.getSelectedItems();
			if (aSelectedItems.length >
				0) {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", true);
			} else {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			}

			//handle finalise and material releated button enable
			this._handleOprCommonBtnEnable();

		},
		/**
		 * Handle Object list delete operation
		 */
		onPressDeleteOperations: function () {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				aSelectedItems = this.oTable.getSelectedItems(),
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
				this.oTable.removeSelections();
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			};

			var declineFn = function () {
				this.oTable.removeSelections();
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			};

			if (aSelectedItems.length > 0) {
				if (this.oTable.getItems().length === 1) {
					sMsg = this.getResourceBundle().getText("msg.confirmDeleteLastOperation");
				} else if (this.oTable.getItems().length === aSelectedItems.length) {
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
				return;
			}
			// check the validation for the finalized operation change
			this.validateEditFinalizeOperation(oEvent, "ALLOW_EDIT");

		},

		/**
		 * On click of CHange Icon show Change Logs page
		 * @param oEvent
		 */
		fnChangeIconClick: function (oEvent) {
			var oBindCon = oEvent.getSource().getBindingContext(),
				sObjectKeyId = oBindCon.getProperty("ObjectKey");
			if (oBindCon.getProperty("CHANGE_INDICATOR")) {
				var oEventBus = sap.ui.getCore().getEventBus();
				this.oViewModel.setProperty("/layout", library.LayoutType.ThreeColumnsMidExpanded);
				oEventBus.publish("ChangeLogs", "routeMatched", {
					sKey: sObjectKeyId
				});
			}
		},

		/**
		 * Apply selected filter to Graphic planning
		 */
		fnApplyFilterToGraphic: function (oEvent) {
			var eventBus = sap.ui.getCore().getEventBus();
			if (this.allFiltersNotCopied) {
				this.showMessageToast(this.getResourceBundle().getText("msg.allFiltersNotApplied"));
			}
			eventBus.publish("GanttChart", "applyFiltersFromOperations");
		},

		/**
		 * Prepare filters from operations table to be applied on graphic planning
		 */
		onTableUpdating: function (oEvent) {
			var aFilters = oEvent.getParameter("bindingParams").filters,
				aLineItems = this.getModel("templateProperties").getData().ganttConfigs.lineItems,
				aResFilter = [];
			var aCheckFields = ["ORDER_NUMBER", "OPR_DESCRIPTION", "OPERATION_NUMBER", "SYSTEM_STATUS_CODE", "USER_STATUS_CODE"];
			if (aFilters && aFilters.length > 0) {
				this.getModel("viewModel").setProperty("/bEnableApplyFilter", true);
				aFilters.forEach(function (oFilter) {
					if (aCheckFields.indexOf(oFilter.sPath) > -1) {
						aLineItems.forEach(function (oItem) {
							if (oFilter.sPath === oItem.Value.Path) {
								aResFilter.push(oFilter);
							}
						});
					}
				});
			} else {
				this.getModel("viewModel").setProperty("/bEnableApplyFilter", false);
			}
			if (aFilters.length > aResFilter.length) {
				this.allFiltersNotCopied = true;
			} else {
				this.allFiltersNotCopied = false;
			}
			this.getModel("viewModel").setProperty("/filtersToGraphicPlanning", aResFilter);
		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * Refresh detail page operation table forcefully
		 */
		_refreshDetailOperationTable: function () {
			this.oSmartTable.rebindTable();
		},

		/**
		 * After operation edit success callback
		 */
		_afterSuccess: function () {
			this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
			this.resetDeferredGroupToChanges(this.getView());
			this.refreshGantChartData(this.getModel("viewModel"));
			this.refreshPlanList();
			this.refreshOperationList();
		},

		/**
		 * After operation edit error callback
		 */
		_afterError: function () {
			this.getModel().resetChanges();
			this.resetDeferredGroupToChanges(this.getView());
		}
	});
});