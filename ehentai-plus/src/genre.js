load('config.js');

// Mỗi thể loại × Mới / Tuần / Tháng / Năm / Mọi lúc
function execute() {
    var periods = [
        ["Mới", "src=new"],
        ["Top tuần", "src=top&tl=13&days=7"],
        ["Top tháng", "src=top&tl=13"],
        ["Top năm", "src=top&tl=12"],
        ["Top mọi lúc", "src=top&tl=11"]
    ];
    var out = [];
    EH_CATS.forEach(function (c) {
        periods.forEach(function (p) {
            out.push({ title: c + " · " + p[0], input: p[1] + "&cats=" + encodeURIComponent(c), script: "gen.js" });
        });
    });
    return Response.success(out);
}
