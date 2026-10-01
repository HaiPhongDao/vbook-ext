load('config.js');

// Hỗ trợ cú pháp tìm kiếm của E-Hentai: f:glasses, artist:"abc$", -netorare ...
function execute(key, page) {
    return runList(mkInput({ src: "search", q: key || "" }), page || "");
}
