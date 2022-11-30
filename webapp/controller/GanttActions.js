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
		 * Create Gantt Operation Payload for Batch Update
		 * @{param} oPayloadData - Shape Data
		 */
		_prepareGanttOpeartionPayload: function (aPayloadArray) {
			this._oView.getModel().setDeferredGroups(["batchGanttUpdate"]);
			return new Promise(function (resolve) {
				aPayloadArray.forEach(function (oPayloadData) {
					var obj = {},
						sPath,
						mParameters = {
							groupId: "batchGanttUpdate"
						};
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
						sPath = "/GanttHierarchySet('" + oPayloadData.ObjectKey + "')";
						this._oView.getModel().update(sPath, oPayloadData, mParameters);
					}.bind(this));
				}.bind(this));
				resolve(aPayloadArray);
			}.bind(this));
		},

		/**
		 * Method to Proceed to Update Gantt Operation Shapes to Backend
		 * and refresh the Detail screen after updating successfully
		 */
		_proceedToGanttOperationUpdate: function () {
			this._oView.getModel("viewModel").setProperty("/ganttSettings/busy", true);
			this._updateGanttOperationCall()
				.then(function (oData) {
					MessageToast.show(this._oView.getModel('i18n').getResourceBundle().getText("msg.OperationSaveSuccess"));
					this._oView.getModel("viewModel").setProperty("/ganttSettings/busy", false);
					this._oView.getModel().refresh();
					var oEventBus = sap.ui.getCore().getEventBus();
					oEventBus.publish("BaseController", "refreshFullGantt");
					oEventBus.publish("BaseController", "refreshUtilizationGantt");
					this._oView.getModel("viewModel").setProperty("/bDependencyCall", true);
					this._oView.getModel("viewModel").setProperty("/ganttSettings/bUtilizationCall", true);
					this._oView.byId("idPlanningGanttChartTable").getSelection().clear(true);
					this.resetDeferredGroupToChanges(this._oView);
				}.bind(this));
		},

		/**
		 * Method for Batch Update Gantt Operation Shapes to Backend
		 * @returns promise
		 */
		_updateGanttOperationCall: function () {
			return new Promise(function (resolve, reject) {
				this._oView.getModel().submitChanges({
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
		 * @param oDateRange - DateRange Context
		 */
		_createGanttHorizon: function (oAxisTimeStrategy, oContext, oDateRange) {
			var sPath = oContext.getPath(),
				oHorizonDates;
			if (oAxisTimeStrategy) {
				oHorizonDates = this._getHorizonDates(sPath, oDateRange);
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
		 * @param oDateRange 
		 */
		_getHorizonDates: function (sPath, oDateRange) {
			var sStartDate = this._oView.getModel().getProperty(sPath + "/START_DATE"),
				sEndDate = this._oView.getModel().getProperty(sPath + "/END_DATE"),
				sTotalStartDate = sStartDate,
				sTotalEndDate = sEndDate,
				oHorizonDates;
			if (oDateRange) {
				sTotalStartDate = oDateRange.getDateValue();
				sTotalEndDate = oDateRange.getSecondDateValue();
			}
			oHorizonDates = {
				visibleHorizon: {
					startDate: moment(sStartDate).startOf("day").subtract(1, "day").toDate(),
					endDate: moment(sEndDate).endOf("day").add(1, "day").toDate()
				},
				totalHorizon: {
					startDate: moment(sTotalStartDate).startOf("day").subtract(1, "day").toDate(),
					endDate: moment(sTotalEndDate).endOf("day").add(1, "day").toDate()
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
					oHorizonDates = this._getUtilizationGanttHorizonDates(sPath, sKey);
				if (sKey === "D") {
					oAxisTimeStrategy.setZoomLevel(6);
				}
				oAxisTimeStrategy.setVisibleHorizon(new sap.gantt.config.TimeHorizon({
					startTime: oHorizonDates.visibleHorizon.startDate,
					endTime: oHorizonDates.visibleHorizon.endDate
				}));
				oAxisTimeStrategy.setTotalHorizon(new sap.gantt.config.TimeHorizon({
					startTime: oHorizonDates.totalHorizon.startDate,
					endTime: oHorizonDates.totalHorizon.endDate
				}));
				oAxisTimeStrategy.setTimeLineOption(formatter.getTimeLineOptions(sKey));
			}
		},

		/**
		 * Function to Calcualate Utilization Gantt Horizon Dates  
		 * @param sPath 
		 */
		_getUtilizationGanttHorizonDates: function (sPath, sKey) {
			var sStartDate = this._oView.getModel().getProperty(sPath + "/START_DATE"),
				sEndDate = this._oView.getModel().getProperty(sPath + "/END_DATE"),
				sTotalStartDate, sTotalEndDate;
			if (sKey === "W") {
				sTotalStartDate = moment(sStartDate).startOf('week').toDate();
				sTotalEndDate = moment(sEndDate).endOf('week').toDate();
			} else if (sKey === "M") {
				sTotalStartDate = moment(sStartDate).startOf('month').toDate();
				sTotalEndDate = moment(sEndDate).endOf('month').toDate();
			} else if (sKey === "D") {
				sTotalStartDate = sStartDate;
				sTotalEndDate = sEndDate;
			}
			sTotalStartDate = moment(sTotalStartDate).startOf("day").subtract(1, "day").toDate();
			sTotalEndDate = moment(sTotalEndDate).endOf("day").add(1, "day").toDate();

			var oHorizonDates = {
				visibleHorizon: {
					startDate: sStartDate,
					endDate: sEndDate
				},
				totalHorizon: {
					startDate: sTotalStartDate,
					endDate: sTotalEndDate
				}
			};
			return oHorizonDates;
		},

	});

});