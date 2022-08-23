sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/base/util/isEmptyObject",
	"sap/ui/core/Fragment"
], function (BaseController, Controller, isEmptyObject, Fragment) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.block.demand.DemandsBlockController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				addOperations: {
					public: true,
					final: true
				},
				onPressEdit: {
					public: true,
					final: true
				}
			}
		},

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
		 * Close operation list frgament
		 * Before close it will remove table selection
		 */
		onPressOperationListCancel: function (oEvent) {
			this.onPressOperationSelectCancel();
			this.destroyOperationListFragment();
		},

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
		 * Sends the changed data to backend
		 */
		onPressEdit: function (oEvent) {
			var bEdit = oEvent.getParameter("editable");
			if (!bEdit && !isEmptyObject(this.getModel().getPendingChanges())) {
				this.saveChangesMain({
					state: "success",
					isCreate: false
				}, this._afterEditSuccess.bind(this), this._afterEditError.bind(this), this._oSmartTable);
			}
		},

		/* =========================================================== */
		/* Private methods                                              */
		/* =========================================================== */

		/**
		 * After operation edit success callback
		 */
		_afterEditSuccess: function () {
			this.showMessageToast(this.getResourceBundle().getText("msg.saveSuccess"));
			if (this._oSmartTable) {
				this._oSmartTable.rebindTable(true);
			}
			this.getModel().resetChanges();
		},

		/**
		 * After operation edit error callback
		 */
		_afterEditError: function () {
			if (this._oSmartTable) {
				this._oSmartTable.rebindTable(true);
			}
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
		 */
		_triggerFunctionImport: function (oParam, aSelectedItems) {
			var oParams = {
					PlanID: oParam.sPrepPlan,
					OrderNumber: oParam.sOrder,
					OperationNumber: oParam.sOpr
				},
				sFunctionName = "CalculateDate";

			var callbackfunction = function (oImportedData) {
				this._triggerItemMergerequest(aSelectedItems, this._saveSuccess.bind(this), this._saveFailed.bind(this));
			}.bind(this);

			this.callFunctionImport(oParams, sFunctionName, "GET", callbackfunction);
		},

		/**
		 * Prepare the payload for the merge call with selected operation for the add operation
		 */
		_triggerItemMergerequest: function (aSelectedItems, oSuccessCallback, oErrorCallback) {
			var mParameters = {
				groupId: "batchSave",
				success: oSuccessCallback,
				error: oErrorCallback
			};
			this._preparePayload(mParameters, aSelectedItems).then(function (oData) {
				if (oData.length > 0) {
					this.getModel().submitChanges(mParameters);
				}
			}.bind(this));
		},

		/**
		 * Preapre payload for the create new assigmentes 
		 * Create changeset
		 * used deferredgroups
		 * @Param {mParameters} - details to odata model
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
		},

		_saveSuccess: function () {
			this.getView().getModel().refresh();
		},

		_saveFailed: function () {
			sap.m.MessageToast.show("Failed");
		}

	});

});