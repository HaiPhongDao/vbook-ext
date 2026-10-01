# vBook extension — E-Hentai Plus

Extension truyện tranh cho app **vBook**, đọc trên [e-hentai.org](https://e-hentai.org) (18+).

## Cài đặt

Thêm repo vào vBook bằng link:

```
https://raw.githubusercontent.com/HaiPhongDao/vbook-ext/main/comic_plugin.json
```

Hoặc tải `plugin.zip` rồi cài từ trong vBook.

## Chức năng

| Chức năng | Ghi chú |
|---|---|
| Khám phá | Top hôm qua / tuần / tháng / năm / mọi lúc, Đang hot, Mới nhất |
| Thể loại | 10 thể loại × Mới / Top tuần / Top tháng / Top năm / Top mọi lúc |
| Tìm kiếm | Cú pháp tìm kiếm của E-Hentai: `f:glasses`, `artist:xxx`, `-netorare` |
| Chi tiết | Tag theo nhóm (bấm để tìm), gợi ý cùng tác giả / nhóm / parody / người đăng, bình luận |
| Mục lục | Mỗi chương = 1 trang thumbnail (20–40 ảnh) |
| Đọc | Ảnh lấy lười qua `img.js` — đọc tới đâu tải tới đó; tự bỏ qua màn cảnh báo nội dung |

## Tuỳ chọn

Thể loại cho các tab Top, ngôn ngữ, rating tối thiểu, ẩn AI generated, blacklist tag,
ưu tiên tiêu đề tiếng Nhật, số luồng tải ảnh, giãn cách request.

## Ghi chú

- E-Hentai không có toplist tuần: **Top tuần** = Top tháng, chỉ giữ truyện đăng trong 7 ngày.
- Lọc thể loại / ngôn ngữ trên toplist làm phía extension (dùng API `gdata`), nên khi lọc
  thể loại hiếm mỗi lần tải sẽ quét thêm vài trang.
- Nội dung liên quan trẻ vị thành niên luôn bị chặn, không có tuỳ chọn tắt.
- Toàn bộ script viết ES5 để chạy trên runtime Rhino của vBook.
