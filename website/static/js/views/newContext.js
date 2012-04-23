define([
    'jquery', 
    'underscore', 
    'backbone',
    'scroll',

    'models/key',
    'models/attribute',
    'views/key',
    'views/valueDetailed',

    'text!templates/newContext.html',
], function($, _, Backbone, scroll, 
    kModel, attrModel, keyView, valueDetailedView,
    newContextTemplate){
    var newAttrView = Backbone.View.extend({

    tagName: 'newcontext',
    template: _.template(newContextTemplate),

    events: {
        'keypress input': 'valueKey',
        'keyup input': 'autocomplete',
    },

    getLocation: function() {
        var context = this.$('input#contextName').val();
        $(this.el).html('get location');
        var that = this;

        this.state.router.controlsView.setUIstate({
            footer:false,
            rightClb: function(){
                that.state.router.navigate('#/new/incontext/'+context, {trigger:true});
            },
            rightTitle: 'Next',
            title: 'Choose Location',
        });
    },
    getAttribute: function() {

    },

    autocomplete: function(evt) {
        var text = $(evt.target).val();
        var regex = new RegExp(text, 'i');
        var matches = [];
        this.$('#autocomplete').empty();

        var url = this.state.satellite.url+'/contexts';

        var that = this;
        $.getJSON(url, function(json){
            for (var i in json.contexts) {
                cntx = json.contexts[i].name;
                if (cntx.match(regex))
                    matches.push(cntx);
            }
            that.$('#suggestions > label').hide();
            _.each(matches, function(entry){
                that.$('#suggestions > label').show();

                var html = $('<a></a>').addClass('suggestion');
                html.html(entry);
                html.click(function(){
                    that.$('.suggestion').css('background-color','inherit');
                    $(this).css('background-color','#aaa');
                    $(evt.target).val($(this).html()).focus();
                    return false;
                });
                this.$('#autocomplete').append(html);
            });
        });
    },

    save: function(){
        var key = this.$('input#title').val();
        if (key.length == 0)
            return false;

        var that = this;
        var saved = false;
        this.$('input.value').each(function(i, obj){

            if ($(obj).val().length > 0) {
                var val = $(obj).val();
                // console.log('adding', i, key, val);

                that.state.mutateKeyValue(key, val, 'POST', function(json){
                    var attr = new attrModel({
                        key:key,
                        val:val,
                        kcnt:1, 
                        vcnt:1, 
                        selected:false,
                        display:true,
                        haveit:true, 
                        matches:{},
                        new:false,
                    });
                    attr.bind('change', that.state.attrCollection.modelChange)
                    that.state.attrCollection.add(attr);
                });
                saved = true;
            }
            if (saved && i > 1)
                that.state.router.navigate('#/all', {trigger:true});
        });
    },
    initialize: function(options) {
        _.bindAll(this, 'render', 'save');
        this.state = options.state;
    },

    valueKey: function(evt){
        if ($(evt.target).hasClass('value') && $(evt.target).val().length > 19)
            return false;
        if ($(evt.target).val().length > 22)
            return false;

        if (evt.keyCode == 32 || evt.keyCode == 13 ||(evt.keyCode >= 45 && evt.keyCode <= 126))
            return true;
        return false;
    },

    render: function() {
        html = this.template({username:this.username});
        $(this.el).html(html);
        $("#container").html(this.el);
        this.$('input#contextName').focus();
        return this;
    },

    });
    return newAttrView;
});