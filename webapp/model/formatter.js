sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/gantt/misc/Format",
	"com/evorait/evosuite/evoprep/model/Constants",
	"sap/gantt/library",
	"com/evorait/evosuite/evoprep/assets/js/moment-with-locales.min"
], function (DateFormat, Format, Constants, GanttLibrary, momentjs) {
	"use strict";

	var mCriticallyStates = Constants.CRITICALLYSTATES;
	var TimeUnit = GanttLibrary.config.TimeUnit;
	var oViewMapping = {
		D: {
			timeLine: "OneDay",
			beginDate: moment().startOf("isoWeek").toDate(),
			endDate: moment().endOf("isoWeek").toDate(),
			bgDifferenceFn: function (oStartDate, oEndDate) {
				return oEndDate.diff(oStartDate, "days");
			},
			bgStartDateFn: function (oDate) {
				//start of day
				return oDate.format("YYYYMMDD000000");
			},
			bgEndDateFn: function (oDate) {
				//end of day
				var sEnd = oDate.format("YYYYMMDD235959");
				oDate.add(1, "days");
				return sEnd;
			},
			isFuture: function (date) {
				if (!date) {
					return false;
				}
				return moment(date).isSameOrAfter(moment().format("YYYY-MM-DD"));
			}
		},
		W: {
			timeLine: "OneWeek",
			beginDate: moment().startOf("month").toDate(),
			endDate: moment().endOf("month").toDate(),
			bgDifferenceFn: function (oStartDate, oEndDate) {
				return oEndDate.diff(oStartDate, 'weeks');
			},
			bgStartDateFn: function (oDate) {
				//monday of this week
				return oDate.day(1).format("YYYYMMDD000000");
			},
			bgEndDateFn: function (oDate) {
				//sunday of week
				var sEnd = oDate.day(7).format("YYYYMMDD235959");
				oDate.add(1, "days");
				return sEnd;
			},
			isFuture: function (date) {
				var today = moment().format("YYYY-MM-DD");
				if (!date) {
					return false;
				}
				//shape startDate is today or later or week start date or between start and end of week
				return moment(date).isSameOrAfter(today) ||
					moment(date).isSame(moment(today).day(1)) ||
					moment(date).isBetween(moment(today).startOf("day"), moment(today).endOf("day"));
			}
		},
		M: {
			timeLine: "OneMonth",
			beginDate: moment().startOf("month").subtract(1, "months").toDate(),
			endDate: moment().endOf("month").add(2, "months").endOf("month").toDate(),
			bgDifferenceFn: function (oStartDate, oEndDate) {
				return oEndDate.diff(oStartDate, 'months');
			},
			bgStartDateFn: function (oDate) {
				//first day of month
				return oDate.startOf("month").format("YYYYMMDD000000");
			},
			bgEndDateFn: function (oDate) {
				//last day of month
				var sEnd = oDate.endOf("month").format("YYYYMMDD235959");
				oDate.add(1, "days");
				return sEnd;
			},
			isFuture: function (date) {
				var today = moment().format("YYYY-MM-DD");
				if (!date) {
					return false;
				}
				//shape startDate is today or later or month start date or between start and end of month
				return moment(date).isSameOrAfter(today) ||
					moment(date).isSame(moment(today).startOf("month")) ||
					moment(date).isBetween(moment(today).startOf("day"), moment(today).endOf("day"));
			}
		}
	};
	var oTimeLineOptions = {
		"OneDay": {
			innerInterval: {
				unit: TimeUnit.day,
				span: 1,
				range: 90
			},
			largeInterval: {
				unit: TimeUnit.week,
				span: 1,
				pattern: "ww | LLL YYYY"
			},
			smallInterval: {
				unit: TimeUnit.day,
				span: 1,
				pattern: "EEE dd"
			}
		},
		"OneWeek": {
			innerInterval: {
				unit: TimeUnit.week,
				span: 1,
				range: 150
			},
			largeInterval: {
				unit: TimeUnit.month,
				span: 1,
				pattern: "LLLL YYYY"
			},
			smallInterval: {
				unit: TimeUnit.week,
				span: 1,
				pattern: "ww"
			}
		},
		"OneMonth": {
			innerInterval: {
				unit: TimeUnit.month,
				span: 1,
				range: 175
			},
			largeInterval: {
				unit: TimeUnit.year,
				span: 1,
				format: "YYYY"
			},
			smallInterval: {
				unit: TimeUnit.month,
				span: 1,
				pattern: "LLL"
			}
		}
	};

	return {

		/**
		 * Handle visibility of full screen and exit full screen 
		 */
		fullScreenVisibility: function (fullScreen) {
			if (!fullScreen) {
				return "sap-icon://exit-full-screen";
			}
			return "sap-icon://full-screen";
		},

		/**
		 * Handle visibility of gantt  full screen and exit full screen 
		 */
		fullScreenGanttVisibility: function (fullScreen) {
			if (!fullScreen) {
				return "sap-icon://exit-full-screen";
			}
			return "sap-icon://full-screen";
		},

		formatStatusState: function (sValue, isInNavLinks) {
			if (mCriticallyStates.hasOwnProperty(sValue)) {
				return mCriticallyStates[sValue].state;
			} else if (isInNavLinks === "true") {
				return mCriticallyStates["info"].state;
			} else {
				return mCriticallyStates["0"].state;
			}
		},

		/**
		 * show/hide options for System status or User status buttons
		 */
		showStatusSelectOption: function (sFunction, mAllowParams) {
			for (var key in mAllowParams) {
				var sAllowFunc = "ALLOW_" + sFunction;
				if (key === sAllowFunc && (mAllowParams[key] === true || mAllowParams[key] === "X")) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Visibility of delete butotn in maste page
		 */
		showDeleteMasterList: function (sEnableDelete, sLayout) {
			if (sEnableDelete && sEnableDelete === "X" && sLayout && sLayout === "OneColumn") {
				return true;
			}

			return false;
		},

		/**
		 * format date by given format from language file
		 * @param date
		 * @param format
		 * @returns {string}
		 */
		formatDate: function (date, format) {
			if (!date || date === "") {
				return "-";
			}
			if (!format) {
				format = "MMM dd, yyyy";
			}
			var oDateFormat = DateFormat.getDateTimeInstance({
				pattern: format
			});
			return oDateFormat.format(new Date(date));
		},

		/**
		 * format visibility of status change button in PrePlan Detail
		 * @param bStatus
		 * @param bEdit
		 * @param bFInal
		 * @returns {boolean}
		 */
		showDetailStatusEdit: function (bStatus, bEdit, bFinal) {
			return Boolean(bStatus && bEdit && bFinal);
		},

		/**
		 * format visibility of add operation button in PrePlan Detail
		 * @param bUpdate
		 * @param bFinal
		 * @param bAllowOper
		 * @returns {boolean}
		 */
		showOperationAdd: function (bUpdate, bFinal, bAllowOper) {
			return Boolean(bUpdate && bFinal && bAllowOper);
		},

		/**
		 * format visibility of row action based on nav links
		 * @param aNavLinks
		 * @returns {boolean}
		 */
		showDemandRowAction: function (sNavLinks) {
			for (var n in sNavLinks) {
				if (sNavLinks[n].btnVisibility) {
					return true;
				}
			}
			return false;
		},

		/**
		 * Formatter to display Relationship Type in Gantt
		 * @param sRelationshipType
		 * @returns {string}
		 */
		showRelationshipType: function (sRelationshipType) {
			if (sRelationshipType === "FS") {
				return "FinishToStart";
			} else if (sRelationshipType === "FF") {
				return "FinishToFinish";
			} else if (sRelationshipType === "SF") {
				return "StartToFinish";
			} else {
				return "StartToStart";
			}
		},

		/**
		 * Merging given date and time to DateTime format
		 * @param sDate
		 * @param sTime
		 */
		mergeDateTime: function (sDate, sTime) {
			var oDatebject = null,
				sOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000,
				oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "yyyy-MM-dd"
				}),
				oTimeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm:ss"
				}),
				sDateStr, sTimeStr;
			if (sDate && sTime) {
				sDateStr = oDateFormat.format(new Date(sDate.getTime() + sOffsetMs));
				sTimeStr = oTimeFormat.format(new Date(sTime.ms + sOffsetMs));
				oDatebject = new Date(sDateStr + "T" + sTimeStr);
			}
			return oDatebject;
		},

		/**
		 * format visibility of delete operation button in PrePlan Detail
		 * @param bFinal
		 * @param bAllowOper
		 * @returns {boolean}
		 */
		showOperationEditDel: function (bFinal, bAllowOper) {
			return Boolean(bFinal && bAllowOper);
		},

		/**
		 * Formatting TimeZone for Gantt Shape Dates
		 * @param oDate
		 */
		formatTimeZone: function (oDate) {
			var sOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			return oDate.getTime() - sOffsetMs;
		},

		/**
		 * get Utilization gantt zoom timeline options for 
		 * @param {string} sKey - key from Select
		 * @returns {object} Zoom time interval for Utilization Gantt Chart
		 */
		getTimeLineOptions: function (sKey) {
			if (oViewMapping[sKey]) {
				return oTimeLineOptions[oViewMapping[sKey].timeLine];
			} else {
				return oTimeLineOptions;
			}
		},
		/**
		 * format the Object Status state acording to Material_Status
		 * @param sValue
		 */
		getDemandState: function (sValue) {
			if (sValue) {
				return sValue;
			}
			return "None";
		},

		/**
		 * format the Old and new values of changes for data formats
		 * @param sThen
		 * @param sOldVal
		 * @param sNow
		 * @param sNewVal
		 * @param sField
		 * @returns {string}
		 */
		formatLogValues: function (sThen, sOldVal, sNow, sNewVal, sField) {
			if (sField.indexOf('DATE') !== -1) {
				sOldVal = sOldVal ? moment(sOldVal, 'YYYYMMDD').format('MMMM DD, YYYY') : sOldVal;
				sNewVal = sNewVal ? moment(sNewVal, 'YYYYMMDD').format('MMMM DD, YYYY') : sNewVal;
			} else if (sField.indexOf('TIME') !== -1) {
				sOldVal = sOldVal ? moment(sOldVal, 'HHmmss').format('HH:mm:ss') : sOldVal;
				sNewVal = sNewVal ? moment(sNewVal, 'HHmmss').format('HH:mm:ss') : sNewVal;
			}
			return sThen + ' ' + sOldVal + '\n' + sNow + ' ' + sNewVal;
		},

		/**
		 * format the plan status acording state
		 * @param sValue
		 */
		getPlanState: function (sValue) {
			if (sValue) {
				if (sValue === "INPR") {
					return "Success";
				} else if (sValue === "NEW") {
					return "Information";
				} else if (sValue === "ARCH") {
					return "Success";
				} else if (sValue === "FINL") {
					return "Error";
				}
			}
			return "None";
		},

		/**
		 * Garphicplanning edit handling
		 * @param bEnableUpdateplan - system info indicator
		 * @param bGanttRealOnly - operation edit indicator
		 * @param bEnableGanttShapesEdit - local edit indicator
		 * @param ballowFinal - plan final status indicator
		 * 
		 */
		checkGanttEditability: function (bEnableUpdateplan, bGanttRealOnly, bEnableGanttShapesEdit, ballowFinal) {
			return Boolean(bEnableUpdateplan === 'X' && !bGanttRealOnly && bEnableGanttShapesEdit && ballowFinal);
		},
	};

});