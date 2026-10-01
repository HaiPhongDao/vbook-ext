// ================= E-Hentai Plus — thư viện dùng chung =================
// Viết theo ES5 để chạy được trên runtime Rhino của vBook.

var EH = "https://e-hentai.org";
var EH_API = "https://api.e-hentai.org/api.php";

var EH_CATS = ["Doujinshi", "Manga", "Artist CG", "Game CG", "Western", "Non-H", "Image Set", "Cosplay", "Asian Porn", "Misc"];
// bitmask f_cats của E-Hentai (bit bật = loại bỏ thể loại đó)
var EH_CAT_BIT = {
    "Misc": 1, "Doujinshi": 2, "Manga": 4, "Artist CG": 8, "Game CG": 16,
    "Image Set": 32, "Cosplay": 64, "Asian Porn": 128, "Non-H": 256, "Western": 512
};
var EH_LANG_CODE = {
    chinese: "ZH", english: "EN", japanese: "JP", korean: "KO", vietnamese: "VI", spanish: "ES",
    russian: "RU", french: "FR", thai: "TH", german: "DE", portuguese: "PT", italian: "IT", indonesian: "ID"
};
var EH_LANG_META = { "translated": 1, "rewrite": 1, "text cleaned": 1, "speechless": 1 };
var EH_NS_SHORT = {
    f: "female", m: "male", x: "mixed", o: "other", a: "artist", g: "group", p: "parody",
    c: "character", l: "language", r: "reclass", cos: "cosplayer", loc: "location"
};
var EH_NS_LABEL = {
    language: "Ngôn ngữ", parody: "Parody", character: "Nhân vật", group: "Nhóm", artist: "Tác giả",
    cosplayer: "Cosplayer", female: "Female", male: "Male", mixed: "Mixed", other: "Khác",
    location: "Địa điểm", reclass: "Reclass", temp: "Tạm"
};
var EH_NS_ORDER = ["artist", "group", "parody", "character", "cosplayer", "language", "female", "male", "mixed", "other", "location", "reclass", "temp"];

// Luôn chặn nội dung liên quan trẻ vị thành niên — cố định, không có tuỳ chọn tắt.
var EH_BLOCK_TAG = /(^|:)(lolicon|shotacon|toddlercon|oppai loli)$/i;
var EH_BLOCK_TITLE = /\bloli(?:con)?\b|\bshota(?:con)?\b|ロリ(?!ータ)|萝莉|蘿莉|ショタ|正太(?!郎)/i;
var EH_BLOCK_MSG = "Nội dung liên quan đến trẻ vị thành niên không được hỗ trợ.";

// ---------- cấu hình người dùng (plugin.json > config) ----------
function cfgGet(name, def) {
    var v;
    try { v = eval(name); } catch (e) { v = undefined; }
    if (v === undefined || v === null || String(v) === "") {
        try { if (typeof localConfig !== "undefined" && localConfig) v = localConfig.getItem(name); } catch (e2) { v = undefined; }
    }
    if (v === undefined || v === null) return def;
    v = String(v);
    return v === "" ? def : v;
}

function readPrefs() {
    var cats = cfgGet("eh_cats", "").split(",").map(trimStr).filter(function (c) { return EH_CAT_BIT[c]; });
    var lang = cfgGet("eh_lang", "Tất cả").toLowerCase();
    if (lang === "tất cả" || lang === "all") lang = "";
    return {
        cats: cats,
        lang: lang,
        minRating: parseFloat(cfgGet("eh_min_rating", "0")) || 0,
        hideAI: cfgGet("eh_hide_ai", "false") === "true",
        black: parseTerms(cfgGet("eh_blacklist", "")),
        jp: cfgGet("eh_jp_title", "false") === "true"
    };
}

// ---------- tiện ích ----------
function trimStr(s) { return String(s).replace(/^\s+|\s+$/g, ""); }
function count(els) {
    if (!els) return 0;
    if (typeof els.size === "function") return els.size();
    return els.length || 0;
}
function decodeEntities(s) {
    if (!s) return "";
    s = String(s);
    if (s.indexOf("&") < 0) return s;
    return s.replace(/&#x([0-9a-f]+);/gi, function (m, h) { return String.fromCharCode(parseInt(h, 16)); })
        .replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(parseInt(d, 10)); })
        .replace(/&quot;/g, "\"").replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function escHtml(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function pad2(n) { return n < 10 ? "0" + n : String(n); }
function fmtDate(sec) {
    if (!sec) return "";
    var d = new Date(sec * 1000);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
}
function fmtSize(b) {
    if (!b) return "";
    if (b >= 1073741824) return (b / 1073741824).toFixed(2) + " GB";
    if (b >= 1048576) return (b / 1048576).toFixed(1) + " MB";
    return Math.round(b / 1024) + " KB";
}

// input của gen.js: "src=top&tl=13&days=7"
function parseInput(s) {
    var o = {};
    String(s || "").split("&").forEach(function (kv) {
        var i = kv.indexOf("=");
        if (i > 0) o[kv.substring(0, i)] = decodeURIComponent(kv.substring(i + 1));
    });
    return o;
}
function mkInput(o) {
    var a = [];
    for (var k in o) if (o.hasOwnProperty(k) && o[k] !== undefined && o[k] !== "") a.push(k + "=" + encodeURIComponent(o[k]));
    return a.join("&");
}

function galleryKey(url) {
    var m = /\/g\/(\d+)\/([0-9a-f]{10})/.exec(String(url || ""));
    return m ? { gid: parseInt(m[1], 10), token: m[2] } : null;
}
// trang gallery chuẩn; p = trang thumbnail (0-based). nw=always bỏ qua màn cảnh báo nội dung.
function galleryUrl(k, p) {
    return EH + "/g/" + k.gid + "/" + k.token + "/?" + (p ? "p=" + p + "&" : "") + "nw=always";
}
function readerUrl(k) { return EH + "/g/" + k.gid + "/" + k.token + "/"; }

// ---------- mạng ----------
function getText(url) {
    var r = fetch(url);
    if (!r || !r.ok) throw new Error("Không tải được trang (HTTP " + (r ? r.status : "?") + ")");
    var t = String(r.text());
    if (/temporarily banned|IP address has been/i.test(t.substring(0, 3000))) {
        throw new Error("IP đang bị E-Hentai chặn tạm thời vì tải quá nhiều. Đợi một lúc rồi thử lại.");
    }
    return t;
}
function getDoc(url) { return Html.parse(getText(url)); }

function normMeta(g) {
    var tags = (g.tags || []).map(function (t) { return String(t).toLowerCase(); });
    return {
        gid: g.gid, token: g.token,
        title: decodeEntities(g.title), jp: decodeEntities(g.title_jpn || ""),
        cat: String(g.category || ""), thumb: String(g.thumb || ""), up: String(g.uploader || ""),
        posted: parseInt(g.posted, 10) || 0, pages: parseInt(g.filecount, 10) || 0,
        rating: parseFloat(g.rating) || 0, size: parseInt(g.filesize, 10) || 0,
        exp: !!g.expunged, tags: tags
    };
}

// API gdata: tối đa 25 gallery / lần
function apiGdata(keys) {
    var out = {};
    for (var i = 0; i < keys.length; i += 25) {
        var chunk = keys.slice(i, i + 25);
        try {
            var r = fetch(EH_API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ method: "gdata", gidlist: chunk.map(function (k) { return [k.gid, k.token]; }), namespace: 1 })
            });
            if (!r || !r.ok) continue;
            var j = JSON.parse(String(r.text()));
            (j.gmetadata || []).forEach(function (g) { if (g && !g.error) out[g.gid] = normMeta(g); });
        } catch (e) { /* API lỗi → dùng dữ liệu từ HTML */ }
    }
    return out;
}

// ---------- chặn & lọc ----------
function isBlocked(tags, title, jp) {
    for (var i = 0; i < tags.length; i++) if (EH_BLOCK_TAG.test(tags[i])) return true;
    return EH_BLOCK_TITLE.test(title || "") || EH_BLOCK_TITLE.test(jp || "");
}

function parseTerms(str) {
    return String(str || "").split(",").map(function (s) { return trimStr(s).toLowerCase(); })
        .filter(function (s) { return s; })
        .map(function (s) {
            var ns = null, val = s, i = s.indexOf(":");
            if (i > 0) { ns = trimStr(s.substring(0, i)); val = trimStr(s.substring(i + 1)); ns = EH_NS_SHORT[ns] || ns; }
            return { ns: ns, val: val };
        }).filter(function (t) { return t.val; });
}
function termHit(t, m) {
    if (t.ns) return m.tags.indexOf(t.ns + ":" + t.val) >= 0;
    for (var i = 0; i < m.tags.length; i++) {
        var tag = m.tags[i];
        if (tag.substring(tag.indexOf(":") + 1).indexOf(t.val) >= 0) return true;
    }
    return (m.title + " " + m.jp + " " + m.up).toLowerCase().indexOf(t.val) >= 0;
}
function langsOf(m) {
    var out = [];
    m.tags.forEach(function (t) {
        if (t.indexOf("language:") === 0) { var l = t.substring(9); if (!EH_LANG_META[l]) out.push(l); }
    });
    return out;
}

// opts: { cats: [...], days: n }   pr: readPrefs()
function passes(m, opts, pr) {
    if (isBlocked(m.tags, m.title, m.jp)) return false;
    if (opts.cats && opts.cats.length && m.cat && opts.cats.indexOf(m.cat) < 0) return false;
    if (opts.days && m.posted && m.posted < Date.now() / 1000 - opts.days * 86400) return false;
    if (pr.minRating && m.rating && m.rating < pr.minRating) return false;
    if (pr.hideAI) {
        for (var i = 0; i < m.tags.length; i++) if (/ai generated$/.test(m.tags[i])) return false;
        if (/ai[\s_-]?generated/i.test(m.title)) return false;
    }
    if (pr.lang) {
        var ls = langsOf(m);
        var ok = pr.lang === "japanese" ? (ls.length === 0 || ls.indexOf("japanese") >= 0) : ls.indexOf(pr.lang) >= 0;
        if (!ok) return false;
    }
    for (var j = 0; j < pr.black.length; j++) if (termHit(pr.black[j], m)) return false;
    return true;
}

function toItem(m, rank, pr) {
    var ls = langsOf(m);
    var bits = [];
    if (rank) bits.push("#" + rank);
    if (m.rating) bits.push("★" + m.rating.toFixed(1));
    if (m.pages) bits.push(m.pages + " tr");
    if (ls.length) bits.push(EH_LANG_CODE[ls[0]] || ls[0].substring(0, 2).toUpperCase());
    if (m.posted) bits.push(fmtDate(m.posted));
    return {
        name: pr.jp && m.jp ? m.jp : m.title,
        link: readerUrl(m),
        cover: m.thumb,
        description: bits.join(" · "),
        tag: m.cat,
        host: EH
    };
}

// ---------- đọc danh sách gallery từ HTML (toplist / popular / trang chủ / tìm kiếm) ----------
function cellText(row, sel) {
    var e = row.select(sel);
    return count(e) ? trimStr(e.first().text()) : "";
}
function parseRows(doc) {
    var out = [], seen = {};
    var rows = doc.select("table.itg tr, div.itg > div.gl1t");
    function add(row, a) {
        var k = galleryKey(a.attr("href"));
        if (!k || seen[k.gid]) return;
        seen[k.gid] = 1;
        var it = { gid: k.gid, token: k.token, title: "", cover: "", cat: "", posted: 0, tags: [] };
        if (row) {
            it.title = cellText(row, ".glink");
            var img = row.select("img");
            if (count(img)) {
                var src = String(img.first().attr("data-src") || "");
                if (src.indexOf("http") !== 0) src = String(img.first().attr("src") || "");
                it.cover = src;
            }
            it.cat = cellText(row, ".cn, .cs");
            var pd = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/.exec(cellText(row, "[id^=posted_]"));
            if (pd) it.posted = Date.UTC(+pd[1], +pd[2] - 1, +pd[3], +pd[4], +pd[5]) / 1000;
            var gts = row.select(".gt[title], .gtl[title]");
            for (var j = 0; j < count(gts); j++) it.tags.push(String(gts.get(j).attr("title")).toLowerCase());
        }
        out.push(it);
    }
    for (var i = 0; i < count(rows); i++) {
        var row = rows.get(i);
        var as = row.select("a[href*='/g/']");
        if (count(as)) add(row, as.first());
    }
    if (!out.length) {                          // giao diện lạ → quét mọi link gallery
        var links = doc.select("a[href*='/g/']");
        for (var x = 0; x < count(links); x++) add(null, links.get(x));
    }
    return out;
}

// gộp dữ liệu HTML + API, lọc, chuyển thành item của vBook
// rankBase >= 0: danh sách xếp hạng (hạng = rankBase + vị trí); -1: không hiện hạng
function collect(rows, opts, pr, rankBase) {
    if (!rows.length) return [];
    var meta = apiGdata(rows);
    var items = [];
    rows.forEach(function (r, idx) {
        var m = meta[r.gid] || {
            gid: r.gid, token: r.token, title: r.title, jp: "", cat: r.cat, thumb: r.cover, up: "",
            posted: r.posted, pages: 0, rating: 0, size: 0, exp: false, tags: r.tags
        };
        if (!m.title) return;
        if (!passes(m, opts, pr)) return;
        items.push(toItem(m, rankBase >= 0 ? rankBase + idx + 1 : 0, pr));
    });
    return items;
}

// ---------- các loại danh sách ----------
var EH_TOP_PAGES = 200;   // toplist có tối đa 200 trang × 50

function listOpts(o, pr) {
    var cats = o.cats ? String(o.cats).split(",") : (o.cfgcats === "1" ? pr.cats : []);
    return { cats: cats, days: parseInt(o.days, 10) || 0 };
}

function listTop(o, tok) {
    var pr = readPrefs(), opts = listOpts(o, pr);
    var p = parseInt(tok || "0", 10) || 0, fetched = 0, out = [];
    while (p < EH_TOP_PAGES) {
        var rows = parseRows(getDoc(EH + "/toplist.php?tl=" + o.tl + (p ? "&p=" + p : "")));
        fetched++;
        if (!rows.length) { p = EH_TOP_PAGES; break; }
        out = out.concat(collect(rows, opts, pr, p * 50));
        p++;
        // khi có bộ lọc, quét thêm vài trang để danh sách không bị thưa
        if (out.length >= 12 || fetched >= (out.length ? 4 : 10)) break;
        sleep(350);
    }
    return Response.success(out, p < EH_TOP_PAGES ? String(p) : "");
}

function listHot(o) {
    var pr = readPrefs(), opts = listOpts(o, pr);
    var rows = parseRows(getDoc(EH + "/popular"));
    return Response.success(collect(rows, opts, pr, 0), "");
}

function frontUrl(o, opts) {
    var q = [];
    if (opts.cats.length) {
        var keep = 0;
        opts.cats.forEach(function (c) { keep |= EH_CAT_BIT[c] || 0; });
        if (keep) q.push("f_cats=" + (1023 - keep));
    }
    if (o.q) q.push("f_search=" + encodeURIComponent(o.q));
    return EH + "/" + (q.length ? "?" + q.join("&") : "");
}

function listFront(o, tok) {
    var pr = readPrefs(), opts = listOpts(o, pr);
    var url = tok || frontUrl(o, opts), next = "", fetched = 0, out = [];
    while (url) {
        var doc = getDoc(url);
        fetched++;
        var rows = parseRows(doc);
        var a = doc.select("a#unext");
        next = count(a) ? String(a.first().attr("href") || "") : "";
        if (next && next.indexOf("http") !== 0) next = EH + (next.charAt(0) === "/" ? "" : "/") + next;
        out = out.concat(collect(rows, opts, pr, -1));
        if (!rows.length || !next) { next = ""; break; }
        if (out.length >= 12 || fetched >= (out.length ? 3 : 8)) break;
        url = next;
        sleep(350);
    }
    return Response.success(out, next);
}

function runList(input, tok) {
    var o = parseInput(input);
    try {
        if (o.src === "top") return listTop(o, tok);
        if (o.src === "hot") return listHot(o);
        return listFront(o, tok);              // "new" và "search"
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}

// ---------- trang gallery ----------
function pageTags(doc) {
    var tags = [];
    var rows = doc.select("#taglist tr");
    for (var i = 0; i < count(rows); i++) {
        var row = rows.get(i);
        var ns = cellText(row, "td.tc").replace(/:$/, "").toLowerCase();
        var links = row.select("a");
        for (var j = 0; j < count(links); j++) {
            var t = trimStr(links.get(j).text()).toLowerCase();
            if (t) tags.push((ns ? ns + ":" : "") + t);
        }
    }
    return tags;
}
function checkGalleryPage(html, doc) {
    if (/This gallery has been removed|Gallery not found|Key missing|pining for the fjords/i.test(html.substring(0, 20000))) {
        throw new Error("Gallery đã bị xoá hoặc không còn tồn tại.");
    }
    if (isBlocked(pageTags(doc), cellText(doc, "#gn"), cellText(doc, "#gj"))) throw new Error(EH_BLOCK_MSG);
}
