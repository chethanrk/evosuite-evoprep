sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment"
], function (BaseController, Fragment) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.CreatePrePlan", {

		oViewModel: null,
		oCreateModel: null,
		aSmartForms: [],
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.CreatePrePlan
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			this.oCreateModel = this.getModel("CreateModel");

			//Bind the message model to the view and register it
			if (this.getOwnerComponent) {
				this.getOwnerComponent().registerViewToMessageManager(this.getView());
			}

			var oRouter = this.getRouter();
			//route for page create new preplan
			oRouter.getRoute("CreatePrePlan").attachMatched(function (oEvent) {
				this._initializeView();
			}, this);
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.view.CreatePrePlan
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.CreatePrePlan
		 */
		onAfterRendering: function () {
			this._initializeView();
		},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.view.CreatePrePlan
		 */
		//	onExit: function() {
		//
		//	}

		onNavBackMaster: function () {
			if (this.oCreateModel.getData().results && this.oCreateModel.getData().results.length) {
				this.confirmEditCancelDialog();
			} else {
				this.onNavBack();
			}
		},

		/**
		 * On press add button on the create plan page
		 * It will open a fragment with operation list to enable selection
		 */
		onPressAddOperations: function (oEvent) {
			// create popover
			if (!this._addOperationsFrag) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.OperationList",
					controller: this
				}).then(function (oDialog) {
					this._addOperationsFrag = oDialog;
					this.open(oDialog);
					sap.ui.getCore().byId("idOperationListFragSmartTable").getTable().removeSelections();
				}.bind(this));
			} else {
				this.open(this._addOperationsFrag);
				sap.ui.getCore().byId("idOperationListFragSmartTable").getTable().removeSelections();
			}
		},

		/**
		 * Close operation list frgament
		 * Before close it will remove table selection
		 */
		onPressOperationListCancel: function (oEvent) {
			this._addOperationsFrag.close();
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
				this.showMessageToast("Select atleast one operation");
				return;
			}
			var oOperationData = this.oCreateModel.getData();
			aSelectedItems.forEach(function (oItem) {
				var oSelObject = oItem.getBindingContext().getObject();
				delete oSelObject.__metadata;
				var iFindIndex = this._checkDuplicate(oOperationData.results, oSelObject.ObjectKey);
				if (iFindIndex === -1) {
					oOperationData.results.push(oSelObject);
				}
			}.bind(this));
			this.oCreateModel.refresh();
			this.onPressOperationListCancel();
		},

		/**
		 * Remove added operations from the operation table
		 * removed data from the model
		 */
		removeOperation: function (oEvent) {
			var oSource = oEvent.getSource(),
				sPath = oSource.getId().slice(-1);

			this.oCreateModel.getData().results.splice(parseInt(sPath, 10), 1);
			this.oCreateModel.refresh();
		},

		/**
		 * create new plan
		 */
		onPressSave: function (oEvent) {
			if (this.aSmartForms.length > 0) {
				var mErrors = this.validateForm(this.aSmartForms);
				//if form is valid save created entry
				if (mErrors.state === "success") {
					var oformData = this.getView().getBindingContext(),
						oDataObject = oformData.getObject();
					this._prepareHeaderData(oDataObject).then(function (oPayloadData) {
						oPayloadData.PlanHeaderToPlanItems = [];
						var aOperationData = this.oCreateModel.getData();
						oPayloadData.PlanHeaderToPlanItems = aOperationData.results;
						console.log(oPayloadData);

						this.CreatePrePlan(oPayloadData, this._createSuccess.bind(this), this._createFail.bind(this));
					}.bind(this));
				}
			}
		},

		/**
		 * when view was integrated set additional page parameters
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, true);
		},

		/**
		 * check dulicate entires 
		 * @{param} oData - create model operation data
		 * @param ObjectKey - object key to compare
		 */
		_checkDuplicate: function (oData, ObjectKey) {
			return oData.findIndex(function (oItem) {
				return (oItem.ObjectKey === ObjectKey);
			});
		},

		/**
		 * Create header payload 
		 * @{param} oFormData - forma data
		 */
		_prepareHeaderData: function (oFormData) {
			return new Promise(function (resolve) {
				var obj = {};
				//collect all assignment properties who allowed for create
				this.getModel().getMetaModel().loaded().then(function () {
					var oMetaModel = this.getModel().getMetaModel(),
						oEntitySet = oMetaModel.getODataEntitySet("PlanHeaderSet"),
						oEntityType = oEntitySet ? oMetaModel.getODataEntityType(oEntitySet.entityType) : null,
						aProperty = oEntityType ? oEntityType.property : [];

					aProperty.forEach(function (property) {
						//obj[property.name] = "";
						if (oFormData[property.name]) {
							obj[property.name] = oFormData[property.name];
						}
					});
					resolve(obj);
				}.bind(this));
			}.bind(this));
		},

		_createSuccess: function (oResponse) {
			console.log(oResponse);
		},

		_createFail: function (oError) {
			console.log(oError);
		},

	});

});