sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"zsp/itsm/zspfopermanager/test/integration/pages/OperManagerList.gen",
	"zsp/itsm/zspfopermanager/test/integration/pages/OperManagerObjectPage.gen"
], function (JourneyRunner, OperManagerListGenerated, OperManagerObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('zsp/itsm/zspfopermanager') + '/test/flp.html#app-preview',
        pages: {
			onTheOperManagerListGenerated: OperManagerListGenerated,
			onTheOperManagerObjectPageGenerated: OperManagerObjectPageGenerated
        },
        async: true
    });

    return runner;
});

