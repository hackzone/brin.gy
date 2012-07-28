define([
  'jquery',
  'underscore', 
  'backbone',
  'app',
  'router',

  'text!templates/mapInfoContext.html',
  'text!templates/userMatch.html'
  ], function($, _, Backbone, appConfig, router, mapInfoContextTemplate, userMatchTemplate){
  var mapinfoContextView = Backbone.View.extend({
    
    className: 'infobox',
    events: {
        'click a.zoom': 'zoomHere',
        'click button#addBtn': 'addBtn',
    },
    app: appConfig.getState(),
    template: _.template( mapInfoContextTemplate ),

    addBtn: function() {
        if (! this.app.agent.loggedIn({alert:1})) {
            this.app.navbarView.login();
            return false;
        }

        haveit = this.model.get('haveit');
        var newhaveit = !haveit;
        var newcount;

        var oldcount = this.model.get('score');
        console.log(oldcount);
        if (haveit) 
            newcount = oldcount-1;
        else
            newcount = oldcount+1;

        this.model.set({haveit: newhaveit, score:newcount});
        console.log(oldcount, newcount, haveit, newhaveit);

        var key = this.model.get('key');
        var val = this.model.get('val');
        var type = (haveit) ? 'DELETE' : 'POST';
        var xdata = this.model.get('xdata');

        this.app.mutateKeyValue({key:key, val:val, type:type, xdata:xdata});
    },

    zoomHere: function() {
        var contextOptions = {
            center: this.model.get('location').center,
            radius: this.model.get('location').radius,
        };
        var circle = new google.maps.Circle(contextOptions);
        this.app.map.fitBounds(circle.getBounds());
        this.app.map.setZoom(this.app.map.getZoom()-2);
    },

    render: function(){
        this.$el.html( this.template(this.model.toJSON()) );

        var btnCaption = '+ me too';
        var btnClass = 'btn-success';
        if (this.model.get('haveit')) {
            btnCaption = '- remove';
            btnClass = 'btn-warning';
        }
        this.$('button#addBtn').html(btnCaption).addClass(btnClass);



        var utemplate = _.template(userMatchTemplate);
        var matches = this.model.get('matches');
        for (var m in matches) {
            var username = matches[m];
            var uhtml = utemplate({username:username});
            this.$('div#matches').append(uhtml);
        }
    },

    initialize: function(model){
        _.bindAll(this, 'render');
        // this.options = options;

        this.model = model;
        this.model.bind('change', this.render);
    },
  });
  return mapinfoContextView;
});
