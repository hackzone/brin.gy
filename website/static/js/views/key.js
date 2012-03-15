define([
    'jquery', 
    'underscore', 
    'backbone',
    'text!templates/key.html',
], function($, _, Backbone, keyTemplate){
    var KeyView = Backbone.View.extend({

    //... is a list tag.
    // el:  $("#m-choices")[0],

    // Cache the template function for a single item.
    template: _.template(keyTemplate),

    // The DOM events specific to an item.
    events: {
      "click a"                   : "toggleSelected",
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'toggleSelected');
      this.model.bind('change', this.render);
      // this.model.bind('destroy', this.remove);
      this.model.view = this;
    },

    render: function() {
        html = this.template(this.model.toJSON());
        $(this.el).html(html);

        // valpart = this.$('div.valpart').children();
        // this.valplaceholder = this.$('div.valpart');
        // this.valplaceholder.append(valpart);

        return this;
    },

    toggleSelected: function() {
      this.model.toggleSelected();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

    });
    return KeyView;
});