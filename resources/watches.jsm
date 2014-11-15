
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/io.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.WatchesManager","SFDCCRUTCH.CaseWatch"];


/////////////
// WatchesManager
/////////////
SFDCCRUTCH.WatchesManager = function(){
	this.caseWatchSet= new Array();
  this.initialized = false;
 	this.workingWatchSet= new Array();
  this.timerId = 0;
}

SFDCCRUTCH.WatchesManager.prototype.start = function()
{
	var periodicity_mn = SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.POLLING_CASE_NEW_COMMENT_TIMER, "int",0);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.start entering periodicity(mn)="+periodicity_mn);

  if (periodicity_mn !=0) this.timerId=SFDCCRUTCH.Util.getBrowserWindow().setInterval(SFDCCRUTCH.WatchesManager.loadPages,60*periodicity_mn*1000,this);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.start exiting ");

}

SFDCCRUTCH.WatchesManager.prototype.stop = function()
{
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.stop entering ");

  if (this.timerId !=0) SFDCCRUTCH.Util.getBrowserWindow().clearInterval(this.timerId);
  this.timerId = 0;
 	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.stop exiting ");

}

SFDCCRUTCH.WatchesManager.loadPages=function(watchesMgr){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.loadPages entering "+watchesMgr.caseWatchSet.length);

  // clone existing cases to watch
 	watchesMgr.workingWatchSet= watchesMgr.caseWatchSet.slice(0);
 	watchesMgr.LoadNextCasePage();

	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.loadPages exiting ");
}
SFDCCRUTCH.WatchesManager.prototype.LoadNextCasePage=function(){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.LoadNextCasePage entering ");
  var saved = false;
 	var caseWatch = this.workingWatchSet.shift();
 	if (caseWatch != null)
 	{
    this.loadPage(caseWatch);
  }
  else
  {
   saved = true;
   this.save();
  }
 	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.LoadNextCasePage exiting saved="+saved);

}

SFDCCRUTCH.WatchesManager.prototype.loadPage=function(caseWatch){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.loadPage entering "+caseWatch.getProperty("caseId"));
  var _this = this;
  var _caseWatch = caseWatch;
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	req.onreadystatechange=function()	{ 
		if(req.readyState == 4)
		{
			if(req.status == 200)
			{
          _this.EndOfOKloading(req.responseXML.documentElement,_caseWatch);
			}
			else
			{
			 SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"WatchesManager.prototype.loadPage status ="+req.status+" !=200!");

			}
		} 
	}; 
	req.open("GET", caseWatch.getProperty("url") , true);
  req.responseType = "document";
  req.send(null);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"WatchesManager.prototype.loadPage exiting ");

}

SFDCCRUTCH.WatchesManager.prototype.EndOfOKloading=function(dom,caseWatch){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.EndOfOKloading entering "+caseWatch.getProperty("caseId")+" last_date="+caseWatch.getProperty("dateAndTimeText"));
	var retvals = SFDCCRUTCH.UICasePage.extractLastComment(dom,caseWatch.getProperty("caseId"));
	if (retvals.result == 1) // user is logged in
	{
    // let's check if the case has been closed in meantime
    var status_div = SFDCCRUTCH.Dom.FindNode(dom,"id","cas7_ileinner"); 
    if ( status_div != null)
    {
      var status_text = SFDCCRUTCH.Dom.Attr(status_div,"textContent");
     	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.EndOfOKloading status case= "+status_text);

      if (status_text == "Closed Resolved" || status_text == "Closed Unresolved")
      {
          SFDCCRUTCH.watchesManager._removeCaseWatch(caseWatch.getProperty("caseId"));
      }
    }
    if (SFDCCRUTCH.user != retvals.commentMaker)
    {
        if (caseWatch.getProperty("dateAndTimeText") != retvals.dateAndTime)
        {
        	caseWatch.setProperty("dateAndTimeText",retvals.dateAndTime);
        	caseWatch.setProperty("commentMaker",retvals.commentMaker);
          SFDCCRUTCH.UI.displayWatch(caseWatch,true,"New case comment notifications");
        	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.WatchesManager.EndOfOKloading new comment inserted at "+retvals.dateAndTime);
        	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.WatchesManager.EndOfOKloading old date&time "+caseWatch.getProperty("dateAndTimeText"));
          SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.WatchesManager.EndOfOKloading old date&time "+caseWatch.serialize());


        }
    }
    this.LoadNextCasePage();
	}
	else // user needs to log
	{
	   SFDCCRUTCH.Util.openNewTab("https://genband.my.salesforce.com/");
	   this.save();

	}
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.EndOfOKloading exiting result="+retvals.result +" new date="+retvals.dateAndTime+" cm="+retvals.commentMaker);
}



SFDCCRUTCH.WatchesManager.prototype.findWatchForCase = function(caseId){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.findWatchForCase entering: caseId="+caseId);
  var pos = -1 ;
  
	for(var j=0; j<this.caseWatchSet.length; j++){
      if (this.caseWatchSet[j].caseId == caseId)
      {
        pos = j;
        break;
      }
 }
	
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.findWatchForCase exiting: index="+pos);
	return pos;
}


SFDCCRUTCH.WatchesManager.prototype._removeCaseWatch = function(caseId){  
  var caseWatch = null;
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._removeCaseWatch entering: caseId="+caseId);
  var pos = this.findWatchForCase(caseId);
  
  if (pos != -1)
  {
      this.caseWatchSet.splice(pos, 1);
  }
  
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._removeCaseWatch exiting: pos="+pos);
  return pos;
}


SFDCCRUTCH.WatchesManager.prototype._addCaseWatch = function(caseId,caseNumber,url,subject,dateAndTime,severity,commentMaker){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._addCaseWatch entering: caseId="+caseId+" url="+url+" subject="+subject+" dateAndTime="+dateAndTime+" severity="+severity);
  // remove from previous date
  this._removeCaseWatch(caseId);
  // add to new date
	var caseWatch = new SFDCCRUTCH.CaseWatch(dateAndTime,caseId,caseNumber,url,subject,severity,commentMaker);
  
	this.caseWatchSet.push(caseWatch);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._addCaseWatch exiting: length="+this.caseWatchSet.length);
	this.save();
}
/*
SFDCCRUTCH.WatchesManager.prototype._moveCaseWatch = function(caseId,delta) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._moveCaseWatch entering: caseId="+caseId);
  var caseWatch =   this._removeCaseWatch(caseId);
  var inc= SFDCCRUTCH.Util.getNoticeBeforeWatch(severity);
	var date = new SFDCCRUTCH.DateTime();
	date.setMDYfromString(nextCaseUpdate);
	date.add(SFDCCRUTCH.DateTime.DAY,-inc+delta,true);
	var alarmDate = date.formatMDY();
	
	var dailyWatch;
	var pos;
	if ((pos = this.findDailyWatch(alarmDate)) == -1)
      dailyWatch = this._addDailyWatch(alarmDate);
  else dailyWatch = this.dailyWatchesManager[pos];

	dailyWatch.caseWatchSet.push(caseWatch);
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager._moveCaseWatch exiting: pos="+pos+" length="+dailyWatch.caseWatchSet.length);
	this.save();

}
*/


SFDCCRUTCH.WatchesManager.prototype.empty = function(){
	this.caseWatchSet = [];
	this.save();
}

SFDCCRUTCH.WatchesManager.prototype._sort = function(){
  this.caseWatchSet.sort(function(a, b) {
          return a.date.date - b.date.date;
       });
}

SFDCCRUTCH.WatchesManager.prototype._getFilePath = function(){
	var profileDir = SFDCCRUTCH.DirIO.get('ProfD');
	var filepath = profileDir.path + SFDCCRUTCH.DirIO.sep;
	filepath += 'sfdccrutch' + SFDCCRUTCH.DirIO.sep;
	filepath += 'watches.txt';
	return filepath;
}

SFDCCRUTCH.WatchesManager.prototype.save = function(){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.prototype.save entering "+this._getFilePath());

	var text = "";
	for(var i=0; i<this.caseWatchSet.length; i++){
		text += this.caseWatchSet[i].serialize() + "\n";
	}
	var fileOut = SFDCCRUTCH.FileIO.open(this._getFilePath());
	SFDCCRUTCH.FileIO.create(fileOut);
	SFDCCRUTCH.FileIO.write(fileOut, text);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.prototype.save exiting ");

}

SFDCCRUTCH.WatchesManager.prototype.read = function(){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.prototype.read entering:"+this.initialized);
	if(!this.initialized)
	{
    var fileIn = SFDCCRUTCH.FileIO.open(this._getFilePath());
    if (fileIn.exists()) {
      var str = SFDCCRUTCH.FileIO.read(fileIn, "UTF-8");
      data = str.replace(/\r/g, "").split('\n');
      for(var i=0; i<data.length-1 && data[i].length !=0; i++){
      	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.WatchesManager.prototype.read data["+i+"]="+data[i]);
        var caseWatch = new SFDCCRUTCH.CaseWatch();
        var valid = caseWatch.deserialize(data[i]);
        if(valid) this.caseWatchSet.push(caseWatch);
      }
    }
    this.initialized = true;
  }
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.WatchesManager.prototype.read exiting "+this.caseWatchSet.length);
}

//////////////
// CaseWatch
//////////////
SFDCCRUTCH.CaseWatch = function(dateAndTimeText,caseId,caseNumber,url,subject,severity,commentMaker){
	this.dateAndTimeText = dateAndTimeText;
	this.dateAndTime = new SFDCCRUTCH.DateTime();
  this.dateAndTime.setMDYandTimefromString(this.dateAndTimeText);
	this.caseId = caseId;
	this.caseNumber = caseNumber;
	this.url=url;
	this.subject=subject;
	this.severity=severity;
	this.commentMaker = commentMaker;
	this.sep = String.fromCharCode(14);
}  

SFDCCRUTCH.CaseWatch.prototype.serialize = function(){
  var text="";
	text += this.dateAndTimeText + this.sep + this.caseId + this.sep +this.caseNumber+ this.sep +this.url +this.sep + this.subject+this.sep + this.severity + this.sep + this.commentMaker;
  if (this.dateAndTimeText == "" || this.caseId == "" || this.caseNumber== "" || this.url == "" || this.subject== "" || this.severity=="" || this.commentMaker=="")
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.CaseWatch.prototype.serialize one of the alarm fields is empty "+
        "dt="+this.dateAndTimeText+" ci="+this.caseId+" cn="+this.caseNumber+" url="+this.url +" sub="+this.subject+" sev="+this.severity+" cm="+this.commentMaker
      );
    
	return text;
}

SFDCCRUTCH.CaseWatch.prototype.deserialize = function(text){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CaseWatch.prototype.deserialize entering");

	var data = text.split(this.sep);
  this.dateAndTimeText = data[0];
  this.dateAndTime = new SFDCCRUTCH.DateTime();
  this.dateAndTime.setMDYandTimefromString(this.dateAndTimeText);
  
  this.caseId = data[1];
  this.caseNumber = data[2];
  this.url = data[3];
  this.subject = data[4];
  this.severity = data[5];
  this.commentMaker = data[6];
  var valid = (data.length > 6);
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CaseWatch.prototype.deserialize exiting date="+this.dateAndTimeText+" caseId="+this.caseId+" caseNumber="+this.caseNumber+" url="+this.url+" subject="+this.subject+" severity="+this.severity+" commentMaker="+this.commentMaker+" valid="+valid);

	return valid;
}

SFDCCRUTCH.CaseWatch.prototype.setProperty = function(property,value){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"CaseWatch.setProperty entering "+property+" "+value);
  switch(property)
  {
    case "caseId": this.caseId = value;
    break;
    case "dateAndTimeText": this.dateAndTimeText = value;
    break;
    case "subject": this.ownerOrganization = subject;
    break;
    case "caseNumber": this.caseNumber = value;
    break;
    case "severity": this.severity = value;
    break;
    case "commentMaker": this.commentMaker = value;
    break;
    case "url": this.url = value;
    break;
    default:
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"CaseWatch.setProperty unknown "+property);
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"CaseWatch.setProperty exiting ");
}



SFDCCRUTCH.CaseWatch.prototype.getProperty = function(property){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"CaseWatch.getProperty entering "+property);

  var value = null;

  switch(property)
  {
    case "caseId": value = this.caseId;
    break;
    case "dateAndTimeText": value = this.dateAndTimeText;
    break;
    case "subject": value = this.subject;
    break;
    case "caseNumber": value = this.caseNumber;
    break;
    case "severity": value = this.severity;
    break;
    case "commentMaker": value = this.commentMaker;
    break;
    case "url": value = this.url;
    break;
    default:
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"CaseWatch.getProperty unknown "+property);
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"CaseWatch.getProperty exiting "+property+" "+value);

  return value;
}
