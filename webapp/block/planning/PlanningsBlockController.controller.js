sap.ui.define([
	//	"sap/ui/core/mvc/Controller"
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/gantt/misc/Utility",
	"sap/m/MessageToast"
], function (BaseController, OverrideExecution, Utility, MessageToast) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.block.planning.PlanningsBlockController", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onClickExpandCollapse: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onShowDependencies: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onShapeDrop: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				},
				onShapeResize: {
					public: true,
					final: true,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		onInit: function () {
			this._treeTable = this.getView().byId("idPlanningGanttTreeTable");
			this._axisTime = this.getView().byId("idPlanningGanttZoom");
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.evorait.evosuite.evoprep.block.planning.PlanningsBlock
		 */
		//	onExit: function() {
		//
		//	}

		/* =========================================================== */
		/* Public methods                                           */
		/* =========================================================== */

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
				sNewEndDate, sDateDifference, oDraggedData, sPath, oPayload;
			if (!oTargetContext) {
				oTargetContext = oParams.targetShape.getParent().getParent().getBindingContext("ganttModel");
			}
			for (var i in aDraggedShapes) {
				var sSourcePath = Utility.parseUid(i).shapeDataName,
					sTargetPath = oTargetContext.getPath();
				if (sSourcePath !== sTargetPath) {
					return;
				}
				oDraggedData = this.getModel("ganttModel").getProperty(sSourcePath);
				sPath = "/GanttHierarchySet('" + oDraggedData.ObjectKey + "')";
				sDateDifference = moment(oDraggedData.START_DATE).diff(oDraggedData.END_DATE);
				sNewEndDate = new Date(moment(sNewStartDate).add(sDateDifference));
				this.getModel("ganttModel").setProperty(sSourcePath + "/START_DATE", sNewStartDate);
				this.getModel("ganttModel").setProperty(sSourcePath + "/END_DATE", sNewEndDate);
				this._prepareGanttOpeartionPayload(oDraggedData).then(function (oPayload) {
					this._proceedToGanttOperationUpdate(sPath, oPayload);
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
				oData = this.getModel("ganttModel").getProperty(oRowContext.getPath()),
				sPath = "/GanttHierarchySet('" + oData.ObjectKey + "')";
			this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/START_DATE", oParams.newTime[0]);
			this.getModel("ganttModel").setProperty(oRowContext.getPath() + "/END_DATE", oParams.newTime[1]);
			this._prepareGanttOpeartionPayload(oData).then(function (oPayload) {
				this._proceedToGanttOperationUpdate(sPath, oPayload);
			}.bind(this));
		},

		/**
		 * Create Gantt Operation Payload 
		 * @{param} oPayloadData - Shape Data
		 */
		_prepareGanttOpeartionPayload: function (oPayloadData) {
			return new Promise(function (resolve) {
				var obj = {};
				//collect all assignment properties who allowed for create
				this.getModel().getMetaModel().loaded().then(function () {
					var oMetaModel = this.getModel().getMetaModel(),
						oEntitySet = oMetaModel.getODataEntitySet("GanttHierarchySet"),
						oEntityType = oEntitySet ? oMetaModel.getODataEntityType(oEntitySet.entityType) : null,
						aProperty = oEntityType ? oEntityType.property : [];
					aProperty.forEach(function (property) {
						if (oPayloadData[property.name]) {
							obj[property.name] = oPayloadData[property.name];
						}
					});
					resolve(obj);
				}.bind(this));
			}.bind(this));
		},

		/**
		 * Method to Proceed to Update Gantt Operation Shapes to Backend
		 * and refresh the Detail screen after updating successfully
		 * @param aPath - Gantt path to be updated
		 * @param oPayload - Opeartion Payload to be sent to backend
		 */
		_proceedToGanttOperationUpdate: function (sPath, oPayload) {
			this.getModel("viewModel").setProperty("/ganttSettings/busy", true);
			this._updateGanttOperationCall(sPath, oPayload)
				.then(function (oData) {
					MessageToast.show(this.getResourceBundle().getText("msg.OperationSaveSuccess"));
					this.getModel("viewModel").setProperty("/ganttSettings/busy", false);
					this.oEventBus = sap.ui.getCore().getEventBus();
					this.oEventBus.publish("BaseController", "refreshFullGantt", this._loadGanttData, this);
					this.getView().getModel().refresh();
				}.bind(this));
		},

		/**
		 * Method to Update Gantt Operation Shapes to Backend
		 * @param aPath - Gantt path to be updated
		 * @param oPayload - Opeartion Payload to be sent to backend
		 * @returns promise
		 */
		_updateGanttOperationCall: function (sPath, oPayload) {
			return new Promise(function (resolve, reject) {
				this.getModel().update(sPath, oPayload, {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},
	});

});