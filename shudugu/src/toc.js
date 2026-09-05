load('config.js');

// Muc luc nam ngay tren trang truyen, nhung site CAT o 999 chuong moi trang.
//
// Do duoc tren truyen /2349/ (3471 chuong):
//   /2349/            -> chuong 1..999      + link 下一页 p-2.html
//   /2349/p-2.html    -> chuong 1000..1998  + link 下一页 p-3.html
//   /2349/p-3.html    -> chuong 1999..2997  + link 下一页 p-4.html
//   /2349/p-4.html    -> chuong 2998..3471  + KHONG co 下一页   (trang cuoi)
//   999+999+999+474 = 3471, khop dung nhan chuong cuoi.
//
// BAY: trang ngoai pham vi KHONG tra 404. /2349/p-5.html va ca p-99.html deu tra
// ve NGUYEN TRANG 1 kem link 下一页 tro p-2 -> vong lap "cu tai tiep" se chay
// vo tan. Vi vay dung theo HAI dieu kien, khong phai mot:
//   1. trang khong con link 下一页
//   2. trang khong them duoc chuong moi nao (chan bay quay vong)
let CATALOG_SELECTOR = '#list a';
let MAX_PAGES = 20;

function pagePath(id, n) {
    return n <= 1 ? '/' + id + '/' : '/' + id + '/p-' + n + '.html';
}

// Link 下一页 co dang tuong doi 'p-3.html#dir'. Lay SO trang roi tu dung lai
// duong dan, an toan hon la ghep chuoi tuong doi.
function nextPageNum(doc) {
    let n = -1;
    doc.select('a').forEach(e => {
        if (n > 0) {
            return;
        }
        let t = e.text();
        if (t && t.indexOf('下一页') !== -1) {
            let href = e.attr('href');
            let m = href ? href.match(/p-(\d+)\.html/) : null;
            if (m) {
                n = parseInt(m[1], 10);
            }
        }
    });
    return n;
}

// Chi tra ve chuong CHUA co trong `seen` - de goi nhieu lan qua cac trang.
function collect(doc, id, selector, seen) {
    let chapters = [];

    doc.select(selector).forEach(e => {
        let href = e.attr('href');
        let name = e.text();
        if (!href || !name) {
            return;
        }
        name = name.trim();
        if (name.length === 0) {
            return;
        }
        if (!/\/\d+\/\d+\.html/.test(href)) {
            return;
        }
        if (id && href.indexOf('/' + id + '/') === -1) {
            return;
        }
        let full = abs(href);
        if (seen[full]) {
            return;
        }
        seen[full] = true;
        chapters.push({name: name, url: full, host: BASE_URL});
    });

    return chapters;
}

// Dua vao so trong /<id>/<chapid>.html de doan chieu sap xep.
function chapNum(u) {
    let m = u.match(/\/\d+\/(\d+)\.html/);
    return m ? parseInt(m[1], 10) : -1;
}

function fixOrder(chapters) {
    if (chapters.length < 2) {
        return chapters;
    }

    let up = 0;
    let down = 0;
    for (let i = 1; i < chapters.length; i++) {
        let a = chapNum(chapters[i - 1].url);
        let b = chapNum(chapters[i].url);
        if (a < 0 || b < 0 || a === b) {
            continue;
        }
        if (b > a) {
            up++;
        } else {
            down++;
        }
    }

    if (down > up) {
        let out = [];
        for (let i = chapters.length - 1; i >= 0; i--) {
            out.push(chapters[i]);
        }
        return out;
    }

    return chapters;
}

function execute(url) {
    let id = bookId(url);
    if (!id) {
        return Response.error('[toc] Không tách được ID từ: ' + url);
    }

    let all = [];
    let seen = {};
    let page = 1;
    let pages = 0;

    while (page > 0 && pages < MAX_PAGES) {
        pages++;
        let path = pagePath(id, page);

        let doc = getDoc(path);
        if (!doc) {
            // Mat mang giua chung: giu nhung gi da lay duoc con hon bo het
            console.log('[toc] không tải được ' + path + ', dừng ở ' + all.length + ' chương');
            break;
        }

        let got = collect(doc, id, CATALOG_SELECTOR, seen);
        if (got.length === 0) {
            got = collect(doc, id, 'a', seen);
        }

        // Chan bay: trang ngoai pham vi tra ve lai trang 1 -> khong them gi moi
        if (got.length === 0) {
            break;
        }

        for (let i = 0; i < got.length; i++) {
            all.push(got[i]);
        }

        page = nextPageNum(doc);
    }

    if (all.length === 0) {
        return Response.error('[toc] Không thấy chương nào trong "' + CATALOG_SELECTOR
            + '": ' + abs(pagePath(id, 1)));
    }

    all = fixOrder(all);
    console.log('[toc] ' + all.length + ' chương / ' + pages + ' trang mục lục');
    return Response.success(all);
}
