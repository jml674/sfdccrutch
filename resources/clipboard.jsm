Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.Clipboard"];




// Create a constructor for the built-in transferable class
const nsTransferable = Components.Constructor("@mozilla.org/widget/transferable;1", "nsITransferable");


SFDCCRUTCH.Clipboard = function() {
  this.transferrable = SFDCCRUTCH.Clipboard.createTransferrable();
  this.transferrable.addDataFlavor("text/unicode");
  Services.clipboard.setData(this.transferrable, null, Services.clipboard.kGlobalClipboard);
}

SFDCCRUTCH.Clipboard.timerId = -1;
SFDCCRUTCH.Clipboard.timerWindow = null;
SFDCCRUTCH.Clipboard.periodicity = 1000;
SFDCCRUTCH.Clipboard.caseId="";

// Create a wrapper to construct a nsITransferable instance and set its source to the given window, when necessary
SFDCCRUTCH.Clipboard.createTransferrable=function(source){
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Clipboard.createTransferrable: entering ");

    var res = nsTransferable();
    if ('init' in res) {
        // When passed a Window object, find a suitable privacy context for it.
        if (source instanceof Components.interfaces.nsIDOMWindow)
            // Note: in Gecko versions >16, you can import the PrivateBrowsingUtils.jsm module
            // and use PrivateBrowsingUtils.privacyContextFromWindow(sourceWindow) instead
            source = source.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIWebNavigation);

        res.init(source);
    }
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Clipboard.createTransferrable: exiting "+res);

    return res;
}

SFDCCRUTCH.Clipboard.startPolling = function(win)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Clipboard.startPolling: entering "+SFDCCRUTCH.Clipboard.timerId+" win="+win);
  if (SFDCCRUTCH.Clipboard.timerId == -1)
  {
    SFDCCRUTCH.Clipboard.timerWindow = win;
    SFDCCRUTCH.Clipboard.timerId = win.setInterval(function(){
      SFDCCRUTCH.Clipboard.checkClipboardAndLoadPage();
      },SFDCCRUTCH.Clipboard.periodicity); 
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Clipboard.startPolling: exiting "+SFDCCRUTCH.Clipboard.timerId );

}

SFDCCRUTCH.Clipboard.checkClipboardAndLoadPage = function()
{
      var win = SFDCCRUTCH.Clipboard.timerWindow;
      var content = SFDCCRUTCH.clipboard.getContent();
      var caseid = SFDCCRUTCH.Util.containsCaseId(content);
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Clipboard.startPolling.timer: entering ["+SFDCCRUTCH.Clipboard.caseId+"]");

      if (caseid!=null && SFDCCRUTCH.Clipboard.caseId != caseid)
      {
        var notification_loading = new win.Notification("Loading case "+caseid+"...");
        SFDCCRUTCH.Util.loadPage("https://genband.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?asPhrase=1&searchType=2&sen=a1T&sen=a0d&sen=00O&sen=005&sen=001&sen=500&sen=003&str="+caseid,"document",SFDCCRUTCH.UI.extractCaseAndLoadPage,
                function(url){
                    SFDCCRUTCH.Util.loadPage("https://genband.my.salesforce.com"+url,"document",
                      function(dom){
                            notification_loading.close();
                            var info = SFDCCRUTCH.UICasePage.collectInfo(dom,caseid);
                            var subject_string = caseid+" ("+SFDCCRUTCH.Util.shortSeverity(info.getProperty("severity"))+"):" +info.getProperty("subject");
                            var body_string = info.getProperty("account")+"/"+info.getProperty("endCustomer")+"\n"+
                                  info.getProperty("supportProduct")+"/"+info.getProperty("actualSoftwareReleasecode")+"\n"+
                                  info.getProperty("ownerOrganization")+"/"+info.getProperty("status")+"\n";
                            new win.Notification(subject_string, {tag: 'soManyNotification',body:body_string});

                        },
                      null,
                      null);

                      },caseid);

      }
      SFDCCRUTCH.Clipboard.caseId= caseid; 

}


SFDCCRUTCH.Clipboard.stopPolling = function()
{
  if (SFDCCRUTCH.Clipboard.timerId != -1)
    SFDCCRUTCH.Clipboard.timerWindow.clearInterval(SFDCCRUTCH.Clipboard.timerId);
  SFDCCRUTCH.Clipboard.timerId = -1;
}

SFDCCRUTCH.Clipboard.prototype.getContent = function() {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Clipboard.getContent: entering ");

  var str       = {};
  var strLength = {};
  var pastetext= null;
  try {
    Services.clipboard.getData(this.transferrable, Services.clipboard.kGlobalClipboard);
    this.transferrable.getTransferData("text/unicode", str, strLength);
    if (str) {
      pastetext = str.value.QueryInterface(Components.interfaces.nsISupportsString).data;
    }
  }  
  catch(e) { // nothing has been CTL-Ced
    return null;
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Clipboard.getContent: exiting "+pastetext);
  return pastetext;
}
