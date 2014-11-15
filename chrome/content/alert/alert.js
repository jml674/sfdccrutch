Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/ui.jsm");

SFDCCRUTCH.finalHeight=0;  
SFDCCRUTCH.slideIncrement = 1;
SFDCCRUTCH.slideTime = 50;
SFDCCRUTCH.openTime = 3000;



SFDCCRUTCH.onAlertLoad = function (){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onAlertLoad entering"+window.arguments[1]);
  

	SFDCCRUTCH.fillAlert(window.arguments[1]);
	
	// play a sound
	var sound = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.SOUND, "str", "default");
	if(sound == "default"){
		SFDCCRUTCH.Util.playSound();
	}else if(sound != "nosound"){
		SFDCCRUTCH.Util.playSound(sound);
	}
	window.focus();
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"onAlertLoad exiting outerw="+window.outerWidth);

}

SFDCCRUTCH.fillAlert=function(type_alert) {
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.fillAlert entering");
  
  var listbox = document.getElementById("scrollbox-alarms");
  var nb_rows = 0;
	for(var j=0; j < SFDCCRUTCH.alarmManager.caseAlarmSet.length; j++){
    var caseAlarm = SFDCCRUTCH.alarmManager.caseAlarmSet[j];
	  var today = new SFDCCRUTCH.DateTime();
	  var caseAlarmDate = caseAlarm.date.clone();
	  caseAlarmDate.add(SFDCCRUTCH.DateTime.DAY,-SFDCCRUTCH.Util.getNoticeBeforeAlarm(caseAlarm.severity));
	  
	  today.setHMS(8, 0, 0);

    //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert today "+today.date);
    //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert caseAlarmDate "+caseAlarmDate.date);
	  //SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert caseAlarm "+caseAlarm.date.date);

	  if(caseAlarmDate.date <= today.date)
	  {
      nb_rows += 1;
      var row = document.createElement('hbox');
            
      var cell = document.createElement('label');
      cell.setAttribute("value",caseAlarm.caseNumber);
      cell.className = "alarm";
      cell.addEventListener("click", SFDCCRUTCH.UI.openNewUrlEventHandler(caseAlarm.url), false);

      row.appendChild(cell);
      
      var cell = document.createElement('label');
      cell.setAttribute("value",","+SFDCCRUTCH.Util.shortSeverity(caseAlarm.severity)+",");
      row.appendChild(cell);

      cell = document.createElement('label');
      cell.setAttribute("value","\""+caseAlarm.subject+"\",");
      cell.setAttribute("tooltiptext",caseAlarm.subject);
      cell.setAttribute("crop","end");
      cell.setAttribute("flex", "1");
  	  if(caseAlarm.date.date <= today.date)
  	  {
        cell.style.color = "Red";
        SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert setting cell color to red");
      }
      else
      {
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert2 today "+today.date.getTime());
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.fillAlert2 caseAlarm "+caseAlarm.date.date.getTime());
      }
      row.appendChild(cell);             
            
      cell = document.createElement('label');
      cell.setAttribute("value",caseAlarm.date_text);
      row.appendChild(cell);
            
      /*
      cell = document.createElement('button');
      cell.setAttribute("label","Snooze");
      cell.addEventListener("click", SFDCCRUTCH.openNewUrlEventHandler(caseAlarm.url), false);
  
      row.appendChild(cell); */
            
      cell = document.createElement('button');
      cell.setAttribute("label","Hide");
      cell.addEventListener("click", SFDCCRUTCH.clearAlarmEventHandler(caseAlarm.caseId,listbox,row), false);
      row.appendChild(cell);
            
      listbox.appendChild(row);
    }
  }	
  if (nb_rows == 0)
  {
      var row = document.createElement('hbox');
      var cell = document.createElement('label');
      cell.setAttribute("value","No case about to expire");
      row.appendChild(cell);
      listbox.appendChild(row);
  }
 
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.fillAlert exiting");
}


SFDCCRUTCH.clearAlarmEventHandler=function(caseId,listbox,row) {
  return function (event) {
             // change in v1.2.14
             //SFDCCRUTCH.alarmManager._removeCaseAlarm(caseId);
             //SFDCCRUTCH.alarmManager.save();
             listbox.removeChild(row);
  }
}

SFDCCRUTCH.animateAlert = function(){
	if (window.outerHeight < SFDCCRUTCH.finalHeight){
		window.screenY -= SFDCCRUTCH.slideIncrement;
		window.outerHeight += SFDCCRUTCH.slideIncrement;
		setTimeout(function(){SFDCCRUTCH.animateAlert();}, SFDCCRUTCH.slideTime);
	}else{
		//setTimeout(SFDCCRUTCH.closeAlert, SFDCCRUTCH.openTime);
	}  
}

function closeAlert() {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"closeAlert entering ");

  if (window.screenY < screen.availHeight){
      window.screenY += SFDCCRUTCH.slideIncrement;
      //window.outerHeight -= SFDCCRUTCH.slideIncrement;
      setTimeout(closeAlert(), SFDCCRUTCH.slideTime);
  }
  else{
     window.close();
  }
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"closeAlert exiting "+window.outerHeight);
} 


