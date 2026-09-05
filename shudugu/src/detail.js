load('config.js');

// Trang truyen /<id>/ - khoi thong tin nam trong .itemtxt:
//   <h1><i>653.5万字</i><a href="/51/#dir">捞尸人</a></h1>
//   <p><span>已完结</span><span>都市小说</span></p>
//   <p><a href="/zuozhe/?tag=...">作者：...</a></p>
//   <p><i>更新时间</i>最新三章节</p>
//
// Luu y: <h1> chua CA so chu lan ten truyen. Lay ten tu the <a> ben trong,
// dung lay text cua ca <h1> keo dinh '653.5万字' vao ten.
function execute(url) {
    let id = bookId(url);
    if (!id) {
        return Response.error('[detail] Không tách được ID từ: ' + url);
    }

    let doc = getDoc(bookUrl(id));
    if (!doc) {
        return Response.error('[detail] Không tải được trang truyện: ' + abs(bookUrl(id)));
    }

    let name = doc.select('.itemtxt h1 a').text();
    if (!name || name.trim().length === 0) {
        name = doc.select('.itemtxt h3 a').text();
    }
    name = name ? name.trim() : '';
    if (name.length === 0) {
        return Response.error('[detail] Không đọc được tên truyện: ' + abs(bookUrl(id)));
    }

    let author = stripLabel(doc.select('.itemtxt a[href*="/zuozhe/"]').text());
    let cover = absImg(doc.select('div.item img').attr('src'));
    if (!cover) {
        cover = absImg(doc.select('img').attr('src'));
    }

    // Gioi thieu truyen nam trong <div class="des bb">, chia san bang the <p>.
    //
    // TRUOC DAY lay tu <meta name="description"> va do la SAI: the meta chi chua
    // chu SEO cua site ("速读谷提供X创作的Y最新章节在线阅读..."), khong phai gioi
    // thieu truyen. Nguoi dung thay o muc gioi thieu toan chu quang cao cua site.
    // Chon '.des' (khong kem 'bb') de con chay neu site doi class phu.
    let parts = [];
    doc.select('.des p').forEach(p => {
        let t = p.text();
        if (t && t.trim().length > 0) {
            parts.push(t.trim());
        }
    });

    let description = parts.join('<br>');

    // Khong co the <p> ben trong -> lay thang text ca khoi
    if (description.length === 0) {
        let raw = doc.select('.des').text();
        description = raw ? raw.trim() : '';
    }

    // <span> dau la trang thai (已完结 / 连载), <span> sau la the loai
    let bits = [];
    doc.select('.itemtxt p span').forEach(s => {
        let t = s.text();
        if (t && t.trim().length > 0) {
            bits.push(t.trim());
        }
    });

    let words = firstText(doc, '.itemtxt h1 i');

    // Lan cap nhat cuoi = <i> cua <li> dau tien trong khoi "最新三章节".
    // Dinh dang tron lan: 5分钟前 / 昨天 / 09-04 -> viTime() doi sang tieng Viet.
    let when = viTime(firstText(doc, '.itemtxt ul li i'));
    let latestChap = firstText(doc, '.itemtxt ul li a');

    let lines = [];
    if (author) {
        lines.push('Tác giả: ' + author);
    }
    if (bits.length > 0) {
        lines.push(bits.join(' · '));
    }
    if (words) {
        lines.push(words);
    }
    if (when) {
        lines.push('Cập nhật: ' + when);
    }
    if (latestChap) {
        lines.push('Mới nhất: ' + latestChap);
    }

    let status = bits.length > 0 ? bits[0] : '';

    return Response.success({
        name: name,
        author: author,
        cover: cover,
        host: BASE_URL,
        description: description,
        detail: lines.join('<br>'),
        ongoing: status.indexOf('完结') === -1 && status.indexOf('完結') === -1
    });
}
