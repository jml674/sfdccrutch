
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/io.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.AlarmManager","SFDCCRUTCH.CaseAlarm"];

/////////////
// AlarmManager
/////////////
SFDCCRUTCH.AlarmManager = function(){
	this.caseAlarmSet= new Array();
  this.initialized = false;
}

SFDCCRUTCH.AlarmManager.prototype.findAlarmForCase = function(caseId){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.findAlarmForCase entering: caseId="+caseId);
  var pos = -1 ;
  
	for(var j=0; j<this.caseAlarmSet.length; j++){
      if (this.caseAlarmSet[j].caseId == caseId)
      {
        pos = j;
        break;
      }
 }
	
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.findAlarmForCase exiting: index="+pos);
	return pos;
}


SFDCCRUTCH.AlarmManager.prototype._removeCaseAlarm = function(caseId){  
  var caseAlarm = null;
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._removeCaseAlarm entering: caseId="+caseId);
  var pos = this.findAlarmForCase(caseId);
  
  if (pos != -1)
  {
      this.caseAlarmSet.splice(pos, 1);
  }
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._removeCaseAlarm exiting: pos="+pos);
  return pos;
}


SFDCCRUTCH.AlarmManager.prototype._addCaseAlarm = function(caseId,caseNumber,url,subject,nextCaseUpdate,severity){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._addCaseAlarm entering: caseId="+caseId+" url="+url+" subject="+subject+" nextCaseUpdate="+nextCaseUpdate+" severity="+severity);
  // remove from previous date
  this._removeCaseAlarm(caseId);
  // add to new date
	var caseAlarm = new SFDCCRUTCH.CaseAlarm(nextCaseUpdate,caseId,caseNumber,url,subject,severity);
  
	this.caseAlarmSet.push(caseAlarm);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._addCaseAlarm exiting: length="+this.caseAlarmSet.length);
	this._sort();
	this.save();
}
/*
SFDCCRUTCH.AlarmManager.prototype._moveCaseAlarm = function(caseId,delta) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._moveCaseAlarm entering: caseId="+caseId);
  var caseAlarm =   this._removeCaseAlarm(caseId);
  var inc= SFDCCRUTCH.Util.getNoticeBeforeAlarm(severity);
	var date = new SFDCCRUTCH.DateTime();
	date.setMDYfromString(nextCaseUpdate);
	date.add(SFDCCRUTCH.DateTime.DAY,-inc+delta,true);
	var alarmDate = date.formatMDY();
	
	var dailyAlarm;
	var pos;
	if ((pos = this.findDailyAlarm(alarmDate)) == -1)
      dailyAlarm = this._addDailyAlarm(alarmDate);
  else dailyAlarm = this.dailyAlarmManager[pos];

	dailyAlarm.caseAlarmSet.push(caseAlarm);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager._moveCaseAlarm exiting: pos="+pos+" length="+dailyAlarm.caseAlarmSet.length);
	this.save();

}
*/


SFDCCRUTCH.AlarmManager.prototype.empty = function(){
	this.caseAlarmSet = [];
	this.save();
}

SFDCCRUTCH.AlarmManager.prototype._sort = function(){
  this.caseAlarmSet.sort(function(a, b) {
          return a.date.date - b.date.date;
       });
}

SFDCCRUTCH.AlarmManager.prototype._getFilePath = function(){
	var profileDir = SFDCCRUTCH.DirIO.get('ProfD');
	var filepath = profileDir.path + SFDCCRUTCH.DirIO.sep;
	filepath += 'sfdccrutch' + SFDCCRUTCH.DirIO.sep;
	filepath += 'alarms.txt';
	return filepath;
}

SFDCCRUTCH.AlarmManager.prototype.save = function(){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.prototype.save entering "+this._getFilePath());

	var text = "";
	for(var i=0; i<this.caseAlarmSet.length; i++){
		text += this.caseAlarmSet[i].serialize() + "\n";
	}
	var fileOut = SFDCCRUTCH.FileIO.open(this._getFilePath());
	SFDCCRUTCH.FileIO.create(fileOut);
	SFDCCRUTCH.FileIO.write(fileOut, text);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.prototype.save exiting ");

}

SFDCCRUTCH.AlarmManager.prototype.read = function(){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.prototype.read entering:"+this.initialized);
	if(!this.initialized)
	{
    var fileIn = SFDCCRUTCH.FileIO.open(this._getFilePath());
    if (fileIn.exists()) {
      var str = SFDCCRUTCH.FileIO.read(fileIn, "UTF-8");
      data = str.replace(/\r/g, "").split('\n');
      for(var i=0; i<data.length; i++){
      	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.AlarmManager.prototype.read data["+i+"]=["+data[i]+"]");
      	if (data[i] !="")
      	{
          var caseAlarm = new SFDCCRUTCH.CaseAlarm();
          var valid = caseAlarm.deserialize(data[i]);
          if(valid) this.caseAlarmSet.push(caseAlarm);
        }
      }
    }
    this.initialized = true;
  }
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.AlarmManager.prototype.read exiting "+this.caseAlarmSet.length);
}

//////////////
// CaseAlarm
//////////////
SFDCCRUTCH.CaseAlarm = function(date_text,caseId,caseNumber,url,subject,severity){
	this.date_text = date_text;
	this.date = new SFDCCRUTCH.DateTime();
	if (typeof date_text !== "undefined")
    this.date.setMDYfromString(this.date_text);
	this.caseId = caseId;
	this.caseNumber = caseNumber;
	// debug
	if (typeof caseNumber !== "undefined")
	SFDCCRUTCH.Util.checkCaseId(caseNumber);
	
	this.url=url;
	this.subject=subject;
	this.severity=severity;
	this.sep = String.fromCharCode(14);
}  

SFDCCRUTCH.CaseAlarm.prototype.serialize = function(){
  var text="";
	text += this.date_text + this.sep + this.caseId + this.sep +this.caseNumber+ this.sep +this.url +this.sep + this.subject+this.sep + this.severity;
  if (this.date_text == "" || this.caseId == "" || this.caseNumber== "" || this.url == "" || this.subject== "" || this.severity=="")
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.CaseAlarm.prototype.serialize one of the alarm fields is empty "+
        "dt="+this.date_text+" ci="+this.caseId+" cn="+this.caseNumber+" url="+this.url +" sub="+this.subject+" sev="+this.severity
    );
    
	return text;
}

SFDCCRUTCH.CaseAlarm.prototype.deserialize = function(text){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CaseAlarm.prototype.deserialize entering text="+text);

	var data = text.split(this.sep);
  this.date_text = data[0];
  this.date = new SFDCCRUTCH.DateTime();
  this.date.setMDYfromString(this.date_text);
  
  this.caseId = data[1];
  this.caseNumber = data[2];
  // debug
  SFDCCRUTCH.Util.checkCaseId(this.caseNumber);

  this.url = data[3];
  this.subject = data[4];
  this.severity = data[5];
  
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CaseAlarm.prototype.deserialize exiting date="+this.date_text+" caseId="+this.caseId+" caseNumber="+this.caseNumber+" url="+this.url+" subject="+this.subject+" severity="+this.severity);

	return (data.length > 5);
}