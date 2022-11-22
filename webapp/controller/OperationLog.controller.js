sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, OverrideExecution) {
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
			var oRouter = this.getRouter();
			//route for page operation logs
			oRouter.getRoute("ChangeLogs").attachMatched(this._routeMatchedLogs, this);
		},

		/* =========================================================== */
		/* Public methods                                              */
		/* =========================================================== */

		/** 
		 * On close of operation log go back to detail page route
		 */
		onCloseLog: function () {
			var sObjectKey = this.getView().getBindingContext().getProperty('HeaderObjectKey');
			this.navToDetail(sObjectKey);
			this.getView().unbindElement();
		},

		/* =========================================================== */
		/* Internal methods                                            */
		/* =========================================================== */

		/** 
		 * Bind PlanItems element when route is matched
		 */
		_routeMatchedLogs: function (oArgs) {
			var sKey = oArgs.getParameter("arguments").operationKey;
			this.getView().bindElement({
				path: "/PlanItemsSet('" + sKey + "')"
			});
		}
	});
});