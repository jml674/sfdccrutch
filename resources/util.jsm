Components.utils.import("resource://gre/modules/devtools/Console.jsm");
Components.utils.import("resource://SFDCCRUTCH/common.jsm");
Components.utils.import("resource://SFDCCRUTCH/io.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.Util"];

SFDCCRUTCH.Util = {};
SFDCCRUTCH.Util.credentials="";

SFDCCRUTCH.Util.tab = function(n){
  var text="["+n+"]";
  for (i=0;i<n;i++)
    text+=' ';
  return text;
}

SFDCCRUTCH.Util.tabs=[SFDCCRUTCH.Util.tab(0),
                    SFDCCRUTCH.Util.tab(1), 
                    SFDCCRUTCH.Util.tab(2),
                    SFDCCRUTCH.Util.tab(3),
                    SFDCCRUTCH.Util.tab(4),
                    SFDCCRUTCH.Util.tab(5),
                    SFDCCRUTCH.Util.tab(6),
                    SFDCCRUTCH.Util.tab(7),
                    SFDCCRUTCH.Util.tab(8),
                    SFDCCRUTCH.Util.tab(9),
                    SFDCCRUTCH.Util.tab(10),
                    SFDCCRUTCH.Util.tab(11),
                    SFDCCRUTCH.Util.tab(12)
                    ];
                    
SFDCCRUTCH.Util.strings = Components.classes["@mozilla.org/intl/stringbundle;1"].getService(Components.interfaces.nsIStringBundleService).createBundle("chrome://SFDCCRUTCH/locale/strings.properties");

SFDCCRUTCH.Util.getString = function(name) {
  var str="Unexpected problem";
  try {
    str = SFDCCRUTCH.Util.strings.GetStringFromName(name);
  }
  catch(e)
  {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Util.getString ["+name+"] string not found!!");
  }
	return str;
}



SFDCCRUTCH.Util.getCallStackSize = function() {
    var count = 0, fn = arguments.callee;
    while ( (fn = fn.caller) && count <12 ) {
        count++;
    }
    return SFDCCRUTCH.Util.tabs[count];
}


SFDCCRUTCH.Util.log = function(level,text){
  var debugLevel=0;
  var log;
  var header = "";
  if (level == SFDCCRUTCH.Util.logC()) header ="CRITICAL";
  if (level !=-1)
  {
    debugLevel = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LOG_LEVEL, "int", 0);

    log = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LOG, "bool", false);
    if(!log || level>debugLevel) return;
    //text = SFDCCRUTCH.Util.getCallStackSize()+text;
    console.log(text); //output messages to the console

	}
	
  var fileOut = SFDCCRUTCH.FileIO.open(this._getFilePath());
	SFDCCRUTCH.FileIO.create(fileOut);
	SFDCCRUTCH.FileIO.write(fileOut, SFDCCRUTCH.Util.getDateAndTime()+" "+header+" "+text+'\n','a');
	
		//
	
}

SFDCCRUTCH.Util.logUnconditional = function(text){
  
  var fileOut = SFDCCRUTCH.FileIO.open(this._getFilePath());
	SFDCCRUTCH.FileIO.create(fileOut);
	SFDCCRUTCH.FileIO.write(fileOut, SFDCCRUTCH.Util.getDateAndTime()+" "+text+'\n','a');
	
}




SFDCCRUTCH.Util.clearLogFile = function(){
  var fileOut = SFDCCRUTCH.FileIO.open(SFDCCRUTCH.Util._getFilePath());
	SFDCCRUTCH.FileIO.create(fileOut);
	SFDCCRUTCH.FileIO.write(fileOut, ' ','w');
}


SFDCCRUTCH.Util.CheckAndClearLog = function(size) {
  var fileOut = SFDCCRUTCH.FileIO.open(SFDCCRUTCH.Util._getFilePath());
  if (fileOut.fileSize > size)
  {
    SFDCCRUTCH.Util.clearLogFile();
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"CheckAndClearLog - clearing logfile limit=["+size+"]+size="+fileOut.fileSize);
  }
}


SFDCCRUTCH.Util.getDateAndTime = function() {
  var dtime = new Date();
  var day = dtime.getDate();if (day<10) day="0"+day;
  var month = dtime.getMonth()+1; if (month<10) month="0"+month;
  var h=dtime.getHours(); if (h<10) h="0"+h;
  var m=dtime.getMinutes(); if (m<10) m="0"+m;
  var s=dtime.getSeconds();if (s<10) s="0"+s;
  
  return dtime.getFullYear()+"/"+month+"/"+day+"-"+h+":"+m+":"+s;
}


SFDCCRUTCH.Util.getBrowserWindow = function(){
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
	return wm.getMostRecentWindow("navigator:browser");
}

SFDCCRUTCH.Util.getBrowser = function(){
	var browserWindow = SFDCCRUTCH.Util.getBrowserWindow();
	if(browserWindow){
		return browserWindow.gBrowser;
	}
}
SFDCCRUTCH.Util.printBrowserNUmber = function(){

  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getEnumerator("navigator:browser");
  var length=0;
  while(enumerator.hasMoreElements()) {
    length++;
    var win = enumerator.getNext();
  // win is [Object ChromeWindow] (just like window), do something with it
  }
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.printBrowserNUmber exiting "+length);

}

SFDCCRUTCH.Util.openNewTab = function(url){
	
  var useOneTab = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.USE_ONLY_ONE_TAB, "bool", true);
  if (useOneTab && SFDCCRUTCH.UI.urlAdvisedTab)
    SFDCCRUTCH.Util.loadTab(SFDCCRUTCH.UI.urlAdvisedTab,url); 
	else
	{
    var browser = SFDCCRUTCH.Util.getBrowser();
    var window = SFDCCRUTCH.Util.getBrowserWindow();
	
    if(browser){
      var newTab = browser.addTab(url);
      var container = browser.tabContainer;  
      container.addEventListener("TabClose", SFDCCRUTCH.Util.tabClose, false); 
      var newTabBrowser = browser.getBrowserForTab(newTab);
      // modif JML to make new tab the active one
      browser.selectedTab = newTab;
      SFDCCRUTCH.UI.urlAdvisedTab = newTab;
      return newTab;
    }
  }
}


SFDCCRUTCH.Util.makeURI = function(myURLString){
// the IO service
  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);

// create an nsIURI
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.makeURI entering ["+myURLString+"]");

  var uri = ioService.newURI(myURLString, null, null);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.makeURI exiting");

  return uri;
}

SFDCCRUTCH.Util.loadTab = function(tab,url){
  var browser = SFDCCRUTCH.Util.getBrowser();
	var window = SFDCCRUTCH.Util.getBrowserWindow();
	
	if(browser){
	 var newTabBrowser = browser.getBrowserForTab(tab);
	 newTabBrowser.loadURI( url )
   browser.selectedTab = tab;
 	}
}

SFDCCRUTCH.Util.tabClose = function(event){
  if (event.target == SFDCCRUTCH.UI.urlAdvisedTab)
    SFDCCRUTCH.UI.urlAdvisedTab = 0;
}

SFDCCRUTCH.Util.closeTab = function(){
  var useOneTab = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.USE_ONLY_ONE_TAB, "bool", true);
  if (useOneTab && SFDCCRUTCH.UI.urlAdvisedTab)
  {
    var browser = SFDCCRUTCH.Util.getBrowser();
    browser.selectedTab = SFDCCRUTCH.UI.urlAdvisedTab;
    browser.removeCurrentTab();
  }
}




SFDCCRUTCH.Util.isFirstLaunch = function(){
	return SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.FIRSTLAUNCH, "bool", true);
}

SFDCCRUTCH.Util.isFirstLaunchToday = function(){
	var lastLaunchDate = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LASTLAUNCHDATE, "str", "");
	var todayDate = SFDCCRUTCH.Util.formatDate(new Date());
	return todayDate != lastLaunchDate;
}

SFDCCRUTCH.Util.checkNewVersion = function(callback){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkNewVersion: entering ");
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
    
  AddonManager.getAddonByID("addon@sfdccrutch.com", function(addon) {
    //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkNewVersion: version="+addon.version);
    var lastVersion = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.VERSION, "str", "");

    callback(lastVersion,addon.version);
  });
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkNewVersion: exiting");

}


SFDCCRUTCH.Util.sendInstallationMessage = function(install){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.sendInstallationMessage: entering "+install);
  var epgurl = "http://www.tvsurftv.fr";
  var credentials = SFDCCRUTCH.Util.getUsernameAndPassword();
  
	var query = epgurl+"/SFDCCRUTCH/install_moves.php?user="+encodeURIComponent(credentials.user)+"&install="+encodeURIComponent(install);

  var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();   
  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.sendInstallationMessage before try: ");
  
  try {  
    // need synchronous request to work, if not request is cancelled by application exit.
    req.open('GET', query, true); 
    req.onreadystatechange = function (aEvt) {
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.sendInstallationMessage: req state= "+req.readyState);

    };
    req.send(null);
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.sendInstallationMessage: sending "+query+" "+req.status);
  }
  catch (ex) {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Util.sendInstallationMessage: EXCEPTION"); 
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.sendInstallationMessage: exiting");

}


SFDCCRUTCH.Util.formatDate = function(date){
	return ""+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
}



SFDCCRUTCH.Util.playSoundFromPrefs = function(){
	// play a sound
	var sound = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.SOUND, "str", "default");
	if(sound == "default"){
		SFDCCRUTCH.Util.playSound();
	}else if(sound != "nosound"){
		SFDCCRUTCH.Util.playSound(sound);
	}
}

SFDCCRUTCH.Util.playSound = function(filepath){
	var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);
	sound.init();
	if (filepath) {
		sound.play(ios.newFileURI(SFDCCRUTCH.FileIO.open(filepath)));
	}else{
		sound.beep();
	}
}

// JML

SFDCCRUTCH.Util._getFilePath = function(){
	var profileDir = SFDCCRUTCH.DirIO.get('ProfD');
	var filepath = profileDir.path + SFDCCRUTCH.DirIO.sep;
	filepath += 'SFDCCRUTCH' + SFDCCRUTCH.DirIO.sep;
	filepath += 'SFDCCRUTCH.log';
	return filepath;
}

SFDCCRUTCH.Util.getLogFileContent= function(){
  var content="EMPTY LOG FILE";
  var fileIn = SFDCCRUTCH.FileIO.open(SFDCCRUTCH.Util._getFilePath());
	if (fileIn.exists()) {
		 content = SFDCCRUTCH.FileIO.read(fileIn, "UTF-8");
	}
  return content;
}


SFDCCRUTCH.Util.logC = function()
{
  return 0;
}

SFDCCRUTCH.Util.logI = function()
{
  return 1;
}

SFDCCRUTCH.Util.logD = function()
{
  return 2;
}
SFDCCRUTCH.Util.logA = function()
{
  return 3;
}

SFDCCRUTCH.Util.logR = function()
{
  return 4;
}



SFDCCRUTCH.Util.settimeout = function()
{
  var timer = Components.classes["@mozilla.org/timer;1"]
            .createInstance(Components.interfaces.nsITimer);
            return timer;
}



SFDCCRUTCH.Util.ascii=function(name)
{
  var str="";
  for (var i=0;i<name.length;i++)
    str += name.charCodeAt(i)+",";

  return name+" "+str;
   
}


SFDCCRUTCH.Util.Utf8Decode = function(s){
    if (s)
    {
      for(var a, b, i = -1, l = (s = s.split("")).length, o = String.fromCharCode, c = "charCodeAt"; ++i < l;
        ((a = s[i][c](0)) & 0x80) &&
        (s[i] = (a & 0xfc) == 0xc0 && ((b = s[i + 1][c](0)) & 0xc0) == 0x80 ?
        o(((a & 0x03) << 6) + (b & 0x3f)) : o(128), s[++i] = "")
      );
      return s.join("");
    }
    else return "";
	}

SFDCCRUTCH.Util.Utf8Encode=function(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
};
 
SFDCCRUTCH.Util.preg_match_all = function (rglob, risolate, haystack) {
  //SFDCCRUTCH.UI.sidebarWindow.alert(rglob);

  var globalRegex = new RegExp(rglob, 'g');
  var globalMatch = haystack.match(globalRegex);
  //SFDCCRUTCH.UI.sidebarWindow.alert(globalMatch);

  matchArray = new Array();

  var globalIsolate = new RegExp(risolate);

  for (var i in globalMatch) {
    nonGlobalMatch = globalIsolate.exec(globalMatch[i]);
    //SFDCCRUTCH.UI.sidebarWindow.alert(nonGlobalMatch);
    matchArray.push(nonGlobalMatch);
  }
  return matchArray;
}

SFDCCRUTCH.Util.split = function (data,splitter) {
  var array = new Array();
  var start = 0;
  var count_quote = 0;
  for (var i=0; i < data.length ; i++)
  {
    if (data[i] == "\"")
    {
      if (count_quote == 0)
        count_quote =1;
      else count_quote = 0;
      //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.split encounter quote ["+i+"] "+count_quote);  

    }
    else if (data[i] ==splitter && count_quote==0)
    {
      array.push(data.substring(start,i));
      //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.split pushing +["+i+"] "+data.substring(start,i));  

      start = i+1;
    }
  }
  array.push(data.substring(start));
 
  return array;
}
SFDCCRUTCH.Util.setJavascriptEnabled = function (value) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.setJavascriptEnabled entering "+value);  

  Components.utils.import("resource://gre/modules/Services.jsm");
  Services.prefs.setBoolPref("javascript.enabled", value);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.setJavascriptEnabled exiting");  
}
SFDCCRUTCH.Util.setBlockMixedContentEnabled = function (value) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.setBlockMixedContentEnabled entering "+value);  

  Components.utils.import("resource://gre/modules/Services.jsm");
  Services.prefs.setBoolPref("security.mixed_content.block_active_content", value);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.setBlockMixedContentEnabled exiting");  
}

SFDCCRUTCH.Util.extractDomain = function(path)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain entering ["+path+"]");  
  var str = "http[s]?://([\\w]+)(\\.[\\w]+)*";
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain regexp= ["+str+"]");  

  var regexp = new RegExp(str);
  var matches = regexp.exec(path);
  var result="";
  if (matches != null)
  {
    result = matches[0];
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting "+matches[0]);  
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting 1="+matches[1]);
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting 2="+matches[2]);
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting 3="+matches[3]);
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting 4="+matches[4]);
   }
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.extractDomain exiting "+result);  

   return result;
   
}

SFDCCRUTCH.Util.shortSeverity = function(severity)
{
  switch (severity)
  {
    case "Major": return "MJ";
    case "Minor": return "MN";
    case "Business Critical": return "BC";
    default: return severity;
  }
}


SFDCCRUTCH.Util.getNoticeBeforeAlarm = function(severity)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Util.getNoticeBeforeAlarm entering ["+severity+"]");  
  var inc=0;
  if (severity=="Major") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ALARM_DAYS_BEFORE_MAJOR, "int", 1);
  else if (severity=="Business Critical") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ALARM_DAYS_BEFORE_BC, "int", 1);
  else if (severity=="Minor") inc= SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.ALARM_DAYS_BEFORE_MINOR, "int", 1);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Util.getNoticeBeforeAlarm exiting ["+inc+"]");  

  return inc;
}



SFDCCRUTCH.Util.MailToFunc = function (callback) {
  
  epgurl = "http://www.tvsurftv.fr";
  
  var loglevel = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.LOG_LEVEL, "int", 0);

  var url=epgurl+"/support/putlogfile.php?user="+SFDCCRUTCH.user+"&level="+loglevel;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Util.MailToFunc: url="+url);

  var file = SFDCCRUTCH.FileIO.open(this._getFilePath());
  
  var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                       .createInstance(Components.interfaces.nsIFileInputStream);
  stream.init(file, 0x04 | 0x08, 0644, 0x04); // file is an nsIFile instance  
	 
	// Try to determine the MIME type of the file
	var mimeType = "text/plain";
	try {
	  var mimeService = Components.classes["@mozilla.org/mime;1"]
	          .getService(Components.interfaces.nsIMIMEService);
	  mimeType = mimeService.getTypeFromFile(file); // file is an nsIFile instance
	}
	catch(e) { /* eat it; just use text/plain */ }
	 
	// Send   
	
	var onterminateloading = function (aEvt) {
    callback();
  };
	
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
	                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
	req.addEventListener("load", onterminateloading, false);
	req.addEventListener("error", onterminateloading, false);
	// Compliance 0.96, call made asynchronous
  req.open('PUT', url, true); 
  req.setRequestHeader('Content-Type', mimeType);
  req.send(stream);

}

SFDCCRUTCH.Util.FormatZerosDate = function (date_text) {
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.FormatZerosDate entering ["+date_text+"]");  
   var value="";
   try
   {
    var regexp = new RegExp("([0-9]*)\/([0-9]*)\/([0-9]*)");
    var matches = regexp.exec(date_text);
    var m=matches[1];
    if (m.length==1) m = "0"+m;
    var d=matches[2];
    if (d.length==1) d = "0"+d;
    var y=matches[3];
    if (y.length==1) y = "20"+y;
   
    value= m+"/"+d+"/"+y;
   }
   catch(e) {
   }
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.FormatZerosDate exiting "+value);  
   return value;
}
SFDCCRUTCH.Util.RemoveLeadingZerosFromDate = function (date_text) {
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.RemoveLeadingZerosFromDate entering "+date_text);  

   var regexp = new RegExp("([0-9]*)\/([0-9]*)\/([0-9]*)");
   var matches = regexp.exec(date_text);
   var m=matches[1];
   if (m[0]=="0") m = m[1];
   var d=matches[2];
   if (d[0]=="0") d = d[1];
   var y=matches[3];
   
   var value= m+"/"+d+"/"+y;
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.RemoveLeadingZerosFromDate exiting "+value);  
   return value;
}
SFDCCRUTCH.Util.checkCaseId = function (caseId) {
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkCaseId entering casId=["+caseId+"]");  

  var that_caseid = caseId;
  var regexp = new RegExp("[0-9]{6}\-[0-9]{6}");
  var matches = regexp.exec(caseId);
  if (matches == null)
  { 
    SFDCCRUTCH.Util.getBrowserWindow().setTimeout(
      function(){
      SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"Please send your logs, Unexpected value for CaseId :["+that_caseid+"] "+that_caseid.length);  
          //SFDCCRUTCH.Util.getBrowserWindow().alert("Please send your logs, Unexpected value for CaseId :["+caseId+"] "+caseId.length);

      },5000);
  }
     SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkCaseId exiting ");  

}

SFDCCRUTCH.Util.checkDateMMDDYYYY = function (date_text) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkDate entering "+date_text);  
  var result = true;
  var days= new Array(31,30,31,30,31,30,31,31,30,31,30,31);
  var regexp = new RegExp("(^[0-9][0-9]?)\/([0-9][0-9]?)\/([0-9]{4})");
  var matches = regexp.exec(date_text);
  if (matches == null) result = false;
  else
  {
    var m=parseInt(matches[1]);
    if (m<1 || m>12) result = false;
    else
    {
      var d=parseInt(matches[2]);
      if (d<1 || d>days[m-1]) result = false;
      else
      {
        var y=parseInt(matches[3]);
        if (y<2014 || y>2015) result = false;
      }
    }
  }
   
   SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.checkDate exiting "+result+(matches==null?" ":" "+matches[1]+" "+matches[2]+" "+matches[3]));  
   return result;
}

SFDCCRUTCH.Util.loadPage = function(url,responseType,cb_if_ok,cb_all,data){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.loadPage entering url="+url+" type="+responseType);
	
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	
  var that_url = url;
  var that_data = data;
  var that_responsetype = responseType;
  
	req.onreadystatechange=function()	{ 
		if(req.readyState == 4)
		{
			if(req.status == 200)
			{
        if (that_responsetype=="document" && cb_if_ok)
          cb_if_ok(req.responseXML.documentElement,that_data,cb_all);
        else if(that_responsetype=="json" && cb_if_ok)
          cb_if_ok(JSON.parse(req.responseText,that_data));
        else if (cb_if_ok)
          cb_if_ok(req.responseText,that_data,cb_all);
			}
			else
			{
			 SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Util.loadPage.loadHTML status ="+req.status+" !=200!");
			 SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Util.loadPage.sendRequest faulty url "+that_url);
			 if (cb_all !=null) cb_all(null);
			}
		} 
	}; 
	req.open("GET", url , true);
	if (responseType =="document")
    //req.responseType = "document";
    req.responseType = responseType;
	req.send(null); 
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.loadPage exiting");
}

SFDCCRUTCH.Util.getUsernameAndPassword = function()
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.getUsernameAndPassword entering:");

  var hostname = 'https://login.salesforce.com';
  var credentials={user:"",password:""};

  var formSubmitURL = ""; 
  var httprealm = "";
	 
	try {
	   // Get Login Manager
	   var myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
                            getService(Components.interfaces.nsILoginManager);
	       
	// Find users for the given parameters
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.getUsernameAndPassword: count ="+myLoginManager.countLogins(hostname, formSubmitURL, httprealm));
	
	
	   var logins = myLoginManager.findLogins({}, hostname, formSubmitURL, httprealm);
	   // Find user from returned array of nsILoginInfo objects
	   for (var i = 0; i < logins.length; i++) {
        //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.getUsernameAndPassword: user="+logins[i].username+" "+logins[i].password+" "+logins[i].hostname+" "+logins[i].httpRealm);
	   	  credentials.user = logins[i].username;
	   	  credentials.password = logins[i].password;
	      //break;
	    }
	}
  
  catch(ex) {
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.Util.getUsernameAndPassword: problem getting credentials.users");
  }	       

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.Util.getUsernameAndPassword: exiting "+credentials.user);
	return credentials;
	
}

SFDCCRUTCH.Util.containsCaseId = function(content) {
  var caseid=null;
  var regexp = new RegExp("([0-9]{2})([0-9]{2})([0-9]{2})-[0-9]{6}");
  var matches = regexp.exec(content);
    
  if(matches != null && parseInt(matches[1])>10 && parseInt(matches[1])<20 && parseInt(matches[2])>0 && parseInt(matches[2])<13
      && parseInt(matches[3])>0 && parseInt(matches[3])<32)
  {
    caseid=matches[0];
  }
  return caseid;
}
SFDCCRUTCH.Util.containsJiraId = function(content) {
  var jiraid=null;
  var regexp = new RegExp("ACP-[0-9]{5}");
  var matches = regexp.exec(content);
    
  if(matches != null)
  {
    jiraid=matches[0];
  }
  return jiraid;
}
