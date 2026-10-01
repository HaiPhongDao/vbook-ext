load('config.js');

function tagSearch(ns, tag) {
    var q = tag.indexOf(" ") >= 0 ? ns + ":\"" + tag + "$\"" : ns + ":" + tag + "$";
    return mkInput({ src: "search", q: q });
}

function execute(url) {
    try {
        var k = galleryKey(url);
        if (!k) return Response.error("Link gallery không hợp lệ");
        var meta = apiGdata([k])[k.gid];
        if (!meta) return Response.error("Gallery đã bị xoá hoặc không còn tồn tại.");
        if (isBlocked(meta.tags, meta.title, meta.jp)) return Response.error(EH_BLOCK_MSG);
        var pr = readPrefs();

        // gom tag theo namespace
        var byNs = {};
        meta.tags.forEach(function (t) {
            var i = t.indexOf(":");
            var ns = i > 0 ? t.substring(0, i) : "temp";
            var v = i > 0 ? t.substring(i + 1) : t;
            (byNs[ns] = byNs[ns] || []).push(v);
        });
        var nsList = EH_NS_ORDER.slice();
        for (var ns0 in byNs) if (byNs.hasOwnProperty(ns0) && nsList.indexOf(ns0) < 0) nsList.push(ns0);

        var desc = [];
        if (meta.jp && meta.jp !== meta.title) desc.push("<b>" + escHtml(pr.jp ? meta.title : meta.jp) + "</b>");
        var genres = [];
        nsList.forEach(function (ns) {
            var list = byNs[ns];
            if (!list) return;
            desc.push("<b>" + escHtml(EH_NS_LABEL[ns] || ns) + ":</b> " + escHtml(list.join(", ")));
            list.forEach(function (v) {
                if (ns === "language" && EH_LANG_META[v]) return;
                var short = { female: "f:", male: "m:", mixed: "x:", other: "o:" }[ns] || "";
                genres.push({ title: short + v, input: tagSearch(ns, v), script: "gen.js" });
            });
        });

        var info = [];
        info.push("📂 " + escHtml(meta.cat));
        info.push("📄 " + meta.pages + " trang");
        if (meta.rating) info.push("★ " + meta.rating.toFixed(2));
        if (meta.posted) info.push("📅 " + fmtDate(meta.posted));
        if (meta.size) info.push("💾 " + fmtSize(meta.size));
        if (meta.up) info.push("👤 " + escHtml(meta.up));
        if (meta.exp) info.push("⚠ Đã bị gỡ khỏi danh sách");

        var authors = (byNs.artist || []).concat(byNs.group || []);
        var suggests = [];
        (byNs.artist || []).slice(0, 3).forEach(function (a) {
            suggests.push({ title: "Cùng tác giả: " + a, input: tagSearch("artist", a), script: "gen.js" });
        });
        (byNs.group || []).slice(0, 2).forEach(function (g) {
            suggests.push({ title: "Cùng nhóm: " + g, input: tagSearch("group", g), script: "gen.js" });
        });
        (byNs.parody || []).filter(function (p) { return p !== "original"; }).slice(0, 2).forEach(function (p) {
            suggests.push({ title: "Cùng parody: " + p, input: tagSearch("parody", p), script: "gen.js" });
        });
        if (meta.up) suggests.push({ title: "Cùng người đăng: " + meta.up, input: mkInput({ src: "search", q: "uploader:" + (meta.up.indexOf(" ") >= 0 ? "\"" + meta.up + "\"" : meta.up) }), script: "gen.js" });

        return Response.success({
            name: pr.jp && meta.jp ? meta.jp : meta.title,
            cover: meta.thumb,
            author: authors.length ? authors.join(", ") : meta.up,
            description: desc.join("<br>"),
            detail: info.join("<br>"),
            host: EH,
            url: readerUrl(k),
            type: "comic",
            format: "comic",
            ongoing: /ongoing|連載|连载/i.test(meta.title + " " + meta.jp),
            nsfw: true,
            locale: galleryLocale(meta),
            genres: genres,
            suggests: suggests,
            comment: { title: "Bình luận", input: readerUrl(k), script: "comment.js" }
        });
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}
