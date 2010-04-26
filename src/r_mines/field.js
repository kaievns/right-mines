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
    var cell = event.target;
    
    if (cell.pos) {
      event.stop();
      
      if (this.state == 'new') this.generate(cell);

      this[(event.which == 3 || event.shiftKey) ? 'mark' : 'check'](cell);
      
      return this.fire('change');
    }
  },
  
  // tries to check the cell
  check: function(cell) {
    if (!cell.hasClass('marked')) {
      console.log("Check", cell.addClass('open').pos);
    }
  },
  
  // tries to mark the cell
  mark: function(cell) {
    if (!cell.opened) {
      this.marked += cell.toggleClass('marked').hasClass('marked') ? 1 : -1;
    }
  },
  
  // rebuilds the field
  rebuild: function() {
    var size = this.size.split('x').map('toInt');
    
    this.element.clean();
    this.cells  = [];
    this.width  = size[0];
    this.height = size[1];
    
    for (var y=0; y < this.height; y++) {
      for (var row = [], x=0; x < this.width; x++) {
        row.push(new Element('div', {pos: [x,y], html: '&nbsp;'}));
      }
      
      this.cells.push(row);
      this.element.insert(new Element('div', {'class': 'row'}).insert(row));
    }
  },
  
  // distributes the mines around
  generate: function(initial_cell) {
    // the number of mines
    this.overall = (this.width * this.height / this.level).floor();
    
    // calclulating the blank field so that our initial cell was always blank
    var blank_field = this.neighbours(initial_cell);
    blank_field.concat(blank_field.map(this.neighbours, this));
    
    // creating the lists of cells
    var cells = this.cells.flatten().each('set', 'mines', 0);
    var targets = cells.without.apply(cells, blank_field);
    
    // mining random positions
    targets.shuffle().slice(0, this.overall).each(function(cell) {
      this.neighbours(cell.set('mined', true)).each(function(cell) {
        cell.mines ++;
      });
    }, this);
    
    // filling up the numbers
    cells.each(function(cell) {
      if (cell.mines > 0) {
        cell.addClass('mines-'+cell.mines).innerHTML = cell.mines + '';
      }
    });
    
    this.state = 'working';
  },
  
  // finds the cell neighbours
  neighbours: function(cell) {
    var neighbours = [], cell_x = cell.pos[0], cell_y = cell.pos[1],
      height = this.height - 1, width = this.width - 1;
    
    for (var x, y, i=0; i < 9; i++) {
      x = cell_x + (i%3) - 1;
      y = cell_y + (i/3).floor() - 1;
      
      if (!(x < 0 || y < 0 || x > width || y > height || (cell_x == x && cell_y == y))) {
        neighbours.push(this.cells[y][x]);
      }
    }
    
    return neighbours;
  }
});