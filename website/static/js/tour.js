
ww = $(window).width();
wh = $(window).height();
Tour = {};
Tour.inTour = false;
Tour.tourSlides = [];
Tour.top = 215;
Tour.tourSlides.push({
    left:55, top:Tour.top, 
    width:0, height:wh-Tour.top, 
    text:"So, you want to find some people. Awesome! <br>This tour will show you how Brin.gy works.",
    btnText: "Start",
    backbtnText: "",
});
Tour.tourSlides.push({
    left:5, top:Tour.top, 
    width:105, height:wh-Tour.top, 
    text:'This is a list of attributes, like "name", "age", "skills" and "location".',
    btnText: "Next",
    backbtnText: "Back",
});
Tour.tourSlides.push({
    left:110, top:Tour.top, 
    width:170, height:wh-Tour.top, 
    text:'This is a list of values for each attribute, like "pol" for "name and "chinese" for "language".',
    btnText: "Next",
    backbtnText: "Back",
});
Tour.tourSlides.push({
    left:110, top:Tour.top, 
    width:30, height:wh-Tour.top, 
    text:'The red boxes show the number of people that have added the attribute next to them.',
    btnText: "Next",
    backbtnText: "Back",
});
Tour.tourSlides.push({
    left:290, top:Tour.top, 
    width:50, height:wh-Tour.top, 
    text:'You can use these boxes to add or remove values to your profile.<br><br>Click on a box to add a piece of information about you, go on :)',
    btnText: "Next",
    backbtnText: "Back",
});

// PYTHON SKILL APP
Tour.tourSlides.push({
    left:130, top:Tour.top, 
    width:0, height:wh-Tour.top, 
    text:'Let\'s look for people who know python and their respective location.',
    btnText: "Next",
    backbtnText: "Back",
});
Tour.tourSlides.push({
    left:110, top:Tour.top, 
    width:170, height:wh-Tour.top,
    text:'First, look for people with the "python" skill by clicking on "python".',
    btnText: "Next",
    backbtnText: "Back",
    select_key: "skill",
    select_val: "python",
});
Tour.tourSlides.push({
    left:5, top:Tour.top, 
    width:105, height:wh-Tour.top,  
    text:'Intersect that with people who reported location by clicking on "my location" attribute.',
    btnText: "Next",
    backbtnText: "Back",
    select_key: "my location",
});

Tour.tourSlides.push({
    left:350, top:90, 
    width:165, height:wh-110, 
    text:'This is a list of results in the intersection.',
    btnText: "Next",
    backbtnText: "Back",
});
Tour.tourSlides.push({
    left:510, top:90, 
    width:ww-355, height:wh-110, 
    text:'... and these are the results on the map.',
    btnText: "Next",
    backbtnText: "Back",
});


// DATING APP
Tour.tourSlides.push({
    left:130, top:Tour.top, 
    width:0, height:wh-Tour.top, 
    text:'Now, let\'s look for a date instead ;)<BR><BR>Against all odds, you\'re a girl looking for a boy!',
    btnText: "Next",
    backbtnText: "Back",
    startFresh: true,
});
Tour.tourSlides.push({
    left:110, top:Tour.top, 
    width:170, height:wh-Tour.top,
    text:'First, let\'s look for males.',
    btnText: "Next",
    backbtnText: "Back",
    select_key: "sex",
    select_val: "male",
});
Tour.tourSlides.push({
    left:5, top:Tour.top, 
    width:105, height:wh-Tour.top,  
    text:'Intersect that with people who reported location by clicking on "my location" attribute.',
    btnText: "Next",
    backbtnText: "Back",
    select_key: "my location",
});

Tour.tourSlides.push({
    left:350, top:90, 
    width:ww-350, height:wh-110, 
    text:'... and these are the results on the map. Happy hunting!',
    btnText: "Finish",
    backbtnText: "Back",
});



Tour.close_tour = function() {
    Tour.inTour = false;
    $(".cover").fadeOut();
}

Tour.select_key = function(key){
    selector = "pill[key='"+key+"']";
    
    offset = $(selector).offset();
    if (offset != undefined) {
        $('#choices').animate({scrollTop: offset.top-wh/2},'slow');
        $(selector).children("a").click();
        return $(selector).children("a").children("span.attr_counters").html();
    }
}

Tour.select_val = function(key, val){
    selector = "div.valcontainer a[key='"+key+"'][val='"+val+"']";
//     console.log($(selector));
    offset = $(selector).offset();
    if (offset != undefined) {
        $('#choices').animate({scrollTop: offset.top-wh/2},'slow');
        $(selector).click();
        return $(selector).children("span.attr_counters").html();
    }
}

Tour.do_tour = function(index){
    Tour.inTour = true;
    if (index==undefined)
        index = 0;
        
    slide = Tour.tourSlides[index];

    $("#covernextbtn").html(slide.btnText).attr("index",index);
    $("#coverbackbtn").attr("index",index);
    if (slide.backbtnText.length)
        $("#coverbackbtn").show().html(slide.backbtnText);
    else
        $("#coverbackbtn").hide();
        
    $("#coverbanner").show();
    $("#covertext").show().html(slide.text);
    
    ww = $(window).width();
    wh = $(window).height();
    $("#covertop").show().css({height:slide.top});
    $("#coverleft").show().css({width:slide.left, top:slide.top, height:slide.height});
    $("#coverright").show().css({left:slide.left+slide.width, top:slide.top, width:ww-slide.left-slide.width, height:slide.height});
    $("#coverbottom").show().css({height:wh-slide.top-slide.height});
    
    
    if (slide.startFresh) {
        $("pill a").each(function(){
            if ($(this).hasClass("pressed")) {
                console.log("clicked", this);
                $(this).click();
            }
        });
    }
        
    if (slide.select_key) {            
        if (slide.select_val == undefined) {
            count = Tour.select_key(slide.select_key);
        } else {
            count = Tour.select_val(slide.select_key, slide.select_val);
        }
        $("#covertext").append('<br>('+count+' people found)');
    }
}