load('config.js');

// Chi giu vai tab chinh tren thanh ngang. 17 the loai da chuyen sang genre.js,
// vBook dung thanh luoi thu gon (nut o dau thanh tab) - do la ly do khong liet ke
// the loai o day nua.
//
// Moi duong dan da tu tay kiem tra 2026-09-05: deu tra 200, co div.item va phan trang.
function execute() {
    return Response.success([
        {title: "Mới cập nhật",   input: "/zuixin/",  script: "list.js"},
        {title: "Bảng xếp hạng",  input: "/paihang/", script: "list.js"},
        {title: "Hoàn tất",       input: "/wanjie/",  script: "list.js"},
        {title: "Trang chủ",      input: "/",         script: "list.js"}
    ]);
}
