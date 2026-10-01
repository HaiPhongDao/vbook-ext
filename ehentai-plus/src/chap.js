load('config.js');

// url = trang thumbnail của gallery (…/g/<gid>/<token>/?p=N)
// Trả về danh sách trang xem ảnh; mỗi ảnh được img.js lấy khi cần (đọc tới đâu tải tới đó).
function execute(url) {
    try {
        var k = galleryKey(url);
        if (!k) return Response.error("Link gallery không hợp lệ");
        var pm = /[?&]p=(\d+)/.exec(String(url));
        var html = getText(galleryUrl(k, pm ? parseInt(pm[1], 10) : 0));
        var doc = Html.parse(html);
        checkGalleryPage(html, doc);
        var links = doc.select("#gdt a[href*='/s/']");
        var data = [], seen = {};
        for (var i = 0; i < count(links); i++) {
            var href = String(links.get(i).attr("href"));
            if (seen[href]) continue;
            seen[href] = 1;
            data.push({ link: href, script: "img.js" });
        }
        if (!data.length) return Response.error("Không tìm thấy ảnh nào trong trang này");
        return Response.success(data);
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}
