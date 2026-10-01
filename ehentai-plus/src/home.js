load('config.js');

function execute() {
    return Response.success([
        { title: "Top hôm qua", input: "src=top&tl=15&cfgcats=1", script: "gen.js" },
        { title: "Top tuần", input: "src=top&tl=13&days=7&cfgcats=1", script: "gen.js" },
        { title: "Top tháng", input: "src=top&tl=13&cfgcats=1", script: "gen.js" },
        { title: "Top năm", input: "src=top&tl=12&cfgcats=1", script: "gen.js" },
        { title: "Top mọi lúc", input: "src=top&tl=11&cfgcats=1", script: "gen.js" },
        { title: "Đang hot", input: "src=hot&cfgcats=1", script: "gen.js" },
        { title: "Mới nhất", input: "src=new&cfgcats=1", script: "gen.js" }
    ]);
}
