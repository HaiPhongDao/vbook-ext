load('config.js');

// Duoc goi tu tab cua home.js. `page` la URL trang sau do findNext() tra ve.
// Phan trang co that: /xuanhuan/ -> /xuanhuan/2.html -> ... -> /xuanhuan/84.html
function execute(url, page) {
    let target = page ? page : (url ? url : '/');

    let doc = getDoc(target);
    if (!doc) {
        return Response.error('[list] Không tải được: ' + abs(target));
    }

    let min = minChapters();
    let rows = doc.select('div.item').size();
    let books = parseList(doc, min);

    if (rows === 0) {
        return Response.error('[list] Trang tải được nhưng không thấy div.item nào: '
            + abs(target));
    }

    let next = findNext(doc);
    console.log('[list] ' + books.length + '/' + rows + ' truyện'
        + (min > 0 ? ' (lọc >=' + min + ' chương)' : ''));

    // Loc het sach ca trang van PHAI tra ve `next`, khong duoc bao loi:
    // trang sau con truyen dat nguong, de vBook cuon tiep la ra.
    return Response.success(books, next);
}
