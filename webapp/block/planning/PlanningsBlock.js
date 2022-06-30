sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
    "use strict";
    var myBlock = BlockBase.extend("com.evorait.evosuite.evoprep.block.planning.PlanningsBlock", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.evorait.evosuite.evoprep.block.planning.PlanningsBlock",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.evorait.evosuite.evoprep.block.planning.PlanningsBlock",
                    type: "XML"
                }
            }
        }
    });
    return myBlock;
}, true);