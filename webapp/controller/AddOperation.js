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
				}

			}
		},

		oSmartTable: null,
		selectedPlanObject: null,

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
					oTable = this.oSmartTable.getTable(),
					bCheckSelectAll = false;
				//When Select All is selected
				if (this.getView().getModel("viewModel").getProperty("/aAllSelectedOperations").length !== 0) {
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
			if (this.getView().getModel("viewModel").getProperty("/aAllSelectedOperations").length !== 0) {
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
							var oTable = this.oSmartTable.getTable(),
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
						this.selectedPlanObject = oParentSource.getBindingContext().getProperty("ObjectKey");
						singleentry.properties = obj;
						this.getModel().createEntry("/" + entitySet, singleentry);
					}.bind(this));
				}.bind(this));
				resolve(aSelectedItems);
			}.bind(this));
		}
	});

});