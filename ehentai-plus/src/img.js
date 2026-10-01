load('config.js');

// url = trang xem ảnh /s/<imgkey>/<gid>-<số trang>; trả về URL ảnh thật
function execute(url) {
    try {
        var doc = getDoc(url);
        var img = doc.select("#img");
        if (!count(img)) return null;
        return String(img.first().attr("src"));
    } catch (e) {
        return null;
    }
}
