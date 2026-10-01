load('config.js');

// Chia gallery thành các "chương" theo trang thumbnail (thường 20–40 ảnh / chương)
function execute(url) {
    try {
        var k = galleryKey(url);
        if (!k) return Response.error("Link gallery không hợp lệ");
        var html = galleryHtml(k, "");
        var doc = Html.parse(html);
        checkGalleryPage(html, doc);

        var per = 0, seen = {};
        var links = doc.select("#gdt a[href*='/s/']");
        for (var i = 0; i < count(links); i++) {
            var h = String(links.get(i).attr("href"));
            if (!seen[h]) { seen[h] = 1; per++; }
        }
        if (!per) return Response.error("Không đọc được danh sách ảnh");

        var total = 0;
        var m = /of\s+([\d,]+)\s+image/i.exec(cellText(doc, ".gpc"));
        if (m) total = parseInt(m[1].replace(/,/g, ""), 10);
        if (!total) {
            var lm = /([\d,]+)\s+pages?/i.exec(cellText(doc, "#gdd"));
            if (lm) total = parseInt(lm[1].replace(/,/g, ""), 10);
        }
        if (!total || total < per) total = per;

        var n = Math.ceil(total / per);
        var base = readerUrl(k);
        if (n <= 1) return Response.success([{ name: "Đọc · " + total + " trang", url: base, host: EH }]);
        var data = [];
        for (var p = 0; p < n; p++) {
            var from = p * per + 1, to = Math.min((p + 1) * per, total);
            data.push({ name: "Trang " + from + "–" + to, url: p ? base + "?p=" + p : base, host: EH });
        }
        return Response.success(data);
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}
