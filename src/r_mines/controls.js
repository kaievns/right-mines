/**
 * Represents the controls bar
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
RMines.Controls = new Class(Observer, {
  EVENTS: $w('change resize'),
  
  Options: {
    Sizes: {
      small:   'Small',
      average: 'Average',
      normal:  'Normal',
      big:     'Big',
      king:    'King Size'
    },
    
    Levels: {
      easy:    'Easy',
      normal:  'Normal',
      hard:    "You're dead"
    },
    
    Blocks: {
      small:   'Small',
      normal:  'Normal',
      big:     'Big'
    }
  },
  
  /**
   * Constructor
   */
  initialize: function() {
    this.$super();
    this.element = $E('div', {'class': 'controls-bar'});
    
    this.element.insert('<label>Size</label>')
      .insert(this.size = this.build(this.Options.Sizes));
    
    this.element.insert('<label>Level</label>')
      .insert(this.level = this.build(this.Options.Levels));
      
    this.element.insert('<label>Blocks</label>')
      .insert(this.blocks = this.build(this.Options.Blocks));
    
    this.size.on('change', this.fire.bind(this, 'change'));
    this.level.on('change', this.fire.bind(this, 'change'));
    this.blocks.on('change', this.fire.bind(this, 'resize'));
  },
  
  /**
   * Resets the values to saved or defaults
   *
   * @param Object default values
   * @return RMines.Controls self
   */
  reset: function(defaults) {
    // restoring the values
    var options = eval('('+ (Cookie.get('r-mines') || '{}') + ')');
    
    $w('size level blocks').each(function(name) {
      this[name].value = options[name] || defaults[name];
    }, this);
    
    return this.fire('change');
  },
  
// protected
  
  // saves the values in cookies
  save: function() {
    var options = $w('size level blocks').map(function(name) {
      return name+":'"+this[name].value+"'";
    }, this);
    
    Cookie.set('r-mines', '{'+ options.join(',') +'}');
  },
  
  // builds a select box
  build: function(hash) {
    var options = '';
    
    for (var key in hash) {
      options += '<option value="'+key+'">'+ hash[key] +'</option>';
    }
    
    return $E('select', {html: options}).on('change', this.save.bind(this));
  }
  
});