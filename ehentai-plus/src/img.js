// url = trang xem ảnh /s/<imgkey>/<gid>-<số trang>
// vBook cần script ảnh trả về DỮ LIỆU ẢNH (Graphics.createImage), không phải URL.
var EH_REFERER = "https://e-hentai.org/";

function imgSrc(html) {
    var doc = Html.parse(html);
    var img = doc.select("#img");
    if (img && (img.size ? img.size() : img.length)) {
        var s = String(img.first().attr("src") || "");
        if (s) return s;
    }
    var m = /<img[^>]+id="img"[^>]+src="([^"]+)"/.exec(html) || /<img[^>]+src="([^"]+)"[^>]+id="img"/.exec(html);
    return m ? m[1].replace(/&amp;/g, "&") : "";
}

function loadImage(src) {
    if (!src) return null;
    var r = fetch(src, { headers: { "Referer": EH_REFERER } });
    if (r && r.ok) return Graphics.createImage(r.base64());
    return null;
}

function execute(url) {
    try {
        var r = fetch(url, { headers: { "Referer": EH_REFERER } });
        if (!r || !r.ok) return null;
        var html = String(r.text());
        var image = loadImage(imgSrc(html));
        if (image) return image;

        // server H@H lỗi → xin server khác qua tham số nl (giống nút "Reload broken image")
        var nl = /nl\('([^']+)'\)/.exec(html);
        if (!nl) return null;
        var r2 = fetch(url + (url.indexOf("?") >= 0 ? "&" : "?") + "nl=" + nl[1], { headers: { "Referer": EH_REFERER } });
        if (!r2 || !r2.ok) return null;
        return loadImage(imgSrc(String(r2.text())));
    } catch (e) {
        return null;
    }
}
