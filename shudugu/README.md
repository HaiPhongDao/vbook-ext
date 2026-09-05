# vBook extension — 速读谷 (shudugu.org)

Extension nguồn truyện cho app **vBook** (Android), đọc truyện raw tiếng Trung
**giản thể** từ [shudugu.org](https://www.shudugu.org).

## Cài đặt

**Cách 1 — file zip:** tải `plugin.zip` rồi cài từ trong vBook.

**Cách 2 — build từ nguồn:** cần vBook bật `chế độ nhà phát triển` (chạm 7 lần vào
tên phiên bản trong app), điện thoại và PC cùng mạng LAN, rồi dùng CLI của
[Darkrai9x/vbook-extensions](https://github.com/Darkrai9x/vbook-extensions):

```
node .claude/skills/vbook-extensions/scripts/vbook.js install vbook-shudugu
```

## Chức năng

| Chức năng | Ghi chú |
|---|---|
| Trang chủ | 4 tab: Mới cập nhật, Bảng xếp hạng, Hoàn tất, Trang chủ |
| Thể loại | 17 thể loại, đọc động từ `/fenlei/`, hiện dạng lưới thu gọn |
| Danh sách | Ảnh bìa, số chương, tác giả, thời gian cập nhật |
| Chi tiết | Tên, tác giả, bìa, giới thiệu, số chữ, trạng thái, chương mới nhất |
| Mục lục | Tự nối phân trang — đã test truyện 3471 chương |
| Đọc chương | Giữ nguyên cách đoạn, có tuỳ chọn gộp đoạn cho TTS |
| Tìm kiếm | Tìm được theo tên truyện lẫn tên tác giả |

## Tuỳ chọn

Trong **cài đặt của extension** (không phải cài đặt chung của vBook):

- **Số chương tối thiểu** — lọc truyện ngắn khi duyệt danh sách. Không áp dụng khi
  tìm kiếm. Mặc định: không lọc.
- **Gộp đoạn cho TTS** — ít đoạn thì TTS đọc đỡ ngắt quãng, đổi lại đọc bằng mắt sẽ
  thưa dòng hơn. Mặc định: giữ nguyên đoạn.

## Cấu trúc

```
plugin.json      khai báo extension + tuỳ chọn
icon.png         200×200
src/
  config.js      hằng số dùng chung, getDoc(), parseList()
  home.js        tab trang chủ
  genre.js       lưới thể loại
  list.js        danh sách truyện + phân trang
  detail.js      chi tiết truyện
  toc.js         mục lục (tự nối trang)
  chap.js        nội dung chương
  search.js      tìm kiếm
NOTES.md         ghi chú kỹ thuật — selector, các bẫy đã gặp, cách test
```

## Trước khi sửa code, đọc `NOTES.md`

Trong đó ghi lại các bẫy đã tốn thời gian để phát hiện, kèm số liệu đo thật:

- Mục lục bị cắt ở **999 chương/trang**, và trang ngoài phạm vi **không trả 404** mà
  lặng lẽ trả về trang 1 — vòng lặp ngây thơ sẽ chạy vô tận
- Endpoint tìm kiếm là `/i/sor.aspx?key=`; `/search/?q=` trả **200 kèm nội dung trang
  chủ**, trông y như tìm kiếm hỏng
- Link tác giả trỏ đi đâu là **tuỳ trang** — chọn theo `href` sẽ mất sạch tác giả trên
  các trang duyệt
- vBook **cắt dấu `/` cuối URL**, mà site này bắt buộc phải có

## Giấy phép

Chỉ dùng cho mục đích cá nhân. Extension không lưu trữ nội dung, chỉ đọc từ site nguồn.
