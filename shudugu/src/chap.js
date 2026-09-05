load('config.js');

// Noi dung chuong nam trong <div class="con">, da chia san bang the <p>.
//
// CHUONG BI PHAN TRANG. Trang sau co duoi '-<n>' truoc '.html':
//   /2349/1181835.html    -> 524 ky tu  + link 下一页 -> 1181835-2.html
//   /2349/1181835-2.html  -> 827        + 下一页 -> -3
//   /2349/1181835-3.html  -> 547        + 下一页 -> -4
//   /2349/1181835-4.html  -> 625        + KHONG con 下一页  (trang cuoi)
//   Tong 2523 ky tu; chi lay trang dau la mat 80% chuong.
//
// Khac muc luc o mot diem quan trong: trang ngoai pham vi (vd -9.html) tra ve
// div.con RONG chu khong quay vong ve trang 1, nen vong lap tu dung duoc.
// Van giu them chan chan "khong them doan nao thi dung" cho chac.
let CONTENT_SELECTOR = 'div.con';
let MAX_PAGES = 20;

// Bo duoi '-<n>' de lay URL trang dau, roi tu dung lai tung trang.
// An toan hon ghep chuoi tuong doi tu href cua the <a>.
function basePage(url) {
    return String(url).replace(/-\d+\.html$/, '.html');
}

function pageUrl(base, n) {
    return n <= 1 ? base : base.replace(/\.html$/, '-' + n + '.html');
}

// Link 下一页 co dang '/2349/1181835-3.html'. Lay SO trang trong duoi '-<n>'.
// Tren trang cuoi khong co the nay -> tra -1.
// Neu site doi 下一页 thanh link sang chuong khac (khong co duoi -N) thi regex
// cung khong khop -> dung, dung hon la di lac sang chuong sau.
function nextPageNum(doc) {
    let n = -1;
    doc.select('a').forEach(e => {
        if (n > 0) {
            return;
        }
        let t = e.text();
        if (t && t.indexOf('下一页') !== -1) {
            let href = e.attr('href');
            let m = href ? href.match(/-(\d+)\.html/) : null;
            if (m) {
                n = parseInt(m[1], 10);
            }
        }
    });
    return n;
}

// Dong rac hay bi chen giua van ban: ten site, loi keu doc tiep, dieu huong.
function isJunk(t) {
    if (!t || t.length === 0) {
        return true;
    }
    if (/速读谷|shudugu|sudugu\.org/i.test(t)) {
        return true;
    }
    if (/^(上一章|下一章|上一页|下一页|目录|加入书签|推荐本书|返回目录)$/.test(t)) {
        return true;
    }
    if (/^[\s　.。·…—\-_*]+$/.test(t)) {
        return true;
    }
    return false;
}

// Gop doan ngan thanh khoi dai cho TTS. Mac dinh TAT - xem NOTES.
// Khi bat, noi bang <br> chu khong phai dau cach, de van con cach dong khi doc mat.
function merge(parts, min) {
    if (min <= 0) {
        return parts;
    }

    let out = [];
    let buf = '';
    for (let i = 0; i < parts.length; i++) {
        buf = buf.length === 0 ? parts[i] : buf + '<br>' + parts[i];
        if (buf.length >= min) {
            out.push(buf);
            buf = '';
        }
    }
    if (buf.length > 0) {
        out.push(buf);
    }
    return out;
}

// Lay cac doan cua MOT trang. Tra ve mang rong neu trang khong co noi dung.
function grabPage(doc) {
    let parts = [];

    let box = doc.select(CONTENT_SELECTOR);
    if (box.size() === 0) {
        return parts;
    }

    box.select('p').forEach(p => {
        let t = p.text();
        t = t ? t.trim() : '';
        if (!isJunk(t)) {
            parts.push(t);
        }
    });

    // Khong co the <p> nao -> lay thang text cua ca khoi, tach theo dong
    if (parts.length === 0) {
        let raw = box.text();
        if (raw) {
            raw.split(/\n+/).forEach(line => {
                let t = line.trim();
                if (!isJunk(t)) {
                    parts.push(t);
                }
            });
        }
    }

    return parts;
}

function execute(url) {
    let base = basePage(url);
    let all = [];
    let page = 1;
    let pages = 0;

    while (page > 0 && pages < MAX_PAGES) {
        pages++;
        let path = pageUrl(base, page);

        let doc = getDoc(path);
        if (!doc) {
            // Mat mang giua chung: tra ve phan da lay con hon bo trang
            console.log('[chap] không tải được ' + path + ', dừng ở ' + all.length + ' đoạn');
            break;
        }

        let got = grabPage(doc);
        if (got.length === 0) {
            break;
        }

        for (let i = 0; i < got.length; i++) {
            all.push(got[i]);
        }

        page = nextPageNum(doc);
    }

    if (all.length === 0) {
        return Response.error('[chap] Không lấy được nội dung: ' + abs(base));
    }

    let min = mergeMin();
    let blocks = merge(all, min);
    console.log('[chap] ' + all.length + ' đoạn / ' + pages + ' trang -> ' + blocks.length
        + ' khối' + (min > 0 ? ' (gộp >=' + min + ')' : ''));

    let html = '';
    for (let i = 0; i < blocks.length; i++) {
        html = html + '<p>' + blocks[i] + '</p>';
    }

    return Response.success(html);
}
