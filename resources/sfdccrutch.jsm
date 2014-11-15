
Components.utils.import("resource://sfdccrutch/common.jsm");
Components.utils.import("resource://sfdccrutch/preferences.jsm");
Components.utils.import("resource://sfdccrutch/model.jsm");
Components.utils.import("resource://sfdccrutch/alarms.jsm");
Components.utils.import("resource://sfdccrutch/watches.jsm");
Components.utils.import("resource://sfdccrutch/clipboard.jsm");

var EXPORTED_SYMBOLS = ["SFDCCRUTCH.alarmManager","SFDCCRUTCH.watchesManager","SFDCCRUTCH.clipboard"];


SFDCCRUTCH.alarmManager = new SFDCCRUTCH.AlarmManager();
SFDCCRUTCH.watchesManager = new SFDCCRUTCH.WatchesManager();
SFDCCRUTCH.clipboard = new SFDCCRUTCH.Clipboard();