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
		 * format visibility of status change button in PrePlan Detail
		 * @param bUpdate
		 * @param bFinal
		 * @returns {boolean}
		 */
		showOperationAddEdit: function (bUpdate, bFinal) {
			return Boolean(bUpdate && bFinal);
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
		}
	};

});