/*
        Zhongwen - A Chinese-English Popup Dictionary
        Copyright (C) 2011 Christian Schiller
        https://chrome.google.com/extensions/detail/kkmlkkjojmombglmlpbpapmhcaljjkde

        ---

        Originally based on Rikaikun 0.8
        Copyright (C) 2010 Erek Speed
        http://code.google.com/p/rikaikun/

        ---

        Originally based on Rikaichan 1.07
        by Jonathan Zarate
        http://www.polarcloud.com/

        ---

        Originally based on RikaiXUL 0.4 by Todd Rudick
        http://www.rikai.com/
        http://rikaixul.mozdev.org/

        ---

        This program is free software; you can redistribute it and/or modify
        it under the terms of the GNU General Public License as published by
        the Free Software Foundation; either version 2 of the License, or
        (at your option) any later version.

        This program is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU General Public License for more details.

        You should have received a copy of the GNU General Public License
        along with this program; if not, write to the Free Software
        Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

        ---

        Please do not change or remove any of the copyrights or links to web pages
        when modifying any of the files. - Jon

*/
var zhongwenMain = {

    altView: 0,
    enabled: 0,

    miniHelp:
    '<span style="font-weight: bold;">Zhongwen Chinese-English Dictionary&nbsp;&nbsp;&nbsp;</span><br><br>' +
    '<p>' +
    'Keyboard shortcuts:' +
    '<p>' +
    '<table style="margin: 20px;" cellspacing=5 cellpadding=5>' +
    '<tr><td><b>N&nbsp;:</b></td><td>&nbsp;Next word</td></tr>' +
    '<tr><td><b>B&nbsp;:</b></td><td>&nbsp;Previous character</td></tr>' +
    '<tr><td><b>M&nbsp;:</b></td><td>&nbsp;Next character</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '<tr><td><b>A&nbsp;:</b></td><td>&nbsp;Alternate popup location</td></tr>' +
    '<tr><td><b>Y&nbsp;:</b></td><td>&nbsp;Move popup location down</td></tr>' +
    '<tr><td><b>X&nbsp;:</b></td><td>&nbsp;Move popup location up</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '<tr><td><b>C&nbsp;:</b></td><td>&nbsp;Copy to clipboard</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '<tr><td><b>S&nbsp;:</b></td><td>&nbsp;Add word to Skritter queue</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '<tr><td colspan=2>Look up selected text in online dictionary:</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '<tr><td><b>Alt + 1&nbsp;:</b></td><td>&nbsp;nciku</td></tr>' +
    '<tr><td><b>Alt + 2&nbsp;:</b></td><td>&nbsp;YellowBridge</td></tr>' +
    '<tr><td><b>Alt + 3&nbsp;:</b></td><td>&nbsp;Dict.cn</td></tr>' +
    '<tr><td><b>Alt + 4&nbsp;:</b></td><td>&nbsp;iCIBA</td></tr>' +
    '<tr><td><b>Alt + 5&nbsp;:</b></td><td>&nbsp;MDBG</td></tr>' +
    '<tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>' +
    '</table>',

    loadDictionary: function() {
        if (!this.dict) {
            try {
                this.dict = new zhongwenDict();
            }
            catch (ex) {
                alert('Error loading dictionary: ' + ex);
                return false;
            }
        }
        return true;
    },

    // The callback for onSelectionChanged.
    // Just sends a message to the tab to enable itself if it hasn't
    // already.
    onTabSelect: function(tabId) {
        zhongwenMain._onTabSelect(tabId);
    },
    _onTabSelect: function(tabId) {
        if ((this.enabled == 1))
            chrome.tabs.sendRequest(tabId, {
                "type":"enable",
                "config":zhongwenMain.config
            });
    },

    enable: function(tab) {
        if (!this.dict) {
            if (!this.loadDictionary()) return;
        }

        // Send message to current tab to add listeners and create stuff
        chrome.tabs.sendRequest(tab.id, {
            "type": "enable",
            "config": zhongwenMain.config
        });
        this.enabled = 1;

        chrome.tabs.sendRequest(tab.id, {
            "type": "showPopup",
            "text": zhongwenMain.miniHelp
        });

        chrome.browserAction.setBadgeBackgroundColor({
            "color":[255,0,0,255]
        });
        
        chrome.browserAction.setBadgeText({
            "text":"On"
        });
    },

    disable: function(tab) {
        // Delete dictionary object after we implement it
        delete this.dict;

        this.enabled = 0;
        chrome.browserAction.setBadgeBackgroundColor({
            "color": [0,0,0,0]
        });
        chrome.browserAction.setBadgeText({
            "text":""
        });

        // Send a disable message to all browsers.
        var windows = chrome.windows.getAll({
            "populate": true
        },
        function(windows) {
            for (var i =0; i < windows.length; ++i) {
                var tabs = windows[i].tabs;
                for ( var j = 0; j < tabs.length; ++j) {
                    chrome.tabs.sendRequest(tabs[j].id, {
                        "type":"disable"
                    });
                }
            }
        });
    },

    enableToggle: function(tab) {
        if (zhongwenMain.enabled) {
            zhongwenMain.disable(tab);
        } else {
            zhongwenMain.enable(tab);
        }
    },

    search: function(text) {

        return this.dict.wordSearch(text);

    }
};
