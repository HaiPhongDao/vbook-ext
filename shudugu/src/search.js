load('config.js');

// Endpoint tim kiem KHONG nam o duong dan doan duoc.
// Trang /i/so.aspx chi la form nhap; form do GET sang 'sor.aspx' (tuong doi),
// tuc /i/sor.aspx, voi mot field duy nhat ten 'key'.
//
// Canh bao cho lan sau: /search/?q= va /s/?q= deu tra HTTP 200 nhung noi dung la
// TRANG CHU (cung 64 link truyen, cung title). Trong nhu tim kiem hong chu khong
// phai duong dan sai - de doc nham lam.
function execute(key, page) {
    if (!key || String(key).trim().length === 0) {
        return Response.error('[search] Chưa nhập từ khoá.');
    }

    let doc = getDoc('/i/sor.aspx?key=' + encodeURIComponent(key));
    if (!doc) {
        return Response.error('[search] Không gọi được endpoint tìm kiếm.');
    }

    // Tim duoc ca theo ten truyen lan ten tac gia (da do: mot tu khoa ten truyen ra
    // 1 ket qua, ten tac gia ra 4). Khong tim thay thi tra ve mang rong that su.
    //
    // Truyen 0 cho parseList: KHONG ap MIN_CHAPTERS o day. Nguoi dung go dung ten
    // truyen ma bi loc mat vi truyen ngan thi vo ly - loc chi danh cho duyet.
    return Response.success(parseList(doc, 0));
}
