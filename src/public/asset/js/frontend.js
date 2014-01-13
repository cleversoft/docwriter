jQuery(document).ready(function($){
    scrollUp();
});

var scrollUp = function () {
    var $ = jQuery;

    var $scroll = $('<a />').attr('href', '#').attr('id', 'scrollup');
    $scroll.html('<i class="fa fa-chevron-circle-up" />').appendTo('body');

    $(window).on('scroll', function() {
        if ($(window).scrollTop() >= 200){
            $scroll.stop().animate({bottom: 0}, 300);
        }
        else {
            $scroll.stop().animate({bottom: -50}, 300);
        }
    });

    $scroll.click(function() {
        $('body,html').stop().animate({scrollTop: 0});

        return false;
    });
};