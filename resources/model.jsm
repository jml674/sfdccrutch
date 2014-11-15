Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/io.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.CasePageInfo","SFDCCRUTCH.DateTime","SFDCCRUTCH.Attachment","SFDCCRUTCH.Comment"];


/////////////
// CasePageInfo
/////////////
SFDCCRUTCH.CasePageInfo = function(caseId,caseNumber,subject,severity,status,button_add_comment,nextUpdateDate,user,contactname,account,ownerorganization,dateAndTimeText,commentMaker,gts_customer_interface_mandatory){
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo entering");

	this.caseId = caseId;
	this.caseNumber = caseNumber;
	// Debug info
	SFDCCRUTCH.Util.checkCaseId(caseNumber);
	this.subject = subject;
	this.severity = severity;
	this.status = status;
	this.button_add_comment = button_add_comment;
	this.nextUpdateDate = nextUpdateDate;
	this.user = user;
	this.contactName = contactname;
	this.account = account;
	this.ownerOrganization = ownerorganization;
	this.comment = "";
	this.dateAndTimeText = dateAndTimeText;
	this.commentMaker=commentMaker;
	this.gtsCustomerInterfaceMandatory = gts_customer_interface_mandatory;
	this.caseButtonSaveOnclick="not defined";
	
	this.automatonStatus = 0;
	this.automatonSubStatus = 0;
	
	SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo exiting sub="+this.subject+
                                                  " sev="+this.severity+" status="+this.status+" nextUpdateDate="+this.nextUpdateDate+
                                                  " user="+this.user+" contactName="+this.contactName+" account="+this.account+
                                                  " ownerOrganization="+this.ownerOrganization+" dateAndTimeText="+this.dateAndTimeText+
                                                  " commentMaker="+this.commentMaker+
                                                  " gtsCustomerInterfaceMandatory="+this.gtsCustomerInterfaceMandatory);
}

SFDCCRUTCH.CasePageInfo.prototype.update = function(subject,severity,status,button_add_comment,nextUpdateDate,user,contactname,account,ownerorganization,dateAndTimeText,commentMaker,gts_customer_interface_mandatory)
{
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo.prototype.update entering "+this.caseId);
  // Debug info
  SFDCCRUTCH.Util.checkCaseId(this.caseNumber);
	this.subject = subject;
	this.severity = severity;
	this.status = status;
	this.button_add_comment = button_add_comment;
	this.nextUpdateDate = nextUpdateDate;
	this.user = user;
	this.contactName = contactname;
	this.account = account;
	this.ownerOrganization = ownerorganization;
	this.dateAndTimeText = dateAndTimeText;
	this.commentMaker=commentMaker;
	this.gtsCustomerInterfaceMandatory = gts_customer_interface_mandatory;
	
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo.prototype.update exiting sub="+this.subject+
                                                  " sev="+this.severity+" status="+this.status+" nextUpdateDate="+this.nextUpdateDate+
                                                  " user="+this.user+" contactName="+this.contactName+" account="+this.account+
                                                  " ownerOrganization="+this.ownerOrganization+" dateAndTimeText="+this.dateAndTimeText+
                                                  " commentMaker="+this.commentMaker+
                                                  " gtsCustomerInterfaceMandatory="+this.gtsCustomerInterfaceMandatory);

}

SFDCCRUTCH.CasePageInfo.prototype.getProperty = function(property){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"getProperty entering "+property);

  var value = null;

  switch(property)
  {
    case "status": value = this.status;
    break;

    case "nextUpdateDate": value = this.nextUpdateDate;
    break;
    case "nextUpdateDateNew": value = this.nextUpdateDateNew;
    break;
    case "automatonStatus": value = this.automatonStatus;
    break;
    case "automatonSubStatus": value = this.automatonSubStatus;
    break;
    case "contactName": value = this.contactName;
    break;
    case "ownerOrganization": value = this.ownerOrganization;
    break;
    case "ownerOrganizationNew": value = this.ownerOrganizationNew;
    break;
    case "subject": value = this.subject;
    break;
    case "comment": value = this.comment;
    break;
    case "caseNumber": value = this.caseNumber;
    break;
    case "severity": value = this.severity;
    break;
    case "user": value = this.user;
    break;
    case "commentMaker": value = this.commentMaker;
    break;
    case "dateAndTimeText": value = this.dateAndTimeText;
    break;
    case "buttonAddComment": value = this.button_add_comment;
    break;
    case "caseButtonSaveOnclick": value = this.caseButtonSaveOnclick;
    break;
    case "account": value = this.account;
    break;
    case "gtsCustomerInterfaceMandatory": value = this.gtsCustomerInterfaceMandatory;
    break;
    case "endCustomer": value = this.endCustomer;
    break;
    case "supportProduct": value = this.supportProduct;
    break;
    case "actualSoftwareReleasecode": value = this.actualSoftwareReleasecode;
    break;
    default:
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"getProperty unknown "+property);
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"getProperty exiting "+property+" "+value);

  return value;
}


SFDCCRUTCH.CasePageInfo.prototype.setProperty = function(property,value){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"setProperty entering "+property+" "+value);
  switch(property)
  {
    case "status": this.status = value;
    break;
    case "nextUpdateDate": this.nextUpdateDate = value;
    break;
    case "nextUpdateDateNew": this.nextUpdateDateNew = value;
    break;
    case "contactName": this.contactName = value;
    break;
    case "ownerOrganization": this.ownerOrganization = value;
    break;
    case "ownerOrganizationNew": this.ownerOrganizationNew = value;
    break;
    case "automatonStatus": this.automatonStatus = value;
    break;
    case "automatonSubStatus": this.automatonSubStatus = value;
    break;
    case "subject": this.subject = value;
    break;
    case "comment": this.comment = value;
    break;
    case "caseNumber": this.caseNumber = value;
    break;
    case "severity": this.severity = value;
    break;
    case "buttonAddComment": this.button_add_comment = value;
    break;
    case "caseButtonSaveOnclick": this.caseButtonSaveOnclick = value;
    break;
    case "account": this.account = value;
    break;
    case "gtsCustomerInterfaceMandatory": this.gtsCustomerInterfaceMandatory=value;
    break;
    case "endCustomer": this.endCustomer = value;
    break;
    case "supportProduct": this.supportProduct = value;
    break;
    case "actualSoftwareReleasecode": this.actualSoftwareReleasecode = value;
    break;
    default:
       SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"setProperty unknown "+property);
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"setProperty exiting ");
}

SFDCCRUTCH.CasePageInfo.prototype.replaceKeywords = function (content,n) {
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo.replaceKeywords entering "+content);
  var nplus1;
  if (arguments.length==2)
  {
    if(n==2 ) return content;
    else nplus1 = n+1;
  } else nplus1=1;
  
  var keywordsArray = new Array("contactName","user","caseNumber","subject","ownerOrganization","severity","signature","account");
  var new_content=content;
  
  for (var i=0;i<keywordsArray.length;i++)
  {
    if (keywordsArray[i]=="signature")
    {
      var re = new RegExp("%"+keywordsArray[i], 'g');
      if (re.test(content))
      {
        var signature_content=SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.SIGNATURE, "str", "");
        signature_content = this.replaceKeywords(signature_content,nplus1);
        new_content = new_content.replace(re,signature_content);
      }
    }
    else
    {
      var re = new RegExp("%"+keywordsArray[i], 'g');
      new_content = new_content.replace(re,this.getProperty(keywordsArray[i]));
    }
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logD(),"SFDCCRUTCH.CasePageInfo.replaceKeywords exiting "+new_content);

  return new_content;
}


/////////////
// Comment
/////////////
SFDCCRUTCH.Comment = function(tr,time_string){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Attachment - entering "+tr+" ts="+time_string);

	this.date = new SFDCCRUTCH.DateTime();
  this.date.setMDYandTimefromString(time_string);	
  this.tr = tr;
 
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Comment - exiting ");

}
/////////////
// Attachment
/////////////
SFDCCRUTCH.Attachment = function(filename,size,description,time_string,author,onclick){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Attachment - entering "+filename+" s="+size+" d="+description+" "+time_string+" "+author+" "+onclick);

	this.date = new SFDCCRUTCH.DateTime();
  this.date.setMDYandTimefromString(time_string);	
  this.filename = filename;
  this.size = size;
  this.description = description;
  this.author = author;
  this.onclick = onclick;
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logA(),"SFDCCRUTCH.Attachment - exiting ");

}

SFDCCRUTCH.Attachment.prototype.isOlder = function(date){
  return this.date.before(date);
}

/////////////
// DateTime
/////////////
SFDCCRUTCH.DateTime = function(){
	this.date = new Date();
}

SFDCCRUTCH.DateTime.DAY = 0;
SFDCCRUTCH.DateTime.HOUR = 1;
SFDCCRUTCH.DateTime.MINUTE = 2;
SFDCCRUTCH.DateTime.SECOND = 3;
SFDCCRUTCH.DateTime.Days = [
	SFDCCRUTCH.Util.getString("day.sunday"),
	SFDCCRUTCH.Util.getString("day.monday"),
	SFDCCRUTCH.Util.getString("day.tuesday"),
	SFDCCRUTCH.Util.getString("day.wednesday"),
	SFDCCRUTCH.Util.getString("day.thursday"),
	SFDCCRUTCH.Util.getString("day.friday"),
	SFDCCRUTCH.Util.getString("day.saturday")
];
SFDCCRUTCH.DateTime.Months = [
	SFDCCRUTCH.Util.getString("month.january"),
	SFDCCRUTCH.Util.getString("month.february"),
	SFDCCRUTCH.Util.getString("month.march"),
	SFDCCRUTCH.Util.getString("month.april"),
	SFDCCRUTCH.Util.getString("month.may"),
	SFDCCRUTCH.Util.getString("month.june"),
	SFDCCRUTCH.Util.getString("month.july"),
	SFDCCRUTCH.Util.getString("month.august"),
	SFDCCRUTCH.Util.getString("month.september"),
	SFDCCRUTCH.Util.getString("month.october"),
	SFDCCRUTCH.Util.getString("month.november"),
	SFDCCRUTCH.Util.getString("month.december"),
];

SFDCCRUTCH.DateTime.prototype.getD = function(){
	var dateTime = new SFDCCRUTCH.DateTime();
	var i = 0;
	while(dateTime.date.getFullYear() < this.date.getFullYear()
		|| dateTime.date.getMonth() < this.date.getMonth()
		|| dateTime.date.getDate() < this.date.getDate()){
		dateTime.add(SFDCCRUTCH.DateTime.DAY, 1);
		i++
	}
	return i;
}

SFDCCRUTCH.DateTime.prototype.setD = function(day){
	var hours = this.date.getHours();
	var minutes = this.date.getMinutes();
	var seconds = this.date.getSeconds();
	this.date = new Date();
	this.setHMS(hours, minutes, seconds);
	this.add(SFDCCRUTCH.DateTime.DAY, day);
}

SFDCCRUTCH.DateTime.prototype.setHMS = function(hours, minutes, seconds){
	this.date.setHours(hours);
	this.date.setMinutes(minutes);
	this.date.setSeconds(seconds);
	this.date.setMilliseconds(0);
}

SFDCCRUTCH.DateTime.prototype.setMDYandTimefromString = function(date_string){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.DateTime.prototype.setMDYandTimefromString - entering "+date_string);
	var regexp = new RegExp("([0-9]*\/[0-9]*\/[0-9]*) ([0-9]*):([0-9]*) (PM)?");
  var matches = regexp.exec(date_string);
  if (matches != null)
  {
    this.setMDYfromString(matches[1]);
    var inc=0;
    if (matches[4] && parseInt(matches[2])<12) inc=12;
    this.setHMS(parseInt(matches[2])+inc, parseInt(matches[3]), 0);
  }
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.DateTime.prototype.setMDYandTimefromString - exiting inc="+inc+" date="+this.date);    
}

SFDCCRUTCH.DateTime.prototype.setMDYfromString = function(date_string){
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.DateTime.prototype.setMDYfromString - entering "+date_string);
	var regexp = new RegExp("([0-9]*)\/([0-9]*)\/([0-9]*)");
  var matches = regexp.exec(date_string);
  var status=0;
  var year=0;
  var m=0;
  var date=0;
  if (matches != null)
  {
    year=parseInt(matches[3]);
    m=parseInt(matches[1]);
    

    date=parseInt(matches[2]);
    if (date>0 && date<32 && m>=0 && m<12 && year>2013)
    {
      this.date.setFullYear(year);
      this.date.setMonth(m-1,date);
      this.date.setDate(date);
      this.setHMS(8, 0, 0);
    }
    else status=-1;
  }
  else
  {
    status=-1;
    SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logC(),"SFDCCRUTCH.DateTime.prototype.setMDYfromString can't convert date "+date_string);  
  }
      
  SFDCCRUTCH.Util.log(SFDCCRUTCH.Util.logR(),"SFDCCRUTCH.DateTime.prototype.setMDYfromString - exiting m="+m+" d="+date+" y="+year+" status="+status+" "+this.date);  

  return status;
}



SFDCCRUTCH.DateTime.prototype.setYMDHMS = function(year, month, date, hour, minute, second){
	this.date.setFullYear(year);
	this.date.setMonth(month-1);
	this.date.setDate(date);
	this.setHMS(hour, minute, second);
}

SFDCCRUTCH.DateTime.prototype.add = function(type, number, modulo){
	if(number == 0) return this;
	var add = number;
	if(modulo){
		var ref = 0;
		switch(type){
			case SFDCCRUTCH.DateTime.DAY:
				ref = this.date.getDate();
				break;
			case SFDCCRUTCH.DateTime.HOUR:
				ref = this.date.getHours();
				break;
			case SFDCCRUTCH.DateTime.MINUTE:
				ref = this.date.getMinutes();
				break;
			case SFDCCRUTCH.DateTime.SECOND:
				ref = this.date.getSeconds();
		}
		var q = ref/modulo;
		var norm = modulo*((number>0)?Math.ceil(q):Math.floor(q));
		if(Math.floor(q)<q) add = norm-ref;
	}
	switch(type){
		case SFDCCRUTCH.DateTime.DAY:
			add *= 24;
		case SFDCCRUTCH.DateTime.HOUR:
			add *= 60;
		case SFDCCRUTCH.DateTime.MINUTE:
			add *= 60;
		case SFDCCRUTCH.DateTime.SECOND:
			add *= 1000;
	}
	this.date.setTime(this.date.getTime()+add);
	return this;
}

SFDCCRUTCH.DateTime.prototype.before = function(dateTime){
	return this.date <= dateTime.date;
}

// equals if same year, month, date, hour, minute
SFDCCRUTCH.DateTime.prototype.equals = function(dateTime){
	return this.formatYMD() == dateTime.formatYMD()
		&& this.formatHM() == dateTime.formatHM();
}

SFDCCRUTCH.DateTime.prototype.clone = function(){
	var newDateTime = new SFDCCRUTCH.DateTime();
	newDateTime.date.setTime(this.date.getTime());
	return newDateTime;
}

SFDCCRUTCH.DateTime.prototype.formatHM = function(ignoreTimeFormat){
	var hours = this.date.getHours();
	var minutes = this.date.getMinutes();
	var use24HourFormat = (SFDCCRUTCH.Pref.get(SFDCCRUTCH.Pref.TIMEFORMAT, "int", 12) == 24);
	var m = ((minutes<10)?"0":"")+minutes;
	if(use24HourFormat || ignoreTimeFormat){
		var h = ((hours<10)?"0":"")+hours;
		return h+":"+m;
	}else{
		var newHours = hours==0?12:(hours>12?hours-12:hours);
		var h = ((newHours<10)?"0":"")+newHours;
		return h+":"+m+" "+(hours<12?"AM":"PM");
	}
}

SFDCCRUTCH.DateTime.prototype.formatYMD = function(type){
	var year = this.date.getFullYear();
	var month = this.date.getMonth()+1;
	var date = this.date.getDate();
	if(type=="path"){
		return year + SFDCCRUTCH.DirIO.sep + month + SFDCCRUTCH.DirIO.sep + date;
	}else if(type=="url"){
		return year + '/' + month + '/' + date;
	}else{
		var m = ((month<10)?"0":"")+month;
		var d = ((date<10)?"0":"")+date;
		return "" + year + m + d;
	}
}

SFDCCRUTCH.DateTime.prototype.formatMDY = function(){
	var year = this.date.getFullYear();
	var month = this.date.getMonth()+1;
	var date = this.date.getDate();
	
	var m = ((month<10)?"0":"")+month;
	var d = ((date<10)?"0":"")+date;
	return m + '/' + d + '/' + year;
}

SFDCCRUTCH.DateTime.prototype.formatMDYandTime = function(){
  var hours = this.date.getHours();
  var pm="AM";
  if (hours >12)
  {
    hours -= 12;
    pm="PM";
  }
  var h = ((hours<10)?"0":"")+hours;
	var mn = ((this.date.getMinutes()<10)?"0":"")+this.date.getMinutes();
	
  var string = this.formatMDY()+" "+h+":"+mn+" "+pm;
  return string;
}

SFDCCRUTCH.DateTime.prototype.formatD = function(){
	var day = new SFDCCRUTCH.DateTime();
	if(this.equals(day)){
		return SFDCCRUTCH.Util.getString("today");
	}
	day.add(SFDCCRUTCH.DateTime.DAY, -1);
	if(this.equals(day)){
		return SFDCCRUTCH.Util.getString("yesterday");
	}
	var month = SFDCCRUTCH.DateTime.Months[this.date.getMonth()];
	var day = SFDCCRUTCH.DateTime.Days[this.date.getDay()];
	var date = this.date.getDate();
	return day+" "+date+" "+month;
}
SFDCCRUTCH.DateTime.prototype.diff = function(dateTime){
	return dateTime.date - this.date;
}

SFDCCRUTCH.DateTime.formatHHMMSS = function(time_left)
{
   var l_result="";
   time_left = time_left.toFixed(0);

   if (time_left ==0) return "";
   var hours;
   if (time_left >=3600)
   {
      hours = (time_left / 3600) -0.5;
      hours = hours.toFixed(0);
      l_result =  hours+"h";
      time_left -= hours * 3600;
   }
   var mn = (time_left / 60) - 0.5; // FIX 0.91
   var sec = time_left % 60;
   if (mn >0)
        l_result +=  mn.toFixed(0)+"mn"+sec+"s ";
   else
        l_result = sec+"s";
   return l_result;        
}

