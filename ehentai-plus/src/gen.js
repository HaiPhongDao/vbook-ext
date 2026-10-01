load('config.js');

// input: chuỗi tham số do home.js / genre.js / detail.js tạo ra
// page:  token trang kế tiếp (số trang toplist hoặc URL "next" của E-Hentai)
function execute(input, page) {
    return runList(input, page || "");
}
