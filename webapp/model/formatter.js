sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/gantt/misc/Format",
	"com/evorait/evosuite/evoprep/model/Constants"
], function (DateFormat, Format, Constants) {
	"use strict";

	var mCriticallyStates = Constants.CRITICALLYSTATES;

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
		}
	};

});