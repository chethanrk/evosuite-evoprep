sap.ui.define([], function () {
	"use strict";

	var constants = {
		APPLICATION: {
			EVOPLAN: "EVOPLAN",
			EVOORDER: "EVOORDER",
			EVOEQUIP: "EVOEQUIP",
			EVONOTIFY: "EVONOTIFY",
			EVOFLOC: "EVOFLOC",
			EVORELATE: "EVORELATE"
		},
		PROPERTY: {
			EVOEQUIP: "EQUIPMENT_NUMBER",
			EVONOTIFY: "NOTIFICATION_NO",
			EVOORDER: ["ORDER_NUMBER", "OPERATION_NUMBER"],
			EVOFLOC: "FUNCTIONAL_LOCATION",
			EVOOPERATION: "OPERATION_NUMBER",
			EVORELATE: "NETWORK_KEY"
		},

		LAUNCH_MODE: {
			FIORI: "LAUNCHPAD",
			BSP: "BSP"
		},
		CRITICALLYSTATES: {
			"info": {
				color: "#5E696E",
				state: "Information"
			},
			"0": {
				color: "#5E696E",
				state: "None"
			},
			"1": {
				color: "#BB0000",
				state: "Error"
			},
			"2": {
				color: "#ff0000",
				state: "Error"
			},
			"3": {
				color: "#E78C07",
				state: "Warning"
			},
			"4": {
				color: "#2B7D2B",
				state: "Success"
			},
			"5": {
				color: "#00ff00",
				state: "Success"
			}
		},
		ALLOWED_LINKS: {
			EVOPLAN: "EVOPLAN",
			EVOORDER: "EVOORDER"
		},
		DETAIL_TABS: {
			TABS: {
				FORM: "Form",
				TABLE: "Table"
			},
			GENERAL: "General",
			CAPACITY: "CapacityTab",
			PLANNING: "PlanningTab",
			OPERATIONS: "DemandsTab"
		},
		TIMEFORMATS: {
			0:	"HH:mm:ss",
			1:	"HH:mm:ss a",
			2:	"HH:mm:ss a",
			3:	"KK:mm:ss a",
			4:	"KK:mm:ss a"
		}
	};

	return constants;

});