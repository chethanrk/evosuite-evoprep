sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
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
				}
			}
		},

		_oSmartTable: null,
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
			this._oSmartTable = this.getView().byId("idDemandBlockSmartTable");
			this._oTable = this._oSmartTable.getTable();
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
				aSelectedItems = oTable.getSelectedItems();

			if (aSelectedItems.length === 0) {
				this.showMessageToast(this.getResourceBundle().getText("msg.selectAtleast"));
				return;
			}
			this._getValidationParameters(aSelectedItems).then(function (oPreparedData) {
				if (oPreparedData && oPreparedData.sOrder && oPreparedData.sOpr) {
					oPreparedData.sPrepPlan = this.getView().getBindingContext().getProperty("PLAN_ID");
					this._triggerFunctionImport(oPreparedData, aSelectedItems);
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
			if (aSelectedItems.length > 0) {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", true);
			} else {
				this.getModel("viewModel").setProperty("/bEnableOperationDelete", false);
			}
			// check enable or disable the materials status and material information button
			if (this._returnMaterialContext().length > 0) {
				this.byId("materialInfo").setEnabled(true);
				this.byId("idOverallStatusButton").setEnabled(true);
			} else {
				this.byId("materialInfo").setEnabled(false);
				this.byId("idOverallStatusButton").setEnabled(false);
			}

		},
		_returnMaterialContext: function () {
			var sDemandPath, bComponentExist, aArrayMaterialContext = [],
				aContext;
			var aSelecteOperationItems = this._oSmartTable.getTable().getSelectedItems();
			for (var i = 0; i < aSelecteOperationItems.length; i++) {
				aContext = aSelecteOperationItems[i].getBindingContext();
				sDemandPath = aContext.getPath();
				bComponentExist = this.getModel().getProperty(sDemandPath + "/COMPONENT_EXISTS");
				if (bComponentExist) {
					aArrayMaterialContext.push(aContext);
				}
			}
			return aArrayMaterialContext;
		},
		onMaterialStatusPress: function (oEvent) {
			var oSelectedIndices = this._returnMaterialContext(),
				oViewModel = this.getModel("viewModel"),
				sDemandPath;
	
			for (var i = 0; i < oSelectedIndices.length; i++) {
				sDemandPath = oSelectedIndices[i].getPath();
				
				this.getOwnerComponent().readData(sDemandPath).then(function (result) {
				
					oViewModel.setProperty("/busy", false);
				}.bind(this));
			}
		},
		onMaterialInfoButtonPress: function () {
			var oTable = this._oSmartTable.getTable()
			var aSelectedItems = oTable.getSelectedItems();
			if (aSelectedItems.length > 100) {
				aSelectedItems.length = 100;
			}
			var aSelectedItemsPath = [];
			for (var i = 0; i < aSelectedItems.length; i++) {
				aSelectedItemsPath.push({
					sPath: aSelectedItems[i].getBindingContext().getPath()
				});
			}
			//var iMaxSelcRow = this.getModel("user").getProperty("/DEFAULT_MAX_DEM_SEL_MAT_LIST");
			if (aSelectedItemsPath.length > 0) {
				
				this.getOwnerComponent().materialInfoDialog.open(this.getView(), false, aSelectedItemsPath);
			} else {
				var msg = this.getResourceBundle().getText("ymsg.selectMaxItemMaterialInfo");
				//MessageToast.show(msg + " " + iMaxSelcRow);
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
			this.getModel("viewModel").setProperty("/bDependencyCall", true);
		},

		/**
		 * After operation edit error callback
		 */
		_afterError: function () {
			this.getModel().resetChanges();
		},

		/**
		 * Prepare function import parameter ready
		 * check for the order number and operation number 
		 * @[param] - aItems - operationlist items
		 */
		_getValidationParameters: function (aItems) {
			return new Promise(function (resolve) {
				var oPrepData = {
					"sOrder": undefined,
					"sOpr": undefined
				};
				aItems.forEach(function (oItem) {
					var oContext = oItem.getBindingContext();
					var sordnum = oContext.getProperty("ORDER_NUMBER"),
						soprnum = oContext.getProperty("OPERATION_NUMBER");

					if (typeof oPrepData.sOrder === "undefined") {
						oPrepData.sOrder = sordnum;
					} else {
						oPrepData.sOrder += "|" + sordnum;
					}
					if (typeof oPrepData.sOpr === "undefined") {
						oPrepData.sOpr = soprnum;
					} else {
						oPrepData.sOpr += "|" + soprnum;
					}
				});
				resolve(oPrepData);
			}.bind(this));
		},

		/**
		 * Trigger function import with url parameters
		 * @{param} oParam - Url parameter
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		_triggerFunctionImport: function (oParam, aSelectedItems) {
			var oParams = {
					PlanID: oParam.sPrepPlan,
					OrderNumber: oParam.sOrder,
					OperationNumber: oParam.sOpr
				},
				sFunctionName = "CalculateDate";

			var callbackfunction = function (oImportedData) {
				this._confirmDateChange(aSelectedItems);
			}.bind(this);

			this.callFunctionImport(oParams, sFunctionName, "GET", callbackfunction);
		},

		/**
		 * Confirm before add operations to table
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		_confirmDateChange: function (aSelectedItems) {
			var sTitle = this.getResourceBundle().getText("xtit.confirm"),
				sMsg = this.getResourceBundle().getText("msg.operationUpdateConfirm");

			var successFn = function () {
				this._triggerItemMergerequest(aSelectedItems, this._afterSuccess.bind(this), this._afterError.bind(this));
			};
			this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
		},

		/**
		 * Prepare the payload for the merge call with selected operation for the add operation
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		_triggerItemMergerequest: function (aSelectedItems, oSuccessCallback, oErrorCallback) {
			var mParameters = {
				groupId: "batchSave",
				success: oSuccessCallback,
				error: oErrorCallback
			};
			this._preparePayload(mParameters, aSelectedItems).then(function (oData) {
				if (oData.length > 0) {
					this.saveChangesMain({
						state: "success",
						isCreate: true
					}, this._afterSuccess.bind(this), this._afterError.bind(this), this.getView());
				}
			}.bind(this));
		},

		/**
		 * Preapre payload for the create new assigmentes 
		 * Create changeset
		 * used deferredgroups
		 * @Param {mParameters} - details to odata model
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		_preparePayload: function (mParameters, aSelectedItems) {
			return new Promise(function (resolve) {
				this.getModel().setDeferredGroups(["batchSave"]);
				aSelectedItems.forEach(function (oItem) {
					var oRowData = oItem.getBindingContext().getObject(),
						singleentry = {
							groupId: "batchSave"
						},
						obj = {},
						entitySet = "PlanItemsSet";
					//collect all assignment properties who allowed for create
					this.getModel().getMetaModel().loaded().then(function () {
						var oMetaModel = this.getModel().getMetaModel(),
							oEntitySet = oMetaModel.getODataEntitySet(entitySet),
							oEntityType = oEntitySet ? oMetaModel.getODataEntityType(oEntitySet.entityType) : null,
							aProperty = oEntityType ? oEntityType.property : [];

						aProperty.forEach(function (property) {
							if (oRowData.hasOwnProperty(property.name) && oRowData[property.name]) {
								obj[property.name] = oRowData[property.name];
							}
						});
						obj.PLAN_ID = this.getView().getBindingContext().getProperty("PLAN_ID");
						singleentry.properties = obj;
						this.getModel().createEntry("/" + entitySet, singleentry);
					}.bind(this));
				}.bind(this));
				resolve(aSelectedItems);
			}.bind(this));
		}
	});
});