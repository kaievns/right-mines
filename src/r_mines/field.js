/**
 * This class represents the mines field
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
RMines.Field = new Class(Observer, {
  EVENTS: $w('change reset loose win'),
  
  Options: {
    // the field sizes
    Sizes: {
      small:   '8x8',
      average: '16x8',
      normal:  '16x16',
      big:     '24x16',
      king:    '32x16'
    },
    
    // cells per mine concentration
    Levels: {
      easy:    9,
      normal:  6,
      hard:    3
    }
  },
  
  state: 'new',
  
  /**
   * Basic constructor
   */
  initialize: function() {
    this.$super();
    this.element = $E('div', {'class': 'field'})
      .onMousedown(this.click.bind(this));
  },
  
  /**
   * Resets the field
   *
   * @param RMines.Controls controls
   * @return this;
   */
  reset: function(controls) {
    this.size    = this.Options.Sizes[controls.size.value]   || '8x8';
    this.level   = this.Options.Levels[controls.level.value] || 9;
    this.state   = 'new';
    this.marked  = 0;
    this.overall = 0;
    
    this.resize(controls).rebuild();
    
    return this.fire('reset');
  },
  
  /**
   * Changes the visual block size on the field
   *
   * @param RMines.Controls controls
   * @return this;
   */
  resize: function(controls) {
    this.element.setClass('field '+ (controls.blocks.value || 'normal'));
    return this;
  },
  
// protected
  
  // catches the clicks on the field
  click: function(event) {
    event.stop();
    
    var target = event.target, row = target.parent(), position = {
      x: row.subNodes().indexOf(target),
      y: row.parent().subNodes().indexOf(row)
    };
    
    this[(event.which == 3 || event.shiftKey) ? 'mark' : 'check'](position);
  },
  
  // tries to check the cell
  check: function(position) {
    console.log("Check", position);
    return this.fire('change');
  },
  
  // tries to mark the cell
  mark: function(position) {
    console.log("Mark", position);
    return this.fire('change');
  },
  
  // rebuilds the field
  rebuild: function() {
    var size = this.size.split('x').map('toInt');
    
    this.element.clean();
    this.cells = [];
    
    for (var y=0; y < size[1]; y++) {
      for (var row = [], x=0; x < size[0]; x++) {
        row.push(new Element('div'));
      }
      
      this.cells.push(row);
      this.element.insert(new Element('div', {'class': 'row'}).insert(row));
    }
  },
  
  // distributes the mines around
  generate: function() {
    
  }
});