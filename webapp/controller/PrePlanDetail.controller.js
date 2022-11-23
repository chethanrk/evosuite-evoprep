sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/f/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/base/util/deepClone",
	"com/evorait/evosuite/evoprep/model/formatter",
	"sap/gantt/misc/Utility",
	"sap/m/MessageBox"
], function (BaseController, Fragment, OverrideExecution, library, Filter, FilterOperator, deepClone, formatter, Utility, MessageBox) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanDetail", {

		formatter: formatter,

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onPressHeaderEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressGanttFullScreen: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressCancelPrePlanHeader: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				oPressDetailDelete: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressChangeStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onSelectChangeStatus: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onClickExpandCollapse: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onShowDependencies: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onShapeDrop: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onShapeResize: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressShapesEdit: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressSavePrePlanHeader: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				navBack: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressUtilizationSync: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onUtilizationSelectionChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressUtilizationGanttFullScreen: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onUtilizationShapeDoubleClick: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onBeforeRebindUtilizationDetails: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPlanningGanttChangeDateRange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		_oContext: null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			this.oViewModel.setProperty("/busy", false);
			var eventBus = sap.ui.getCore().getEventBus();

			this.oViewModel.setProperty("/busy", false);
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
			eventBus.subscribe("BaseController", "refreshFullGantt", this._loadGanttData, this);
			eventBus.subscribe("BaseController", "refreshUtilizationGantt", this._loadUtilizationGantt, this);

			//Initializing GanttActions.js
			this.GanttActions = this.getOwnerComponent().GanttActions;
			this.GanttActions.init(this.getView());

			this._treeTable = this.getView().byId("idPlanningGanttTreeTable");
			this._axisTime = this.getView().byId("idPlanningGanttZoom");

			this._UtilizationAxisTime = this.getView().byId("idUtilizationGanttZoom");
			this._UtilizationSelectView = this.getView().byId("idUtilizationSelect");
		},
		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onAfterRendering: function () {
			this._initializeView();
		},
		/**
		 * Called when a controller is destroyed
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);

			if (this._actionSheetStatus) {
				this._actionSheetStatus.destroy(true);
				this._actionSheetStatus = null;
			}
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/*On Press of Header Edit Button
		 * @param oEvent
		 */
		onPressHeaderEdit: function (oEvent) {
			this.setFormsEditable(this.aSmartForms, true);
			this._validateDates();
			this.oViewModel.setProperty("/editMode", false);
			this.oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
			this.oViewModel.setProperty("/fullscreen", false);
		},

		/*On Press of Header Edit Button
		 * @param oEvent
		 */
		onPressGanttFullScreen: function (oEvent) {
			var oSource = oEvent.getSource(),
				oViewModel = this.getModel("viewModel");
			if (oSource.getIcon() === "sap-icon://full-screen") {
				oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				oViewModel.setProperty("/ganttFullMode", true);
				oViewModel.setProperty("/ganttUtilizationFullMode", false);
				this.oViewModel.setProperty("/fullscreenGantt", false);
				oSource.setType("Emphasized");
			} else {
				if (oViewModel.getProperty("/fullscreen")) {
					oViewModel.setProperty("/layout", library.LayoutType.TwoColumnsMidExpanded);
				} else {
					oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				}
				oViewModel.setProperty("/ganttFullMode", true);
				oViewModel.setProperty("/ganttUtilizationFullMode", true);
				this.oViewModel.setProperty("/fullscreenGantt", true);
				oSource.setType("Default");
			}
		},

		/**
		 * Called onClick of Cancel when edit is enabled for header
		 * Shows dialog when user wants to cancel the edited changes
		 */
		onPressCancelPrePlanHeader: function () {
			var successFn = function () {
				this._clearData();
			};
			this.showConfirmDialog(this.getResourceBundle().getText("xtit.confirm"), this.getResourceBundle().getText("msg.leaveWithoutSave"),
				successFn.bind(this));
		},

		/*
		Saving Edited Header Data Using Submit Changes	
		*/
		onPressSavePrePlanHeader: function () {
			if (this.aSmartForms.length > 0) {
				var oModel = this.getModel(),
					oResourceBundle = this.getResourceBundle(),
					mErrors = this.validateForm(this.aSmartForms);
				//if form is valid save created entry
				if (mErrors.state === "success") {
					if (oModel.hasPendingChanges()) {
						this.saveChangesMain(mErrors, this._saveSuccess.bind(this), this._errorCallBackForPlanHeaderSet.bind(this));
					} else {
						sap.m.MessageToast.show(oResourceBundle.getText("ymsg.noChangesPrePlanHeaderEdit"));
					}
				} else {
					sap.m.MessageToast.show(oResourceBundle.getText("ymsg.invalidChangesPrePlanHeaderEdit"));
				}
			}
		},

		/**
		 * Detail page delete functionality
		 */
		oPressDetailDelete: function () {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				sMsg = this.getResourceBundle().getText("msg.confirmDeletePrepLan");

			if (this._oContext) {
				var successFn = function () {
					this.deleteEntries([this._oContext], null).then(function () {
						this.nav2Master();
					}.bind(this));
				};
				this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
			}
		},

		/**
		 * Copy the opened plan
		 * */
		onPressCopyPrePlanHeader: function () {
			var sGuid = this._oContext.getProperty("ObjectKey");
			this.copySelectedPlan(sGuid);
		},

		/**
		 * show ActionSheet of status buttons
		 * @param oEvent
		 */
		onPressChangeStatus: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._actionSheetStatus) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.StatusChange",
					controller: this,
					type: "XML"
				}).then(function (oFragment) {
					this._actionSheetStatus = oFragment;
					this.getView().addDependent(oFragment);
					this._actionSheetStatus.addStyleClass(this.getModel("viewModel").getProperty("/densityClass"));
					this._actionSheetStatus.openBy(oButton);
				}.bind(this));
			} else {
				this._actionSheetStatus.openBy(oButton);
			}
		},

		/**
		 * Event triggered when user or system status dropdown is clicked/selected
		 * @param oEvent
		 */
		onSelectChangeStatus: function (oEvent) {
			var oSource = oEvent.getSource(),
				oItem = oEvent.getParameter("item");
			this.sFunctionKey = oItem ? oItem.data("key") : oSource.data("key");
			this._updateStatus();
		},

		/**
		 * On click on expand the tree nodes gets expand to level 1
		 * On click on collapse all the tree nodes will be collapsed to root.
		 * @param oEvent
		 */
		onClickExpandCollapse: function (oEvent) {
			var oButton = oEvent.getSource(),
				oCustomData = oButton.getCustomData();
			if (oCustomData[0].getValue() === "EXPAND" && this._treeTable) {
				this._treeTable.expandToLevel(1);
			} else {
				this._treeTable.collapseAll();
			}
		},

		/**
		 * On click on Hide/Show Dependencies, Relationships will be hidden and shown
		 * @param oEvent
		 */
		onShowDependencies: function (oEvent) {
			var oSource = oEvent.getSource(),
				sButtonText = oSource.getText(),
				oResourceBundle = this.getResourceBundle();
			//Service Call while clicking on Show Dependencies Button for First Time
			if (this.oViewModel.getProperty("/bDependencyCall")) {
				this._loadGanttData();
			}
			if (sButtonText === oResourceBundle.getText("xbut.hideDependencies")) {
				this.getModel("viewModel").setProperty("/bShowDependencies", false);
				oSource.setText(oResourceBundle.getText("xbut.showDependencies"));
			} else {
				this.getModel("viewModel").setProperty("/bShowDependencies", true);
				oSource.setText(oResourceBundle.getText("xbut.hideDependencies"));
			}
		},

		/**
		 * Triggered when a Operatio shape is dragged inside Gantt
		 * and dropped to same row
		 * @param oEvent
		 */
		onShapeDrop: function (oEvent) {
			var oParams = oEvent.getParameters(),
				aDraggedShapes = oParams.draggedShapeDates,
				oTargetContext = oParams.targetRow ? oParams.targetRow.getBindingContext("ganttModel") : null,
				sNewStartDate = oParams.newDateTime,
				aShapeData = [],
				sNewEndDate, sDateDifference, oDraggedData, sStartDateTime, sEndDateTime;
			if (!oTargetContext) {
				oTargetContext = oParams.targetShape.getParent().getParent().getBindingContext("ganttModel");
			}
			for (var i in aDraggedShapes) {
				var sSourcePath = Utility.parseUid(i).shapeDataName,
					sTargetPath = oTargetContext.getPath();
				oDraggedData = this.getModel("ganttModel").getProperty(sSourcePath);
				sStartDateTime = formatter.mergeDateTime(oDraggedData.START_DATE, oDraggedData.START_TIME);
				sEndDateTime = formatter.mergeDateTime(oDraggedData.END_DATE, oDraggedData.END_TIME);
				sDateDifference = moment(sEndDateTime).diff(sStartDateTime);
				if (sDateDifference < 0) {
					sDateDifference = sDateDifference * -1;
				}
				sNewEndDate = new Date(moment(sNewStartDate).add(sDateDifference));
				oDraggedData.START_TIME.ms = sNewStartDate.getTime();
				oDraggedData.END_TIME.ms = sNewEndDate.getTime();

				this.getModel("ganttModel").setProperty(sSourcePath + "/START_DATE", sNewStartDate);
				this.getModel("ganttModel").setProperty(sSourcePath + "/END_DATE", sNewEndDate);
				aShapeData.push(oDraggedData);
			}
			this.GanttActions._prepareGanttOpeartionPayload(aShapeData).then(function (aPayload) {
				this.GanttActions._proceedToGanttOperationUpdate();
			}.bind(this));
		},

		/**
		 * Triggered when Operation shape are resized 
		 * validate shape new dates and if change is allowed
		 * @param oEvent
		 */
		onShapeResize: function (oEvent) {
			var oParams = oEvent.getParameters(),
				oRowContext = oParams.shape.getBindingContext("ganttModel"),
				oData = this.getModel("ganttModel").getProperty(oRowContext.getPath()),
				aShapeData = [];
			//Adjusting End Date and Time after resize
			if (oParams.newTime[0] === oParams.oldTime[0]) {
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/START_DATE", oData.START_DATE);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/START_TIME", oData.START_TIME);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/END_DATE", oParams.newTime[1]);
				oData.END_TIME.ms = formatter.formatTimeZone(oParams.newTime[1]);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/END_TIME", oData.END_TIME);
				oData.END_DATE = moment(oData.END_DATE).endOf('day').subtract(999, 'milliseconds').toDate();
			}
			//Adjusting Start Date and Time after resize
			if (oParams.newTime[1] === oParams.oldTime[1]) {
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/END_DATE", oData.END_DATE);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/END_TIME", oData.END_TIME);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/START_DATE", oParams.newTime[0]);
				oData.START_TIME.ms = formatter.formatTimeZone(oParams.newTime[0]);
				this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/START_TIME", oData.START_TIME);
				oData.START_DATE = moment(oData.START_DATE).endOf('day').subtract(999, 'milliseconds').toDate();
			}
			aShapeData.push(oData);
			this.GanttActions._prepareGanttOpeartionPayload(aShapeData).then(function (aPayload) {
				this.GanttActions._proceedToGanttOperationUpdate();
			}.bind(this));
		},

		/**
		 * On click on Edid button on Gantt
		 * Function to enable/disable Operation Shapes
		 * @param oEvent
		 */
		onPressShapesEdit: function (oEvent) {
			var oSource = oEvent.getSource();
			if (oSource.getIcon() === "sap-icon://edit") {
				oSource.setIcon("sap-icon://display");
				this.getModel("viewModel").setProperty("/bEnableGanttShapesEdit", false);
			} else {
				oSource.setIcon("sap-icon://edit");
				this.getModel("viewModel").setProperty("/bEnableGanttShapesEdit", true);
			}
		},

		/**
		 * Go back to Plan list from Plan details
		 */
		navBack: function () {
			this.onNavBack();
		},

		/**
		 * On click on Sync button in Utilization Gantt Chart
		 */
		onPressUtilizationSync: function () {
			this._loadUtilizationGantt();
		},

		/**
		 * On Selection Change of View Mode in Utilization Gantt Chart 
		 */
		onUtilizationSelectionChange: function () {
			this._loadUtilizationGantt();
		},

		/*On Press of Full Screen Button in Utilization Gantt Chart
		 * @param oEvent
		 */
		onPressUtilizationGanttFullScreen: function (oEvent) {
			var oSource = oEvent.getSource(),
				oViewModel = this.getModel("viewModel");
			if (oSource.getIcon() === "sap-icon://full-screen") {
				oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				oViewModel.setProperty("/ganttUtilizationFullMode", true);
				oViewModel.setProperty("/ganttFullMode", false);
				this.oViewModel.setProperty("/fullscreenGantt", false);
				oSource.setType("Emphasized");
			} else {
				if (oViewModel.getProperty("/fullscreen")) {
					oViewModel.setProperty("/layout", library.LayoutType.TwoColumnsMidExpanded);
				} else {
					oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				}
				oViewModel.setProperty("/ganttUtilizationFullMode", true);
				oViewModel.setProperty("/ganttFullMode", true);
				this.oViewModel.setProperty("/fullscreenGantt", true);
				oSource.setType("Default");
			}
			oViewModel.setProperty("/ganttUtilization/ganttSelectionPane", "30%");
		},

		/*On Press of Shape Double Click in Utilization Gantt Chart
		 * Displaying Utilization Details in PopOver
		 * @param oEvent
		 */
		onUtilizationShapeDoubleClick: function (oEvent) {
			var mParams = oEvent.getParameters(),
				oShape = mParams.shape;
			this._oUtilizationShapeContext = oShape.getBindingContext();
			if (!this._oUtilizationPopover) {
				Fragment.load({
					name: "com.evorait.evosuite.evoprep.view.fragments.UtilizationDetails",
					controller: this
				}).then(function (pPopover) {
					this._oUtilizationPopover = pPopover;
					this.getView().addDependent(this._oUtilizationPopover);
					this._oUtilizationPopover.openBy(oShape);
				}.bind(this));
			} else {
				this._oUtilizationPopover.openBy(oShape);
				sap.ui.getCore().byId("idUtilizationDetailsSmartTable").rebindTable();
			}
		},

		/**
		 * Utilization Details PopOver 
		 * Passing selected shape filter
		 * @param oEvent
		 */
		onBeforeRebindUtilizationDetails: function (oEvent) {
			var sPlanID = this.getModel().getProperty(this._oContext.getPath() + "/PLAN_ID"),
				sKey = this._UtilizationSelectView.getSelectedKey(),
				mBindingParams = oEvent.getParameter("bindingParams"),
				aFilters = new Filter({
					filters: [
						new Filter("PLAN_ID", FilterOperator.EQ, sPlanID),
						new Filter("CELL_START_DATE", FilterOperator.EQ, this._oUtilizationShapeContext.getProperty("BARSTART_DATE")),
						new Filter("CELL_END_DATE", FilterOperator.EQ, this._oUtilizationShapeContext.getProperty("BAREND_DATE")),
						new Filter("VIEW_MODE", FilterOperator.EQ, sKey),
						new Filter("WORKCENTRE", FilterOperator.EQ, this._oUtilizationShapeContext.getProperty("WORKCENTRE"))
					],
					and: true
				});
			mBindingParams.filters = mBindingParams.filters.concat(aFilters);
		},

		/**
		 * on changing Graphic Planning DateRange
		 * Updating Gantt Chart Horizon
		 * @param oEvent
		 */
		onPlanningGanttChangeDateRange: function (oEvent) {
			var oSource = oEvent.getSource(),
				dStartDate = oSource.getDateValue(),
				dEndDate = oSource.getSecondDateValue(),
				dPlanStartDate = this.getModel().getProperty(this._oContext.getPath() + "/START_DATE"),
				dPlanEndDate = this.getModel().getProperty(this._oContext.getPath() + "/END_DATE"),
				bCheckStartDate = dPlanStartDate < dEndDate && dPlanStartDate > dStartDate,
				bCheckEndDate = dPlanEndDate < dEndDate && dPlanEndDate > dStartDate;
			//Condition to check if the selected date range included Plan Start and End Dates or not
			if (!bCheckStartDate && !bCheckEndDate) {
				var sMsg = this.getResourceBundle().getText("msg.ganttDateCheck");
				this.showMessageToast(sMsg);
				oSource.setDateValue(dPlanStartDate);
				oSource.setSecondDateValue(dPlanEndDate);
			}
			this.GanttActions._createGanttHorizon(this._axisTime, this._oContext, oSource);
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * TemplateRenderer changedBinding Event
		 * set new this._oContext
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoPrep" && sEvent === "changedBinding") {
				var sViewName = this.getView().getViewName() + "#" + this.getView().getId();

				if (!oData) {
					return;
				}

				if (oData.viewNameId === sViewName) {
					this._oContext = this.getView().getBindingContext();
					this._resetGlobalValues(); //Called to reset all the global values
					this._rebindPage();
					this._loadUtilizationGantt();
					this._loadGanttData();
				}
			}
		},

		/**
		 * Method called to rebind the page with data.
		 * Set View model property with the new bound data.
		 * Fetch System Information and update the View Model.
		 *
		 */
		_rebindPage: function () {
			this._oContext = this.getView().getBindingContext();
			if (!this._oContext) {
				return;
			}
			var objData = this._oContext.getObject();
			//set user status button functions only when it's enabled
			this.getOwnerComponent().oSystemInfoProm.then(function (oUser) {
				this.oViewModel.setProperty("/showStatusButton", false);
				if (oUser.ENABLE_STATUS_CHANGE) { //Formation of mPreplanAllows object
					var mPreplanAllows = {};
					Object.keys(objData).forEach(function (key) {
						if (key.startsWith("ALLOW_")) {
							mPreplanAllows[key] = objData[key];
						}
					});
					this.oViewModel.setProperty("/PrePlanAllows", mPreplanAllows);
					this._setStatusButtonVisibility(mPreplanAllows);
				}

			}.bind(this));
		},

		/* set visibility on user status change dropdown 
		 * items based on allowance from order status
		 * @param oData
		 */
		_setStatusButtonVisibility: function (oData) {
			//when functionSet of status was laoded
			this.getOwnerComponent().oFunctionSetProm.then(function () {
				var aAvailableStatus = this.getModel("templateProperties").getProperty("/functionsSet/userStatus");
				//loop on all ALLOW_ fields in order with user status set from loaded FunctionSet
				for (var key in oData) {
					if (aAvailableStatus && aAvailableStatus.length > 0) {
						aAvailableStatus.forEach(function (oItem) {
							if (key.indexOf(oItem.Function) >= 0 && (oData[key] === true || oData[key] === "X")) {
								this.oViewModel.setProperty("/showStatusButton", true);
							}
						}.bind(this));
					}
				}
			}.bind(this));
		},

		/**
		 * function to update the satus
		 */
		_updateStatus: function () {
			var oData = this._oContext.getObject(),
				sPath = this._oContext.getPath(),
				message = "";
			this._oContext = this.getView().getBindingContext();

			if (oData["ALLOW_" + this.sFunctionKey]) {
				this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);
				if (this.sFunctionKey === "FINAL") {
					this.saveChangesMain({
						state: "success",
						isCreate: false
					}, this._afterUpdateStatus.bind(this), this._updatePlanStatusError.bind(this));
				} else {
					this.saveChangesMain({
						state: "success",
						isCreate: false
					}, this._afterUpdateStatus.bind(this), this._errorCallBackForPlanHeaderSet.bind(this));
				}

			} else {
				message = this.getResourceBundle().getText("msg.workorderSubmitFail", oData.PLAN_ID);
				this.addMsgToMessageManager(this.mMessageType.Error, message, "/PreplanList");
			}
		},

		/**
		 * Event triggered when status updated successfully and to refresh the status dropdown
		 * @private
		 */
		_afterUpdateStatus: function (oRes) {
			var msg = this.getResourceBundle().getText("msg.saveSuccess");
			this.showMessageToast(msg);

			this.getOwnerComponent().readData(this._oContext.getPath()).then(function (mResult) {
				if (mResult) {
					this._rebindPage();
					this._setStatusButtonVisibility(mResult);
				}
			}.bind(this));
		},
		/**
		 * when view was integrated set additional page parameters
		 */
		_initializeView: function () {
			this.aSmartForms = this.getAllSmartForms(this.getView().getControlsByFieldGroupId("smartFormTemplate"));
		},

		/*
		Validating Header Dates 
		Setting Max and Min Dates for Header Start Date and End Dates
		*/
		_validateDates: function () {
			var sPath = this.getView().getBindingContext().getPath(),
				oStartDate = this.getFormFieldByName("idSTART_DATE", this.aSmartForms),
				oEndData = this.getFormFieldByName("idEND_DATE", this.aSmartForms),
				oParams = {
					PlanID: this.getModel().getProperty(sPath + "/PLAN_ID"),
					OrderNumber: "",
					OperationNumber: ""
				},
				sStartDate = this.getModel().getProperty(sPath + "/START_DATE"),
				sEndDate = this.getModel().getProperty(sPath + "/END_DATE"),
				sMaxDate, sMinDate;

			var callbackfunction = function (oImportedData) {
				if (oStartDate) {
					sMaxDate = oImportedData.ACT_START_DATE;
					if (sStartDate > sMaxDate) {
						sMaxDate = sStartDate;
					}
					oStartDate.getContent().setMaxDate(sMaxDate);
				}
				if (oEndData) {
					sMinDate = oImportedData.ACT_END_DATE;
					if (sEndDate < sMinDate) {
						sMinDate = sEndDate;
					}
					oEndData.getContent().setMinDate(sMinDate);
				}
			}.bind(this);

			this.callFunctionImport(oParams, "CalculateDate", "GET", callbackfunction);

		},
		/**
		 * Event triggered after header data is updated successfully and to refresh the context
		 * @private
		 */
		_saveSuccess: function () {
			var oResourceBundle = this.getResourceBundle();
			sap.m.MessageBox.success(oResourceBundle.getText("ymsg.saveSuccessPrePlanHeaderEdit"));
			this._clearData();
		},

		/*
		Resetting Header Form 
		*/
		_clearData: function () {
			this.getModel().resetChanges();
			this.setFormsEditable(this.aSmartForms, false);
			this.oViewModel.setProperty("/editMode", true);
			this.oViewModel.setProperty("/layout", library.LayoutType.TwoColumnsMidExpanded);
			this.oViewModel.setProperty("/fullscreen", true);
			this._loadUtilizationGantt();
			this._loadGanttData();
			this.oViewModel.setProperty("/bDependencyCall", true);
		},

		/**
		 * Set initial data to the Gantt model
		 */
		_initialiseGanttModel: function () {
			this.oOriginData = {
				data: {
					children: []
				},
				tempData: {},
				changedData: [],
				hasChanges: false,
				deletedData: []
			};
			this.oGanttModel = this.getOwnerComponent().getModel("ganttModel");
			this.oGanttModel.setData(deepClone(this.oOriginData));
		},

		/**
		 * Load the tree data and process the data as child nodes
		 **/
		_loadGanttData: function () {
			this._initialiseGanttModel();
			this.GanttActions._createGanttHorizon(this._axisTime, this._oContext);
			this._getGanttData(0)
				.then(this._getGanttData.bind(this))
				.then(function () {
					//backup original data
					this.oOriginData = deepClone(this.oGanttModel.getProperty("/"));
					this.getModel("viewModel").setProperty("/ganttSettings/busy", false);
				}.bind(this));
		},

		/**
		 * set filters and read data for Gantt
		 * set result with deepClone to Json Model
		 * @param {object} iLevel - level of hierarchy if Gantt tree
		 * @returns {Promise}
		 **/
		_getGanttData: function (iLevel) {
			this.getModel("viewModel").setProperty("/ganttSettings/busy", true);
			return new Promise(function (resolve) {
				var sEntitySet = "/GanttHierarchySet",
					aFilters = [],
					mParams = "",
					sPath = this._oContext.getPath();
				//Passing Expand Call Only while Clicking on Show Dependecies for First Time
				if (this.oViewModel.getProperty("/bDependencyCall") && this.oViewModel.getProperty("/bShowDependencies")) {
					mParams = {
						"$expand": "GanttHierarchyToDependency"
					};
					this.oViewModel.setProperty("/bDependencyCall", false);
				}
				var sHeaderKey = this.getModel().getProperty(sPath + "/ObjectKey");
				aFilters.push(new Filter("HIERARCHY_LEVEL", FilterOperator.EQ, iLevel));
				aFilters.push(new Filter("HeaderObjectKey", FilterOperator.EQ, sHeaderKey));

				this.getModel("viewModel").setProperty("/ganttSettings/sStartDate", this.getModel().getProperty(sPath + "/START_DATE"));
				this.getModel("viewModel").setProperty("/ganttSettings/sEndDate", this.getModel().getProperty(sPath + "/END_DATE"));

				//is also very fast with expands
				this.getOwnerComponent().readData(sEntitySet, aFilters, mParams).then(function (oData) {
					if (iLevel > 0) {
						this._addChildrenToParent(iLevel, oData.results);
					} else {
						this.oGanttModel.setProperty("/data/children", oData.results);
					}
					resolve(iLevel + 1);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * when data was loaded then children needs added to right parent node
		 * @param iLevel
		 * @param oChildData
		 */
		_addChildrenToParent: function (iLevel, oChildData) {
			var aChildren = this.oGanttModel.getProperty("/data/children");
			var callbackFn = function (oItem) {
				oItem.children = [];
				oChildData.forEach(function (oResItem) {
					if (oItem.ObjectKey === oResItem.HeaderObjectKey) {
						oItem.children.push(oResItem);
					}
				});
			}.bind(this);
			aChildren = this._recurseChildren2Level(aChildren, iLevel, callbackFn);
			this.oGanttModel.setProperty("/data/children", aChildren);
		},
		/**
		 * Display the error messages from the backend for the
		 * PlanHeaderSet entity set specific in case we change
		 * the status to final as this method helps to display the 
		 * confirmation dialog box
		 * @param oError - This is a error object returned from backend. 
		 * @private
		 */
		_updatePlanStatusError: function (oError) {
			var oResourceBundle = this.getResourceBundle(),
				sFinalMessage,
				sErrortext = oResourceBundle.getText("errorText"),
				sMessage = this._extractError(this._extractError(oError.__batchResponses[0].response)),
				sMessageDoyouWantToContinue = oResourceBundle.getText("msg.errorHanlderFinalStatusConfmsg"); //errorHanlderFinalStatusConfmsg;
			if (oError.__batchResponses[0].response.statusCode === "500") {
				this._errorCallBackForPlanHeaderSet(oError);
				return;
			}
			if (sMessage !== undefined && sMessage !== null) {
				var parsedMessage, aInnerDetails, strError = "";
				parsedMessage = jQuery.sap.parseJS(sMessage);
				aInnerDetails = parsedMessage.error.innererror.errordetails;
				if (aInnerDetails.length > 0) {
					for (var i = 0; i < aInnerDetails.length; i++) {
						if (aInnerDetails[i].severity === "warning") {
							this._addWarningMessageToMessageManager(aInnerDetails[i].message);
						} else {
							strError += String.fromCharCode("8226") + " " + aInnerDetails[i].message + "\n\n";
						}
					}
				} else {
					strError = parsedMessage.error.code + ": " + parsedMessage.error.message.value;
				}
				sFinalMessage = strError + String.fromCharCode("8226") + "  " + sMessageDoyouWantToContinue;
			} else {
				sFinalMessage = sMessage;
			}

			MessageBox.confirm(
				sFinalMessage, {
					//details: typeof (sFinalMessage) === "string" ? sFinalMessage.replace(/\n/g, "<br/>") : sFinalMessage,
					styleClass: this.getOwnerComponent().getContentDensityClass(),
					actions: [MessageBox.Action.OK, MessageBox.Action.NO],
					onClose: function (oAction) {
						if (oAction === "OK") {
							var sPath = this._oContext.getPath();
							this.getModel().setProperty(sPath + "/FUNCTION", this.sFunctionKey);
							this.getModel().setProperty(sPath + "/SKIP_ERROR_ENTRY", "X");
							this.saveChangesMain({
								state: "success",
								isCreate: false
							}, this._afterUpdateStatus.bind(this), this._errorCallBackForPlanHeaderSet.bind(this));
						}

					}.bind(this)
				}
			);
		},

		/**
		 * Loading Utilization Gantt Chart
		 **/
		_loadUtilizationGantt: function () {
			if (this._UtilizationSelectView) {
				var sKey = this._UtilizationSelectView.getSelectedKey();
				this._setUtilizationGanttFilter(sKey);
				this.GanttActions._createUtilizationGanttHorizon(this._UtilizationAxisTime, this._oContext, sKey);
			}
		},

		/**
		 * set filters and read data for Utilization Gantt Chart
		 *  @param sKey - View Mode Key
		 **/
		_setUtilizationGanttFilter: function (sKey) {
			var aFilters = this._getUtilizationGanttFilters(sKey);
			var binding = this.getView().byId("idUtilizationGanttTreeTable").getBinding("rows");
			binding.filter(aFilters, "Application");

			binding.attachDataRequested(function () {
				this.oViewModel.setProperty("/ganttUtilization/busy", true);
			}.bind(this));

			binding.attachDataReceived(function (aData) {
				var iCount = 0;
				if (aData.getParameters().data) {
					iCount = aData.getParameters().data.results.length;
				}
				this.oViewModel.setProperty("/ganttUtilization/dLastSync", new Date());
				this.oViewModel.setProperty("/ganttUtilization/busy", false);
				this.oViewModel.setProperty("/ganttUtilization/iCount", iCount);
				this.oViewModel.setProperty("/ganttUtilization/ganttSelectionPane", "30%");
			}.bind(this));
		},

		/**
		 * set filters values for Utilization Gantt Chart
		 *  @param sKey - View Mode Key
		 * @returns [aFilters]
		 **/
		_getUtilizationGanttFilters: function (sKey) {
			var aFilters = [],
				sPath = this._oContext.getPath(),
				sHeaderKey = this.getModel().getProperty(sPath + "/ObjectKey");
			aFilters.push(new Filter("HeaderObjectKey", FilterOperator.EQ, sHeaderKey));
			aFilters.push(new Filter("VIEW_MODE", FilterOperator.EQ, sKey));
			return aFilters;
		},

		/**
		 * To reset all the global values after each navigation
		 **/
		_resetGlobalValues: function () {
			this.oViewModel.setProperty("/bShowDependencies", false); //Disabling Dependencies in Graphic Planning GanttChart
			this.oViewModel.setProperty("/bDependencyCall", true);
			this.oViewModel.setProperty("/ganttSettings/sStartDate", this.getModel().getProperty(this._oContext.getPath() + "/START_DATE"));
			this.oViewModel.setProperty("/ganttSettings/sEndDate", this.getModel().getProperty(this._oContext.getPath() + "/END_DATE"));
			if (this._UtilizationSelectView) {
				this._UtilizationSelectView.setSelectedKey(this.getModel("user").getProperty("/DEFAULT_VIEW_MODE"));
			}
		}
	});

});