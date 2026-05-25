(function () {
    'use strict';

    // ===== 時間停止 / 倍速 hook =====
    if (window.setup && setup.Time && setup.Time.advance_time) {
        var _origAT = setup.Time.advance_time.bind(setup.Time);
        setup.Time.advance_time = function (minutes) {
            var V = (window.SugarCube && SugarCube.State) ? SugarCube.State.variables : null;
            if (!V) return _origAT(minutes);
            if (V.cotTimeStop) return;
            if (V.cotTimeMult) {
                var mult = Number(V.cotTimeMultVal) || 1;
                minutes = Math.round(minutes * mult);
                if (minutes <= 0) return;
            }
            _origAT(minutes);
        };
    }

    // ===== 需求鎖定 hook =====
    if (window.setup && setup.Needs) {
        if (setup.Needs.decay_need) {
            var _origDN = setup.Needs.decay_need;
            setup.Needs.decay_need = function (n, a) {
                var V = (window.SugarCube && SugarCube.State) ? SugarCube.State.variables : null;
                if (V && V.cotNeedsLock) return;
                return _origDN.call(this, n, a);
            };
        }
        if (setup.Needs.decrease_need) {
            var _origDec = setup.Needs.decrease_need;
            setup.Needs.decrease_need = function (n, a) {
                var V = (window.SugarCube && SugarCube.State) ? SugarCube.State.variables : null;
                if (V && V.cotNeedsLock) return;
                return _origDec.call(this, n, a);
            };
        }
    }

    // ===== 繞過暴露癖限制 hook =====
    if (window.Person && window.Person.prototype) {
        var _origGetErrDress = window.Person.prototype.get_error_dress_code;
        window.Person.prototype.get_error_dress_code = function (dress_codes, location, streaking_allowed) {
            var V = (window.SugarCube && SugarCube.State) ? SugarCube.State.variables : null;
            if (V && V.cotNudist) return null;
            return _origGetErrDress.call(this, dress_codes, location, streaking_allowed);
        };
        var _origGetErrExhib = window.Person.prototype.get_error_exhibitionism;
        window.Person.prototype.get_error_exhibitionism = function (location, locblock) {
            var V = (window.SugarCube && SugarCube.State) ? SugarCube.State.variables : null;
            if (V && V.cotNudist) return null;
            return _origGetErrExhib.call(this, location, locblock);
        };
    }

    console.log('[CotCheatMod] Hooks installed');

    // ===== 作弊選單內容（SugarCube markup）=====
    var CHEAT_MENU =
        '<<if ndef $cotTimeStop>><<set $cotTimeStop to false>><</if>>' +
        '<<if ndef $cotNeedsLock>><<set $cotNeedsLock to false>><</if>>' +
        '<<if ndef $cotNudist>><<set $cotNudist to false>><</if>>' +
        '<<if ndef $cotTimeMult>><<set $cotTimeMult to false>><</if>>' +
        '<<if ndef $cotTimeMultVal>><<set $cotTimeMultVal to 1>><</if>>' +
        '<b>CoT 作弊選單</b><br>' +
        '<table class="options-table"><tr>' +
        '<td class="options-col-label" style="width:13em;">快速開關</td>' +
        '<td class="options-col-content" style="text-align:left;">' +
        '<label><<checkbox "$cotTimeStop" false true autocheck>> 停止時間（凍結所有時間推進）</label><br>' +
        '<label><<checkbox "$cotNeedsLock" false true autocheck>> 鎖定需求（防止所有需求下降）</label><br>' +
        '<label><<checkbox "$cotNudist" false true autocheck>> 繞過暴露癖限制（裸體自由行動）</label>' +
        ' <span class="ungood">⚠ 可能造成Bug</span><br>' +
        '<label><<checkbox "$cotTimeMult" false true autocheck>> 時間倍速</label>' +
        '<<if $cotTimeMult>>&nbsp;' +
        '<<link "0.5x">><<set $cotTimeMultVal to 0.5>><</link>>' +
        '<<link "1x">><<set $cotTimeMultVal to 1>><</link>>' +
        '<<link "2x">><<set $cotTimeMultVal to 2>><</link>>' +
        '<<link "5x">><<set $cotTimeMultVal to 5>><</link>>' +
        '&nbsp;（目前：<<= $cotTimeMultVal>>x）<</if>>' +
        '</td></tr></table><br>' +
        '<b>技能</b><br>' +
        '<<link "全滿技能">><<run (function(){var s=setup.Skills.all_skills();if(!V.pcskills)V.pcskills={};s.forEach(function(n){V.pcskills[n]=1000;});})(  )>><</link>>&nbsp;' +
        '<<link "重置技能">><<run (function(){var s=setup.Skills.all_skills();if(V.pcskills)s.forEach(function(n){V.pcskills[n]=0;});})(  )>><</link>><br><br>' +
        '<b>時間控制</b>' +
        '<br>目前：<<= setup.Time.clock()>> | <<= setup.Time.weekday()>>，第 <<= $gameday>> 天<br>' +
        '<div class="two-column-container"><div class="two-column">' +
        '<<link "+30分鐘">><<run setup.Time.advance_time(30)>><</link>><br>' +
        '<<link "+1小時">><<run setup.Time.advance_time(60)>><</link>><br>' +
        '<<link "+4小時">><<run setup.Time.advance_time(240)>><</link>><br>' +
        '<<link "+8小時">><<run setup.Time.advance_time(480)>><</link>><br>' +
        '<<link "+1天">><<run setup.Time.advance_time(1440)>><</link>>' +
        '</div><div class="two-column">' +
        '<<link "跳至早上8時">><<run setup.Time.advance_time((((480-V.hour*60-V.minute)%1440)+1440)%1440||1440)>><</link>><br>' +
        '<<link "跳至正午">><<run setup.Time.advance_time((((720-V.hour*60-V.minute)%1440)+1440)%1440||1440)>><</link>><br>' +
        '<<link "跳至下午3時">><<run setup.Time.advance_time((((900-V.hour*60-V.minute)%1440)+1440)%1440||1440)>><</link>><br>' +
        '<<link "跳至晚上7時">><<run setup.Time.advance_time((((1140-V.hour*60-V.minute)%1440)+1440)%1440||1440)>><</link>><br>' +
        '<<link "跳至午夜">><<run setup.Time.advance_time((((1440-V.hour*60-V.minute)%1440)+1440)%1440||1440)>><</link>>' +
        '</div></div><br>' +
        '<<if ndef $cotJumpHour>><<set $cotJumpHour to 12>><</if>>' +
        '跳至指定時間：<<textbox "$cotJumpHour" $cotJumpHour>>' +
        ' <<link "前往">><<run setup.Time.advance_time((((Number(V.cotJumpHour)*60-V.hour*60-V.minute)%1440+1440)%1440)||1440)>><</link>> （0-23）<br><br>' +
        '<b>隨身衣櫃</b><br><<link "開啟衣櫃" "Wardrobe">><</link>><br><br>' +
        '<b>事件瀏覽器</b><br>' +
        '<<link "瀏覽事件">><<run window.cotOpenEventBrowser()>><</link>>';

    var EVENT_BROWSER =
        '<<if ndef $cheatevtag>><<set $cheatevtag to "campus walk">><</if>>' +
        '<b>事件瀏覽器</b>' +
        '<br>選擇標籤以篩選事件。點擊事件名稱可直接前往該事件。' +
        '<br><i>注意：部分事件需要特定NPC或場景才能正確執行。</i><br><br>' +
        '<<set _tagcounts to {}>>' +
        '<<for _ev range setup.Events.db>>' +
        '<<for _t range _ev.tags>>' +
        '<<run (_t in _tagcounts)?_tagcounts[_t]++:(_tagcounts[_t]=1)>>' +
        '<</for>><</for>>' +
        '<<set _displaytags to []>>' +
        '<<for _t range Object.keys(_tagcounts).sort()>>' +
        '<<if _tagcounts[_t] gte 10>><<run _displaytags.push(_t)>><</if>>' +
        '<</for>>' +
        '<b>標籤（10個以上事件）：</b><br>' +
        '<<for _t range _displaytags>>' +
        '<<capture _t>><<link _t>>' +
        '<<set $cheatevtag to _t>>' +
        '<<replace "#cot-evt-list">>' +
        '<<set _c to 0>>' +
        '<<for _ev range setup.Events.db>>' +
        '<<if _ev.tags.includes($cheatevtag)>>' +
        '<<set _c++>><<capture _ev>><<link _ev.passage _ev.passage>><</link>><br><</capture>>' +
        '<</if>><</for>>' +
        '"<<= $cheatevtag>>" 共 <<= _c>> 個事件。' +
        '<</replace>><</link>><</capture>> | ' +
        '<</for>><br><br>' +
        '<div id="cot-evt-list" style="max-height:350px;overflow-y:auto;">' +
        '<<set _c to 0>>' +
        '<<for _ev range setup.Events.db>>' +
        '<<if _ev.tags.includes($cheatevtag)>>' +
        '<<set _c++>><<capture _ev>><<link _ev.passage _ev.passage>><</link>><br><</capture>>' +
        '<</if>><</for>>' +
        '"<<= $cheatevtag>>" 共 <<= _c>> 個事件。' +
        '</div>';

    // 事件瀏覽器開啟函數（供 CHEAT_MENU 內的 link 呼叫）
    window.cotOpenEventBrowser = function () {
        if (!window.SugarCube || !Dialog) return;
        Dialog.setup('事件瀏覽器', 'cot-event-browser');
        Dialog.wiki(EVENT_BROWSER);
        Dialog.open();
    };

    // ===== 側邊欄按鈕注入 =====
    window.jQuery(document).on(':passageend', function () {
        if (window.$('#cot-cheat-btn').length > 0) return;
        var $block = window.$('.storymenu-button-block');
        if (!$block.length) return;
        var $wrap = window.$('<div class="fullwidth-buttons"></div>');
        var $btn = window.$('<button id="cot-cheat-btn" class="link-image link-internal macro-button" type="button">⚙ 作弊選單</button>');
        $btn.on('click', function () {
            if (!window.SugarCube || !Dialog) return;
            Dialog.setup('作弊選單', 'cot-cheat-menu');
            Dialog.wiki(CHEAT_MENU);
            Dialog.open();
        });
        $wrap.append($btn);
        $block.prepend($wrap);
    });

})();
