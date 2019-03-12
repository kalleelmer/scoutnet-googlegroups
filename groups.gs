function sync() {
  var lists = getLists();
  var groups = getGroups();
  for(var i = 0; i < groups.length; i++) {
    var group = groups[i];
    var list = lists[group.email];
    if(list) {
      // There is a corresponding Scoutnet list
      updateGroup(group, list);
    }
  }
}

function getGroups() {
  var response = AdminDirectory.Groups.list({domain:"scoutkarenfinn.se"});
  var groups = response.groups;
  return groups;
}

function getLists() {
  var response = UrlFetchApp.fetch(SCOUTNET_LISTS_URL);
  var data = JSON.parse(response.getContentText());
  var lists = {};
  for(var k in data) {
    var list = data[k];
    lists[list.title] = list;
  }
  return lists;
}

function getEmails(list, primaryOnly) {
  var url = list.link;
  if(!primaryOnly) {
    url += "&contact_fields=email_mum,email_dad,email_alt";
  }
  var response = UrlFetchApp.fetch(url);
  var json = JSON.parse(response.getContentText());
  var emails = {};
  for(var k in json.data) {
    var person = json.data[k];
    
    // Add primary email, if it exists
    for(var e in person) {
      //Logger.log(e);
      if(e.indexOf("email") == 0) {
        emails[person[e].value] = true;
      }
    }
  }
  var count = 0;
  for(var k in emails) count++;
  return emails;
}

function getMembers(group) {
  // Google hard limit is 200 per request, so fetch recursively using pagination
  var members = [];
  var response = {};
  do {
    response = AdminDirectory.Members.list(group.id, {pageToken: response.nextPageToken});
    members = members.concat(response.members);
  } while (response.nextPageToken);
  return members;
}

function updateGroup(group, list) {
  var primaryOnly = list.description.indexOf("[PRIMARY_ONLY]") >= 0;
  var emails = getEmails(list, primaryOnly);
  var members = getMembers(group);
  
  // Check all current members and remove as necessary
  for(var i = 0; i < members.length; i++) {
    var member = members[i];
    if(emails[member.email]) {
      // We no longer need to add them
      delete emails[member.email];
    } else {
      removeMember(group, member);
    }
  }
  
  // Remaining emails were not found. We need to add them.
  for(var email in emails) {
    addMember(group, email);
  }
}

function removeMember(group, member) {
  Logger.log("Removing " + member.email + " from " + group.email);
  if(!SIMULATE) {
    AdminDirectory.Members.remove(group.id, member.id);
  }
}

function addMember(group, email) {
  Logger.log("Adding " + email + " to " + group.email);
  if(!SIMULATE) {
    var member = {
      email: email,
      role: 'MEMBER'
    };
    AdminDirectory.Members.insert(member, group.id);
  }
}
