sap.ui.define(["sap/uxap/BlockBase"], function (BlockBase) {
    "use strict";
    var myBlock = BlockBase.extend("com.evorait.evosuite.evoprep.block.capacity.CapacityBlock", {
        metadata: {
            views: {
                Collapsed: {
                    viewName: "com.evorait.evosuite.evoprep.block.capacity.CapacityBlock",
                    type: "XML"
                },
                Expanded: {
                    viewName: "com.evorait.evosuite.evoprep.block.capacity.CapacityBlock",
                    type: "XML"
                }
            }
        }
    });
    return myBlock;
}, true);