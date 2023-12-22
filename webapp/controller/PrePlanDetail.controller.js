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
	"sap/m/MessageBox",
	"sap/gantt/config/TimeHorizon",
], function (BaseController, Fragment, OverrideExecution, library, Filter, FilterOperator, deepClone, formatter, Utility, MessageBox, TimeHorizon) {
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
				onPressCopyPrePlanHeader: {
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
				onDoubleClickPlanningGantt: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPlanningShaprePress: {
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
				},
				onChangeCalculateUtilization: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onClrFilters: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressHeaderReload: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onFinalizeBtnPressGraphicPlan: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPlanningSelectionChange: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onMaterialStatusPressGraphicPlan: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onMaterialInfoButtonPressGraphicPlan: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onAutoRefreshUtilization: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onChangeSmartField: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				updatePlanningGanttHorizon: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				applyCursorPosition: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				getTimeHorizonObject: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				},
				onPressFullScreen: {
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
			eventBus.subscribe("RefreshEvoPrepDetailHeader", "refreshDetailHeader", this._refrshDetailHeader, this);
			eventBus.subscribe("GanttChart", "applyFiltersFromOperations", this._fnFiltersOnGraphic, this);
			eventBus.subscribe("PrePlanDetail", "refreshPlanDetail", this._refreshPlanDetailPage, this);

			//Initializing GanttActions.js
			this.GanttActions = this.getOwnerComponent().GanttActions;
			this.GanttActions.init(this.getView());

			this._treeTable = this.getView().byId("idPlanningGanttTreeTable");
			this._axisTime = this.getView().byId("idPlanningGanttZoom");
			this._planningGanttContainer = this.getView().byId("idPlanningGanttChartContainer");
			this._utilizationGanttContainer = this.getView().byId("idUtilizationGanttChartContainer");

			this._UtilizationAxisTime = this.getView().byId("idUtilizationGanttZoom");
			this._UtilizationSelectView = this.getView().byId("idUtilizationSelect");

			this.updatePlanningGanttHorizon();

			this.getRouter().attachRouteMatched(this._routeMatched, this);
		},
		/**
		 * Method trigers on every routing and navigation
		 * @param {object} oEvent - object will hold the current route informtation
		 */
		_routeMatched: function(oEvent){
			if (oEvent.getParameter("name") === "PrePlanDetail");{
				this.oViewModel.setProperty("/sCurrentView", oEvent.getParameter("name"));
			}
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
		 * Unsubscribe the subscribed events
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
			eventBus.unsubscribe("BaseController", "refreshFullGantt", this._loadGanttData, this);
			eventBus.unsubscribe("BaseController", "refreshUtilizationGantt", this._loadUtilizationGantt, this);
			eventBus.unsubscribe("GanttChart", "applyFiltersFromOperations", this._fnFiltersOnGraphic, this);
			eventBus.unsubscribe("RefreshEvoPrepDetailHeader", "refreshDetailHeader", this._refrshDetailHeader, this);

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
			this._resetGanttWithSetTimeout();
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
				oEvent.getSource().getParent().getParent().getParent().getParent().addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				this._planningGanttContainer.setHeight("100%");
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
				oEvent.getSource().getParent().getParent().getParent().getParent().removeStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				this._planningGanttContainer.setHeight("500px");
			}
			this._resetGanttWithSetTimeout();
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
				this.oViewModel.setProperty("/ganttSettings/bUtilizationCall", true);
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
				sLastDraggedShapeUid = oParams.lastDraggedShapeUid,
				dOldStartDateTime = aDraggedShapes[sLastDraggedShapeUid].time,
				oTargetContext = oParams.targetRow ? oParams.targetRow.getBindingContext("ganttModel") : null,
				sNewStartDate = oParams.newDateTime,
				aShapeData = [],
				sDateDifference = sNewStartDate.getTime() - dOldStartDateTime.getTime(),
				sNewEndDate, oDraggedData, sStartDateTime, sEndDateTime, sSourcePath;

			if (!oTargetContext) {
				oTargetContext = oParams.targetShape.getParent().getParent().getBindingContext("ganttModel");
			}

			for (var i in aDraggedShapes) {
				sSourcePath = Utility.parseUid(i).shapeDataName;
				oDraggedData = this.getModel("ganttModel").getProperty(sSourcePath);

				//Validate the past date for header bar
				if (moment(sNewStartDate).isBefore(moment()) && oDraggedData.HIERARCHY_LEVEL === 0 && !this.getModel("user").getProperty("/ENABLE_PAST_DATE")) {
					this.showMessageToast(this.getResourceBundle().getText("msg.orderPastDateValidation"));
					return;
				}
				sStartDateTime = formatter.mergeDateTime(oDraggedData.START_DATE, oDraggedData.START_TIME);
				sEndDateTime = formatter.mergeDateTime(oDraggedData.END_DATE, oDraggedData.END_TIME);
				sNewStartDate = new Date(moment(sStartDateTime).add(sDateDifference));
				sNewEndDate = new Date(moment(sEndDateTime).add(sDateDifference));
				oDraggedData.START_TIME.ms = sNewStartDate.getTime();
				oDraggedData.END_TIME.ms = sNewEndDate.getTime();
				this.getModel("ganttModel").setProperty(sSourcePath + "/START_DATE", sNewStartDate);
				this.getModel("ganttModel").setProperty(sSourcePath + "/END_DATE", sNewEndDate);
				aShapeData.push(oDraggedData);
			}
			if (aShapeData.length) {
				this.GanttActions._prepareGanttOpeartionPayload(aShapeData).then(function (aPayload) {
					this.GanttActions._proceedToGanttOperationUpdate();
				}.bind(this));
			}
		},

		/**
		 * Triggered when Operation shape are resized 
		 * validate shape new dates and if change is allowed
		 * @param oEvent
		 */
		onShapeResize: function (oEvent) {
			var oParams = oEvent.getParameters(),
				oRowContext = oParams.shape.getBindingContext("ganttModel"),
				oData = this.getModel("ganttModel").getProperty(oRowContext.getPath());
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
			this.GanttActions._prepareGanttOpeartionPayload([oData]).then(function (aPayload) {
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
			this.oViewModel.setProperty("/ganttUtilization/bDefaultUtilizationCall", true);
			this._loadUtilizationGantt(false);
		},

		/**
		 * On Selection Change of View Mode in Utilization Gantt Chart 
		 */
		onUtilizationSelectionChange: function () {
			this.oViewModel.setProperty("/ganttUtilization/bDefaultUtilizationCall", true);
			this._loadUtilizationGantt(true);
		},

		/*On Press of Full Screen Button in Utilization Gantt Chart
		 * @param oEvent
		 */
		onPressUtilizationGanttFullScreen: function (oEvent) {
			var oSource = oEvent.getSource(),
				oViewModel = this.getModel("viewModel"),
				sKey = this._UtilizationSelectView.getSelectedKey();
			if (oSource.getIcon() === "sap-icon://full-screen") {
				oViewModel.setProperty("/layout", library.LayoutType.MidColumnFullScreen);
				oViewModel.setProperty("/ganttUtilizationFullMode", true);
				oViewModel.setProperty("/ganttFullMode", false);
				this.oViewModel.setProperty("/fullscreenGantt", false);
				oSource.setType("Emphasized");
				oEvent.getSource().getParent().getParent().getParent().getParent().addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				this._utilizationGanttContainer.setHeight("100%");
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
				oEvent.getSource().getParent().getParent().getParent().getParent().removeStyleClass("sapUxAPObjectPageSubSectionFitContainer");
				this._utilizationGanttContainer.setHeight("300px");
			}
			oViewModel.setProperty("/ganttUtilization/ganttSelectionPane", "30%");
			this._resetGanttWithSetTimeout();
		},

		/*On Press of Shape Double Click in Utilization Gantt Chart
		 * Displaying Utilization Details in PopOver
		 * @param oEvent
		 */
		onUtilizationShapeDoubleClick: function (oEvent) {
			var mParams = oEvent.getParameters(),
				oShape = mParams.shape;
			if (oShape) {
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
			} else {
				//When clicked on No Shift icon is pressed toast msg will be displayed
				this.showMessageToast(this.getResourceBundle().getText("msg.noShifts"));
			}
		},

		/**
		 * Called when double click on shapes
		 * collectes the annotations and view details
		 * @param oEvent
		 */
		onDoubleClickPlanningGantt: function (oEvent) {
			var oShape = oEvent.getParameter("shape");
			if (oShape && oShape.sParentAggregationName !== "relationships") {
				var oContext = oShape.getBindingContext("ganttModel"),
					oHeaderContext = this.getView().getBindingContext(),
					mParams = {},
					bValidate = formatter.checkGanttEditability(this.getModel("user").getProperty("/ENABLE_PREPLAN_UPDATE"), oContext.getProperty(
						"READ_ONLY"), this.oViewModel.getProperty("/bEnableGanttShapesEdit"), oHeaderContext.getProperty("ALLOW_FINAL"));

				if (oContext && oContext.getProperty("OPERATION_NUMBER") !== "") {
					mParams = {
						viewName: "com.evorait.evosuite.evoprep.view.templates.DialogContentWrapper#EditOperations",
						annotationPath: "com.sap.vocabularies.UI.v1.Facets#EditOperations",
						entitySet: "GanttHierarchySet",
						controllerName: "EditOperation",
						title: "tit.editOperation",
						type: "Edit",
						saveButtonVisible: bValidate, //Validate the edit feature based on syatem info/operation status/plan status and edit gantt indicator
						sPath: "/GanttHierarchySet('" + oContext.getProperty("ObjectKey") + "')"
					};
					this.getOwnerComponent().DialogTemplateRenderer.open(this.getView(), mParams);
				}
			}
		},

		/**
		 * Triigers when shape selection change 
		 * To validate the header selection to avaid multiple select
		 * @param {oEvent}
		 */
		onPlanningShaprePress: function (oEvent) {
			var oShape = oEvent.getParameter("shape"),
				oShapeContext = {},
				aSelectedShapesIds = this.getView().byId("idPlanningGanttChartTable").getSelectedShapeUid(),
				oRowDetails = {},
				oRowObject = {},
				bValidate = false;
			if (!oShape) {
				return;
			}
			oShapeContext = oShape.getBindingContext("ganttModel");
			if (!oShape.getSelected()) {
				aSelectedShapesIds.forEach(function (sid) {
					oRowDetails = Utility.parseUid(sid);
					oRowObject = this.getModel("ganttModel").getProperty(oRowDetails.shapeDataName);
					if (oRowObject && (oRowObject.HIERARCHY_LEVEL === 0 || oShapeContext.getProperty("HIERARCHY_LEVEL") === 0)) {
						bValidate = true;
					}
				}.bind(this));
			}
			if (bValidate) {
				if (aSelectedShapesIds.length === 2) {
					oEvent.preventDefault();
					this.showMessageToast(this.getResourceBundle().getText("msg.shapeSelectionValidation"));
					return;
				} else {
					this.getView().byId("idPlanningGanttChartTable").getSelection().clear(true);
					return;
				}
			}

		},
		/**
		 * Triigers when shape selection change method of gantt chart
		 * This method only helps to retrive the shapes that are selected at the moment.
		 * @param {oEvent}
		 */
		onPlanningSelectionChange: function (oEvent) {
			var aSelectedShapesIds = oEvent.getParameter("shapeUids"),
				oRowDetails = {},
				oRowObject = {},
				bValidate = false,
				bValidadeFinal = false,
				oViewModel = this.getView().getModel("viewModel");

			for (var i in aSelectedShapesIds) {
				oRowDetails = Utility.parseUid(aSelectedShapesIds[i]);
				oRowObject = this.getModel("ganttModel").getProperty(oRowDetails.shapeDataName);
				if (oRowObject && oRowObject.HIERARCHY_LEVEL === 0) {
					bValidate = true;
					bValidadeFinal = false;
					break;
				}
				if (oRowObject.HIERARCHY_LEVEL === 1 && oRowObject.READ_ONLY === false) {
					bValidadeFinal = true;
				}
			}
			oViewModel.setProperty("/bEnableFinalizeBtnGraphicPlan", bValidadeFinal);
			if (bValidate) {
				// this validation to check multiple shapes is already handled by onPlanningShaprePress
				return;
			}
		},
		/**
		 * Method called on the press of finalize button press on the 
		 * gantt chart in the graphic planning table
		 *  @param oEvent
		 */
		onFinalizeBtnPressGraphicPlan: function (oEvent) {
			var aSelectedShapesIds = this.getView().byId("idPlanningGanttChartTable").getSelectedShapeUid(),
				oRowDetails = {},
				oRowObject = {},
				sEnittySet,
				bSaveChanges = false;
			aSelectedShapesIds.forEach(function (sid) {
				oRowDetails = Utility.parseUid(sid);
				oRowObject = this.getModel("ganttModel").getProperty(oRowDetails.shapeDataName);
				if (oRowObject.HIERARCHY_LEVEL === 1 && oRowObject.READ_ONLY === false) {
					sEnittySet = oRowObject["__metadata"]["id"].split("/").pop();
					this.getModel().setProperty("/" + sEnittySet + "/FUNCTION", "OPER_FINAL");
					bSaveChanges = true;
				}
			}.bind(this));

			if (bSaveChanges) {
				this.saveChangesMain({
					state: "success",
					isCreate: false
				},
					this._afterSucessFinalizeGraphicPlan.bind(this));
			}
		},
		/**
		 * Utilization Details PopOver 
		 * Passing selected shape filter
		 * @param oEvent
		 */
		onBeforeRebindUtilizationDetails: function (oEvent) {
			var sPlanID = this.getModel().getProperty(this._oContext.getPath() + "/PLAN_ID"),
				bBlockByPlan = this.getModel().getProperty(this._oContext.getPath() + "/BLOCKED_BY_PLAN"),
				sKey = this._UtilizationSelectView.getSelectedKey(),
				mBindingParams = oEvent.getParameter("bindingParams"),
				aFilters = new Filter({
					filters: [
						new Filter("PLAN_ID", FilterOperator.EQ, sPlanID),
						new Filter("CELL_START_DATE", FilterOperator.EQ, this._oUtilizationShapeContext.getProperty("BARSTART_DATE")),
						new Filter("CELL_END_DATE", FilterOperator.EQ, this._oUtilizationShapeContext.getProperty("BAREND_DATE")),
						new Filter("VIEW_MODE", FilterOperator.EQ, sKey),
						new Filter("BLOCKED_BY_PLAN", FilterOperator.EQ, bBlockByPlan),
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

		/**
		 * on show Utilization Column in Graphic Planning 
		 * @param oEvent
		 */
		onChangeCalculateUtilization: function (oEvent) {
			if (oEvent.getSource().getState()) {
				this.oViewModel.setProperty("/ganttSettings/bShowUtilization", true);
				//Service Call while Utilization on for First Time
				if (this.oViewModel.getProperty("/ganttSettings/bUtilizationCall")) {
					this.oViewModel.setProperty("/bDependencyCall", true);
					this._loadGanttData();
				}
			} else {
				this.oViewModel.setProperty("/ganttSettings/bShowUtilization", false);
			}
		},

		/**
		 * Clear all filters applied on Graphic planning
		 */
		onClrFilters: function () {
			var oViewModel = this.getModel("viewModel"),
				binding = this.getView().byId("idPlanningGanttTreeTable").getBinding("rows");
			binding.filter([], null);
			oViewModel.setProperty("/filtersExist", false);
		},

		/**
		 * onPress Plan Detail Header Refresh Button 
		 * Plan Detail page is refreshed
		 */
		onPressHeaderReload: function () {
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("PrePlanDetail","refreshPlanDetail");
		},
		/**
		 * Method called on the press of material refresh button on the 
		 * table in graphic planning table
		 *  @param oEvent
		 */
		onMaterialStatusPressGraphicPlan: function (oEvent) {
			var aSelectedItems = this._ReturnPropContextTreeTable(this._treeTable, "COMPONENT_EXISTS"),
				aPromises = [],
				sEnittySet,
				oBindingRows = this._treeTable.getBinding("rows"),
				sPath = oBindingRows.getPath(),
				oTableData = oBindingRows.getModel().getProperty(sPath)["children"],
				iIndex;
			this.oViewModel.setProperty("/busy", true);
			for (var i in aSelectedItems) {
				sEnittySet = "/" + aSelectedItems[i]["__metadata"]["id"].split("/").pop();
				aPromises.push(this.getOwnerComponent().readData(sEnittySet));
			}
			Promise.all(aPromises).then(function (oResult) {
				for (var i in oResult) {
					if (oResult[i].hasOwnProperty("ObjectKey")) {
						for (var x in oTableData) {
							iIndex = oTableData[x]["children"].findIndex(r => r.ObjectKey === oResult[i]["ObjectKey"]);
							if (iIndex >= 0) {
								oResult[i]["IsSelected"] = true;
								oTableData[x]["children"][iIndex] = oResult[i];
								break;
							}
						}

					}
				}
				oBindingRows.getModel().refresh();
				this.oViewModel.setProperty("/busy", false);
			}.bind(this));

		},
		/**
		 * Method called on the press of material information button on the 
		 * table in graphic planning table
		 *  @param oEvent
		 */
		onMaterialInfoButtonPressGraphicPlan: function (oEvent) {
			var aSelectedItems = this._ReturnPropContextTreeTable(this._treeTable, "COMPONENT_EXISTS"),
				aSelectedItemsPath = [];
			for (var i = 0; i < aSelectedItems.length; i++) {
				aSelectedItemsPath.push({
					sPath: "/PlanItemsSet('" + aSelectedItems[i].ObjectKey + "')"
				});
			}
			if (aSelectedItemsPath.length > 0) {
				this.getOwnerComponent().materialInfoDialog.open(this.getView(), aSelectedItemsPath);
			}
		},

		/**
		 * Method called on the check and uncheck of checkbox in the graphic 
		 * planning table
		 *  @param oEvent
		 */
		onChangeSelectOperation: function (oEvent) {
			var oSource = oEvent.getSource(),
				oBindingContext = oSource.getBindingContext("ganttModel"),
				sPath = oBindingContext.getPath(),
				oModel = oBindingContext.getModel("ganttModel");
			oModel.setProperty(sPath + "/IsSelected", oEvent.getParameter("selected"));
			var aSelectedItems = this._ReturnPropContextTreeTable(this._treeTable, "COMPONENT_EXISTS");
			if (aSelectedItems.length > 0) {
				this.getView().getModel("viewModel").setProperty("/bEnableMaterialGraphicPlan", true);
			} else {
				this.getView().getModel("viewModel").setProperty("/bEnableMaterialGraphicPlan", false);
			}
		},

		/**
		 * Method called on press of Refresh Utilization Switch 
		 * to refresh Utilization Tab on Updating in other tabs
		 *  @param oEvent
		 */
		onAutoRefreshUtilization: function (oEvent) {
			var oSource = oEvent.getSource(),
				bState = oSource.getState();
			this.oViewModel.setProperty("/ganttUtilization/bAutoUpdateUtilization", bState);
		},

		/**
		* Method called on change of Form Fields 
		* to Validate Start and End Dates
		*  @param oEvent
		*/
		onChangeSmartField: function (oEvent) {
			var oSource = oEvent.getSource(),
				oBinding = oSource.getBindingInfo("value")["binding"],
				sNewValue = oEvent.getParameter("newValue"),
				sNewDate = new Date(sNewValue),
				sMsg = this.getView().getModel("i18n").getResourceBundle().getText("msg.oprDateValidation"),
				oOrigData = this.getModel().getData(oBinding.getContext().getPath()),
				sPath = oBinding.getPath(),
				compareDate, result, oStartDate, oEndDate, bValid, sOperationCheckMsg;

			if (sNewValue.split(/[.\-/_]/).length > 1) {
				sNewValue = sNewValue.split(/[.\-/_]/),
					sNewDate = new Date(sNewValue[2] + "-" + sNewValue[1] + "-" + sNewValue[0]);
			}

			if (sPath === 'START_DATE') {
				compareDate = oOrigData.END_DATE;
				result = Boolean(sNewDate > compareDate);
				oStartDate = this.getFormFieldByName("idSTART_DATE", this.aSmartForms);
				if (oStartDate) {
					bValid = oStartDate.getContent().getMaxDate() < sNewDate;
					sOperationCheckMsg = this.getView().getModel("i18n").getResourceBundle().getText("ymsg.oprValidStartDate");
				}
			} else if (sPath === 'END_DATE') {
				compareDate = oOrigData.START_DATE;
				result = Boolean(sNewDate < compareDate);
				oEndDate = this.getFormFieldByName("idEND_DATE", this.aSmartForms);
				if (oEndDate) {
					bValid = oEndDate.getContent().getMinDate() > sNewDate;
					sOperationCheckMsg = this.getView().getModel("i18n").getResourceBundle().getText("ymsg.oprValidEndDate");
				}
			}
			if (result) {
				this.showMessageToast(sMsg);
				this.getModel().resetChanges();
				return;
			} else if (bValid) {
				this.showMessageToast(sOperationCheckMsg);
				this.getModel().resetChanges();
			}
		},
		/**
		 * Function for updating Visible Horizon 
		 * For Graphic Planning Gantt Chart
		 */
		updatePlanningGanttHorizon: function () {
			var oPlanningGanttChartTable = this.getView().byId("idPlanningGanttChartTable"),
				oVisibleHorizon = {};

			var fFetchCurrentVisibleHorizon = function () {
				var oCurrentVisibleHorizon = this._axisTime && this._axisTime.getVisibleHorizon();
				oVisibleHorizon.startTime = oCurrentVisibleHorizon && oCurrentVisibleHorizon.getStartTime();
				oVisibleHorizon.endTime = oCurrentVisibleHorizon && oCurrentVisibleHorizon.getEndTime();
				if (this.oViewModel) {
					this.oViewModel.setProperty("/PlanningGanttChartVisibleHorizon", oVisibleHorizon);
				}
			};

			if (oPlanningGanttChartTable) {
				oPlanningGanttChartTable.attachShapeDrop(fFetchCurrentVisibleHorizon.bind(this));
				oPlanningGanttChartTable.attachShapeDoubleClick(fFetchCurrentVisibleHorizon.bind(this));
				oPlanningGanttChartTable.attachShapeResize(fFetchCurrentVisibleHorizon.bind(this));
			}
		},
		/**
		 * Function for resetting Visible Horizon 
		 * For Graphic Planning Gantt Chart
		 */
		applyCursorPosition: function () {
			var oDropShapeVisibleHorizon = this.oViewModel.getProperty("/PlanningGanttChartVisibleHorizon"),
				oTimeHorizonObject = this.getTimeHorizonObject(oDropShapeVisibleHorizon);
			if (oDropShapeVisibleHorizon) {
				this._axisTime.setVisibleHorizon(oTimeHorizonObject);
			}
		},

		/**
		 * Function for Visible Horizon DateTime Formatting
		 * For Graphic Planning Gantt Chart
		*/
		getTimeHorizonObject: function (oDateTimeObject) {
			return new TimeHorizon(oDateTimeObject);
		},

		/**
		 * handle detail page full scrren
		 * validate based on the icon pressed
		 */
		onPressFullScreen: function (oEvent) {
			BaseController.prototype.onPressFullScreen.apply(this, arguments);			
			this._resetGanttWithSetTimeout();
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
					if (!this._oContext) {
						return;
					}
					this._resetGlobalValues(); //Called to reset all the global values
					this._rebindPage();
					this._loadUtilizationGantt(true);
					this._loadGanttData(true);
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

			this.refreshGantChartData(this.getModel("viewModel"));
			this.refreshPlanList();
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
			this.refreshGantChartData(this.getModel("viewModel"));
			this.refreshPlanList();
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
			this.oViewModel.setProperty("/bDependencyCall", true);
			this.oViewModel.setProperty("/ganttSettings/bUtilizationCall", true);
			this._resetGanttWithSetTimeout();
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

		/*
		 * Load the tree data and process the data as child nodes
		 * @param bFirstTime - To Check whether Graphic Planning is loading for first time
		 */
		_loadGanttData: function (bFirstTime) {
			//Initialsing GanttModel only for the first time
			if (typeof(bFirstTime) === "boolean") {
				this._initialiseGanttModel();
			}
			this.GanttActions._createGanttHorizon(this._axisTime, this._oContext);
			this._getGanttData([0, bFirstTime])
				.then(this._getGanttData.bind(this))
				.then(function () {
					//backup original data
					this.oOriginData = deepClone(this.oGanttModel.getProperty("/"));
					this.iNumberOfLines = this._countLineItems(this.oOriginData);
					this.getModel("viewModel").setProperty("/ganttSettings/busy", false);
				}.bind(this));
		},

		/**
		 * set filters and read data for Gantt
		 * set result with deepClone to Json Model
		 * @param [aParams] 
		 * @returns {Promise}
		 */
		_getGanttData: function (aParams) {
			var iLevel, bIsShapeRefresh;
			if (aParams instanceof Array) {
				iLevel = aParams[0];
				if (typeof(aParams[1]) === "string") {
					bIsShapeRefresh = true;
				}
			} else {
				iLevel = aParams;
			}
			this.getModel("viewModel").setProperty("/ganttSettings/busy", true);
			return new Promise(function (resolve) {
				var sEntitySet = "/GanttHierarchySet",
					aFilters = [],
					mParams = "",
					sPath = this._oContext.getPath(),
					bUtilizationOn = this.getView().byId("idCalculateUtilization").getState();

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

				//Passing Utilization filter only when Utilization Switch is On
				if (bUtilizationOn && iLevel === 1 && this.oViewModel.getProperty("/ganttSettings/bUtilizationCall")) {
					aFilters.push(new Filter("REQUEST_UTILIZATION", FilterOperator.EQ, bUtilizationOn));
					this.oViewModel.setProperty("/ganttSettings/bUtilizationCall", false);
				}

				this.getModel("viewModel").setProperty("/ganttSettings/sStartDate", this.getModel().getProperty(sPath + "/START_DATE"));
				this.getModel("viewModel").setProperty("/ganttSettings/sEndDate", this.getModel().getProperty(sPath + "/END_DATE"));

				//is also very fast with expands
				this.getOwnerComponent().readData(sEntitySet, aFilters, mParams).then(function (oData) {
					if (iLevel > 0) {
						this._addChildrenToParent(iLevel, oData.results, bIsShapeRefresh);
					} else {
						if (bIsShapeRefresh) {
							// for the nodes to be refreshed clear children
							this.oGanttModel.setProperty("/data/childrenNew", oData.results);
						} 
						this.oGanttModel.setProperty("/data/children", oData.results);
						this.applyCursorPosition();
					}
					resolve(iLevel + 1, bIsShapeRefresh);
				}.bind(this));
			}.bind(this));

		},

		/**
		 * when data was loaded then children needs added to right parent node
		 * @param iLevel
		 * @param oChildData
		 * @param bIsShapeRefresh
		 */
		_addChildrenToParent: function (iLevel, oChildData, bIsShapeRefresh) {
			var aChildren = this.oGanttModel.getProperty("/data/children");
			if (bIsShapeRefresh) {
				aChildren = this.oGanttModel.getProperty("/data/childrenNew");
				this.oGanttModel.setProperty("/data/children", aChildren);
			}
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
		 * Count the number of line items in the result for visible row count
		 * @Athour Rahul
		 * @param {Object} data Data of gantt chart 
		 * @version 2301
		 * @private
		 */
		_countLineItems: function (data) {
			var iLength = 0;
			iLength = data.data.children.length;
			for (var i in data.data.children) {
				iLength = iLength + data.data.children[i].children.length;
			}
			return iLength;
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
				sFinalMessage = oResourceBundle.getText("ymsg.finalizeMessage"),
				sMessage = this._extractError(this._extractError(oError.__batchResponses[0].response));
			if (oError.__batchResponses[0].response.statusCode === "500") {
				this._errorCallBackForPlanHeaderSet(oError);
				return;
			}
			if (sMessage !== undefined && sMessage !== null) {
				var parsedMessage, aInnerDetails;
				parsedMessage = jQuery.sap.parseJS(sMessage);
				aInnerDetails = parsedMessage.error.innererror.errordetails;
				if (aInnerDetails.length > 0) {
					for (var i = 0; i < aInnerDetails.length; i++) {
						if (aInnerDetails[i].severity === "warning") {
							this._addWarningMessageToMessageManager(aInnerDetails[i].message);
						}
					}
				}
			}

			MessageBox.confirm(
				sFinalMessage, {
				//details: typeof (sFinalMessage) === "string" ? sFinalMessage.replace(/\n/g, "<br/>") : sFinalMessage,
				styleClass: this.getOwnerComponent().getContentDensityClass(),
				actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
				onClose: function (oAction) {
					if (oAction === "YES") {
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

		/*
		 * Loading Utilization Gantt Chart
		 * @param bFirstTime
		 */
		_loadUtilizationGantt: function (bFirstTime) {
			if (this._UtilizationSelectView) {
				if (typeof(bFirstTime) !== "boolean") {
					bFirstTime = true;
				}
				var sKey = this._UtilizationSelectView.getSelectedKey();
				this._setUtilizationGanttFilter(sKey);
				this.GanttActions._createUtilizationGanttHorizon(this._UtilizationAxisTime, this._oContext, sKey, bFirstTime);
			}
		},

		/*
		 * Refresh detail header forcefully
		 */
		_refrshDetailHeader: function () {
			this.getOwnerComponent().readData(this._oContext.getPath()).then(function () {
				//Refreshing Status Dropdown
				this._rebindPage();
				this._resetGanttWithSetTimeout();
			}.bind(this));
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
			//Loading Utilization Tab Data by default only when this gloabal config is enabled 
			if (this.oViewModel.getProperty("/ganttUtilization/bDefaultUtilizationCall")) {
				aFilters.push(new Filter("HeaderObjectKey", FilterOperator.EQ, sHeaderKey));
				aFilters.push(new Filter("VIEW_MODE", FilterOperator.EQ, sKey));
			}
			return aFilters;
		},

		/**
		 * To reset all the global values after each navigation
		 **/
		_resetGlobalValues: function () {
			this.oViewModel.setProperty("/bShowDependencies", false); //Disabling Dependencies in Graphic Planning GanttChart
			this.oViewModel.setProperty("/bDependencyCall", true);
			this.oViewModel.setProperty("/ganttSettings/bUtilizationCall", true);
			this.oViewModel.setProperty("/ganttSettings/bShowUtilization", false);
			this.oViewModel.setProperty("/ganttSettings/sStartDate", this.getModel().getProperty(this._oContext.getPath() + "/START_DATE"));
			this.oViewModel.setProperty("/ganttSettings/sEndDate", this.getModel().getProperty(this._oContext.getPath() + "/END_DATE"));
			if (this._UtilizationSelectView) {
				this._UtilizationSelectView.setSelectedKey(this.getModel("user").getProperty("/DEFAULT_VIEW_MODE"));
				var bRefreshUtilization = this.getModel("user").getProperty("/ENABLE_PLAN_DETAIL_UTIL_CALC") === "X" ? true : false;
				this.getView().byId("idRefreshUtilization").setState(bRefreshUtilization);
				this.oViewModel.setProperty("/ganttUtilization/bAutoUpdateUtilization", bRefreshUtilization);
				this.oViewModel.setProperty("/ganttUtilization/bDefaultUtilizationCall", this.getModel("user").getProperty(
					"/ENABLE_PLAN_OPEN_UTIL_CALC"));
			}
			this.getView().byId("idCalculateUtilization").setState(false);
			this._axisTime.setZoomLevel(6);
		},

		_fnFiltersOnGraphic: function (sChannel, sEvent, oData) {
			if (sChannel === "GanttChart" && sEvent === "applyFiltersFromOperations") {
				var oViewModel = this.getModel("viewModel"),
					aFilters = oViewModel.getProperty("/filtersToGraphicPlanning"),
					binding = this.getView().byId("idPlanningGanttTreeTable").getBinding("rows");
				if (aFilters && aFilters.length > 0) {
					oViewModel.setProperty("/filtersExist", true);
					binding.filter(aFilters, "Application");
				}
			}
		},
		/**
		 * Internal Function trigerred on the success of finlaize button pressed in the function
		 * onFinalizeBtnPressGraphicPlan
		 */
		_afterSucessFinalizeGraphicPlan: function () {
			var oViewModel = this.getView().getModel("viewModel");
			oViewModel.setProperty("/bEnableFinalizeBtnGraphicPlan", false);
			this.refreshGantChartData(oViewModel);
		},
		/**
		 * Returns the array of values in graphic plan table 
		 * for which a particular passed property value is true and 
		 * that particular value is checked in the checkbox
		 * @param {object} oTable - refrence of graphic plan tree table
		 * @param {string} sProp - property value
		 * @returns {array}
		 **/
		_ReturnPropContextTreeTable: function (oTable, sProp) {
			var oBindingRows = oTable.getBinding("rows"),
				sPath = oBindingRows.getPath(),
				oTableData = oBindingRows.getModel().getProperty(sPath)["children"],
				aResults = [];
			oTableData.forEach(function (elem) {
				aResults = [].concat(elem["children"].filter(function (obj) {
					if (obj[sProp]) {
						if (obj["IsSelected"]) {
							return obj;
						}
					}
				}), aResults);
			});
			return aResults;
		},
		/**
		 * This method will reset Plannig and Utilization gantt
		 * setTimeout method is added because some of the function like switching to fullscreen mode take some time and we don't have any event for this
		 */
		_resetGanttWithSetTimeout: function(){
			setTimeout(function(){
				this.GanttActions._createUtilizationGanttHorizon(this._UtilizationAxisTime, this._oContext, this._UtilizationSelectView.getSelectedKey(), true);				
				this.GanttActions._createGanttHorizon(this._axisTime, this._oContext);
			}.bind(this),900);
		},

		_refreshPlanDetailPage: function(){
			this.refreshGantChartData(this.oViewModel);
			this.resetDeferredGroupToChanges(this.getView());
		}

	});

});