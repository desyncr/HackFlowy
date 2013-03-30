var app = app || {};

(function() {

  app.TaskView = Backbone.View.extend({

    tagName: 'li',
    template: $('#taskTemplate').html(),

    events: {
      'click .task': 'edit',
      'blur .edit': 'close',
      'keyup .edit': 'broadcast',
      'keypress .edit': 'add'
    },

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
      var tmpl = _.template(this.template);
      var task = this;
      this.$el.html(tmpl(this.model.toJSON()));
      this.$input = this.$('.edit');
      socket.on('task', function(data){
        if (task.model.id == data.id) {
          if (task.$input.val != data.content)
            task.$input.val(data.content);
        }
      });
      return this;
    },

    edit: function() {
      this.$el.addClass('editing');
      this.$input.focus();
    },

    broadcast: function() {
      socket.emit('task', { 
        id: this.model.id, 
        parent_id: this.model.parent_id, 
        content: this.$input.val().trim() 
      });
    },

    add: function(e) {
      if ( e.which === ENTER_KEY ) {
        this.$input.blur();
        var task = new app.Task({content:''});
        var taskView = new app.TaskView({model:task}).render();
        taskView.$el.insertAfter(this.$el);
        taskView.$input.focus();
      }
    },

    close: function() {
      var value = this.$input.val().trim();
      if (value === '') {
        this.model.destroy();
      }
      else
        this.model.save({content: value});
      this.$el.removeClass('editing');
    }

  });

}());