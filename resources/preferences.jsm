
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");

var EXPORTED_SYMBOLS = ["sfdccrutch.Pref"];

/////////
// Pref
/////////
SFDCCRUTCH.Pref = {
  DEBUG_CONSOLE:"extensions.sfdccrutch.debugconsole",
  VERSION: "extensions.sfdccrutch.version",
	LOG: "extensions.sfdccrutch.log",
	LOG_LEVEL:"extensions.sfdccrutch.loglevel",
	INSTALL_DIR:"extensions.sfdccrutch.installdir",
  CLEAR_LOG_AT_START:"extensions.sfdccrutch.clearlogfileatstarttime",
  USE_ONLY_ONE_TAB:"extensions.sfdccrutch.useOneTab",
  TEMPLATE_ACTION:"extensions.sfdccrutch.template.action",
  TEMPLATE_ASSIGNMENT:"extensions.sfdccrutch.template.assignment",
  TEMPLATE_EMAIL_SUBJECT:"extensions.sfdccrutch.template.emailsubject",
  SIGNATURE:"extensions.sfdccrutch.template.signature",
  NEXTUPDATE_DAYS_INC_MAJOR:"extensions.sfdccrutch.dayinc.major",
  NEXTUPDATE_DAYS_INC_MINOR:"extensions.sfdccrutch.dayinc.minor",
  NEXTUPDATE_DAYS_INC_BC:"extensions.sfdccrutch.dayinc.BC",
  NEXTUPDATE_DAYS_INC_WEEKDAYS:"extensions.sfdccrutch.dayinc.weekdays",
  ALARM_DAYS_BEFORE_MAJOR:"extensions.sfdccrutch.alarm.daysbefore.major",
  ALARM_DAYS_BEFORE_BC:"extensions.sfdccrutch.alarm.daysbefore.BC",
  ALARM_DAYS_BEFORE_MINOR:"extensions.sfdccrutch.alarm.daysbefore.minor",
  TEMPLATE_SCREENING_DEFAULT:"extensions.sfdccrutch.template.screening.default",
  TEMPLATE_SCREENING_REQUESTINFO:"extensions.sfdccrutch.template.screening.requestInfo",
  MAX_ATTACHMENTS:"extensions.sfdccrutch.maxAttachments",
  SOUND: "extensions.sfdccrutch.sound",
  ACTIVATED: "extensions.sfdccrutch.activated",
  USER: "extensions.sfdccrutch.user",
  POLLING_CASE_NEW_COMMENT_TIMER: "extensions.sfdccrutch.pollingCaseNewCommentTimerMn",
  AUTOLOGIN: "extensions.sfdccrutch.autoLogin",
  LIGHT_CASEDISPLAY: "extensions.sfdccrutch.lightDisplay",
  DIRECT_SUBSCRIBE_WHEN_GTS_CI_INTERFACE_SET: "extensions.sfdccrutch.autoSubscribeWhenGTSinterfaceCIisChecked",
  DOMAINSTOINTERCEPT: "extensions.sfdccrutch.domainsToIntercept",
  
	xp: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch)
	
}

SFDCCRUTCH.Pref.Listener = function(branchName, func){
	var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
	var branch = prefService.getBranch(branchName);
	branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
	
	this.register = function(){
		branch.addObserver("", this, false);
		branch.getChildList("", { })
			.forEach(function (name) { func(branch, name); });
	};
	
	this.unregister = function unregister(){
		if (branch)
			branch.removeObserver("", this);
	};
	
	this.observe = function(subject, topic, data){
		if (topic == "nsPref:changed")
			func(branch, data);
	};
}

SFDCCRUTCH.Pref.set = function(pref, type, value){
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Pref.set - entering pref="+pref+" type of value="+typeof(value)+" value="+value);
	try {
		switch(type) {
			case "str":
				return SFDCCRUTCH.Pref.xp.setCharPref(pref, value);
				break;
			case "int":
				value = parseInt(value, 10);
				return SFDCCRUTCH.Pref.xp.setIntPref(pref, value);
				break;
			case "bool":
			default:
				if(typeof(value) == "string") {
					value = (value == "true");
				}
				return SFDCCRUTCH.Pref.xp.setBoolPref(pref, value);
				break;
		}
	} catch(e) {
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Pref.set EXCEPTION"+pref+" - type="+type+" value="+value);
	
    }
	return null;
}
	
SFDCCRUTCH.Pref.get = function(pref, type, defaultValue){
	 //SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.get "+pref+" returning default="+defaultValue);

	if(SFDCCRUTCH.Pref.xp.getPrefType(pref) == SFDCCRUTCH.Pref.xp.PREF_INVALID) {
	  SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.get "+pref+" - INVALID returning default="+defaultValue);

		return defaultValue;
	}
	try {
		switch (type) {
			case "str":
				return SFDCCRUTCH.Pref.xp.getCharPref(pref).toString();
				break;
			case "int":
				return SFDCCRUTCH.Pref.xp.getIntPref(pref);
				break;
			case "bool":
			default:
				return SFDCCRUTCH.Pref.xp.getBoolPref(pref);
				break;
		}
	} catch(e)
    {
      SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.get EXCEPTION"+pref+" - type="+type+" no switch returning default="+defaultValue);
    } 
  SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.get "+pref+" - type="+type+" no switch returning default="+defaultValue);

	return defaultValue;
}

SFDCCRUTCH.Pref.resetToDefault = function(pref,id) {
  SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.resetToDefault entering"+pref);
  SFDCCRUTCH.Pref.xp.clearUserPref(pref);
  var  type="";
  switch(SFDCCRUTCH.Pref.xp.getPrefType(pref))
  {
    case 64: type = "int";
    break;
    case 128: type = "bool";
    break;
    case 32: type = "str";
    break;
  }
  id.value = SFDCCRUTCH.Pref.get(pref, type, "");

  SFDCCRUTCH.Util.logUnconditional("SFDCCRUTCH.Pref.resetToDefault exiting");
}