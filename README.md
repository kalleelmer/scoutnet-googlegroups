# Scoutnet to Google Groups sync
This is a simple script to sync email lists in Scoutnet to Google Groups. Scoutnet is the member registration system of The Guides and Scouts of Sweden. This is not an official tool and not a part of Scoutnet. It is provided as-is, without warranty of any kind.

I originally used another synchronization script, https://github.com/scouternasetjanster/Google-Scoutnet-synk, but decided to write my own since my needs were somewhat different.

Here are some of the differences:

* Groups are never deleted and recreated, so you can safely make manual changes, such as permissions and moderation settings, without losing them.
* The script itself is stateless. There is no separate spreadsheet and it can run with existing groups.
* There are fewer API calls to Google, especially write operations, since it only updates what has changed.
* Since members are not deleted and re-added there is no risk that someone could miss an email if it happens to be sent while the script is running.
* It's a lot faster.

## Setup
It's the same process as the script referenced above, but there is only a single file of code, groups.js. The function sync() in this file is the one that should be called. The file config.gs.default should be renamed to config.gs and the variables within should be changed.

## Operation
For each Google Group, the script looks for a list in Scoutnet whose name is the email address of the group. If it is found, the member list of the group is updated so it matches the Scoutnet list.

If the Scoutnet list contains the tag "[PRIMARY_ONLY]" somehere in its description, only the primary email address of each person will be used. Otherwise, it includes additional contact field of relatives etc. The selection of addresses to receive emails in Scoutnet has no effect.

## Google Groups permissions
My original reason for writing this was that I wanted to have groups where anyone within our domain could send emails, but members of the group could not. Sadly, the API lacks this kind of granular control, which is the reason that the delete and recreate strategy wouldn't work. I needed the manual settings to be persistent.

In the Admin console, this is not possible either. If you give permission to the organization, members also get it automatically. However, the "Advanced settings" link leads to Google Groups, where you can specifically select the organization only. This doesn't show up correctly in the Admin console, but I have tested it and it works. This is perfect for us since members of a group may be parents who should no be able to send mass emails, while anyone with an organization account is a trusted leader who may need to send information to the parents.
