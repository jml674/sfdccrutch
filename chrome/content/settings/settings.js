
Components.utils.import("resource://sfdccrutch/common.jsm");

// change 0.97 logfile can't be sent if user is not registered


SFDCCRUTCH.settingsDoOK= function(){
    var domains = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.DOMAINSTOINTERCEPT, "str", "");
    SFDCCRUTCH.HTTP.registerForDomain(domains,null);
    return true;
}

SFDCCRUTCH.enableSendLogfileButton = function (){
  var button = document.getElementById("sendLogfileButton");
  button.setAttribute("disabled",SFDCCRUTCH.user =="");
}

SFDCCRUTCH.showuploadinglogfile = function(show){
	var button = document.getElementById("uploadinglogfile");
	if (button) button.style.display = show?"":"none";
	// Correction 0.97, disable ACCEPT button while loading
	document.documentElement.getButton("accept").setAttribute("disabled",show);
}

SFDCCRUTCH.SendLogFile = function() {

  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.SendLogFile - entering");
  var details = document.getElementById("logdetails").value;
  
  if (details =="")
  {
    //SFDCCRUTCH.UI.displayError("Please provide details prior sending logs","");  
    var details = document.getElementById("logdetailstitle");
    details.style.color="red";
      
  }
  else
  {
    SFDCCRUTCH.Util.log(0,"SFDCCRUTCH.SendLogFile - details:"+details);  
    SFDCCRUTCH.showuploadinglogfile(true);
    SFDCCRUTCH.Util.MailToFunc(SFDCCRUTCH.endloadinglogfileHandler);
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.SendLogFile - exiting");
  }
}

SFDCCRUTCH.endloadinglogfileHandler = function(){
	SFDCCRUTCH.showuploadinglogfile(false);
}

/////////
// Alarms
/////////
SFDCCRUTCH.readSound = function(){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.readSound - entering ");

	var sound = document.getElementById("sound").value;
	if(sound=="nosound" || sound=="default") return sound;
	document.getElementById("soundfile").value = sound;
	document.getElementById("select-sound").disabled = false;
	document.getElementById("test-sound").disabled = false;
	return "custom";
}

SFDCCRUTCH.writeSound = function (){
	var sound = document.getElementById("group-sound").selectedItem.value;
	if(sound=="nosound" || sound=="default") return sound;
	sound = document.getElementById("soundfile").value;
	return sound;
}

SFDCCRUTCH.updateSound = function(){
	var sound = document.getElementById("group-sound").value;
	document.getElementById("select-sound").disabled = (sound!="custom");
	document.getElementById("test-sound").disabled = (sound!="custom");
}

SFDCCRUTCH.selectSound = function(){
	var NFP = Components.interfaces.nsIFilePicker;
	var filePicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(NFP);
	filePicker.init(window, null, NFP.modeOpen);
	filePicker.appendFilters(NFP.filterAll);
	
	if(filePicker.show() == NFP.returnOK) {
	  document.getElementById("soundfile").value = filePicker.file.path;
	}
}

SFDCCRUTCH.testSound = function(){
	var filepath = document.getElementById("soundfile").value;
	if (filepath) {
		SFDCCRUTCH.Util.playSound(filepath);
	}
}

SFDCCRUTCH.ClearLogFile = function(){
  SFDCCRUTCH.Util.clearLogFile();
}

