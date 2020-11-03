/*
东东工厂
更新时间：2020-10-31 17:18

[task_local]
# 东东工厂
*/
const $ = new Env('京东工厂');
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let cookiesArr = [],
    cookie = '';
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
} else {
    cookiesArr.push($.getdata('CookieJD'));
    cookiesArr.push($.getdata('CookieJD2'));
}
let message = '',
    subTitle = '',
    shareCodes = ['P04z54XCjVWnYaS5m9cZ2esjHVDlwcfuXNvEN4'];
const JD_API_HOST = 'https://api.m.jd.com/client.action'

!(async() => {
    if (!cookiesArr[0]) {
        $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', { "open-url": "https://bean.m.jd.com/" });
        return;
    }
    for (let i = 0; i < cookiesArr.length; i++) {
        if (cookiesArr[i]) {
            cookie = cookiesArr[i];
            $.UserName = $.factoryInfo.data.result.UserName;
            $.errorMsg = '';
            await jdFactory();
            await jdfactory_getTaskDetail();
            console.log(`\n===============开始【京东账号${$.UserName}】==================\n`);
            //console.log(`互助码: ` + $.factoryInfo.data.result.);
            await doDailyTask();
            await meetList();
            await shopList();
            await followList();
            await invited();
            await collectElectricity();
            await DailyElectricity();
            await addEnergy();
            await showMsg();
        }
    }
})()
.catch((e) => {
    $.log('', `❌ ${$.UserName}, 失败! 原因: ${e}!`, '')
})

.finally(() => {
    $.done();
})

function showMsg() {
    if ($.isLogin) {
        $.log(`\n${message}\n`);
        jdNotify = $.getdata('jdSpeedNotify') ? $.getdata('jdSpeedNotify') : jdNotify;
        if (!jdNotify || jdNotify === 'false') {
            $.msg($.name, subTitle, `【京东账号${$.index}】${UserName}\n` + message);
        }
    }
}
async function jdFactory() {
    await initForfactory();
    if ($.factoryInfo.data.result.haveProduct === 1) {
        console.log(`\n【产品名称】${$.factoryInfo.data.result.factoryInfo.name}` + `  剩余:${$.factoryInfo.data.result.factoryInfo.couponCount}`);
        subTitle = `【产品名称】${$.factoryInfo.data.result.factoryInfo.name}` + `  剩余:${$.factoryInfo.data.result.factoryInfo.couponCount}`
    } else if ($.factoryInfo.data.result.haveProduct === 0) {
        //未开始生产新商品
        $.msg($.name, `【提醒⏰】请重新选择产品`);
        if ($.isNode()) {
            await notify.sendNotify(`${$.name}请重新选择产品`);
        }
        return
    }
}

//初始化
async function initForfactory() {
    return new Promise(resolve => {
        $.get(taskUrl('jdfactory_getHomeData'), async(err, resp, data) => {
            try {
                if (err) {
                    console.log('\n东东工厂: API查询请求失败 ‼️‼️');
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    $.factoryInfo = JSON.parse(data);
                    if ($.factoryInfo.code === 0) {
                        console.log('-----初始化：' + $.factoryInfo.data.bizMsg + '-----');
                        $.UserName = $.factoryInfo.data.result.UserName;
                    } else {
                        console.log('-----初始化：' + $.factoryInfo.msg + '-----');
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

//获取任务信息
function jdfactory_getTaskDetail() {
    return new Promise(resolve => {
        $.get(taskUrl('jdfactory_getTaskDetail'), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        $.homeData = JSON.parse(data);
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

//每日签到
async function doDailyTask() {
    console.log('-----开始签到------');
    if ($.homeData.data.result.taskVos[0].times === $.homeData.data.result.taskVos[0].maxTimes) {
        console.log('任务已经做过了');
    } else {
        await signForFactory();
        if ($.signResult.data.bizMsg === "0") {
            console.log(`【签到成功】获得${$.signResult.result.score}⚡电量`)
        } else {
            console.log(`签到结果:  ${JSON.stringify($.signResult.msg)}`);
        }
        console.log('-----休息一下-----');
        await sleep(5000);
    }
}

//逛板块
async function meetList() {
    console.log('-----开始逛板块-----');
    if ($.homeData.data.result.taskVos[3].times === $.homeData.data.result.taskVos[3].maxTimes) {
        console.log('任务已经做过了');
    } else {
        for (i = 0; i < $.homeData.data.result.taskVos[3].maxTimes; i++) {
            await meetForFactory(i);
            await jdfactory_getTaskDetail();
            console.log($.homeData.data.result.taskVos[3].shoppingActivityVos[i].title + '  ' + $.homeData.data.result.taskVos[3].times + '/' + $.homeData.data.result.taskVos[3].maxTimes);
            if ($.meetResult.data.bizMsg === "0") {
                console.log(`任务执行成功获得${$.meetResult.result.score}⚡电量`)
            } else {
                console.log(`任务执行结果: ${JSON.stringify($.meetResult.data.bizMsg)}`);
            }
            await sleep(2000);
        }
        console.log('-----休息一下-----');
        await sleep(5000);
    }
}

// 逛商品
async function shopList() {
    console.log('-----开始逛商品-----');
    if ($.homeData.data.result.taskVos[4].times === $.homeData.data.result.taskVos[4].maxTimes) {
        console.log('任务已经做过了');
    } else {
        for (i = 0; i < $.homeData.data.result.taskVos[4].maxTimes; i++) {
            await shopForFactory(i);
            await jdfactory_getTaskDetail();
            console.log('任务次数  ' + $.homeData.data.result.taskVos[4].times + '/' + $.homeData.data.result.taskVos[4].maxTimes);
            if ($.shopResult.data.bizMsg === "0") {
                console.log(`任务执行成功获得${$.shopResult.data.result.score}⚡电量`)
            } else {
                console.log(`任务执行结果: ${JSON.stringify($.shopResult.data.bizMsg)}`);
            }
            await sleep(8000);
        }
        console.log('-----休息一下-----');
        await sleep(5000);
    }
}

// 关注店铺
async function followList() {
    console.log('-----关注店铺-----');
    if ($.homeData.data.result.taskVos[5].times === $.homeData.data.result.taskVos[5].maxTimes) {
        console.log('任务已经做过了');
    } else {
        for (i = 0; i < $.homeData.data.result.taskVos[5].maxTimes; i++) {
            await followShop(i);
            await jdfactory_getTaskDetail();
            console.log('任务次数: ' + $.homeData.data.result.taskVos[5].times + '/' + $.homeData.data.result.taskVos[5].maxTimes);
            if ($.finishfollow.data.bizMsg === "0") {
                console.log(`任务执行成功获得${$.finishfollow.data.result.score}⚡电量`);
            } else {
                console.log(`任务执行结果:  ${JSON.stringify($.finishfollow.data.bizMsg)}`);
            }
            await sleep(2000);
        }
        console.log('-----休息一下-----');
        await sleep(5000);
    }
}



// 签到API
async function signForFactory() {
    const functionId = 'jdfactory_collectScore';
    const taskToken = $.homeData.data.result.taskVos[0].simpleRecordInfoVo.taskToken;
    const body = `'taskToken':'${taskToken}'`;
    const host = `api.m.jd.com`;
    $.signResult = await request(functionId, body, host, 'application/x-www-form-urlencoded');
}

// 逛一逛API
async function meetForFactory(i) {
    const functionId = 'jdfactory_collectScore';
    const taskToken = $.homeData.data.result.taskVos[3].shoppingActivityVos[i].taskToken;
    const body = `'taskToken':'${taskToken}'`;
    const host = `api.m.jd.com`;
    $.meetResult = await request(functionId, body, host);
}

// 逛商品API
async function shopForFactory(i) {
    const functionId = 'jdfactory_collectScore';
    const taskToken = $.homeData.data.result.taskVos[4].productInfoVos[i].taskToken;
    const body = `'taskToken':'${taskToken}'`;
    const host = `api.m.jd.com`;
    $.shopResult = await request(functionId, body, host);
}

//关注店铺api
async function followShop(i) {
    const functionId = 'followShop';
    const shopId = $.homeData.data.result.taskVos[5].followShopVo[i].shopId;
    const host = `api.m.jd.com`;
    const body = `"follow":"true",'shopId':'${shopId}',"award":"false","sourceRpc":"shop_app_home_follow"`;
    $.followShop = await request(functionId, body, host);
    await finishfollow(i);
}

async function finishfollow() {
    const functionId = 'jdfactory_collectScore';
    const taskToken = $.homeData.data.result.taskVos[5].followShopVo[i].taskToken;
    const body = `'taskToken':'${taskToken}'`;
    const host = `api.m.jd.com`;
    $.finishfollow = await request(functionId, body, host);
}

// 充电
async function addEnergy() {
    if ($.factoryInfo.data.result.factoryInfo.totalScore === $.homeData.data.result.userScore) {
        return new Promise(resolve => {
            $.post(taskUrl('jdfactory_addEnergy'), async(err, resp, data) => {
                try {
                    if (err) {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    } else {
                        if (data) {
                            $.addEnergy = JSON.parse(data);
                            console.log($.addEnergy);
                            if ($.addEnergy.data.bizCode === 0) {
                                console.log('充电成功');
                            } else {
                                console.log($.addEnergy.data.bizMsg);
                            }
                        } else {
                            console.log(`京东服务器返回空数据`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp)
                } finally {
                    resolve();
                }
            })
        })
    } else {
        await jdfactory_getTaskDetail();
        console.log('当前电量⚡ :' + $.homeData.data.result.userScore + '  需要电量⚡ :' + $.factoryInfo.data.result.factoryInfo.totalScore);
        $.msg('东东工厂', subTitle, '\n 当前电量⚡ :' + $.homeData.data.result.userScore + '  需要电量⚡ :' + $.factoryInfo.data.result.factoryInfo.totalScore);
    }
}

//收集电量
async function collectElectricity() {
    return new Promise(resolve => {
        $.post(taskUrl('jdfactory_collectElectricity'), async(err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    if (data) {
                        $.addEnergy = JSON.parse(data);
                        if ($.addEnergy.data.bizCode === 0) {
                            console.log('收集成功');
                        } else {
                            console.log($.addEnergy.data.bizMsg);

                        }
                    } else {
                        console.log(`京东服务器返回空数据`)
                    }
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

//每日巡厂API
async function DailyElectricity() {
    const time = new Date();
    var now = time.getHours();
    if (10 <= now <= 13) {
        if ($.homeData.data.result.taskVos[7].times === $.homeData.data.result.taskVos[7].maxTimes) {
            console.log('任务已经做过了');
        } else {
            const functionId = 'jdfactory_collectScore';
            const taskToken = $.homeData.data.result.taskVos[7].threeMealInfoVos.taskToken;
            const body = `'taskToken':'${taskToken}'`;
            const host = `api.m.jd.com`;
            $.DailyElectricityResult = await request(functionId, body, host);
            if ($.DailyElectricityResult.data.bizCode === 0) {
                console.log($.DailyElectricityResult.data.bizMsg);
            } else {
                console.log($.DailyElectricityResult.data.bizMsg);
            }
        }
    }
}

//助力
async function invited() {
    const function_id = 'collectFriendRecordColor';
    return new Promise((resolve) => {
        let url = {
            url: `${JD_API_HOST}?functionId=${function_id}`,
            headers: {
                'Origin': `https://h5.m.jd.com`,
                'Cookie': cookie,
                'Connection': `keep-alive`,
                'Referer': `https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html`,
                'Host': 'api.m.jd.com',
                'Accept-Encoding': `gzip, deflate, br`,
                'Accept-Language': `zh-cn`,
                'Content-Type': `application/x-www-form-urlencoded`,
                'User-Agent': `jdapp;iPhone;9.2.0;14.1;`
            },
            body: `functionId=${function_id}$body={${shareCodes}}&client=wh5&clientVersion=1.0.0`
        }
        $.post(url, async(err, resp, data) => {
            try {
                data = JSON.parse(data);
                console.log($.data);
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

function request(functionId, body, host, ContentType) {
    return new Promise(resolve => {
        $.post(taskPostUrl(functionId, body, host, ContentType), (err, resp, data) => {
            try {
                if (err) {
                    console.log('\n京东工厂: API查询请求失败 ‼️‼️')
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    data = JSON.parse(data);
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function taskUrl(function_id, body = {}) {
    return {
        url: `${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&clientVersion=1.0.0&client=wh5`,
        headers: {
            'Origin': `https://h5.m.jd.com`,
            'Cookie': cookie,
            'Connection': `keep-alive`,
            'Referer': `https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html`,
            'Host': 'api.m.jd.com',
            'Accept-Encoding': `gzip, deflate, br`,
            'Accept-Language': `zh-cn`,
            'Content-Type': `application/x-www-form-urlencoded`,
            'User-Agent': `jdapp;iPhone;9.2.0;14.1;`
        }
    }
}

function taskPostUrl(functionId, body, host, ContentType) {
    return {
        url: `${JD_API_HOST}?functionId=${functionId}`,
        headers: {
            'Origin': `https://h5.m.jd.com`,
            'Cookie': cookie,
            'Connection': `keep-alive`,
            'Referer': `https://h5.m.jd.com/babelDiy/Zeus/2uSsV2wHEkySvompfjB43nuKkcHp/index.html`,
            'Host': host,
            'Accept-Encoding': `gzip, deflate, br`,
            'Accept-Language': `zh-cn`,
            'Content-Type': ContentType,
            'User-Agent': `jdapp;iPhone;9.2.0;14.1;`
        },
        body: `functionId=${functionId}&body={${body}}&client=wh5&clientVersion=1.0.0`
    }
}

const sleep = (timeountMS) => new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
});

// prettier-ignore
function Env(t, e) {
    class s {
        constructor(t) { this.env = t }
        send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) }
        get(t) { return this.send.call(this.env, t) }
        post(t) { return this.send.call(this.env, t, "POST") }
    }
    return new class {
        constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) }
        isNode() { return "undefined" != typeof module && !!module.exports }
        isQuanX() { return "undefined" != typeof $task }
        isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon }
        isLoon() { return "undefined" != typeof $loon }
        toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } }
        toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } }
        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try { s = JSON.parse(this.getdata(t)) } catch {}
            return s
        }
        setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } }
        getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) }
        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), a = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } };
                this.post(a, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }
        loaddata() {
            if (!this.isNode()) return {}; {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e);
                if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } }
            }
        }
        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile),
                    e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t),
                    i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }
        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i)
                if (r = Object(r)[t], void 0 === r) return s;
            return r
        }
        lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) }
        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) { e = "" }
            }
            return e
        }
        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }
        getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null }
        setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null }
        initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) }
        get(t, e = (() => {})) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) { this.logErr(t) }
            }).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => {
                const { message: s, response: i } = t;
                e(s, i, i && i.body)
            }))
        }
        post(t, e = (() => {})) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => {!t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) });
            else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => {
                const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                e(null, { status: s, statusCode: i, headers: r, body: o }, o)
            }, t => e(t));
            else if (this.isNode()) {
                this.initGotEnv(t);
                const { url: s, ...i } = t;
                this.got.post(s, i).then(t => {
                    const { statusCode: s, statusCode: i, headers: r, body: o } = t;
                    e(null, { status: s, statusCode: i, headers: r, body: o }, o)
                }, t => {
                    const { message: s, response: i } = t;
                    e(s, i, i && i.body)
                })
            }
        }
        time(t) { let e = { "M+": (new Date).getMonth() + 1, "d+": (new Date).getDate(), "H+": (new Date).getHours(), "m+": (new Date).getMinutes(), "s+": (new Date).getSeconds(), "q+": Math.floor(((new Date).getMonth() + 3) / 3), S: (new Date).getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length))); for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length))); return t }
        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"],
                            s = t.mediaUrl || t["media-url"];
                        return { openUrl: e, mediaUrl: s }
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl,
                            s = t["media-url"] || t.mediaUrl;
                        return { "open-url": e, "media-url": s }
                    }
                    if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
            let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
            h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
        }
        log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) }
        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
        }
        wait(t) { return new Promise(e => setTimeout(e, t)) }
        done(t = {}) {
            const e = (new Date).getTime(),
                s = (e - this.startTime) / 1e3;
            this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}