load('config.js');

// url = trang thumbnail của gallery (…/g/<gid>/<token>/?p=N)
// Mặc định: tự lấy link ảnh thật của cả chương rồi trả về mảng URL (định dạng chuẩn của vBook).
// Tuỳ chọn "Từng ảnh khi đọc": trả về {link, script: "img.js"} để vBook lấy từng ảnh khi cần.

function viewerImgSrc(html) {
    var m = /<img[^>]+id="img"[^>]+src="([^"]+)"/.exec(html) || /<img[^>]+src="([^"]+)"[^>]+id="img"/.exec(html);
    return m ? decodeEntities(m[1]) : "";
}

// lấy link ảnh qua API showpage (JSON nhỏ, nhanh hơn tải cả trang /s/)
function showpage(gid, page, imgkey, showkey) {
    try {
        var r = fetch(EH_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method: "showpage", gid: gid, page: page, imgkey: imgkey, showkey: showkey })
        });
        if (!r || !r.ok) return "";
        var j = JSON.parse(String(r.text()));
        return j && j.i3 ? viewerImgSrc(String(j.i3)) : "";
    } catch (e) {
        return "";
    }
}

function resolveAll(pages) {
    var out = [], showkey = "";
    for (var i = 0; i < pages.length; i++) {
        var p = pages[i], src = "";
        if (showkey) src = showpage(p.gid, p.page, p.imgkey, showkey);
        if (!src) {                                      // trang đầu, hoặc API lỗi → tải trang /s/
            var html = getText(p.url);
            var sk = /showkey\s*=\s*"([^"]+)"/.exec(html);
            if (sk) showkey = sk[1];
            src = viewerImgSrc(html);
        }
        if (src) out.push(src);
    }
    return out;
}

function execute(url) {
    try {
        var k = galleryKey(url);
        if (!k) return Response.error("Link gallery không hợp lệ");
        var pm = /[?&]p=(\d+)/.exec(String(url));
        var html = getText(galleryUrl(k, pm ? parseInt(pm[1], 10) : 0));
        var doc = Html.parse(html);
        checkGalleryPage(html, doc);

        var links = doc.select("#gdt a[href*='/s/']");
        var pages = [], seen = {};
        for (var i = 0; i < count(links); i++) {
            var href = String(links.get(i).attr("href"));
            var m = /\/s\/([0-9a-f]+)\/(\d+)-(\d+)/.exec(href);
            if (!m || seen[href]) continue;
            seen[href] = 1;
            pages.push({ url: href, imgkey: m[1], gid: parseInt(m[2], 10), page: parseInt(m[3], 10) });
        }
        if (!pages.length) return Response.error("Không tìm thấy ảnh nào trong trang này");

        if (cfgGet("eh_img_mode", "Tải trước cả chương") === "Từng ảnh khi đọc") {
            return Response.success(pages.map(function (p) { return { link: p.url, script: "img.js" }; }));
        }
        var imgs = resolveAll(pages);
        if (!imgs.length) return Response.error("Không lấy được link ảnh");
        return Response.success(imgs);
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}
