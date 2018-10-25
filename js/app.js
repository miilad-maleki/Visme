//************************************************Routers
application = {
	
	models: {},
	views: {},
	collections: {},
	routers: {},
	init: function() {
		directory = new application.views.states(directoryData);
		
		appRouter = new application.routers.Router();
		Backbone.history.start();
	}
	
}

application.routers.Router = Backbone.Router.extend({

	routes: {
		'filter/:type': 'urlFilter'
	},
	
	urlFilter: function(type) {
		directory.filterType = type;
		directory.trigger('change:filterType');
	}
	
});

//************************************************Model
application.models.State = Backbone.Model.extend({
	defaults: {
		
		'name': '',
		'abbreviation': '',
		'position': ''
	},
	
	initialize: function() {
		var self = this;
		if(this.get('position') !== '') {
			self.set('type', 'Western');
		} else {
			self.set('type', 'Eastern');
		}
	}
	
});

application.collections.state = Backbone.Collection.extend({
	
	model: application.models.State,
	
	comparator: function(state) {
		return state.get('name');
	}
	
});


//************************************************View


application.views.State = Backbone.View.extend({
	tagName: 'tr',
	
	attributes: function() {
		return {
			class: 'state ' + this.model.get('type')
		};
	},
	
	template: _.template($('#state-template').html()),
	
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},
	
});

application.views.states = Backbone.View.extend({

	el: '#wrapper',
	
	initialize: function(data) {
		this.collection = new application.collections.state(data);
		this.render();
		
		this.$el.find('#filters').append(this.createFilters());
		
		this.on('change:searchFilter', this.filterBySearch, this);
		this.on('change:filterType', this.filterByType, this);
		
		this.collection.on('reset', this.render, this);
	},
	
	events: {
		'keyup #searchBox': 'searchFilter',
		'click a.filter': 'setFilter'
	},
	
	render: function() {
		var self = this;
		$('#listing').empty();
		_.each(this.collection.models, function(state) {
			self.renderstate(state);
		}, this);
	},
	
	renderstate: function(state) {
		var newstate = new application.views.State({
			model: state
		});
		$('#listing').append(newstate.render().el);
	},
	
	getTypes: function() {
		return _.uniq(this.collection.pluck('type'));
	},
	
	
	
	createFilters: function() {
		var filters = '<a class="filter" href="#all" style="padding: 20px">all</a>';
		_.each(this.getTypes(), function(item) {
			filters += '<a class="filter" style="padding: 20px" href="#' + item + '">' + item + '</a>';
		});
		return filters;
	},

	searchFilter: function(e) {
		this.searchFilter = e.target.value;
		this.trigger('change:searchFilter');
	},
	
	setFilter: function(e) {
		e.preventDefault();
		this.filterType = e.currentTarget.innerHTML;
		this.trigger('change:filterType');
	},
	
	filterBySearch: function() {
		this.collection.reset(directoryData, {silent: true});
		var filterString = this.searchFilter,
		filtered = _.filter(this.collection.models, function(item) {
			return item.get('name').toLowerCase().indexOf(filterString.toLowerCase()) !== -1;
		});
		this.collection.reset(filtered);
	},
	
	filterByType: function() {
		if(this.filterType === 'all') {
			this.collection.reset(directoryData);
			appRouter.navigate('filter/all');
		} else {
			this.collection.reset(directoryData, { silent:true });
			var filterType = this.filterType,
			filtered = _.filter(this.collection.models, function(item) {
				return item.get('type') === filterType;
			});
			this.collection.reset(filtered);
			appRouter.navigate('filter/' + filterType);
		}
	}
	
});

application.init();