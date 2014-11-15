Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");
Components.utils.import("resource://sfdccrutch/dom.jsm");
Components.utils.import("resource://sfdccrutch/sfdccrutch.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.UI"];

SFDCCRUTCH.UI = {};



SFDCCRUTCH.UI.panelWindow = 0;
SFDCCRUTCH.UI.sidebarWindow = null;
SFDCCRUTCH.UI.alreadyLaunched = false;

SFDCCRUTCH.UI.currentPageIndex = 0;

SFDCCRUTCH.UI.ScraperDocument = 0;
SFDCCRUTCH.UI.instanceNumber = 0;
SFDCCRUTCH.UI.ErrorPopup=0;
SFDCCRUTCH.UI.WatchPopup = 0;
SFDCCRUTCH.UI.urlAdvisedTab=null;
SFDCCRUTCH.UI.currentTabDocument=null;
SFDCCRUTCH.UI.listenerAdded=false;
SFDCCRUTCH.UI.currentNode=null;
SFDCCRUTCH.UI.savedNodeStyle="";
SFDCCRUTCH.UI.pathDisplaySize="300";
SFDCCRUTCH.user = "";


SFDCCRUTCH.UI.restoreStyleOfNode = function(node){
  node.setAttribute("style",SFDCCRUTCH.UI.savedNodeStyle);
}

SFDCCRUTCH.UI.saveStyleOfNode=function(style) {
  SFDCCRUTCH.UI.savedNodeStyle=style;
}





SFDCCRUTCH.UI.getYearString = function(year)
{
  if (year != "")
    return "("+year+")"
  else
    return "";
}

SFDCCRUTCH.UI.addClass = function(element, className){
	element.className += " " + className;
}

SFDCCRUTCH.UI.buildMenusAndStatusbar= function(win){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildMenusAndStatusbar: entering");
  var addonBar = win.document.getElementById("nav-bar-customization-target"); 
  
  var toolbaritem=win.document.createElement("toolbaritem");
  toolbaritem.setAttribute("id","sfdccrutch-toolbaritem");
  toolbaritem.setAttribute("align","center");
  toolbaritem.setAttribute("pack","end");
  toolbaritem.setAttribute("flex","0");
  toolbaritem.setAttribute("removable","true");
  toolbaritem.setAttribute("cui-areatype","toolbar");
  addonBar.appendChild(toolbaritem);
  
  var statusbarpanel = win.document.createElement("toolbarbutton");
  statusbarpanel.setAttribute("image","chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg");
  statusbarpanel.setAttribute("id","sb-button-sfdccrutch");
  //statusbarpanel.setAttribute("context","sfdccrutch-popup-status");
  statusbarpanel.setAttribute("type","menu-button");

  var menupopup = win.document.createElement("menupopup");
  
  var menuitem_show_alarms = win.document.createElement("menuitem");
  menuitem_show_alarms.setAttribute("label","Updates required");  
  menuitem_show_alarms.addEventListener("click", function(){
           SFDCCRUTCH.Util.getBrowserWindow().openDialog("chrome://sfdccrutch/content/alert/alert.xul","","titlebar,toolbar,centerscreen", null,0);

          }
    , false);
  menupopup.appendChild(menuitem_show_alarms);

  var menuitem_show_watches = win.document.createElement("menuitem");
  menuitem_show_watches.setAttribute("label","Comment subscriptions");  
  menuitem_show_watches.addEventListener("click", function(){
          SFDCCRUTCH.UI.displayWatch(null,false,"Case subscriptions");
          }
    , false);
  menupopup.appendChild(menuitem_show_watches);

  

  var menuitem_lightmode = win.document.createElement("menuitem");
  menuitem_lightmode.id = "lightDisplayMenuItem";

  menuitem_lightmode.setAttribute("type","checkbox");
  menuitem_lightmode.setAttribute("label","Light display");
  menuitem_lightmode.setAttribute("checked",SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LIGHT_CASEDISPLAY, "bool",true));
          

  menuitem_lightmode.addEventListener("command", function(){
        SFDCCRUTCH.Pref.set(SFDCCRUTCH.Pref.LIGHT_CASEDISPLAY, "bool",this.getAttribute("checked"));

          }
    , false);
  menupopup.appendChild(menuitem_lightmode);
  
  var menuitem_activate = win.document.createElement("menuitem");
  menuitem_activate.id = "activateMenuItem";
  menuitem_activate.setAttribute("type","checkbox");
  menuitem_activate.setAttribute("label","Activated");
  var checked = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ACTIVATED, "bool",true);
  statusbarpanel.setAttribute("image",(checked?"chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg":"chrome://sfdccrutch/skin/images/sfdccrutch_ico16inactivated.jpg"));
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildMenusAndStatusbar: menu activate image="+(checked?"chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg":"chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg"));

  menuitem_activate.setAttribute("checked",checked);

  menuitem_activate.addEventListener("command", function(){
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildMenusAndStatusbar: menu activate "+this.getAttribute("checked"));
    SFDCCRUTCH.Pref.set(SFDCCRUTCH.Pref.ACTIVATED, "bool",this.getAttribute("checked"));
    /*statusbarpanel.setAttribute("image",(this.getAttribute("checked")?"chrome://sfdccrutch/skin/images/sfdccrutch_ico16.jpg":"chrome://sfdccrutch/skin/images/sfdccrutch_ico16inactivated.jpg"));

    if (this.getAttribute("checked"))
    {
        SFDCCRUTCH.start(win);
    } 
    else
    {
        SFDCCRUTCH.stop(win);
    }
    */
          }
    , false);
  
  menupopup.appendChild(menuitem_activate);

  var menuitem_options = win.document.createElement("menuitem");
  menuitem_options.setAttribute("label","Options");
  menuitem_options.addEventListener("click", function(){
      SFDCCRUTCH.UI.ErrorPopup = SFDCCRUTCH.Util.getBrowserWindow().openDialog("chrome://sfdccrutch/content/settings/settings.xul", "", "chrome,titlebar,toolbar,centerscreen","","");   
          }
    , false);
  
  menupopup.appendChild(menuitem_options);

  var menuitem_about = win.document.createElement("menuitem");
  menuitem_about.setAttribute("label","About");
  menuitem_about.addEventListener("command",
      function(){SFDCCRUTCH.Util.getBrowserWindow().open("chrome://sfdccrutch/content/about/about.xul","","chrome,dialog,modal,centerscreen");},false);
  menupopup.appendChild(menuitem_about);
  
  
  statusbarpanel.appendChild(menupopup);
  toolbaritem.appendChild(statusbarpanel);
  
  SFDCCRUTCH.UI.buildContextMenu(win);
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildMenusAndStatusbar: exiting");
}

SFDCCRUTCH.UI.loadCaseOrJiraHandler= function(menuItem) {
  var id = menuItem.getAttribute("value");
  if (id[0]=="A") // Jira
    SFDCCRUTCH.Util.openNewTab("jira.genband.com/browse/"+id);
  else
  SFDCCRUTCH.Util.loadPage("https://genband.my.salesforce.com/_ui/search/ui/UnifiedSearchResults?asPhrase=1&searchType=2&sen=a1T&sen=a0d&sen=00O&sen=005&sen=001&sen=500&sen=003&str="+id,"document",SFDCCRUTCH.UI.extractCaseAndLoadPage,function(url){SFDCCRUTCH.UI.displayCasePage(url);},id);
}

SFDCCRUTCH.UI.displayCasePage = function(case_adress) {
  SFDCCRUTCH.Util.openNewTab("https://genband.my.salesforce.com"+case_adress);
}

SFDCCRUTCH.UI.buildContextMenu=function(win)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildContextMenu: entering");
  var contextMenu = win.document.getElementById("contentAreaContextMenu");
  var menu = win.document.getElementById("sfdccrutch-add-case-comment-menu");
  
  var menu_load_case = win.document.getElementById("sfdccrutch-load-caseorjira-menu");
	menu_load_case.addEventListener('command',function(){SFDCCRUTCH.UI.loadCaseOrJiraHandler(menu_load_case);},true);

  var menupopup = win.document.createElement("menupopup");
  menu.appendChild(menupopup);
   
  var menuitem1 =win.document.createElement("menuitem");
  menuitem1.setAttribute("label","Regular");
  menuitem1.style.color="blue";
  menuitem1.addEventListener('command',function(){SFDCCRUTCH.addComment(SFDCCRUTCH.InRegularEdition);},true);
  menupopup.appendChild(menuitem1);
   
  var menuitem1_1 =win.document.createElement("menuitem");
  menuitem1_1.style.color="blue";
  menuitem1_1.setAttribute("label","Initial assignment");
  menuitem1_1.addEventListener('command',function(){SFDCCRUTCH.addComment(SFDCCRUTCH.InAssignmentEdition);},true);
  menupopup.appendChild(menuitem1_1);

  var menuseparator =win.document.createElement("menuseparator");
  menuseparator.style.color="blue";
  menupopup.appendChild(menuseparator);

  var menuitem2 =win.document.createElement("menuitem");
  menuitem2.style.color="blue";
  menuitem2.setAttribute("label","Screening - default");
  menuitem2.addEventListener('command',function(){SFDCCRUTCH.addComment(SFDCCRUTCH.InDefaultScreeningEdition);},true);
  menupopup.appendChild(menuitem2);
  
  var menuitem3 =win.document.createElement("menuitem");
  menuitem3.style.color="blue";  
  menuitem3.setAttribute("label","Screening - request info");
  menuitem3.addEventListener('command',function(){SFDCCRUTCH.addComment(SFDCCRUTCH.InRequestInfoScreeningEdition);},true);
  menupopup.appendChild(menuitem3);
  
  if (contextMenu)
    contextMenu.addEventListener("popupshowing", function(event){SFDCCRUTCH.populateContextProgram(event,menu);}, false);  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.buildContextMenu: exiting");
}


SFDCCRUTCH.UI.displayError  = function (title,detail) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.displayError - entering :"+title+" ["+detail+"]");

  if (SFDCCRUTCH.UI.ErrorPopup == 0)
  {
    SFDCCRUTCH.UI.ErrorPopup = SFDCCRUTCH.Util.getBrowserWindow().openDialog("chrome://sfdccrutch/content/error/error.xul", "", "chrome,titlebar,toolbar,centerscreen",title,detail);
  }
  else
  {
    SFDCCRUTCH.UI.fillError(SFDCCRUTCH.UI.ErrorPopup,title,detail,true);
    SFDCCRUTCH.UI.ErrorPopup.focus();
  }  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.displayError - exiting");

}
SFDCCRUTCH.UI.empty = function(container){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UI.empty: entering container="+container);    
  if (!container) return;
	while(container.hasChildNodes()){
		container.removeChild(container.firstChild);
	}
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UI.empty exiting");    
}
SFDCCRUTCH.UI.fillError= function(win,errtitle,errdetail,append) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.fillError - entering ["+errtitle+"]");
	
	var vboxerrordetail=null;
	if (win.document)
	{
    vboxerrordetail = win.document.getElementById("error-details");
	}
	else
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.fillError - pb with fields to set");
	if (vboxerrordetail!= null)
	{
    // change 0.93
    if (!append)
      SFDCCRUTCH.UI.empty(vboxerrordetail);

    var label = win.document.createElement("label");
    label.setAttribute("value", errtitle);
    vboxerrordetail.appendChild(label);

    var details = errdetail.split("\n");
    for (var i=0;i<details.length;i++)
    {
      label = win.document.createElement("label");
      label.setAttribute("value", details[i]);
      vboxerrordetail.appendChild(label);
    }
    var xpcomInterface = vboxerrordetail.boxObject.QueryInterface(
       Components.interfaces.nsIScrollBoxObject);
    xpcomInterface.ensureElementIsVisible(label);
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.fillError - vboxerrordetail is NULL !!");
	//win.sizeToContent();

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.fillError - exiting");

}

SFDCCRUTCH.UI.openDialogOnlyOnce = function (window,xul,title,features){
  var dialog=null;
  if (typeof(window.hashdialogs) != "undefined")
  {
    dialog =  window.hashdialogs[xul];
  }
  else
    window.hashdialogs = new Object();
  if (dialog == null || dialog.closed)
  {
    window.hashdialogs[xul] = window.openDialog(xul,title,features);
  }
  else dialog.focus();
}
SFDCCRUTCH.UI.simulateClickEvent=function(doc,target) {
  var evt = doc.createEvent("MouseEvents");  
  evt.initEvent("click", true, false);  
  target.dispatchEvent(evt);
}

SFDCCRUTCH.UI.simulateKeyEvent=function(doc,target,value) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.simulateKeyEvent - entering doc="+doc+" "+value);
  target.focus();
  var evt = doc.createEvent("KeyboardEvent");
  for (var i=0;i<value.length;i++)
  {
    evt.initKeyEvent("keypress", true, true, SFDCCRUTCH.Util.getBrowserWindow(),
                    0, 0, 0, 0,
                    0, value.charCodeAt(i)) 
    var canceled = !target.dispatchEvent(evt);
    if(canceled) {
    // A handler called preventDefault
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UI.simulateKeyEvent - canceled "+i+" char="+value.charAt(i));

    }
    else // None of the handlers called preventDefault
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.UI.simulateKeyEvent - not canceled "+i);
  }
  
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.simulateKeyEvent - exiting");
}


const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

SFDCCRUTCH.UI.myListener =
  {
	  QueryInterface: function(aIID)
	  {
      if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
          aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
          aIID.equals(Components.interfaces.nsISupports))
	     return this;
	    throw Components.results.NS_NOINTERFACE;
	  },
	 
	  onStateChange: function(aBrowser, aWebProgress,  aRequest,  aStateFlags,  aStatus)
	  {
      if(aStateFlags & STATE_START)
      {
          caseId = SFDCCRUTCH.UI.matchCaseId(aRequest.name,"https://genband.my.salesforce.com/("+SFDCCRUTCH.patternCaseId+")");
          if (caseId != null)
          {
               SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"myListener loading starting to "+aRequest.name); 
               SFDCCRUTCH.UI.disableEnableMenu(aBrowser,true);
               SFDCCRUTCH.Util.setBlockMixedContentEnabled(false);
          }      
      }
      else if(aStateFlags & STATE_STOP)
      {
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"myListener loading ended for "+aRequest.name); 

        // This fires when the load finishes
        var pageCanBeCase = false;
        var pageCanBeEmail = false;
        var pageCanBeLogin = false;

        var caseId = SFDCCRUTCH.UI.matchCaseId(aRequest.name,"https://genband.my.salesforce.com/00a/e\?.*id\=("+SFDCCRUTCH.patternCaseId+")");
        if (caseId == null)
        {
          caseId = SFDCCRUTCH.UI.matchCaseId(aRequest.name,"https://genband.my.salesforce.com/("+SFDCCRUTCH.patternCaseId+")");
          if (caseId != null)
          {
            pageCanBeCase = true;
            SFDCCRUTCH.Util.setBlockMixedContentEnabled(true);
            SFDCCRUTCH.UI.disableEnableMenu(aBrowser,false);
            SFDCCRUTCH.UICasePage.instrument(aBrowser.contentDocument,caseId);
           
          } else {
             caseId = SFDCCRUTCH.UI.matchCaseId(aRequest.name,"https://genband.my.salesforce.com/_ui/core/email/author/EmailAuthor.*p3_lkid=("+SFDCCRUTCH.patternCaseId+")");
             if (caseId != null) pageCanBeEmail = true;
             else
             {
               if (SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.AUTOLOGIN, "bool",true)
                  && SFDCCRUTCH.UILogin.isLoginPageWithNoError(aBrowser.contentDocument,aRequest.name))
               {
                  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"myListener loading ended for "+aRequest.name+" this is a LOGIN"); 
                  pageCanBeLogin = true;
                  if (SFDCCRUTCH.UILogin.instrument(aBrowser.contentDocument,"https://login.salesforce.com/"))
                    SFDCCRUTCH.UILogin.save(aBrowser.contentDocument);
               }
             }
          }
        }
        if (caseId != null)
        {
          if(SFDCCRUTCH.CasePageInformationSet[caseId])
          {
            SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"myListener loading ended for "+aRequest.name+" status="+  SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonStatus").toString()+" substatus="+SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus").toString()); 
 
            switch(SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonStatus"))
            {
             case 0: SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"myListener idle - status=0");
             break;
             case SFDCCRUTCH.StartingCaseCommentEdition:
                SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"myListener starting comment edition");
                SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.InCommentEdition);
                SFDCCRUTCH.UICommentPage.instrument(aBrowser.contentDocument,caseId);
             break;
             case SFDCCRUTCH.CommentHasBeenSaved:
                var substatus = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("automatonSubStatus");
                var changed=false;
                if ( substatus== SFDCCRUTCH.InRegularEdition || substatus == SFDCCRUTCH.EmailToBeSent || substatus == SFDCCRUTCH.InAssignmentEdition)
                   changed = SFDCCRUTCH.UICasePage.AddInfoModifiedFromComment(aBrowser.contentDocument,caseId);
                if  (substatus == SFDCCRUTCH.EmailToBeSent && !changed)
                { 
                   var emailInEdition = SFDCCRUTCH.UICasePage.launchEmailEdition(aBrowser.contentDocument,caseId);
                   if (emailInEdition) SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.InEmailEdition);
                }
             break;
             case SFDCCRUTCH.LaunchEmailEdition:
                var emailInEdition = SFDCCRUTCH.UICasePage.launchEmailEdition(aBrowser.contentDocument,caseId);
                if (emailInEdition) SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",SFDCCRUTCH.InEmailEdition);
                
             break;
             case SFDCCRUTCH.InEmailEdition:
                SFDCCRUTCH.UIEmail.PopulateEmailPage(aBrowser.contentDocument,caseId);
                SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("automatonStatus",0);
          
           }
          }
          else if (pageCanBeCase)
          {
            SFDCCRUTCH.UICasePage.instrument(aBrowser.contentDocument,caseId);
          }
        }   
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"myListener referrer "+aBrowser.contentDocument.referrer);
      }       
    },
    onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { },
    onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) { },
    onLocationChange: function(aWebProgress, aRequest, aStatus, aMessage) { },
    onSecurityChange: function(aWebProgress, aRequest, aStatus, aMessage) { },
  };

SFDCCRUTCH.UI.matchCaseId=function(url,pattern) {
  var caseId=null; 
  var regexp = new RegExp(pattern);
  var matches = regexp.exec(url);
  if (matches != null)
  {
    caseId = matches[1];
  }
  return caseId;
}




SFDCCRUTCH.UI.moveCaretToEnd=function(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}


SFDCCRUTCH.UI.displayWatch  = function (caseWatch,append,title) {
  if (caseWatch!=null)
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.displayWatch - entering :"+caseWatch.getProperty("caseId")+"] title="+title);
  else  
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.displayWatch - entering : all watches]");

  if (SFDCCRUTCH.UI.WatchPopup == 0)
  {
    SFDCCRUTCH.UI.WatchPopup = SFDCCRUTCH.Util.getBrowserWindow().openDialog("chrome://sfdccrutch/content/watches/watches.xul", "", "chrome,titlebar,toolbar,centerscreen",caseWatch,title);
  }
  else
  {
    SFDCCRUTCH.UI.fillWatch(SFDCCRUTCH.UI.WatchPopup,caseWatch,append,title);
    SFDCCRUTCH.UI.WatchPopup.focus();
  }  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.displayWatch - exiting");

}
SFDCCRUTCH.UI.fillWatch= function(win,caseWatch,append,title) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.fillWatch - entering [] append="+append+" title="+title);
	var doc = win.document;
	var vboxwatchdetail=null;
	if (doc)
	{
    if (title != null) doc.title=title;
    vboxwatchdetail = doc.getElementById("watch-details");
	}
	else
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.fillWatch - pb with fields to set");
	if (vboxwatchdetail!= null)
	{
    // change 0.93
    if (!append)
      SFDCCRUTCH.UI.empty(vboxwatchdetail);
    if (caseWatch != null)
    {
      var vbox = SFDCCRUTCH.UI.createWatchBox(doc,caseWatch,"red");
      vboxwatchdetail.appendChild(vbox);
    }
    else
    {
      for(var i=0;i<SFDCCRUTCH.watchesManager.caseWatchSet.length;i++)
      {
        var vbox = SFDCCRUTCH.UI.createWatchBox(doc,SFDCCRUTCH.watchesManager.caseWatchSet[i],"black");
        vboxwatchdetail.appendChild(vbox);
      }
    }
    var xpcomInterface = vboxwatchdetail.boxObject.QueryInterface(
       Components.interfaces.nsIScrollBoxObject);
    xpcomInterface.ensureElementIsVisible(vbox);
  }
  else SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.UI.fillWatch - vboxwatchdetail is NULL !!");
	
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.fillWatch - exiting");

}

SFDCCRUTCH.UI.createWatchBox=function(doc,caseWatch,color) {
    var vbox= doc.createElement("vbox");

    var hbox1= doc.createElement("hbox");
    vbox.appendChild(hbox1);

    var cell = doc.createElement('label');
    cell.setAttribute("value",caseWatch.getProperty("caseNumber"));
    cell.className = "alarm";
    cell.addEventListener("click", SFDCCRUTCH.UI.openNewUrlEventHandler(caseWatch.getProperty("url")), false);
    hbox1.appendChild(cell);
        
    cell = doc.createElement('label');
    cell.setAttribute("value","\""+caseWatch.getProperty("subject")+"\",");
    cell.setAttribute("tooltiptext",caseWatch.getProperty("subject"));
    cell.setAttribute("crop","end");
    cell.setAttribute("flex", "1");
    cell.style.color = color;

    hbox1.appendChild(cell);

    var hbox2= doc.createElement("hbox");
    vbox.appendChild(hbox2);

    cell = doc.createElement('label');
    if (caseWatch.getProperty("commentMaker") !="")
    {
      cell.setAttribute("value","     by "+caseWatch.getProperty("commentMaker"));
      hbox2.appendChild(cell);
      cell = doc.createElement('label');
      cell.setAttribute("value",caseWatch.getProperty("dateAndTimeText"));
      hbox2.appendChild(cell);
    }
    else
    {
      cell.setAttribute("value","     No comment yet");
      hbox2.appendChild(cell);
    }
    var suscribe_button = SFDCCRUTCH.UI.createSubscribeButton(doc,caseWatch.getProperty("caseId"),"button");
    hbox2.appendChild(suscribe_button);
    
    return vbox;
}

SFDCCRUTCH.UI.openNewUrlEventHandler=function(url) {
  return function (event) {
    SFDCCRUTCH.Util.openNewTab(url);
  }
}


SFDCCRUTCH.UI.createSubscribeButton=function(doc,caseId,type_button) {
  var button_get_notified = doc.createElement(type_button);
  button_get_notified.style.color = "Blue";

  var subscribed;
  var attribute_name="";
  if (type_button == "button") attribute_name="label";
  else attribute_name="value";
  
  if ((subscribed = SFDCCRUTCH.watchesManager.findWatchForCase(caseId)) != -1)
        button_get_notified.setAttribute(attribute_name,"Unsubscribe");
  else  button_get_notified.setAttribute(attribute_name,"Subscribe");
  button_get_notified.setAttribute("class","btn");
  button_get_notified.onclick=function(){
      var subscribed_cb;
      var attribute_name="";
      if (this.tagName == "button") attribute_name="label";
      else attribute_name="value";
      if ((subscribed_cb = SFDCCRUTCH.watchesManager.findWatchForCase(caseId)) == -1)
      {
        var dateAndTimeText=SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("dateAndTimeText");
        var commentMaker=SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("commentMaker");
        SFDCCRUTCH.watchesManager._addCaseWatch(caseId,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("caseNumber"),
                                              "https://genband.my.salesforce.com/"+caseId,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("subject"),
                                              dateAndTimeText,
                                              SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("severity"),
                                              commentMaker);
        this.setAttribute(attribute_name,"Unsuscribe");

      }
      else
      {
         SFDCCRUTCH.watchesManager._removeCaseWatch(caseId);
         SFDCCRUTCH.watchesManager.save();
         this.setAttribute(attribute_name,"suscribe");
      }                                                    
  };
  return button_get_notified;
}

SFDCCRUTCH.UI.replaceOwnerOrganizationAndPublicCheckbox=function(doc,caseId,textarea,public_update_button,value,by_callback) {
  if (value == "Customer" || (!by_callback && SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("status")=="Pending Closure"))
  {
          textarea.value = textarea.value.replace(/\[Owner:.*\]/,"[Owner: "+SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("account")+"]");
          // make public change
          // modification 1.2.14
          //public_update_button.checked = true;
          SFDCCRUTCH.UI.simulateClickEvent(doc,public_update_button);

  }
  else
  {
          // make internal change
          public_update_button.checked = false;

          textarea.value = textarea.value.replace(/\[Owner:.*\]/,"[Owner: "+value+"]");        
  }
}

SFDCCRUTCH.UI.createSelectOwnerButton=function(doc,caseId,textarea,public_update_button) {
   var retVals = { top: "", select: ""};

   retVals.top = doc.createElement("td");
  
   var td1 = doc.createElement("td");
   var bold = doc.createElement("b");

   bold.textContent = "Owner Organisation:";
   bold.style.color = "Blue";

   retVals.top.appendChild(td1);
   td1.appendChild(bold);

   var td2 = doc.createElement("td");
   retVals.top.appendChild(td2);
   
   var select = doc.createElement("select");
   select.style.color = "Blue";

   select.setAttribute("name","Owner Organisation");
   select.addEventListener("change", function(){
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.createSelectOwnerButton - selecting entering");

        SFDCCRUTCH.CasePageInformationSet[caseId].setProperty("ownerOrganizationNew",this.value);
        SFDCCRUTCH.UI.replaceOwnerOrganizationAndPublicCheckbox(doc,caseId,textarea,public_update_button,this.value,true);
        
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.createSelectOwnerButton - selecting exiting");

    },false);

   td2.appendChild(select);
   
   var options_array=new Array("GTS","GPS","ER","SWDEL","GTAC","Trials","Customer","3rd Party","Engineering","PLM","Other","Business Ops");
   
   var status=SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("status");
   var ownerOrganization = SFDCCRUTCH.CasePageInformationSet[caseId].getProperty("ownerOrganization");
   for (var i=0;i<options_array.length;i++)
   {
     var option = doc.createElement("option");
     option.setAttribute("value",options_array[i]);
     option.textContent = options_array[i];
     if (ownerOrganization==options_array[i])
          option.setAttribute("selected",true);

     option.style.color = "Blue";

     select.appendChild(option);
      
     if ((status == "Future Availability" || status == "Pending Closure" || status == "Closed Resolved" || status == "Closed Unresolved")
          && (options_array[i]=="Customer"))
     {
        option.setAttribute("disabled",true);
        option.style.color = "Grey";

     }
   }
   return retVals;
}

SFDCCRUTCH.UI.createHelpButton=function(doc,id,text) {
   // TBC
   return null;
   var tr = doc.createElement("tr");
   var td = doc.createElement("td");
   td.setAttribute("class","labelCol");
   tr.appendChild(td);

   var span = doc.createElement("span");
   span.setAttribute("id","Case.jml-_help");
   span.setAttribute("class","helpButton");
   span.textContent="help";
   td.appendChild(span);
   
   var image = doc.createElement("img");
   image.setAttribute("class","helpOrb");
   image.setAttribute("title","");
   image.setAttribute("alt","");
   //image.setAttribute("src","./s.gif");
   image.style.minWidth = "20px";
   image.style.minHeight= "15px";
   
   span.appendChild(image);
   
   var head= doc.getElementsByTagName('head')[0];
   var script= doc.createElement('script');
   script.type= 'text/javascript';
   script.textContent= "sfdcPage.setHelp('Case.jml', 'dummy help text');";

   head.appendChild(script);
   return tr;
}

SFDCCRUTCH.UI.extractCaseAndLoadPage = function(dom,caseId,callback) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - entering caseId="+caseId+ " dom="+dom);
  var divCasebody = SFDCCRUTCH.Dom.FindNode(dom,"id","Case_body");
  if (divCasebody != null) // this is truly the page with search content
  {
    var table = divCasebody.getElementsByTagName('table')[0];
    trs = table.getElementsByTagName("tr");
    for (var i=0;i<trs.length;i++)
    {
      var th = trs[i].getElementsByTagName('th');
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - class tr ="+trs[i].className);

      if (th.length!=0)
      {
        var a = th[0].getElementsByTagName('a');
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - class th ="+th[0].className);
        
        if (a.length!=0)
        {
          var l_case = a[0].textContent;
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - l_case="+l_case);
          if (l_case == caseId)
          {
            var case_adress = a[0].getAttribute("href");
            callback(case_adress);
            //SFDCCRUTCH.Util.openNewTab("https://genband.my.salesforce.com"+case_adress);
            break;
          }
        }
      }
    }
  }
  else // SFDC user may not be logged in
  {
    SFDCCRUTCH.Util.openNewTab("https://genband.my.salesforce.com");   
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - divCasebody is null ");
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.extractCaseAndLoadPage - exiting "+caseId );
}

SFDCCRUTCH.UI.addLinkToElement=function(doc,element,link_url) {
        var link = doc.createElement('link');
        link.type="text/css";
        link.rel = "stylesheet";
        link.href = link_url;

        element.appendChild(link);
}

SFDCCRUTCH.UI.addLink=function(doc,link_url) {
        var head = doc.getElementsByTagName('head')[0];
        var link = doc.createElement('link');
        link.type="text/css";
        link.rel = "stylesheet";
        link.href = link_url;

        head.appendChild(link);
}
SFDCCRUTCH.UI.addScriptToPage=function(doc,script_content,type) {
  var head = doc.getElementsByTagName('head')[0];
  var script = doc.createElement('script');
  script.type = 'text/javascript';
  if (type!="src")
    script.textContent = script_content;
  else {
          script.type = 'text/javascript';
          script.src = script_content;
  }
  head.appendChild(script);
}

SFDCCRUTCH.UI.disableEnableMenu=function(browser,value) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.disableEnableMenu - entering "+value );
  var win = SFDCCRUTCH.UI.getTopWindow(browser);
  var menu = win.document.getElementById("sfdccrutch-add-case-comment-menu");
  if (menu != null) menu.setAttribute("disabled",value);

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.disableEnableMenu - exiting "+menu );
}

SFDCCRUTCH.UI.getTopWindow=function(browser) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.getTopWindow - entering "+browser );
  var win = browser.contentWindow ;
  var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.UI.getTopWindow - exiting "+mainWindow );
  return mainWindow;
}
SFDCCRUTCH.UI.doForAllWindows=function(type,cb) {

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]  
                       .getService(Components.interfaces.nsIWindowMediator);  
    var enumerator = wm.getEnumerator(type);  
    while(enumerator.hasMoreElements()) {  
      var win = enumerator.getNext();  
      cb(win);
      // win is [Object ChromeWindow] (just like window), do something with it  
    }  
}