sap.ui.define([
	"com/evorait/evosuite/evoprep/controller/BaseController",
	"sap/ui/core/mvc/OverrideExecution"
], function (BaseController, OverrideExecution) {
	"use strict";

	return BaseController.extend("com.evorait.evosuite.evoprep.controller.PrePlanDetail", {
		metadata: {
			// extension can declare the public methods
			// in general methods that start with "_" are private
			methods: {
				oPressDetailDelete: {
					public: true,
					final: false,
					overrideExecution: OverrideExecution.Instead
				}
			}
		},

		oViewModel: null,
		_oContext: null,

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.evorait.evosuite.evoprep.view.PrePlanDetail
		 */
		onInit: function () {
			this.oViewModel = this.getModel("viewModel");
			var eventBus = sap.ui.getCore().getEventBus();
			//Binnding has changed in TemplateRenderController.js
			eventBus.subscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
		},

		/**
		 * Called when a controller is destroyed
		 * Object on exit
		 */
		onExit: function () {
			this.getView().unbindElement();
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.unsubscribe("TemplateRendererEvoPrep", "changedBinding", this._changedBinding, this);
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * Detail page delete functionality
		 */
		oPressDetailDelete: function () {
			var sTitle = this.getResourceBundle().getText("tit.confirmDelete"),
				sMsg = this.getResourceBundle().getText("msg.confirmDeleteSelectedPrepLan");

			if (this._oContext) {
				var successFn = function () {
					this.deleteEntries([this._oContext], null).then(function () {
						this.nav2Master();
					}.bind(this));
				};
				this.showConfirmDialog(sTitle, sMsg, successFn.bind(this));
			}
		},

		/* =========================================================== */
		/* public methods                                              */
		/* =========================================================== */

		/**
		 * TemplateRenderer changedBinding Event
		 * set new this._oContext
		 * @param sChannel
		 * @param sEvent
		 * @param oData
		 */
		_changedBinding: function (sChannel, sEvent, oData) {
			if (sChannel === "TemplateRendererEvoPrep" && sEvent === "changedBinding") {
				var sViewName = this.getView().getViewName() + "#" + this.getView().getId();

				if (!oData) {
					return;
				}

				if (oData.viewNameId === sViewName) {
					this._oContext = this.getView().getBindingContext();
				}
			}
		}

	});

});