const SHEET_ID = '1NWT48wXxSdNN4O9lFQwVFARcKVnWzUNagvHGC7dXRxM';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    const x = String(data.x || '').trim();
    const repost = String(data.repost_url || '').trim();
    const zec = String(data.zec || '').trim();
    const region = String(data.region || '').trim();
    const collector = String(data.collector_type || '').trim();
    const reason = String(data.reason || '').trim();

    if (!x || !repost || !zec || !reason) {
      return json_({ok:false, error:'Missing required fields'});
    }
    if (!/^https:\/\/(x\.com|twitter\.com)\//i.test(repost)) {
      return json_({ok:false, error:'Invalid repost URL'});
    }
    if (!/^u1/i.test(zec)) {
      return json_({ok:false, error:'Unified Address must begin with u1'});
    }

    sheet.appendRow([
      new Date(),
      x,
      repost,
      zec,
      region,
      collector,
      reason,
      'NEW',
      ''
    ]);

    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function doGet() {
  return json_({ok:true, service:'ZEC NINJA 888 WL'});
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
