sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"com/evorait/evosuite/evoprep/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Token",
	"sap/m/Tokenizer",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast"
], function (BaseController, formatter, Filter, FilterOperator, Token, Tokenizer, Fragment, MessageToast) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.GanttAction", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {}
		},

		init: function (oView) {
			this._oView = oView;
		},

		/**
		 * Create Gantt Operation Payload 
		 * @{param} oPayloadData - Shape Data
		 */
		_prepareGanttOpeartionPayload: function (oPayloadData) {
			return new Promise(function (resolve) {
				var obj = {};
				//collect all assignment properties who allowed for create
				this._oView.getModel().getMetaModel().loaded().then(function () {
					var oMetaModel = this._oView.getModel().getMetaModel(),
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
			this._oView.getModel("viewModel").setProperty("/ganttSettings/busy", true);
			this._updateGanttOperationCall(sPath, oPayload)
				.then(function (oData) {
					MessageToast.show(this._oView.getModel('i18n').getResourceBundle().getText("msg.OperationSaveSuccess"));
					this._oView.getModel("viewModel").setProperty("/ganttSettings/busy", false);
					this._oView.getModel().refresh();
					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("BaseController", "refreshFullGantt", this._loadGanttData, this);
					this._oView.getModel("viewModel").setProperty("/bDependencyCall", true);
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
				this._oView.getModel().update(sPath, oPayload, {
					success: function (oData) {
						resolve(oData);
					},
					error: function (oError) {
						reject(oError);
					}
				});
			}.bind(this));
		},

		/**
		 * Creating Gantt Horizon for Gantt 
		 * @param oAxisTimeStrategy - Gantt AxisTimeStrategy
		 * @param oContext - Detail Page BindingContext
		 */
		_createGanttHorizon: function (oAxisTimeStrategy, oContext) {
			var sPath = oContext.getPath(),
				oHorizonDates;
			if (oAxisTimeStrategy) {
				oHorizonDates = this._getHorizonDates(sPath);
				oAxisTimeStrategy.setTotalHorizon(new sap.gantt.config.TimeHorizon({
					startTime: oHorizonDates.totalHorizon.startDate,
					endTime: oHorizonDates.totalHorizon.endDate
				}));
				oAxisTimeStrategy.setVisibleHorizon(new sap.gantt.config.TimeHorizon({
					startTime: oHorizonDates.visibleHorizon.startDate,
					endTime: oHorizonDates.visibleHorizon.endDate
				}));
				oAxisTimeStrategy.setZoomLevel(6);
			}
		},

		/**
		 * Function to Calcualate Gantt Horizon Dates  
		 * @param sPath 
		 */
		_getHorizonDates: function (sPath) {
			var sStartDate = this._oView.getModel().getProperty(sPath + "/START_DATE"),
				sEndDate = this._oView.getModel().getProperty(sPath + "/END_DATE"),
				sMidDate = new Date(sEndDate - (sEndDate - sStartDate) / 2),
				oHorizonDates = {
					visibleHorizon: {
						startDate: moment(sMidDate).startOf("day").subtract(2, "day").toDate(),
						endDate: moment(sMidDate).endOf("day").add(1, "day").toDate()
					},
					totalHorizon: {
						startDate: moment(sStartDate).startOf("day").subtract(30, "day").toDate(),
						endDate: moment(sEndDate).endOf("day").add(30, "day").toDate()
					}
				};
			return oHorizonDates;
		},

		/**
		 * Creating Gantt Horizon for Utilization Gantt Chart
		 * @param oAxisTimeStrategy - Gantt AxisTimeStrategy
		 * @param oContext - Detail Page BindingContext
		 * @param sKey - View Mode Key
		 */
		_createUtilizationGanttHorizon: function (oAxisTimeStrategy, oContext, sKey) {
			if (oAxisTimeStrategy) {
				var sPath = oContext.getPath(),
					sStartDate = this._oView.getModel().getProperty(sPath + "/START_DATE"),
					sEndDate = this._oView.getModel().getProperty(sPath + "/END_DATE");
				oAxisTimeStrategy.setTotalHorizon(new sap.gantt.config.TimeHorizon({
					startTime: moment(sStartDate).startOf('month').toDate(), 
					endTime: moment(sEndDate).endOf('month').toDate() 
				}));
				oAxisTimeStrategy.setVisibleHorizon(new sap.gantt.config.TimeHorizon({
					startTime: sStartDate,
					endTime: sEndDate 
				}));
				oAxisTimeStrategy.setZoomLevel(6);
				oAxisTimeStrategy.setTimeLineOption(formatter.getTimeLineOptions(sKey));
				// if (sKey === "D") {
				// 	oAxisTimeStrategy.setZoomLevel(6);
				// }
			}
		},
	});

});