sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/evorait/evosuite/evoprep/model/models",
	"com/evorait/evosuite/evoprep/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment"
], function (Controller, models, formatter, Filter, FilterOperator, Fragment) {
	"use strict";

	return Controller.extend("com.evorait.evosuite.evoprep.controller.MaterialInfoDialog", {

		formatter: formatter,
		_bFirstTime: false,
		init: function () {},

		/**
		 * open dialog
		 * get detail data from resource and resource group
		 * @param oView
		 * @param sBindPath
		 */
		open: function (oView, mParameters, aSelectedPaths) {
			// create dialog lazily
			if (!this._oDialog) {
				oView.getModel("viewModel").setProperty("/busy", true);
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.MaterialInfoDialog",
					controller: this
				}).then(function (oDialog) {
					oView.getModel("viewModel").setProperty("/busy", false);
					this._oDialog = oDialog;
					this.onOpen(oDialog, oView, aSelectedPaths, mParameters);
				}.bind(this));
			} else {
				this.onOpen(this._oDialog, oView, aSelectedPaths);
			}
		},
		onBeforeOpen: function (oEvent) {
			sap.ui.getCore().byId("materialInfoTable").setTableBindingPath();
		},

		onOpen: function (oDialog, oView, aSelectedPaths, mParameters) {
			// connect dialog to view (models, lifecycle)
			oView.addDependent(oDialog);
			this._mParameters = mParameters || {
				bFromHome: true
			};
			this._oView = oView;
			this._selectedFunction = null;
			this._aSelectedPaths = aSelectedPaths;
			this._component = this._oView.getController().getOwnerComponent();
			// setting the content density class on dialog
			oDialog.addStyleClass(this._component.getContentDensityClass());

			// open dialog
			oDialog.open();
			this._componentDetail(this._aSelectedPaths);
		},

		/**
		 * Filter Logic for Material COmponent Details
		 * @param oEvent
		 */
		_componentDetail: function (aSelectedPaths) {
			if (aSelectedPaths.length > 0 && this._bFirstTime) {
				var oSmartTable = sap.ui.getCore().byId("materialInfoTable");
				oSmartTable.rebindTable();

			}
			this._bFirstTime = true;

		},
		onBeforeRebindTable: function (oEvent) {
			var oParams = oEvent.getParameters(),
				oBinding = oParams.bindingParams,
				aFilter = new Filter(this._getDemandFilters(this._aSelectedPaths), true);
			oBinding.filters = [new Filter(aFilter, true)];
		},
		/**
		 * Return resource filters on selected resources
		 * @param aSelectedPaths {Array} Selected Demands
		 * @return aFilters Demand Filters
		 * @Author: Pranav
		 */
		_getDemandFilters: function (aSelectedPaths) {
			var aDemandGuid = [],
				oModel = this._oView.getModel();
			var aFilters = [];

			for (var i = 0; i < aSelectedPaths.length; i++) {
				var sPath = aSelectedPaths[i].sPath,
					sOrderId = this._oView.getModel().getProperty(sPath).ORDER_NUMBER,
					sOperationId = this._oView.getModel().getProperty(sPath).OPERATION_NUMBER;
				aDemandGuid.push(new Filter("ORDER_NUMBER", FilterOperator.EQ, sOrderId));
				aDemandGuid.push(new Filter("OPERATION_NUMBER", FilterOperator.EQ, sOperationId));
			}

			if (aDemandGuid.length > 0) {
				aFilters.push(new Filter({
					filters: aDemandGuid,
					and: false
				}));
			}
			return aFilters;
		},

		/**
		 * close dialog
		 */
		onCloseDialog: function (oEvent) {
			sap.ui.getCore().byId("materialInfoTable").setTableBindingPath("DemandToComponents");
			this._oDialog.close();
		}
	});
});