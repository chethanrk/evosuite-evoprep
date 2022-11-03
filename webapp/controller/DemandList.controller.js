sap.ui.define([
	//	"sap/ui/core/mvc/Controller"
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/base/util/isEmptyObject",
	"sap/f/library",
	"sap/m/MessageBox"
], function (BaseController, Fragment, OverrideExecution, isEmptyObject, library, MessageBox) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.DemandList", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onRowActionPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onClickNavAction: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				goBackToPrePlans: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				handleDemandSelectionChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCreatePrePlanButton: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressPlanNumber: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressNetworkKey: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onListPlanItemPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onListNetworkItemPress: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressAddExistingPlan: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressPlanListCancel: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressOprPlanSave: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		oSmartTable: null,
		selectedPlanObject: null,

		/* =========================================================== */
		/* Lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.DemandList
		 */
		onInit: function () {
			this.oSmartTable = this.getView().byId("demandListSmartTable");

			this.oViewModel = this.getModel("viewModel");
			this.oCreateModel = this.getModel("CreateModel");
		},

		/* =========================================================== */
		/* Public methods                                              */
		/* =========================================================== */

		/**
		 * Opens the popup containing button to nav to other Evo Apps
		 * @param oEvent
		 */
		onRowActionPress: function (oEvent) {
			var oContext = oEvent.getSource().getParent().getParent().getBindingContext(),
				oModel = oContext.getModel(),
				sPath = oContext.getPath(),
				oParent = oEvent.getSource().getParent();
			this.selectedPlanData = oModel.getProperty(sPath);
			if (!this._oDialog) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.NavigationActionSheet",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._oView = this.getView();
					this._component = this._oView.getController().getOwnerComponent();
					oDialog.addStyleClass(this._component.getContentDensityClass());
					// connect dialog to view (models, lifecycle)
					this.getView().addDependent(oDialog);
					oDialog.openBy(oParent);
				}.bind(this));
			} else {
				this._oDialog.openBy(oParent);
			}
		},

		/**
		 * Navigate to other EvoSuite apps
		 * @param oEvent
		 */
		onClickNavAction: function (oEvent) {
			var appName = oEvent.getSource().getBindingContext("templateProperties").getPath().split('/')[2],
				navContext = this.getModel("templateProperties").getProperty("/navLinks")[appName].ApplicationId;
			this.openEvoAPP(this.selectedPlanData.ORDER_NUMBER, navContext);
		},

		/*
		 * Navigates back to Pre-Plans list
		 */
		goBackToPrePlans: function () {
			this._removeOprTableSelection();
			this.getOwnerComponent().getRouter().navTo("PrePlanMaster");
		},

		/**
		 * Called when operation list selection change method 
		 * Enabled/Disabled create preplan button
		 * Validate for the minimum 1 operation selection
		 */
		handleDemandSelectionChange: function (oEvent) {
			var isEnabledPrePlanreate = false;
			var aSelecteOperationIndice = this.oSmartTable.getTable().getSelectedIndices();
			if (aSelecteOperationIndice.length > 0) {
				isEnabledPrePlanreate = true;
			}
			this.getModel("viewModel").setProperty("/allowPrePlanCreate", isEnabledPrePlanreate);
		},

		/**
		 * Called when create button on operation list page
		 * Navigate to the create preplan page
		 */
		onPressCreatePrePlanButton: function (oEvent) {
			var oTable = this.oSmartTable.getTable(),
				aSelectedIndices = oTable.getSelectedIndices();

			var oOperationData = this.oCreateModel.getData();
			aSelectedIndices.forEach(function (iIndex) {
				var oItem = oTable.getContextByIndex(iIndex),
					oSelObject = oItem.getObject();
				delete oSelObject.__metadata;
				//validate for the duplicate
				if (this.checkDuplicate(oOperationData.results, oSelObject.ObjectKey)) {
					oOperationData.results.push(oSelObject);
				}
			}.bind(this));
			this.oCreateModel.refresh();
			this._removeOprTableSelection();
			this.getRouter().navTo("CreatePrePlan", {
				layout: library.LayoutType.MidColumnFullScreen
			});
		},

		/**
		 * Called when clicks on the number of plan link
		 * To display plan details inside popover
		 */
		onPressPlanNumber: function (oEvent) {
			var oSource = oEvent.getSource(),
				oLineItem = oSource.getParent(),
				oContext = oLineItem.getBindingContext(),
				PlanNumber = oEvent.getSource().getText();
			if (!isNaN(PlanNumber) && parseInt(PlanNumber, 10) > 0) {
				if (!this._oPlanPopover) {
					Fragment.load({
						name: "com.evorait.evosuite.evoprep.view.fragments.OperationPlanDisplay",
						controller: this
					}).then(function (pPopover) {
						this._oPlanPopover = pPopover;
						this.getView().addDependent(this._oPlanPopover);
						this._oPlanPopover.setBindingContext(oContext);
						this._oPlanPopover.openBy(oSource);

					}.bind(this));
				} else {
					this._oPlanPopover.setBindingContext(oContext);
					this._oPlanPopover.openBy(oSource);
				}
			}
		},

		/**
		 * Called when clicks on the network key 
		 * If operation is assigned to any network it will allow to open popover with network details
		 */
		onPressNetworkKey: function (oEvent) {
			var oSource = oEvent.getSource(),
				oLineItem = oSource.getParent(),
				oContext = oLineItem.getBindingContext(),
				PlanNumber = oEvent.getSource().getText();
			if (!isNaN(PlanNumber) && parseInt(PlanNumber, 10) > 0) {
				if (!this._oNetworkPopover) {
					Fragment.load({
						name: "com.evorait.evosuite.evoprep.view.fragments.OperationNetworkDisplay",
						controller: this
					}).then(function (pPopover) {
						this._oNetworkPopover = pPopover;
						this.getView().addDependent(this._oNetworkPopover);
						this._oNetworkPopover.setBindingContext(oContext);
						this._oNetworkPopover.openBy(oSource);

					}.bind(this));
				} else {
					this._oNetworkPopover.setBindingContext(oContext);
					this._oNetworkPopover.openBy(oSource);
				}
			}
		},

		/**
		 * Called when plan item pressed inside popover display
		 * Navigate to detail page with selected plan
		 */
		onListPlanItemPress: function (oEvent) {
			var oSource = oEvent.getSource(),
				oContext = oSource.getBindingContext();
			this._removeOprTableSelection();
			var sObjKey = oContext.getProperty("ObjectKey");
			if (sObjKey) {
				this.navToDetail(sObjKey);
			}
		},

		/**
		 * Called when network item press inside popover display
		 * Navigate to evoorderreleate application
		 */
		onListNetworkItemPress: function (oEvent) {
			var oSource = oEvent.getSource();
			var oNavLinks = this.getModel("templateProperties").getProperty("/navLinks"),
				oContext = oSource.getBindingContext(),
				sProp = "NETWORK_KEY";

			if (oContext && oNavLinks[sProp]) {
				var sPath = oContext.getPath() + "/" + oNavLinks[sProp].Property;
				this.openEvoAPP(this.getModel().getProperty(sPath), oNavLinks[sProp].ApplicationId);
			}
		},

		/**
		 * Sends the changed data to backend
		 */
		onPressEdit: function (oEvent) {
			var bEdit = oEvent.getParameter("editable");
			this.getModel("viewModel").setProperty("/orderListEditMode", bEdit);
			if (!bEdit && !isEmptyObject(this.getModel().getPendingChanges())) {
				this.saveChanges(this.oSmartTable);
			}

		},

		/**
		 * Called when add to exsting plan button pressed
		 * Validate the final opetaions to exclude
		 */
		onPressAddExistingPlan: function (oEvent) {
			var oTable = this.oSmartTable.getTable(),
				aSelectedIndices = oTable.getSelectedIndices();

			if (this._validateOperationFinalStatus(aSelectedIndices, oTable)) {
				this.showMessageToast(this.getResourceBundle().getText("msg.operationFinalValidation"));
				return;
			}
			// create popover
			if (!this._addExistingPlan) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.PlanList",
					controller: this
				}).then(function (oDialog) {
					this._addExistingPlan = oDialog;
					this.getView().addDependent(oDialog);
					this.open(oDialog);
					this._addExistingPlan.attachAfterOpen(function () {
						var oPlanSmartTable = sap.ui.getCore().byId("idPlanListFragSmartTable");
						oPlanSmartTable.getTable().removeSelections();
						oPlanSmartTable.rebindTable();
					}.bind(this));
				}.bind(this));
			} else {
				this.open(this._addExistingPlan);
			}
			//this._removeOprTableSelection();
		},

		/**
		 * Close plan list frgament
		 * Before close it will remove table selection
		 */
		onPressPlanListCancel: function (oEvent) {
			this._addExistingPlan.close();
		},

		/*onPressSave for the selected operations to existing plans
		 */
		onPressOprPlanSave: function (oEvent) {
			var oSmartTable = this.getView().byId("demandListSmartTable"),
				oTable = oSmartTable.getTable(),
				aSelectedItems = oTable.getSelectedIndices();

			this._triggerItemMergerequest(aSelectedItems, this._addExistingSuccess.bind(this), this._addExistingError.bind(this));

			this.onPressPlanListCancel();
			this._removeOprTableSelection();
		},

		/* =========================================================== */
		/* Private methods                                           */
		/* =========================================================== */

		/**
		 * Method to deselect the selcted items
		 */
		_removeOprTableSelection: function () {
			this.oSmartTable.getTable().clearSelection(true);
			this.getModel("viewModel").setProperty("/allowPrePlanCreate", false);
		},

		/**
		 * Validate the final status selection
		 * @param [aSelectedIndices] - Selected items indices
		 * @param {oTable} - operation table
		 */
		_validateOperationFinalStatus: function (aSelectedIndices, oTable) {
			var bIndicator = false;
			aSelectedIndices.forEach(function (iIndex) {
				var oItem = oTable.getContextByIndex(iIndex),
					oSelObject = oItem.getObject();
				//validate for the final operations
				if (!oSelObject.ALLOW_EDIT) {
					bIndicator = true;
					return;
				}
			}.bind(this));

			return bIndicator;
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
					}, this._addExistingSuccess.bind(this), this._addExistingError.bind(this), this.getView());
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
		_preparePayload: function (mParameters, aSelectedItems) {
			return new Promise(function (resolve) {
				this.getModel().setDeferredGroups(["batchSave"]);
				aSelectedItems.forEach(function (iIndex) {
					var oTable = this.oSmartTable.getTable(),
						oItem = oTable.getContextByIndex(iIndex),
						oRowData = oItem.getObject(),
						planlist = sap.ui.getCore().byId("idPlanListFragSmartTable").getTable(),
						oSelPlan = planlist.getSelectedItem(),
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
						obj.PLAN_ID = oSelPlan.getBindingContext().getProperty("PLAN_ID");
						this.selectedPlanObject = oSelPlan.getBindingContext().getProperty("ObjectKey");
						singleentry.properties = obj;
						this.getModel().createEntry("/" + entitySet, singleentry);
					}.bind(this));
				}.bind(this));
				resolve(aSelectedItems);
			}.bind(this));
		},

		/**
		 * Save success callback for the add operation to the existing plan
		 */
		_addExistingSuccess: function () {
			var sTitle = this.getResourceBundle().getText("xtit.confirm"),
				sMsg = "wants to navigate to detail page of plan";

			var successcallback = function () {
				this.navToDetail(this.selectedPlanObject);
				this.selectedPlanObject = null;
			};

			var cancelCallback = function () {};
			this.showConfirmDialog(sTitle, sMsg, successcallback.bind(this), cancelCallback.bind(this));
		},

		/**
		 * Save error callback for the add operation to the existing plan
		 */
		_addExistingError: function () {
			this.getModel().resetChanges();
		}

	});

});