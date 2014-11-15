Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/util.jsm");

SFDCCRUTCH.fillVersion =function(){
  var version = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.VERSION, "str", "");
	document.getElementById("version").setAttribute("value", version);	
}