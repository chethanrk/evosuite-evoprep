sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/OverrideExecution",
	"sap/f/library"
], function (BaseController, OverrideExecution, library) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.OperationLog", {

		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				onCloseLog: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlan
		 */
		onInit: function () {
			var oEventBus = sap.ui.getCore().getEventBus();
			oEventBus.subscribe("ChangeLogs", "routeMatched", this._routeMatchedLogs, this);
		},

		/* =========================================================== */
		/* Public methods                                              */
		/* =========================================================== */

		/** 
		 * On close of operation log go back to detail page route
		 */
		onCloseLog: function () {
			this.getView().unbindElement();
			var sLayout = library.LayoutType.ThreeColumnsMidExpandedEndHidden,
				oViewModel = this.getModel("viewModel");
			if (this.getModel("user").getProperty("/DEFAULT_PLAN_DET_FULLSC")) {
				sLayout = library.LayoutType.MidColumnFullScreen;
			}
			oViewModel.setProperty("/layout", sLayout);
		},

		/* =========================================================== */
		/* Internal methods                                            */
		/* =========================================================== */

		/** 
		 * Bind PlanItems element when operation is clicked
		 */
		_routeMatchedLogs: function (sChannel, sEvent, oData) {
			var sObjectKey = oData.sKey;
			this.getView().bindElement({
				path: "/PlanItemsSet('" + sObjectKey + "')"
			});
		}
	});
});