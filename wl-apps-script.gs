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

    const profile = fetchXProfile_(x);

    sheet.appendRow([
      new Date(),
      x,
      repost,
      zec,
      region,
      collector,
      reason,
      'NEW',
      '',
      profile.followers,
      profile.following,
      profile.posts,
      profile.verified,
      profile.created_at,
      profile.status
    ]);

    return json_({ok:true});
  } catch (err) {
    return json_({ok:false, error:String(err)});
  }
}

function fetchXProfile_(handle) {
  const token = PropertiesService.getScriptProperties().getProperty('X_BEARER_TOKEN');
  if (!token) {
    return emptyX_('NO_API_KEY');
  }

  const username = String(handle || '')
    .trim()
    .replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?(x\.com|twitter\.com)\//i, '')
    .split(/[\/?#]/)[0];

  if (!/^[A-Za-z0-9_]{1,15}$/.test(username)) {
    return emptyX_('INVALID_HANDLE');
  }

  const url =
    'https://api.x.com/2/users/by/username/' +
    encodeURIComponent(username) +
    '?user.fields=public_metrics,created_at,verified';

  try {
    const res = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {Authorization: 'Bearer ' + token},
      muteHttpExceptions: true
    });

    const statusCode = res.getResponseCode();
    const body = JSON.parse(res.getContentText() || '{}');

    if (statusCode < 200 || statusCode >= 300 || !body.data) {
      return emptyX_('HTTP_' + statusCode);
    }

    const m = body.data.public_metrics || {};
    return {
      followers: m.followers_count || 0,
      following: m.following_count || 0,
      posts: m.tweet_count || 0,
      verified: body.data.verified === true ? 'YES' : 'NO',
      created_at: body.data.created_at || '',
      status: 'OK'
    };
  } catch (err) {
    return emptyX_('ERROR');
  }
}

function emptyX_(status) {
  return {
    followers: '',
    following: '',
    posts: '',
    verified: '',
    created_at: '',
    status: status
  };
}

function doGet() {
  return json_({ok:true, service:'ZEC NINJA 888 WL'});
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
