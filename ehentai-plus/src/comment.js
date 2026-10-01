load('config.js');

// input = link gallery; trả về bình luận trên trang gallery
function execute(input, next) {
    try {
        var k = galleryKey(input);
        if (!k) return Response.success([], "");
        var doc = getDoc(galleryUrl(k, 0) + "&hc=1");   // hc=1: hiện tất cả bình luận
        var cs = doc.select("#cdiv .c1");
        var out = [];
        for (var i = 0; i < count(cs); i++) {
            var c = cs.get(i);
            var head = cellText(c, ".c3");
            var who = cellText(c, ".c3 a");
            var when = /Posted on (.+?)(?: by|$)/.exec(head);
            var score = cellText(c, ".c5 span");
            var body = c.select(".c6");
            out.push({
                name: who || "Ẩn danh",
                content: count(body) ? String(body.first().html()) : "",
                description: (when ? when[1] : "") + (score ? " · " + score : "")
            });
        }
        return Response.success(out, "");
    } catch (e) {
        return Response.error(String(e && e.message ? e.message : e));
    }
}
