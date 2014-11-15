
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/ui.jsm");


SFDCCRUTCH.onWatchesLoad = function(){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.onWatchesLoad - entering");
	// play a sound
	var sound = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.SOUND, "str", "default");
	if(sound == "default"){
		SFDCCRUTCH.Util.playSound();
	}else if(sound != "nosound"){
		SFDCCRUTCH.Util.playSound(sound);
	}
	SFDCCRUTCH.UI.fillWatch(window,window.arguments[0],false,window.arguments[1]);

	sizeToContent();
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.onWatchesLoad - exiting");

}




SFDCCRUTCH.onWatchesUnload= function(){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.onWatchesUnload - entering");
  SFDCCRUTCH.UI.WatchPopup=0;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.onWatchesUnload - exiting");

}