# Ghi chú bàn giao — extension vBook cho 速读谷 (shudugu.org)

## Bối cảnh

Nguồn truyện raw tiếng Trung **giản thể**. Viết mới 2026-09-05 để thay `vbook-69shuba`,
vì site 69shuba ngừng nhận nội dung mới từ khoảng 02/2026 và tìm kiếm hỏng hẳn.

Khác với bản 69shuba, **toàn bộ selector dưới đây đọc trực tiếp từ DOM thật** trước khi
viết code, và mọi script đã chạy qua harness trên máy thật.

`sudugu.org` chuyển hướng 301 sang `www.shudugu.org`. Dùng domain sau.

---

## Trạng thái

Đã test trên máy thật 2026-09-05, tất cả `code:0`:

| Chức năng | File | Kết quả test |
|---|---|---|
| Trang chủ / tab | `home.js` | 4 tab đặt cứng |
| Lưới thể loại | `genre.js` | 17 thể loại đọc động từ `/fenlei/` |
| Danh sách truyện | `list.js` | 10 truyện + link trang sau |
| Chi tiết truyện | `detail.js` | đủ 7 trường, không trường nào rỗng |
| Mục lục | `toc.js` | 3471 chương / 4 trang, và 790 chương / 1 trang |
| Nội dung chương | `chap.js` | 2368 ký tự (nguồn 2288 + thẻ `<p>`) |
| Tìm kiếm | `search.js` | tìm được theo tên truyện và tên tác giả |
| Thể loại | *(chưa có)* | `genre.js` chưa viết |

---

## Sự thật đã xác minh

**Bảng mã: UTF-8 thật.** Đo được 0 ký tự U+FFFD. **Không cần vòng dò bảng mã** như
69shuba — `getDoc()` chỉ fetch một lần rồi `text('utf-8')`.

**Không có Cloudflare.** Server là `Microsoft-IIS/10.0`. curl trần lấy được nội dung
bình thường, không cần cookie clearance, không cần header giả Chrome.

**Ảnh bìa** nằm ở `/files/cover/...` cùng host, luôn là URL tuyệt đối, dùng `src`
thẳng — **không lazy-load**, nên không phải dò `data-original` / `data-src`.

**Mục lục nằm ngay trên trang truyện** `/<id>/`, không có trang mục lục riêng, nhưng
**bị cắt ở 999 chương mỗi trang** — xem mục riêng bên dưới.

**Thời gian cập nhật** có sẵn trên mọi dòng danh sách, không tốn thêm request. Nằm ở
`<i>` của `<li>` đầu tiên trong `.itemtxt ul` (khối 最新三章节 — ba chương mới nhất).

---

## Bảng URL và selector

| Thứ | Giá trị |
|---|---|
| Trang truyện (kiêm mục lục) | `/<id>/` |
| Trang chương | `/<id>/<chapid>.html` |
| Mục lục thể loại | `/fenlei/` — 17 thể loại kèm số truyện, nguồn của `genre.js` |
| Danh sách thể loại | `/xuanhuan/`, `/xianxia/`, `/dushi/`, `/lishi/`, `/junshi/`, `/kehuan/`, `/yanqing/`, `/qing/`, `/zhutianwuxian/`, `/youxi/`, `/qihuan/`, `/xuanyi/`, `/tiyu/`, `/guanchang/`, `/wuxia/`, `/xiangcun/`, `/xianshi/` |
| Mới cập nhật | `/zuixin/` |
| Bảng xếp hạng | `/paihang/` |
| Truyện hoàn | `/wanjie/` |
| Trang sau | `/<thể-loại>/<số>.html` (vd `/xuanhuan/2.html`, cuối là `/xuanhuan/84.html`) |
| Trang tác giả | `/zuozhe/?tag=<tên tác giả>` |
| **Tìm kiếm** | **`/i/sor.aspx?key=<từ khoá>`** (GET) |
| Link chương trong mục lục | `#list a` (container `div#list.dir.clear`) |
| Nội dung chương | `div.con` (đã chia sẵn thẻ `<p>`, không có div con) |
| Một dòng trong danh sách | `div.item` → `div.itemtxt` |

Cấu trúc một dòng danh sách:

```html
<div class="item">
  <a href="/51/"><img src="https://www.shudugu.org/files/cover/....jpg"></a>
  <div class="itemtxt">
    <h1|h3><a href="/51/">tên truyện</a></h1>
    <p><span>已完结</span><span>都市小说</span></p>
    <p><a href="/zuozhe/?tag=...">作者：...</a></p>
    <ul><li><i>09-03</i><a href="/51/4419510.html">chương mới</a></li>…</ul>
  </div>
</div>
```

---

## Mục lục bị cắt ở 999 chương — có phân trang

**Sửa lỗi ghi chép:** bản NOTES đầu tiên (viết cùng ngày, sớm hơn vài giờ) ghi mục lục
"không phân trang". **Sai.** Lúc đó mới thử truyện 790 và 673 chương — cả hai đều dưới
ngưỡng nên không hiện link phân trang. Đúng loại âm tính giả mà `vbook-69shuba/NOTES.md`
đã cảnh báo: kết luận "không có X" từ mẫu chưa bao giờ chạm tới X.

Đo trên truyện `/2349/` (3471 chương):

| Trang | Chương | Link `下一页` |
|---|---|---|
| `/2349/` | 1–999 | → `p-2.html` |
| `/2349/p-2.html` | 1000–1998 | → `p-3.html` |
| `/2349/p-3.html` | 1999–2997 | → `p-4.html` |
| `/2349/p-4.html` | 2998–3471 | **không có** (trang cuối) |

999 + 999 + 999 + 474 = 3471, khớp đúng nhãn `第3471章` của chương cuối.

Đường dẫn: trang 1 là `/<id>/`, từ trang 2 là `/<id>/p-<n>.html`.

### BẪY: trang ngoài phạm vi không trả 404

`/2349/p-5.html` và cả `/2349/p-99.html` đều trả **HTTP 200 kèm nguyên nội dung trang 1**,
và vẫn có link `下一页` trỏ `p-2.html`. Vòng lặp kiểu "cứ tải trang tiếp cho tới khi
lỗi" sẽ **chạy vô tận** và nạp lại chương 1–999 mãi.

`toc.js` vì thế dừng theo **hai** điều kiện, không phải một:

1. Trang không còn link `下一页`
2. Trang không thêm được chương mới nào (chốt chặn bẫy quay vòng — dựa vào bảng `seen`
   dùng chung giữa các trang)

Cộng thêm `MAX_PAGES = 20` làm chốt cuối (≈ 20.000 chương).

Số request: truyện dưới 999 chương tốn 1 request, truyện 3471 chương tốn 4. Chấp nhận được.

---

## Mô tả trong danh sách: số chương · tác giả · thời gian

**Thứ tự này có chủ đích, đừng đảo lại.** vBook cắt mô tả còn một dòng trên thẻ truyện,
phần đuôi bị nuốt. Đo trên 50 truyện:

| Thành phần | Độ dài |
|---|---|
| `Cập nhật 31 giây trước` | **22** — ngốn nhất |
| `NNN chương` | 10, cố định |
| Tên tác giả | tối đa **8**, trung vị 4 |

Tên tác giả không phải thủ phạm về số ký tự, nhưng chữ Hán rộng gấp đôi chữ Latin nên
8 ký tự đó vẫn đủ đẩy số chương ra ngoài khi nó đứng sau.

Ba thay đổi để chống cắt:

1. **Số chương lên đầu** — ngắn, cố định, và là thứ người dùng cần nhất, nên phải nằm
   ở vị trí không bao giờ bị cắt.
2. **Bỏ chữ `Cập nhật`** — tiết kiệm 9 ký tự. `31 giây trước` tự nó đã rõ; dạng `09-03`
   đứng cuối dòng danh sách thì hiểu là ngày cập nhật.
3. **Chặn tên tác giả ở 10 ký tự** (thêm `…`) — mẫu 50 truyện cao nhất mới 8, nhưng
   không có gì đảm bảo không có tên dài hơn.

Kết quả: độ dài mô tả trung vị **40 → 31**, dài nhất **46 → 36**.

`detail.js` vẫn giữ đủ chữ `Cập nhật:` vì trang chi tiết rộng, không bị cắt.

---

## Ba trường trong mô tả lấy ở đâu

Dựng trong `parseList()` của `config.js`, **không tốn request nào** — cả ba thứ đều có
sẵn trên dòng danh sách.

### Tác giả: chọn theo CHỮ, tuyệt đối không theo href

Tác giả nằm trong `<p>` có chữ mở đầu `作者：`. Nhưng **thẻ `<a>` bọc nó trỏ đi đâu thì
tuỳ trang**:

| Trang | href của link tác giả |
|---|---|
| Trang chủ, thể loại, `/paihang/`, `/wanjie/` | trỏ về **chính truyện** (`/51/`) |
| Trang tìm kiếm | trỏ `/zuozhe/?tag=...` |

Lần đầu tôi chọn bằng `a[href*="/zuozhe/"]` và đo ra **0/10 trên mọi trang duyệt**,
tưởng site không có tác giả. Chọn theo tiền tố chữ thì ra **10/10 ở tất cả**.

### Số chương: quét cả ba chương mới nhất, lấy số lớn nhất

Lấy từ nhãn `第N章` trong khối `最新三章节`. Phải quét **cả ba** `<li>` chứ không chỉ
cái đầu, vì truyện đã hoàn thường kết bằng `番外` (ngoại truyện) không đánh số.

Tỉ lệ đọc được, đo thật:

| Trang | Có tác giả | Có số chương |
|---|---|---|
| `/dushi/` (thể loại) | 10/10 | 10/10 |
| `/zuixin/` | 10/10 | 9/10 |
| `/paihang/` | 10/10 | 8/10 |
| `/wanjie/` | 10/10 | **5/10** |

`/wanjie/` chỉ được 5/10 vì có truyện cả ba mục cuối đều là ngoại truyện. Quét một mục
đầu thì con số này là **0/10** — nên việc quét cả ba là đáng.

Không lấy được số chương thì **bỏ hẳn phần đó** khỏi mô tả, không đoán bừa. Muốn đủ
100% thì phải mở từng truyện — 10 request cho mỗi trang danh sách, đúng kiểu gây chặn IP.
Không làm.

---

## Lọc theo số chương

`plugin.json.config.MIN_CHAPTERS`, `mode: select` / `format: single`, mặc định
`"Không lọc"`. Lựa chọn: `Không lọc`, `100/200/300/500/1000 chương`.
Tìm trong **cài đặt của extension**, không phải cài đặt chung của vBook.

**Chỉ áp dụng khi duyệt** (`list.js`). `search.js` luôn truyền `0` — gõ đúng tên truyện
mà bị lọc mất vì truyện ngắn thì vô lý.

Dòng không đọc được số chương cũng bị loại khi đang lọc, vì không chứng minh được là đủ.
Đo thật ở ngưỡng 500:

| Tab | Còn lại | Ít chương nhất |
|---|---|---|
| `/zuixin/` | 9/10 | 625 |
| `/paihang/` | 8/10 | 714 |
| `/dushi/` | 7/10 | 528 |
| `/wanjie/` | 5/10 | 838 |

**Lọc hết sạch một trang vẫn phải trả về `next`**, không được báo lỗi — trang sau còn
truyện đạt ngưỡng, để vBook cuộn tiếp là ra. Đây là khác biệt lớn so với bản 69shuba:
ở đó `/last.html` không phân trang nên lọc xong là hết, còn ở đây mọi trang danh sách
đều phân trang nên danh sách tự đầy lại.

**Ba luật config injection — sai là chết cả script:**

1. Mỗi key trong `config` được tiêm thành `const KEY = "..."` trước khi script chạy.
   **Không được `let MIN_CHAPTERS` ở bất cứ file nào** — trùng tên là `SyntaxError`.
2. Giá trị **luôn là chuỗi**, phải tự `parseInt`.
3. Tên khoá cấm dùng: `thread_num`, `timeout`, `delay`, `ignore`.

`parseInt` đọc phần số ở đầu chuỗi rồi dừng, nên `'300 chương'` → `300` và
`'Không lọc'` → `NaN` → `0`.

---

## Lượt đọc tuần/tháng — site KHÔNG có, đừng tìm lại

Đã kiểm kỹ 2026-09-05, không có số lượt đọc ở bất cứ đâu:

- **Trang truyện** chỉ có số chữ, trạng thái, thể loại, tác giả, thời gian cập nhật,
  ba chương mới nhất. Không có `点击` / `阅读量` / `人气` / `收藏` dạng số.
- **Trang danh sách** cũng không. Các số trong dòng đều là số chương.
- `周` / `月` xuất hiện trong HTML là **dương tính giả** — chúng nằm trong tên chương
  (`求月票` = xin phiếu tháng) và trong ngày tháng, không phải nhãn xếp hạng.

Không có bảng xếp hạng tuần/tháng:

| URL thử | Kết quả |
|---|---|
| `/paihang/week/`, `/paihang/month/` | 404 |
| `/zhoubang/`, `/yuebang/`, `/top/` | 200 nhưng nội dung là **TRANG CHỦ** (bẫy catch-all) |
| `/paihang/?type=week` | tham số bị bỏ qua, y hệt `/paihang/` |

Chỉ có một bảng xếp hạng tổng ở `/paihang/` (489 trang). Số hạng nằm trong
`<b class="rank1">01</b>` — đã thử hiện ra rồi **gỡ bỏ**: xếp hạng tổng không phản ánh
độ hot hiện tại nên không đáng đưa vào.

---

## Thanh tab và lưới thể loại

`home.js` chỉ giữ **4 tab** ngang: Mới cập nhật, Bảng xếp hạng, Hoàn tất, Trang chủ.

17 thể loại chuyển sang `genre.js` — vBook dựng thành **lưới thu gọn** (nút ở đầu thanh
tab mở ra), giống cách ext Cà Chua làm. `genre.js` trả về cùng dạng
`{title, input, script}` như tab của `home.js`.

`genre.js` đọc **động** từ `/fenlei/`, không đặt cứng: site thêm thể loại thì tự có.
Chỉ bảng tên tiếng Việt là đặt cứng — khớp thì dịch, không khớp thì giữ nguyên tên Trung,
nên thể loại lạ vẫn hiện chứ không biến mất.

Tên trong lưới kèm số truyện, ví dụ `Đô thị (1062)`.

---

## Nội dung chương CŨNG bị phân trang

**Lỗi nặng nhất của bản này, sửa 2026-09-06 (v7).** Không chỉ mục lục — **nội dung
chương cũng chia trang**, dùng đuôi **gạch ngang** trước `.html`:

| Trang | Ký tự | Link `下一页` |
|---|---|---|
| `/2349/1181835.html` | 524 | → `1181835-2.html` |
| `/2349/1181835-2.html` | 827 | → `-3` |
| `/2349/1181835-3.html` | 547 | → `-4` |
| `/2349/1181835-4.html` | 625 | **không có** (trang cuối) |
| **Tổng** | **2523** | |

Chỉ lấy trang đầu là **mất 80% chương**.

Mức thiệt hại thật sau khi sửa:

| Chương | Trước | Sau |
|---|---|---|
| `2349/1181835` | 693 | **2523** |
| `51/3194` | 2368 | **7618** |

### Vì sao lọt lưới suốt mấy vòng test

Lúc dựng ext, tôi so nội dung trả về (2368) với `div.con` đo tay (2288) rồi kết luận
"không mất nội dung, còn dư vì thêm thẻ `<p>`". **Phép so đó vô giá trị**: cả hai đều
chỉ là **trang 1**. So kết quả với chính cái nguồn cũng thiếu thì không chứng minh
được gì.

Bài học lặp lại lần thứ ba trong dự án này (sau `/book/<id>/` của 69shuba và mục lục
999 chương): **muốn biết có thiếu không, phải tìm mốc độc lập** — ở đây là nhãn
`第N章` của chương cuối, hoặc link `下一页`. Đừng so với số do chính mình đo bằng
cùng một giả định.

### Rate limit của site — phạt bằng cách đá sang Google

Site có bộ giới hạn tần suất **của riêng nó** (server IIS, không phải Cloudflare).
Khi vượt ngưỡng, mọi đường dẫn trả:

```
HTTP/1.1 302
Location: https://www.google.com/
```

Kể cả trang chủ. Nghỉ 10-15 phút thì tự hết, hoặc đổi IP.

**Đây nhiều khả năng là nguyên nhân của triệu chứng "đọc 3-5 chương lại phải bấm tải
lại"** mà người dùng báo — và nó có từ TRƯỚC khi thêm phân trang chương, nên không
phải do số request mỗi chương. Việc bấm tải lại có tác dụng chỉ vì lúc đó đã nghỉ đủ lâu.

Giảm nhẹ: trong vBook nâng **"Giãn cách kết nối"** từ mặc định 10ms lên **300-500ms**.

### BẪY: vòng lặp trang chương chạy vòng tròn

**Lỗi tôi tự tạo ra ở v7, sửa ở v8.** Trang ngoài phạm vi của MỘT SỐ chương trả về
lại **trang 1** (không phải rỗng như chương tôi thử lúc đầu). Khi đó `下一页` của nó
trỏ về `-2`, và vòng lặp quay **2 → 3 → 4 → 2 → 3 → 4…** tới khi chạm `MAX_PAGES`.

Hậu quả đo được trên chương `/2349/1181227.html`:

| | v7 | v8 |
|---|---|---|
| Kết quả | **500 đoạn / 20 trang** | 102 đoạn / 4 trang |

Tức mỗi chương bắn 20 request và trả về nội dung lặp 5 lần. Ba chương như vậy là đủ
53 request và bị chặn IP ngay.

**Chốt chặn hiện tại, cả ba đều cần:**

1. `visited[page]` — quay lại số trang đã đọc thì dừng. **Đây là chốt chính**, nó cắt
   đúng chu trình.
2. Vân tay **cả trang** (`got.join('')`) — trang lặp nguyên vẹn thì dừng.
3. `MAX_PAGES = 20` — chốt cuối.

**Đừng khử trùng theo từng đoạn.** Đã thử và nó ăn nhầm các câu lặp hợp lệ trong văn
bản: một chương 110 đoạn bị còn 106. Vân tay cả trang thì không mất chữ.

### Cảnh giác: công cụ đo hỏng trông y như site hỏng

Trong lúc truy lỗi này, một regex Python `<div class="con">(.*?)</div>` khớp hụt (thẻ
thật có thêm thuộc tính) khiến 9 trang liên tiếp báo `len=0`, trông hệt như đang bị
chặn IP. Thực tế trang tải bình thường: 6340 byte, 32 thẻ `<p>`.

Trước khi kết luận "site chặn", hãy kiểm bằng thứ độc lập với parser — mã HTTP,
`Content-Length`, hoặc `grep` thẳng chuỗi `class="con"` trong HTML thô.

### Điều kiện dừng

Khác mục lục ở chỗ quan trọng: trang ngoài phạm vi (vd `-9.html`) trả về `div.con`
**rỗng**, không quay vòng về trang 1. Nên vòng lặp tự dừng được. Vẫn giữ cả hai chốt:

1. Không còn link `下一页` (lấy số trang từ đuôi `-(\d+)\.html`)
2. Trang không cho thêm đoạn nào

Cộng `MAX_PAGES = 20`. Nếu `下一页` trỏ sang link không có đuôi `-N` (chuyển chương)
thì regex không khớp → dừng, đúng hơn là đi lạc sang chương sau.

Số request: chương 1 trang tốn 1, chương 4 trang tốn 4.

---

## Nội dung chương: giữ nguyên đoạn (đừng bê MERGE_MIN từ ext khác sang)

**Lỗi đã sửa 2026-09-06.** Bản đầu bê nguyên `MERGE_MIN = 600` từ `vbook-69shuba`
sang mà không xét lại. Hậu quả đo được trên một chương thật:

| | Trước | Sau |
|---|---|---|
| Thẻ `<p>` trong nguồn | 63 | 63 |
| Khối trả về | **4** | **56** |
| Khối dài nhất | 684 ký tự | 115 ký tự |

63 đoạn bị ép còn 4 khối ~600 ký tự nối bằng **dấu cách** → đọc bằng mắt thấy chữ dính
liền một mảng, không xuống dòng. Chính chú thích trong `vbook-69shuba/src/config.js`
đã ghi 600 là "gộp mạnh, gần như đọc liên tục" — tối ưu cho TTS, hỏng cho đọc mắt.
Bê sang mà không đọc chú thích là ra lỗi này.

Số khối 56 (không phải 63) là do `isJunk()` lọc bỏ 7 dòng rỗng/rác — đúng như mong muốn.

### Cách hoạt động hiện tại

Mức gộp đọc từ `plugin.json.config.MERGE_TTS`, mặc định **Giữ nguyên đoạn**.
Các mức: `Gộp nhẹ (300)`, `Gộp vừa (600)`, `Gộp mạnh (1200)`.

Khi **bật** gộp, các đoạn nối bằng **`<br>` chứ không phải dấu cách** — nên dù gộp thì
cách dòng vẫn còn khi đọc bằng mắt. Đã đo ở mức 600: 56 đoạn → 5 khối, kèm **51 thẻ
`<br>`**.

**Chưa kiểm được** vBook có tách câu TTS tại `<br>` hay không. Nếu có thì bật gộp sẽ
không còn tác dụng cho TTS — nhưng hiển thị thì không bao giờ hỏng, nên đây là đánh
đổi an toàn.

---

## Bốn cái bẫy — đọc trước khi sửa

**1. Tìm kiếm không nằm ở đường dẫn đoán được.**
`/search/?q=` và `/s/?q=` đều trả **HTTP 200** nhưng nội dung là **TRANG CHỦ** (đúng 64
link truyện, đúng title trang chủ). Trông y như tìm kiếm hỏng, thực ra là đường dẫn sai.
Endpoint thật là `/i/sor.aspx?key=` — form nhập ở `/i/so.aspx` trỏ tới `sor.aspx` bằng
đường dẫn tương đối. Trang chủ **không có form tìm kiếm nào**, chỉ có link sang Bing,
nên không tự dò ra được.

**2. vBook cắt dấu `/` cuối URL** trước khi gọi `execute(url)` (SKILL.md ràng buộc 7).
Site này bắt buộc phải có `/` cuối. Luôn dựng lại bằng `bookUrl(id)`, đừng dùng thẳng
`url` nhận được.

**3. Tên truyện bọc trong `<h1>` hay `<h3>` tuỳ trang** — `h1` ở trang chủ và trang
truyện, `h3` ở trang tìm kiếm. `parseList()` vì thế bắt theo **href** khớp `^/\d+/$`
chứ không theo thẻ bao ngoài.

**4. `<h1>` trên trang truyện chứa cả số chữ lẫn tên**: `<h1><i>653.5万字</i><a>捞尸人</a></h1>`.
Lấy `h1.text()` sẽ ra `653.5万字捞尸人`. Phải lấy từ thẻ `<a>` bên trong.

---

## Vòng lặp test

Giống hệt bản 69shuba, dùng chung harness ở `../.claude/skills/vbook-extensions/`.
Chạy từ thư mục cha (`vbook ext/`):

```
node .claude/skills/vbook-extensions/scripts/vbook.js test vbook-shudugu toc.js "https://www.shudugu.org/51/"
```

Trong Git Bash, tham số bắt đầu bằng `/` bị nuốt thành đường dẫn Windows — nhớ
`export MSYS_NO_PATHCONV=1` khi truyền `/zuixin/` và tương tự.

`[test] code=200` chỉ là mã HTTP; mã thật của script là `"code": 0` trong khối output.

---

## Việc còn treo

**`icon.png` là ảnh tạm tự sinh** (200×200, hình quyển sách đơn giản). Favicon của site
chỉ có ICO 32×32 nên không dùng trực tiếp được, và máy này không có ImageMagick lẫn PIL.
Thay bằng ảnh đẹp hơn nếu muốn.

**Số chương thiếu ~50% trên `/wanjie/`** — truyện hoàn kết bằng ngoại truyện không đánh
số. Chỉ lấy đủ được nếu mở từng truyện, mà như thế là 10 request mỗi trang danh sách.
Để nguyên.

**`chap.js` lọc rác chưa đối chiếu nhiều chương.** Hàm `isJunk()` loại tên site và các
dòng điều hướng, nhưng mới xác minh trên 2 chương. Nếu thấy rác lọt vào, thêm mẫu ở đó.
