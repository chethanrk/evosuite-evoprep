sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/base/util/isEmptyObject",
	"sap/f/library",
	"sap/m/MessageBox"
], function (BaseController, Fragment, OverrideExecution, isEmptyObject, library, MessageBox) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.AddOperation", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				getValidationParameters: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				triggerFunctionImport: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				confirmDateChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				triggerItemMergerequest: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				preparePayload: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onFinalizeBtnPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onMaterialStatusPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onMaterialInfoButtonPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onReprocessBtnPressed: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		oSmartTable: null,
		selectedPlanObject: null,

		oTable: null,

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Base for the operation list and demand block oninit
		 */
		onInit: function () {
			BaseController.prototype.onInit.apply(this, arguments);
			this.oViewModel = this.getModel("viewModel");
		},

		/**
		 * Prepare function import parameter ready
		 * check for the order number and operation number 
		 * @[param] - aItems - operationlist items
		 */
		getValidationParameters: function (aItems) {
			return new Promise(function (resolve) {
				var oPrepData = {
						"sOrder": undefined,
						"sOpr": undefined
					},
					oTable = this.oTable,
					bCheckSelectAll = false;
				//When Select All is selected
				if (this.getModel("viewModel").getProperty("/aAllSelectedOperations").length !== 0) {
					bCheckSelectAll = true;
				}
				aItems.forEach(function (oItem) {
					var oContext, sordnum, soprnum;
					//When Select All is selected
					if (bCheckSelectAll) {
						sordnum = oItem.ORDER_NUMBER;
						soprnum = oItem.OPERATION_NUMBER;
					} else {
						oContext = null;
						if (typeof (oItem) === "number") {
							oContext = oTable.getContextByIndex(oItem);
						} else {
							oContext = oItem.getBindingContext();
						}

						sordnum = oContext.getProperty("ORDER_NUMBER");
						soprnum = oContext.getProperty("OPERATION_NUMBER");
					}
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
		triggerFunctionImport: function (oParam, aSelectedItems, oSuccessCallback, oErrorCallback) {
			var oParams = {
					PlanID: oParam.sPrepPlan,
					OrderNumber: oParam.sOrder,
					OperationNumber: oParam.sOpr
				},
				sFunctionName = "CalculateDate";

			var callbackfunction = function (oImportedData) {
				this.confirmDateChange(aSelectedItems, oSuccessCallback, oErrorCallback);
			}.bind(this);

			this.callFunctionImport(oParams, sFunctionName, "GET", callbackfunction);
		},

		/**
		 * Confirm before add operations to table
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		confirmDateChange: function (aSelectedItems, oSuccessCallback, oErrorCallback) {
			var sTitle = this.getResourceBundle().getText("xtit.confirm"),
				sMsg = this.getResourceBundle().getText("msg.operationUpdateConfirm");

			var successFn = function () {
				this.triggerItemMergerequest(aSelectedItems, oSuccessCallback, oErrorCallback);
			};
			this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
		},

		/**
		 * Prepare the payload for the merge call with selected operation for the add operation
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		triggerItemMergerequest: function (aSelectedItems, oSuccessCallback, oErrorCallback) {
			var mParameters = {
				groupId: "batchSave",
				success: oSuccessCallback,
				error: oErrorCallback
			};

			this.preparePayload(mParameters, aSelectedItems).then(function (oData) {
				if (oData.length > 0) {
					this.saveChangesMain({
						state: "success",
						isCreate: true
					}, oSuccessCallback, oErrorCallback, this.getView());
				}
			}.bind(this));
		},

		/**
		 * Preapre payload for the add operation to existing plan 
		 * Create changeset
		 * used deferredgroups
		 * @Param {mParameters} - details to odata model
		 * @{param} -aSelectedItems - Selected operations from the operation list 
		 */
		preparePayload: function (mParameters, aSelectedItems) {
			var bCheckSelectAll = false;
			//When Select All is selected
			if (this.getModel("viewModel").getProperty("/aAllSelectedOperations").length !== 0) {
				bCheckSelectAll = true;
			}
			return new Promise(function (resolve) {
				this.getModel().setDeferredGroups(["batchSave"]);
				aSelectedItems.forEach(function (iIndex) {
					var oRowData = null,
						oParentSource = null,
						singleentry = {
							groupId: "batchSave"
						},
						obj = {},
						entitySet = "PlanItemsSet";
					if (bCheckSelectAll) {
						oRowData = iIndex;
						oParentSource = this.getView();
					} else {
						if (typeof (iIndex) === "number") {
							var oTable = this.oTable,
								oItem = oTable.getContextByIndex(iIndex);
							oRowData = oItem.getObject();
							var planlist = sap.ui.getCore().byId("idPlanListFragSmartTable").getTable();
							oParentSource = planlist.getSelectedItem();
						} else {
							oRowData = iIndex.getBindingContext().getObject();
							oParentSource = this.getView();
						}
					}

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
						obj.PLAN_ID = oParentSource.getBindingContext().getProperty("PLAN_ID");
						this.selectedPlanObject = oParentSource.getBindingContext();
						singleentry.properties = obj;
						this.getModel().createEntry("/" + entitySet, singleentry);
					}.bind(this));
				}.bind(this));
				resolve(aSelectedItems);
			}.bind(this));
		},

		/**
		 * On Refresh Material Status Button press in Demand/Operations Table
		 * used in the for table in demandsblock and demandslist
		 */
		onMaterialStatusPress: function (oEvent) {
			var oTable = this.oTable;
			var oSelectedIndices = this._returnPropertyContext(oTable, "COMPONENT_EXISTS"),
				oViewModel = this.getModel("viewModel"),
				sDemandPath, aPromises = [];
			oViewModel.setProperty("/busy", true);
			for (var i = 0; i < oSelectedIndices.length; i++) {
				sDemandPath = oSelectedIndices[i].getPath();
				aPromises.push(this.getOwnerComponent().readData(sDemandPath));
			}
			Promise.all(aPromises).then(function () {
				oViewModel.setProperty("/busy", false);
			});
		},
		/**
		 * On Material Info Button press event in Demands/Operations Table
		 * used in the for table in demandsblock and demandslist
		 */
		onMaterialInfoButtonPress: function () {
			var oTable = this.oTable;
			var aSelectedItems = this._returnPropertyContext(oTable, "COMPONENT_EXISTS");
			var aSelectedItemsPath = [];
			for (var i = 0; i < aSelectedItems.length; i++) {
				aSelectedItemsPath.push({
					sPath: aSelectedItems[i].getPath()
				});
			}
			if (aSelectedItemsPath.length > 0) {
				this.getOwnerComponent().materialInfoDialog.open(this.getView(), aSelectedItemsPath);
			}
		},
		/**
		 * Method called on the press of finalize button press on the 
		 * operations table
		 */
		onFinalizeBtnPress: function () {
			var oTable = this.oTable,
				iTotalSelections,
				aSelectedContext = this._returnPropertyContext(oTable, "ALLOW_EDIT"),
				sPath;
			// validating the selected context
			if (oTable.getAggregation("items")) {
				iTotalSelections = oTable.getSelectedItems();
			} else {
				iTotalSelections = oTable.getSelectedIndices();
			}
			if (iTotalSelections.length !== aSelectedContext.length) {
				this.showMessageToast(this.getResourceBundle().getText("msg.operationTinalizeBtnValidation"));
				return;
			}

			for (var i = 0; i < aSelectedContext.length; i++) {
				sPath = aSelectedContext[i].getPath();
				this.getModel().setProperty(sPath + "/FUNCTION", "OPER_FINAL");
			}
			if (aSelectedContext.length > 0) {
				this.saveChangesMain({
					state: "success",
					isCreate: false
				}, this._afterSucessFinalize.bind(this));
			}
		},
		/**
		 * This method is used to validate if the user can edit the 
		 * operation or not
		 * @param mParam is the event object
		 * @mParam mProperty is the model property
		 */
		validateEditFinalizeOperation: function (mParam, mProperty) {
			var oContext = mParam.getParameter("changeEvent").getSource().getBindingContext();
			var sValue = oContext.getProperty(mProperty);
			if (!sValue) {
				this.getView().getModel().resetChanges([oContext.getPath()]);
				this.showMessageToast(this.getResourceBundle().getText("msg.operationEditFinalizeValidation"));
			}
		},
		/**
		 * Method called on the press of reprocess button press on the 
		 * operations table in the operation list
		 */
		onReprocessBtnPressed: function () {
			var oTable = this.oTable,
				oViewModel = this.getModel("viewModel"),
				oModel = this.getModel(),
				iTotalSelections,
				aSelectedContext = this._returnPropertyContext(oTable, "ALLOW_REPROCESS"),
				sPath,
				aPromises = [],
				othat = this;
			// validating the selected context
			if (oTable.getAggregation("items")) {
				iTotalSelections = oTable.getSelectedItems();
			} else {
				iTotalSelections = oTable.getSelectedIndices();
			}
			if (iTotalSelections.length !== aSelectedContext.length) {
				this.showMessageToast(this.getResourceBundle().getText("msg.operationReprocessValidation"));
				return;
			}
			for (let x in aSelectedContext) {
				let oPrams = {
					OperationGuid: aSelectedContext[x].getProperty("ObjectKey")
				};
				aPromises.push(new Promise(function(resolve, reject){
					this.callFunctionImport(oPrams,"ReprocessItem","POST",resolve);
				}.bind(this)));
			}
			Promise.all(aPromises).then(function () {
				oViewModel.setProperty("/busy", false);
				if (oTable.getAggregation("items")) {
					oTable.removeSelections();
				} else {
					oTable.clearSelection(true);
				}
				oViewModel.setProperty("/bOperationReprocess", false);
				this.getModel().refresh();
				this.oSmartTable.rebindTable(true);
				this.getModel().resetChanges();
			}.bind(this));
		},

		/** Method to get the context of selected items in the 
		 * demands table which has component_exist true for 
		 * checking the material information
		 * This method is used in the DemandsBlock and DemandsList Views
		 * @param oTable {object} table instance
		 * @param sProperty {string} property name to be validate
		 * @return aArrayPropertyContext {array}
		 */
		_returnPropertyContext: function (oTable, sProperty) {
			var aSelectections, aContext, sDemandPath, bPropertyExist, aArrayPropertyContext = [];
			if (oTable.getAggregation("items")) {
				aSelectections = oTable.getSelectedItems();
				for (var i = 0; i < aSelectections.length; i++) {
					aContext = aSelectections[i].getBindingContext();
					if (aContext) {
						sDemandPath = aContext.getPath();
						bPropertyExist = this.getModel().getProperty(sDemandPath + "/" + sProperty);
						if (bPropertyExist) {
							aArrayPropertyContext.push(aContext);
						}
					}
				}
			} else {
				aSelectections = this.oTable.getSelectedIndices();
				for (var j = 0; j < aSelectections.length; j++) {
					aContext = this.oTable.getContextByIndex(aSelectections[j]);
					if (aContext) {
						sDemandPath = aContext.getPath();
						bPropertyExist = this.getModel().getProperty(sDemandPath + "/" + sProperty);
						if (bPropertyExist) {
							aArrayPropertyContext.push(aContext);
						}
					}
				}
			}
			return aArrayPropertyContext;
		},

		/**
		 * Validate finalise and material button enable state
		 */
		_handleOprCommonBtnEnable: function () {
			if (this._returnPropertyContext(this.oTable, "COMPONENT_EXISTS").length > 0) {
				this.oViewModel.setProperty("/bMaterialsDemandsBlock", true);
			} else {
				this.oViewModel.setProperty("/bMaterialsDemandsBlock", false);
			}
			// check the enable or disable finalize button in the operations table header
			if (this._returnPropertyContext(this.oTable, "ALLOW_EDIT").length > 0) {
				this.oViewModel.setProperty("/bEnableFinalizeBtn", true);
			} else {
				this.oViewModel.setProperty("/bEnableFinalizeBtn", false);
			}
		},

		/** This method is called after the sucess call on press
		 * of the finalize button for the operation
		 */
		_afterSucessFinalize: function () {
			var oTable = this.oTable;
			if (oTable.getAggregation("items")) {
				oTable.removeSelections();
			} else {
				oTable.clearSelection(true);
			}
			this.getModel("viewModel").setProperty("/bEnableFinalizeBtn", false);
			this.getModel().refresh();
			this.oSmartTable.rebindTable(true);
			this.getModel().resetChanges();
			this.refreshGantChartData();
		}
	});

});