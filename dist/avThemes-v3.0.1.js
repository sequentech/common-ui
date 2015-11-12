(function() {
    var avThemes = this.avThemes = {};
    avThemes.current = 'default';

    avThemes.change = function(theme) {
        var base = $("#theme").get('base');
        $("#theme").attr("href", base + "themes/"+theme+"/app.min.css");
    };
}).call(this);
