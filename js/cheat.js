(function () {
    'use strict';

    // ===== 命名空間 =====
    var CotCheat = window.CotCheat = window.CotCheat || {};

    // ===== SC2 就緒後安裝所有 hook =====
    // :storyready 在 SugarCube 完整初始化後、第一個段落渲染前觸發，
    // 此時 setup.* 與 Person.prototype 均已定義完畢。
    $(document).one(':storyready', function () {

        // --- 時間停止 / 倍速 ---
        var _origAT = setup.Time.advance_time.bind(setup.Time);
        setup.Time.advance_time = function (minutes) {
            var V = State.variables;
            if (V.cotTimeStop) return;
            if (V.cotTimeMult) {
                var mult = Number(V.cotTimeMultVal) || 1;
                minutes = Math.round(minutes * mult);
                if (minutes <= 0) return;
            }
            _origAT(minutes);
        };

        // --- 需求鎖定 ---
        ['decay_need', 'decrease_need'].forEach(function (fn) {
            if (!setup.Needs || !setup.Needs[fn]) return;
            var orig = setup.Needs[fn];
            setup.Needs[fn] = function () {
                if (State.variables.cotNeedsLock) return;
                return orig.apply(this, arguments);
            };
        });

        // --- 繞過暴露癖限制 ---
        ['get_error_dress_code', 'get_error_exhibitionism'].forEach(function (fn) {
            if (!Person || !Person.prototype || !Person.prototype[fn]) return;
            var orig = Person.prototype[fn];
            Person.prototype[fn] = function () {
                if (State.variables.cotNudist) return null;
                return orig.apply(this, arguments);
            };
        });

        console.log('[CotCheatMod] hooks installed');
    });

    // ===== 技能輔助函數 =====
    CotCheat.fillSkills = function () {
        var V = State.variables;
        var skills = setup.Skills.all_skills();
        if (!V.pcskills) V.pcskills = {};
        skills.forEach(function (n) { V.pcskills[n] = 1000; });
    };

    CotCheat.resetSkills = function () {
        var V = State.variables;
        var skills = setup.Skills.all_skills();
        if (V.pcskills) skills.forEach(function (n) { V.pcskills[n] = 0; });
    };

    // ===== 事件瀏覽器 =====
    CotCheat.openEventBrowser = function () {
        Dialog.setup('事件瀏覽器', 'cot-event-browser');
        Dialog.wiki(CotCheat._EVENT_BROWSER);
        Dialog.open();
    };

    CotCheat._EVENT_BROWSER = [
        '<<if ndef $cheatevtag>><<set $cheatevtag to "campus walk">><</if>>',
        '<b>事件瀏覽器</b>',
        '<br>選擇標籤以篩選事件。點擊事件名稱可直接前往。',
        '<br><i>注意：部分事件需要特定 NPC 或場景才能正確執行。</i><br><br>',
        '<<set _tagcounts to {}>>',
        '<<for _ev range setup.Events.db>>',
        '<<for _t range _ev.tags>>',
        '<<run (_t in _tagcounts) ? _tagcounts[_t]++ : (_tagcounts[_t] = 1)>>',
        '<</for>><</for>>',
        '<<set _displaytags to []>>',
        '<<for _t range Object.keys(_tagcounts).sort()>>',
        '<<if _tagcounts[_t] gte 10>><<run _displaytags.push(_t)>><</if>>',
        '<</for>>',
        '<b>標籤（≥10 個事件）：</b><br>',
        '<<for _t range _displaytags>>',
        '<<capture _t>>',
        '<<link _t>>',
        '<<set $cheatevtag to _t>>',
        '<<replace "#cot-evt-list">>',
        '<<set _c to 0>>',
        '<<for _ev range setup.Events.db>>',
        '<<if _ev.tags.includes($cheatevtag)>>',
        '<<set _c++>><<capture _ev>><<link _ev.passage _ev.passage>><</link>><br><</capture>>',
        '<</if>><</for>>',
        '"<<= $cheatevtag>>" 共 <<= _c>> 個事件。',
        '<</replace>>',
        '<</link>><</capture>> | ',
        '<</for>><br><br>',
        '<div id="cot-evt-list" style="max-height:350px;overflow-y:auto;">',
        '<<set _c to 0>>',
        '<<for _ev range setup.Events.db>>',
        '<<if _ev.tags.includes($cheatevtag)>>',
        '<<set _c++>><<capture _ev>><<link _ev.passage _ev.passage>><</link>><br><</capture>>',
        '<</if>><</for>>',
        '"<<= $cheatevtag>>" 共 <<= _c>> 個事件。',
        '</div>'
    ].join('');

    // ===== 作弊選單 =====
    CotCheat.openMenu = function () {
        Dialog.setup('作弊選單', 'cot-cheat-menu');
        Dialog.wiki(CotCheat._MENU);
        Dialog.open();
    };

    CotCheat._MENU = [
        // 初始化 flag 變數
        '<<if ndef $cotTimeStop>><<set $cotTimeStop to false>><</if>>',
        '<<if ndef $cotNeedsLock>><<set $cotNeedsLock to false>><</if>>',
        '<<if ndef $cotNudist>><<set $cotNudist to false>><</if>>',
        '<<if ndef $cotTimeMult>><<set $cotTimeMult to false>><</if>>',
        '<<if ndef $cotTimeMultVal>><<set $cotTimeMultVal to 1>><</if>>',

        // 快速開關
        '<b>CoT 作弊選單</b><br>',
        '<table class="options-table"><tr>',
        '<td class="options-col-label" style="width:13em;">快速開關</td>',
        '<td class="options-col-content" style="text-align:left;">',
        '<label><<checkbox "$cotTimeStop" false true autocheck>> 停止時間（凍結所有時間推進）</label><br>',
        '<label><<checkbox "$cotNeedsLock" false true autocheck>> 鎖定需求（防止所有需求下降）</label><br>',
        '<label><<checkbox "$cotNudist" false true autocheck>> 繞過暴露癖限制（裸體自由行動）</label>',
        ' <span class="ungood">⚠ 可能造成 Bug</span><br>',
        '<label><<checkbox "$cotTimeMult" false true autocheck>> 時間倍速</label>',
        '<<if $cotTimeMult>>',
        '&nbsp;<<link "0.5x">><<set $cotTimeMultVal to 0.5>><</link>>',
        ' <<link "1x">><<set $cotTimeMultVal to 1>><</link>>',
        ' <<link "2x">><<set $cotTimeMultVal to 2>><</link>>',
        ' <<link "5x">><<set $cotTimeMultVal to 5>><</link>>',
        '&nbsp;（目前：<<= $cotTimeMultVal>>x）',
        '<</if>>',
        '</td></tr></table><br>',

        // 技能（呼叫命名函數，不再用 inline IIFE）
        '<b>技能</b><br>',
        '<<button "全滿技能">><<run CotCheat.fillSkills()>><</button>>',
        '&nbsp;',
        '<<button "重置技能">><<run CotCheat.resetSkills()>><</button>>',
        '<br><br>',

        // 時間控制
        '<b>時間控制</b><br>',
        '目前：<<= setup.Time.clock()>> | <<= setup.Time.weekday()>>，第 <<= $gameday>> 天<br>',
        '<div class="two-column-container">',
        '<div class="two-column">',
        '<<link "+30 分鐘">><<run setup.Time.advance_time(30)>><</link>><br>',
        '<<link "+1 小時">><<run setup.Time.advance_time(60)>><</link>><br>',
        '<<link "+4 小時">><<run setup.Time.advance_time(240)>><</link>><br>',
        '<<link "+8 小時">><<run setup.Time.advance_time(480)>><</link>><br>',
        '<<link "+1 天">><<run setup.Time.advance_time(1440)>><</link>>',
        '</div>',
        '<div class="two-column">',
        '<<link "跳至早上 8 時">><<run setup.Time.advance_time(((480-$hour*60-$minute)%1440+1440)%1440||1440)>><</link>><br>',
        '<<link "跳至正午">><<run setup.Time.advance_time(((720-$hour*60-$minute)%1440+1440)%1440||1440)>><</link>><br>',
        '<<link "跳至下午 3 時">><<run setup.Time.advance_time(((900-$hour*60-$minute)%1440+1440)%1440||1440)>><</link>><br>',
        '<<link "跳至晚上 7 時">><<run setup.Time.advance_time(((1140-$hour*60-$minute)%1440+1440)%1440||1440)>><</link>><br>',
        '<<link "跳至午夜">><<run setup.Time.advance_time(((1440-$hour*60-$minute)%1440+1440)%1440||1440)>><</link>>',
        '</div></div><br>',

        // 跳至指定時間
        '<<if ndef $cotJumpHour>><<set $cotJumpHour to 12>><</if>>',
        '跳至指定時間：<<textbox "$cotJumpHour" $cotJumpHour "nosubmit">>',
        ' <<button "前往">><<run setup.Time.advance_time(((Number($cotJumpHour)*60-$hour*60-$minute)%1440+1440)%1440||1440)>><</button>>',
        '&nbsp;（0–23）<br><br>',

        // 衣櫃 / 事件瀏覽器
        '<b>隨身衣櫃</b><br>',
        '<<link "開啟衣櫃" "Wardrobe">><</link>><br><br>',
        '<b>事件瀏覽器</b><br>',
        '<<button "瀏覽事件">><<run CotCheat.openEventBrowser()>><</button>>'
    ].join('');

})();
