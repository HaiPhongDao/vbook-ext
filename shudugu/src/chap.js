load('config.js');

// Noi dung chuong nam trong <div class="con">, da chia san bang the <p>.
// Da do tren mot chuong that: 56 the <p>, khong co <div> con nao ben trong
// -> khong can go rac cau truc nhu ban 69shuba (.txtinfo, #txtright, .page1...).
let CONTENT_SELECTOR = 'div.con';

// Dong rac hay bi chen giua van ban: ten site, loi keu doc tiep, dieu huong.
function isJunk(t) {
    if (!t || t.length === 0) {
        return true;
    }
    if (/速读谷|shudugu|sudugu\.org/i.test(t)) {
        return true;
    }
    if (/^(上一章|下一章|目录|加入书签|推荐本书|返回目录)$/.test(t)) {
        return true;
    }
    // Dong chi co dau cau hoac ky tu trang tri
    if (/^[\s　.。·…—\-_*]+$/.test(t)) {
        return true;
    }
    return false;
}

// Gop doan ngan thanh khoi dai: vBook doc TTS theo tung doan, moi doan la mot luot
// doc rieng co do tre khoi dong -> cang it doan cang it bi ngat.
//
// MAC DINH TAT. Ban dau bung nguyen MERGE_MIN=600 tu ext 69shuba sang, ket qua la
// 63 doan goc bi ep con 4 khoi ~600 ky tu noi bang dau cach -> doc bang mat thay
// chu dinh lien mot mang, khong xuong dong.
//
// Khi BAT gop, noi bang <br> chu khong phai dau cach: nhu vay du gop van con cach
// dong khi doc bang mat. (Chua kiem duoc vBook co tach TTS tai <br> hay khong - neu
// co thi bat gop se khong con tac dung cho TTS, nhung hien thi thi khong bao gio hong.)
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

function execute(url) {
    let doc = getDoc(url);
    if (!doc) {
        return Response.error('[chap] Không tải được chương: ' + abs(url));
    }

    let box = doc.select(CONTENT_SELECTOR);
    if (box.size() === 0) {
        return Response.error('[chap] Không thấy "' + CONTENT_SELECTOR + '" trong: ' + abs(url));
    }

    let parts = [];
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

    if (parts.length === 0) {
        return Response.error('[chap] Chương rỗng sau khi lọc: ' + abs(url));
    }

    let min = mergeMin();
    let blocks = merge(parts, min);
    console.log('[chap] ' + parts.length + ' đoạn gốc -> ' + blocks.length + ' khối'
        + (min > 0 ? ' (gộp >=' + min + ')' : ' (giữ nguyên đoạn)'));
    let html = '';
    for (let i = 0; i < blocks.length; i++) {
        html = html + '<p>' + blocks[i] + '</p>';
    }

    return Response.success(html);
}
