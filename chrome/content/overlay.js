Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/preferences.jsm");

Components.utils.import("resource://sfdccrutch/ui_email.jsm");
Components.utils.import("resource://sfdccrutch/ui_commentpage.jsm");
Components.utils.import("resource://sfdccrutch/ui_casepage.jsm");
Components.utils.import("resource://sfdccrutch/ui_login.jsm");
Components.utils.import("resource://sfdccrutch/ui.jsm");

Components.utils.import("resource://sfdccrutch/model.jsm");
Components.utils.import("resource://sfdccrutch/http.jsm");
Components.utils.import("resource://sfdccrutch/clipboard.jsm");


SFDCCRUTCH.patternCaseId = "5006000000[0-9a-zA-Z]{5}"; 
SFDCCRUTCH.user="";
SFDCCRUTCH.CasePageInformationSet={};

SFDCCRUTCH.StartingCaseCommentEdition = 1; 
SFDCCRUTCH.InCommentEdition = 2; 
SFDCCRUTCH.CommentHasBeenSaved = 3; 
SFDCCRUTCH.LaunchEmailEdition = 4;
SFDCCRUTCH.InEmailEdition = 5;

SFDCCRUTCH.InAssignmentEdition = 1;
SFDCCRUTCH.InRegularEdition = 2; 
SFDCCRUTCH.EmailToBeSent = 3;
SFDCCRUTCH.InDefaultScreeningEdition = 4; 
SFDCCRUTCH.InRequestInfoScreeningEdition = 5; 

SFDCCRUTCH.onOverlayUnload = function(){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onOverlayUnload: entering");
  //SFDCCRUTCH.HTTP.unregister();
  //SFDCCRUTCH.Clipboard.stopPolling(window);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onOverlayUnload: exiting");

}


// 0.95 Compliance change to Mozilla add-ons policy
SFDCCRUTCH.mytoggleSidebarHandler = function (i){
    return function (event) {
      if(event.button==0){ mytoggleSidebar('viewsfdccrutchSidebar');
      }
    }
}

SFDCCRUTCH.onOverlayLoad = function(){
  window.pglistener == null;
  if (SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.CLEAR_LOG_AT_START, "bool", true))
  {

    SFDCCRUTCH.Util.clearLogFile();
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.onOverlayLoad: - clearing log file");

  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"onOverlayLoad: entering "+SFDCCRUTCH.UI.alreadyLaunched+" clipcaseid="+SFDCCRUTCH.Clipboard.caseId);
  

  var dir = SFDCCRUTCH.DirIO.get('ProfD');
  var str1 = SFDCCRUTCH.DirIO.path(dir);
  var str2 = str1.replace(/%20/,' ');
  var str3 = str2.replace(/file:\/\/\//,'');
  var str = str3.replace(/\//g,SFDCCRUTCH.DirIO.sep)+SFDCCRUTCH.DirIO.sep+'sfdccrutch';
      
  SFDCCRUTCH.Pref.set(SFDCCRUTCH.Pref.INSTALL_DIR, "str", str);

  SFDCCRUTCH.user=SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.USER, "str", "");

  if (!SFDCCRUTCH.UI.alreadyLaunched)
        SFDCCRUTCH.Util.checkNewVersion(function(old_version,new_version) {
          //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"onOverlayLoad: checking version "+old_version+" "+new_version);
          if (old_version != new_version)
          {
            SFDCCRUTCH.Pref.set(SFDCCRUTCH.Pref.VERSION, "str", new_version);
            SFDCCRUTCH.Util.sendInstallationMessage(new_version)
          }
        });
        
   window.setTimeout(function(){SFDCCRUTCH.UI.buildMenusAndStatusbar(window)},1000);

  /*if (SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ACTIVATED, "bool",true))
  {       
        SFDCCRUTCH.start(window);
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onOverlayLoad: extension is not activated");
  */
  SFDCCRUTCH.registerPrefsListener();
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onOverlayLoad: exiting");
}

SFDCCRUTCH.start = function(win){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.start: entering "+SFDCCRUTCH.UI.alreadyLaunched);

  if (win.pglistener == null) win.gBrowser.addTabsProgressListener(SFDCCRUTCH.UI.myListener);
    win.pglistener = 1;
  if (!SFDCCRUTCH.UI.alreadyLaunched)
  {
    var domains = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.DOMAINSTOINTERCEPT, "str", "");
    SFDCCRUTCH.HTTP.registerForDomain(domains,null);
    SFDCCRUTCH.alarmManager.read();
    SFDCCRUTCH.watchClipboard();
    SFDCCRUTCH.Util.getBrowserWindow().openDialog("chrome://sfdccrutch/content/alert/alert.xul","","titlebar,toolbar,centerscreen", null,0);
    SFDCCRUTCH.watchesManager.read();
    SFDCCRUTCH.watchesManager.start();
  }
  SFDCCRUTCH.UI.alreadyLaunched = true;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.start: exiting");
}

SFDCCRUTCH.stop = function(win){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.stop: entering");

  win.gBrowser.removeTabsProgressListener(SFDCCRUTCH.UI.myListener);
  win.pglistener = null;
  if (SFDCCRUTCH.UI.alreadyLaunched)
  {
    SFDCCRUTCH.watchesManager.stop();
    SFDCCRUTCH.HTTP.unregister();
    SFDCCRUTCH.Clipboard.stopPolling(win);
  }
  SFDCCRUTCH.UI.alreadyLaunched = false;
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.stop: exiting");
}


SFDCCRUTCH.addComment = function(subStatus){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"addComment: entering subStatus="+subStatus);
  var browser = SFDCCRUTCH.Util.getBrowser();
  var caseId = SFDCCRUTCH.UI.matchCaseId(browser.selectedBrowser.contentDocument.location.href,"https://genband.my.salesforce.com/("+SFDCCRUTCH.patternCaseId+")");
  if (caseId != null)
  {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"addComment: caseId="+caseId);

    var button = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("buttonAddComment");
    if (button != null)
    {  
      var evt = document.createEvent("Events");  
      evt.initEvent("click", true, false);  
      button.dispatchEvent(evt);
      
      SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.StartingCaseCommentEdition);
      SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonSubStatus",subStatus);  

    }
    else  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"addComment: button is NULL !");
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"addComment: caseId is NULL, url="+browser.selectedBrowser.contentDocument.location.href);
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"addComment: exiting "+(caseId==null?"null":SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonStatus")));
}


SFDCCRUTCH.populateContextProgram=function(event,menuItem){
  var browser = SFDCCRUTCH.Util.getBrowser();
//  SFDCCRUTCH.Util.printBrowserNUmber();

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"populateContextProgram: entering " +browser.selectedBrowser.contentDocument.location.href);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"populateContextProgram: entering window id=" +window.id);
  var caseId = SFDCCRUTCH.UI.matchCaseId(browser.selectedBrowser.contentDocument.location.href,"http[s]?://genband.my.salesforce.com/("+SFDCCRUTCH.patternCaseId+")");

  
  //alert(event.target.triggerNode.href);
  
  var display="";
  if (caseId == null) 
  {
    display="none";
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"populateContextProgram: this is not a case page");
  } 
  menuItem.style.display = display;

  // get clipboard
  SFDCCRUTCH.getClipboardContentAndDisplayMenuButton(event,"sfdccrutch-load-caseorjira-menu","Load SFDC case","Load JIRA ");
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"populateContextProgram: exiting");
}

SFDCCRUTCH.getClipboardContentAndDisplayMenuButton= function(event,menuId,labelcase,labeljira) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"getClipboardContentAndDisplayMenuButton: entering ");
  var content = "";
  var show_button = false;
  var display="none";
  var caseId;
  var jiraId;
  
  //var menu = document.getElementById(menuId);
  // fix 1.2.6 bug with label not beeing modified in the propper document.
  var menu = event.view.document.getElementById(menuId);
  
  content = SFDCCRUTCH.clipboard.getContent();
  if (content != null)
  {
    if ((caseId=SFDCCRUTCH.Util.containsCaseId(content))!=null)
    {
      display="";
      menu.label=labelcase+" "+caseId;
      menu.value=caseId;
      menu.style.display = display;
      show_button = true;
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"getClipboardContentAndDisplayMenuButton: showing button "+caseId);
    }
    else if ((jiraId=SFDCCRUTCH.Util.containsJiraId(content))!=null)
    {
      display="";
      menu.label=labeljira+" "+jiraId;
      menu.value=jiraId;
      menu.style.display = display;
      show_button = true;
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"getClipboardContentAndDisplayMenuButton: showing button "+jiraId);
    }
    
  }
  else
  {
    menu.style.display = display;
  }
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"getClipboardContentAndDisplayMenuButton: exiting menu=" +menu+" content="+content+" show="+show_button);
  return (display!="none");
}

SFDCCRUTCH.watchClipboard=function() {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"watchClipboard: entering ");
  SFDCCRUTCH.Clipboard.startPolling(window);

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"watchClipboard: exiting");

}

SFDCCRUTCH.registerPrefsListener=function() {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"registerPrefsListener: entering ");

  sfdccrutchPrefListener = new SFDCCRUTCH.Pref.Listener("extensions.sfdccrutch.",
		function(branch, name){
		  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"sfdccrutchPrefListener pref="+name);
			switch (name){
        case "lightDisplay":

            var lightDisplay=SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LIGHT_CASEDISPLAY, "bool",true);
            SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"changing: lightDisplay="+lightDisplay);
            SFDCCRUTCH.UI.doForAllWindows("navigator:browser",function(win){  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"registerPrefsListener: window ");
                var menuItem=win.document.getElementById("lightDisplayMenuItem");
                if (menuItem != null)
                {
                  menuItem.setAttribute("checked",lightDisplay);
                }                  
            });
          break;

        case "activated":
            var activated=SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ACTIVATED, "bool",true);
            SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"changing: activation="+activated);
            SFDCCRUTCH.UI.doForAllWindows("navigator:browser",function(win){  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"registerPrefsListener: window ");
                var menuItem=win.document.getElementById("activateMenuItem");
                if (menuItem != null)
                {
                  menuItem.parentNode.parentNode.setAttribute("image",(activated?"chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg":"chrome://sfdccrutch/skin/images/sfdccrutch_ico16inactivated.jpg"));
                  menuItem.setAttribute("checked",activated);
                }
                if (activated) SFDCCRUTCH.start(win);
                else SFDCCRUTCH.stop(win);
                  
            });
          break;
			}
  	  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"sfdccrutchPrefListener exiting");
		}
	);
	sfdccrutchPrefListener.register();
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"registerPrefsListener: exiting ");
}