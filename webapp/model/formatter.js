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

	/*	getOperationDate: function (oDate) {
			debugger;
		}*/
	};

});