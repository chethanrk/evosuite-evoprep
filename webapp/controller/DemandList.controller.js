sap.ui.define([
	//	"sap/ui/core/mvc/Controller"
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/base/util/isEmptyObject"
], function (BaseController, Fragment, OverrideExecution, isEmptyObject) {
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
				onNavLinkVisibilty: {
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
				}
			}
		},

		oSmartTable: null,

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
			this.selectedDemandData = oModel.getProperty(sPath);
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
			var appName = oEvent.getSource().getProperty("text"),
				results = oEvent.getSource().getBindingContext("navLinks").getModel().getData().results[0].Value1;
		},

		/*
		 * Navigation Action Sheet button dynamic visibilty
		 */
		onNavLinkVisibilty: function (oView) {
			var sEnableField,
				oNavLinksData = oView.getModel("navLinks").getData();
			for (var n = 0; n < oNavLinksData.length; n++) {
				sEnableField = "ENABLE_ROUTE_" + oNavLinksData[n].ApplicationId;
				oNavLinksData[n].btnVisibility = false;
				if (this.selectedDemandData[sEnableField] === true) {
					oNavLinksData[n].btnVisibility = true;
				}
			}
			oView.getModel("navLinks").refresh(true);
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
			this.getRouter().navTo("CreatePrePlan");
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

		/* =========================================================== */
		/* Private methods                                           */
		/* =========================================================== */

		/**
		 * Method to deselect the selcted items
		 */
		_removeOprTableSelection: function () {
			this.oSmartTable.getTable().clearSelection(true);
			this.getModel("viewModel").setProperty("/allowPrePlanCreate", false);
		}
	});

});