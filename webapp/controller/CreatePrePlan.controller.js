sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, Fragment, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.CreatePrePlan", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {

				onNavBackMaster: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onPressAddOperations: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onPressOperationListCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onPressAdd: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				removeOperation: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onPressSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},

				onUpdateFinished: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

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
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.CreatePrePlan
		 */
		onAfterRendering: function () {
			this._initializeView();
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * Nav back functionality
		 * check for the changes in the view if exist confirmation pop will open
		 * if no changes it will navigate to master page
		 */
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
					this._addOperationsFrag.attachAfterOpen(function () {
						var oOpSmartTable = sap.ui.getCore().byId("idOperationListFragSmartTable");
						oOpSmartTable.getTable().removeSelections();
						oOpSmartTable.rebindTable();
					}.bind(this));
				}.bind(this));
			} else {
				this.open(this._addOperationsFrag);
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
				this.showMessageToast(this.getResourceBundle().getText("msg.selectAtleast"));
				return;
			}
			var oOperationData = this.oCreateModel.getData();
			aSelectedItems.forEach(function (oItem) {
				var oSelObject = oItem.getBindingContext().getObject();
				delete oSelObject.__metadata;
				//validate for the duplicate
				if (this.checkDuplicate(oOperationData.results, oSelObject.ObjectKey)) {
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
				oSelItem = oSource.getParent(),
				oContext = oSelItem.getBindingContext("CreateModel"),
				sPath = oContext.getPath().slice(-1);

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

						this.CreatePrePlan(oPayloadData, this._createSuccess.bind(this));
					}.bind(this));
				}
			}
		},

		/**
		 * Called when each time CreateModel gets update
		 * set operation table row count 
		 * validate the From Date and To date with operations earliast start date and latest end date
		 */
		onUpdateFinished: function (oEvent) {
			var oSource = oEvent.getSource(),
				aItems = oSource.getItems();
			//set operation table row count
			this.getModel("viewModel").setProperty("/operationTableCount", this.getResourceBundle().getText("tit.opr", (aItems.length).toString()));

			//validate from and to date with operations
			if (aItems.length) {
				this._getValidationParameters(aItems).then(function (oPreparedData) {
					if (oPreparedData && oPreparedData.sOrder && oPreparedData.sOpr) {
						this._triggerFunctionImport(oPreparedData);
					}
				}.bind(this));
			}
		},

		/* =========================================================== */
		/* internal methods                                              */
		/* =========================================================== */

		/**
		 * when view was integrated set additional page parameters
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
			this.setFormsEditable(this.aSmartForms, true);
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

		/**
		 * Called when create request sussessfully saved in backend
		 * @{param} oResponse - response from the backend
		 * unbind old context and bind new context
		 * Set default values
		 */
		_createSuccess: function (oResponse) {
			if (oResponse) {
				//Bind new context
				this.getView().unbindElement();
				var oContext = this.getView().getModel().createEntry("/PlanHeaderSet");
				this.getView().setBindingContext(oContext);
				this.getModel("CreateModel").getData().results = [];
				this.getModel("CreateModel").refresh();

				// defaulting values
				this._initializeView();
			}
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
					var sordnum = oItem.getBindingContext("CreateModel").getProperty("ORDER_NUMBER"),
						soprnum = oItem.getBindingContext("CreateModel").getProperty("OPERATION_NUMBER");

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
		_triggerFunctionImport: function (oParam) {
			var oParams = {
					PlanID: '',
					OrderNumber: oParam.sOrder,
					OperationNumber: oParam.sOpr
				},
				sFunctionName = "CalculateDate";

			var callbackfunction = function (oImportedData) {
				var sPath = this.getView().getBindingContext().getPath();
				this.getModel().setProperty(sPath + "/START_DATE", oImportedData.START_DATE);
				this.getModel().setProperty(sPath + "/END_DATE", oImportedData.END_DATE);

				var oStartDate = this.getFormFieldByName("idSTART_DATE", this.aSmartForms),
					oEndData = this.getFormFieldByName("idEND_DATE", this.aSmartForms);

				if (oStartDate) {
					oStartDate.getContent().setMaxDate(oImportedData.START_DATE);
				}
				if (oEndData) {
					oEndData.getContent().setMinDate(oImportedData.END_DATE);
				}

			}.bind(this);

			this.callFunctionImport(oParams, sFunctionName, "GET", callbackfunction);
		}

	});

});