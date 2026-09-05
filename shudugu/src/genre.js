load('config.js');

// Danh sach the loai -> vBook dung cai nay dung luoi thu gon (nut o goc thanh tab),
// thay vi nhoi het vao thanh tab ngang.
//
// Nguon: /fenlei/ - co 17 the loai kem so truyen, nhieu hon han 7 muc tren nav.
// Vi du: <a href="/xuanhuan/">玄幻小说(834部)</a>
//
// Doc DONG tu trang chu khong dat cung: site them the loai moi thi tu co.
// Chi bang ten tieng Viet la dat cung, the loai la khop duoc thi dich,
// khong khop thi giu nguyen ten Trung.
function viName(zh) {
    let map = {
        '玄幻小说': 'Huyền huyễn',
        '仙侠小说': 'Tiên hiệp',
        '都市小说': 'Đô thị',
        '历史小说': 'Lịch sử',
        '军事小说': 'Quân sự',
        '科幻小说': 'Khoa huyễn',
        '言情小说': 'Ngôn tình',
        '轻小说': 'Light novel',
        '诸天无限': 'Chư thiên vô hạn',
        '游戏小说': 'Game',
        '奇幻小说': 'Kỳ huyễn',
        '悬疑小说': 'Huyền nghi',
        '体育小说': 'Thể thao',
        '官场小说': 'Quan trường',
        '武侠小说': 'Võ hiệp',
        '乡村小说': 'Nông thôn',
        '现实小说': 'Hiện thực'
    };
    return map[zh] ? map[zh] : zh;
}

// Cac duong dan da co tab rieng tren trang chu -> khong lap lai trong luoi
function isPinned(href) {
    return href === '/' || href === '/zuixin/' || href === '/paihang/'
        || href === '/wanjie/' || href === '/fenlei/';
}

function execute() {
    let doc = getDoc('/fenlei/');
    if (!doc) {
        return Response.error('[genre] Không tải được /fenlei/');
    }

    let out = [];
    let seen = {};

    doc.select('a').forEach(e => {
        let href = e.attr('href');
        let text = e.text();
        if (!href || !text) {
            return;
        }
        text = text.trim();

        // The loai luon co dang /<chu-cai>/ va nhan kem so truyen: 玄幻小说(834部)
        if (!/^\/[a-z]+\/$/.test(href) || isPinned(href) || seen[href]) {
            return;
        }

        let m = text.match(/^(.+?)\s*[（(](\d+)部[）)]\s*$/);
        if (!m) {
            return;
        }
        seen[href] = true;

        out.push({
            title: viName(m[1]) + ' (' + m[2] + ')',
            input: href,
            script: 'list.js'
        });
    });

    if (out.length === 0) {
        return Response.error('[genre] Không đọc được thể loại nào từ /fenlei/');
    }

    console.log('[genre] ' + out.length + ' thể loại');
    return Response.success(out);
}
