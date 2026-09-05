// 速读谷 (shudugu.org) - dung chung cho moi script.
//
// Khac han 69shuba o hai diem lon:
//   - Site tra ve UTF-8 that (da do: 0 ky tu U+FFFD) -> KHONG can vong do bang ma
//   - Khong co Cloudflare (server la IIS 10.0) -> khong can cookie clearance
let BASE_URL = 'https://www.shudugu.org';

let UA = 'Mozilla/5.0 (Linux; Android 14; Poco X7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36';

// Muc do gop doan cho TTS - doc tu plugin.json.config.MERGE_TTS.
// Mac dinh GIU NGUYEN doan goc: gop lam mat cach dong khi doc bang mat.
//
// Tuyet doi khong duoc `let MERGE_TTS` o bat cu dau: vBook tiem no thanh const,
// trung ten la SyntaxError chet ca script.
function mergeMin() {
    let raw = '';
    try {
        raw = MERGE_TTS;
    } catch (e) {
        raw = '';
    }
    let m = raw ? String(raw).match(/(\d+)/) : null;
    return m ? parseInt(m[1], 10) : 0;
}

function abs(url) {
    if (!url) {
        return BASE_URL;
    }
    if (url.indexOf('http') !== 0) {
        return BASE_URL + (url.charAt(0) === '/' ? url : '/' + url);
    }
    return url.replace(/^https?:\/\/[^\/]+/i, BASE_URL);
}

// Anh bia nam cung host (/files/cover/...) va luon la URL tuyet doi san,
// nhung van xu ly duong dan tuong doi phong khi site doi.
function absImg(url) {
    if (!url) {
        return '';
    }
    if (url.indexOf('//') === 0) {
        return 'https:' + url;
    }
    if (url.indexOf('http') === 0) {
        return url;
    }
    return BASE_URL + (url.charAt(0) === '/' ? url : '/' + url);
}

function getDoc(url) {
    let response = fetch(abs(url), {
        method: 'GET',
        headers: {
            'User-Agent': UA,
            'Referer': BASE_URL + '/'
        }
    });
    if (!response || !response.ok) {
        return null;
    }
    let text = response.text('utf-8');
    if (!text) {
        return null;
    }
    return Html.parse(text);
}

// ID truyen tu bat ky dang URL nao: /51/ hoac /51 hoac /51/3194.html
function bookId(url) {
    if (!url) {
        return null;
    }
    let m = url.match(/\/(\d+)(?:\/|$)/);
    return m ? m[1] : null;
}

// vBook CAT dau '/' cuoi truoc khi goi execute(url) - xem SKILL.md rang buoc 7.
// Site nay bat buoc phai co '/' cuoi, nen luon dung ham nay de dung lai URL.
function bookUrl(id) {
    return '/' + id + '/';
}

function stripLabel(t) {
    if (!t) {
        return '';
    }
    return t.replace(/^\s*(作者|状态|分类)\s*[：:]\s*/, '').trim();
}

// Elements.text() cua jsoup NOI text cua MOI phan tu khop -> khong dung de lay
// "cai dau tien". Elements.first() thi tra null khi rong, goi .text() la van.
// Ham nay lay text cua phan tu dau tien co noi dung, an toan ca hai phia.
function firstText(el, selector) {
    let out = '';
    el.select(selector).forEach(x => {
        if (out) {
            return;
        }
        let t = x.text();
        if (t && t.trim().length > 0) {
            out = t.trim();
        }
    });
    return out;
}

// Site tron lan thoi gian tuong doi va tuyet doi trong cung mot cot:
//   18秒前 / 5分钟前 / 2小时前 / 昨天 / 前天 / 09-04
// Doi cac dang tuong doi sang tieng Viet, dang ngay thang giu nguyen.
function viTime(t) {
    if (!t) {
        return '';
    }
    t = t.trim();

    let m = t.match(/^(\d+)\s*秒前$/);
    if (m) {
        return m[1] + ' giây trước';
    }
    m = t.match(/^(\d+)\s*分钟前$/);
    if (m) {
        return m[1] + ' phút trước';
    }
    m = t.match(/^(\d+)\s*小时前$/);
    if (m) {
        return m[1] + ' giờ trước';
    }
    m = t.match(/^(\d+)\s*天前$/);
    if (m) {
        return m[1] + ' ngày trước';
    }
    if (t === '刚刚') {
        return 'vừa xong';
    }
    if (t === '昨天') {
        return 'hôm qua';
    }
    if (t === '前天') {
        return 'hôm kia';
    }
    return t;
}

// Mot dong truyen trong danh sach (trang chu, the loai, tim kiem) deu la:
//   <div class="item">
//     <a href="/51/"><img src="https://.../files/cover/....jpg"></a>
//     <div class="itemtxt">
//       <h1|h3><a href="/51/">ten truyen</a></h1>      <- h1 o trang chu, h3 o trang tim kiem
//       <p><span>已完结</span><span>都市小说</span></p>
//       <p><a href="/zuozhe/?tag=...">作者：...</a></p>
//       <ul><li><i>09-03</i><a href="/51/4419510.html">chuong moi</a></li>...</ul>
//     </div>
//   </div>
//
// Bat ten theo HREF chu khong theo the bao ngoai, vi h1/h3 khac nhau tuy trang.
// MIN_CHAPTERS duoc vBook tiem thanh const tu plugin.json.config.
// Gia tri LUON la chuoi va co the chua ton tai -> doc phong thu.
// Tuyet doi khong duoc `let MIN_CHAPTERS` o bat cu file nao: trung ten voi const
// duoc tiem la SyntaxError, chet ca script.
//
// parseInt doc phan so o DAU chuoi roi dung, nen '300 chương' -> 300 va
// 'Không lọc' -> NaN -> 0. Nho vay danh sach chon hien chu tieng Viet de doc.
function minChapters() {
    let raw = '';
    try {
        raw = MIN_CHAPTERS;
    } catch (e) {
        raw = '';
    }
    let n = parseInt(raw, 10);
    if (isNaN(n) || n < 0) {
        return 0;
    }
    return n;
}

// `min` > 0 thi loai truyen duoi nguong. Dong khong doc duoc so chuong cung bi loai,
// vi khong chung minh duoc la du. Truyen tim kiem thi luon truyen 0 - tim theo ten
// ma bi loc mat thi vo ly.
function parseList(doc, min) {
    let books = [];
    let seen = {};
    min = min > 0 ? min : 0;

    doc.select('div.item').forEach(e => {
        let link = '';
        let name = '';

        e.select('.itemtxt a').forEach(a => {
            if (link) {
                return;
            }
            let href = a.attr('href');
            if (href && /^\/\d+\/$/.test(href)) {
                let t = a.text();
                if (t && t.trim().length > 0) {
                    link = href;
                    name = t.trim();
                }
            }
        });

        if (!link) {
            return;
        }
        let m = link.match(/^\/(\d+)\/$/);
        if (!m || seen[m[1]]) {
            return;
        }
        seen[m[1]] = true;

        // Tac gia: nam trong <p> co chu bat dau bang '作者：'.
        //
        // TUYET DOI khong chon theo href. Tren trang chu va cac trang the loai, link
        // tac gia tro ve chinh TRUYEN (/51/); chi rieng trang tim kiem moi tro
        // /zuozhe/?tag=... Chon theo href thi moi trang duyet deu mat sach tac gia.
        let author = '';
        e.select('.itemtxt p').forEach(p => {
            if (author) {
                return;
            }
            let t = p.text();
            if (t && /^\s*作者\s*[：:]/.test(t)) {
                author = stripLabel(t.trim());
            }
        });

        // So chuong lay tu nhan '第N章' cua khoi ba chuong moi nhat, giu so LON NHAT.
        // Phai quet ca ba chu khong chi cai dau: truyen da hoan thuong ket bang 番外
        // (ngoai truyen) khong danh so, quet moi cai dau thi /wanjie/ mat sach
        // (da do: 0/10 doc duoc neu chi lay chuong dau tien).
        let chapNo = -1;
        e.select('.itemtxt ul li a').forEach(a => {
            let t = a.text();
            let m = t ? t.match(/第\s*(\d+)\s*章/) : null;
            if (m) {
                let n = parseInt(m[1], 10);
                if (n > chapNo) {
                    chapNo = n;
                }
            }
        });

        // Dang loc ma khong doc duoc so chuong -> loai, khong doan bua
        if (min > 0 && (chapNo < 0 || chapNo < min)) {
            return;
        }

        // THU TU CO CHU DICH. vBook cat mo ta con mot dong tren the truyen, phan
        // duoi bi nuot. Do dai do duoc tren 50 truyen:
        //   'Cập nhật 31 giây trước' = 22 ky tu  <- ngon cho nhat
        //   'NNN chương'             = 10, co dinh
        //   ten tac gia              = toi da 8, trung vi 4 (nhung chu Han rong gap doi)
        // => dat SO CHUONG len dau (ngan, co dinh, nguoi dung can nhat), tac gia o
        // giua, thoi gian xuong cuoi vi no dai nhat va it quan trong nhat.
        let bits = [];

        if (chapNo > 0) {
            bits.push(chapNo + ' chương');
        }

        if (author) {
            // Chan ten dai bat thuong - mau 50 truyen cao nhat moi 8 ky tu, nhung
            // khong co gi dam bao khong co ten dai hon.
            if (author.length > 10) {
                author = author.substring(0, 10) + '…';
            }
            bits.push(author);
        }

        // Lan cap nhat cuoi = <i> cua <li> DAU TIEN trong .itemtxt ul.
        // Bo chu 'Cập nhật' cho gon: '31 giây trước' tu no da ro, con dang '09-03'
        // dung cuoi dong danh sach thi hieu la ngay cap nhat.
        let when = viTime(firstText(e, '.itemtxt ul li i'));
        if (when) {
            bits.push(when);
        }

        books.push({
            name: name,
            link: BASE_URL + link,
            host: BASE_URL,
            cover: absImg(e.select('img').attr('src')),
            description: bits.join(' · ')
        });
    });

    return books;
}

// Link "trang sau" o cuoi trang the loai: /xuanhuan/2.html
function findNext(doc) {
    let next = null;
    doc.select('a').forEach(e => {
        if (next) {
            return;
        }
        let t = e.text();
        if (t && (t.indexOf('下一页') !== -1 || t.indexOf('下页') !== -1)) {
            let href = e.attr('href');
            if (href && href.indexOf('javascript') !== 0 && href !== '#') {
                next = abs(href);
            }
        }
    });
    return next;
}
