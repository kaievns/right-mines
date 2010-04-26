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
    
    this.onWin('showAnimation', 'marked').onLoose('showAnimation', 'blown');
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
  
  /**
   * catches the clicks on the field
   *
   * @param Event click
   * @return void
   */
  click: function(event) {
    var cell = event.target;
    
    if (cell.pos) {
      event.stop();
      
      if (this.state == 'new') this.generate(cell);
      
      if (this.state == 'working') {
        this[(event.which == 3 || event.shiftKey) ? 'mark' : 'check'](cell);
        this.checkState(cell).fire('change');
      }
    }
  },
  
  /**
   * tries to check the cell
   *
   * @param Element cell
   * @return void
   */
  check: function(cell) {
    if (!cell.marked) {
      if (!cell.open) {
        cell.addClass('open').open = true;
        
        if (cell.mined) {
          cell.addClass('blown').blown = true;
        } else if (cell.mines == 0) {
          this.neighbors(cell).each(this.check, this);
        }
      } else if (cell.mines > 0) {
        // cheat mode, if all the hidden neighbors have no mines, open them up
        var neighbors = this.neighbors(cell),
          closed = neighbors.filter(function(c) { return !c.open && !c.marked; }),
          mined  = closed.filter('mined');
          
        if (mined.empty()) {
          closed.each(this.check, this);
        }
      }
    }
  },
  
  /**
   * Marks/unmarks the cell as mined
   *
   * @param Element cell
   * @return void
   */
  mark: function(cell) {
    if (!cell.open) {
      cell.marked = cell.toggleClass('marked').hasClass('marked');
      this.marked += cell.marked ? 1 : -1;
      
    }
  },
  
  /**
   * rebuilds the field
   *
   * @return void
   */
  rebuild: function() {
    var size = this.size.split('x').map('toInt');
    
    this.element.clean();
    this.grid   = [];
    this.cells  = [];
    this.width  = size[0];
    this.height = size[1];
    this.overall = (this.width * this.height / this.level).floor();
    
    for (var y=0; y < this.height; y++) {
      for (var row = [], x=0; x < this.width; x++) {
        var cell = new Element('div', {pos: [x,y], html: '&nbsp;', mines: 0});
        row.push(cell);
        this.cells.push(cell);
      }
      
      this.grid.push(row);
      this.element.insert(new Element('div', {'class': 'row'}).insert(row));
    }
    
    
  },
  
  /**
   * distributes the mines around the field
   *
   * NOTE: creates a blank field so that the
   *       initial cell was always blank and the player
   *       had a nice first field
   *
   * @param Element initial cell
   * @return void
   */
  generate: function(initial_cell) {
    var blank_field = this.neighbors(initial_cell).concat([initial_cell]);
    blank_field.concat(blank_field.map(this.neighbors, this)).uniq();
    
    var targets = this.cells.without.apply(this.cells, blank_field);
    
    targets.shuffle().slice(0, this.overall).each('set', 'mined', true).each(function(cell) {
      this.neighbors(cell).each(function(cell) {
        if (!cell.mined)
          cell.mines ++;
      });
    }, this);
    
    this.cells.each(function(cell) {
      if (cell.mines > 0) cell.addClass('mines-'+cell.mines).innerHTML = cell.mines + '';
    });
    
    this.state = 'working';
  },
  
  /**
   * finds the cell neighbors
   *
   * @param Element cell
   * @return Array neighbors list
   */
  neighbors: function(cell) {
    var neighbors = [], cell_x = cell.pos[0], cell_y = cell.pos[1],
      height = this.height - 1, width = this.width - 1;
    
    for (var x, y, i=0; i < 9; i++) {
      x = cell_x + (i%3) - 1;
      y = cell_y + (i/3).floor() - 1;
      
      if (!(x < 0 || y < 0 || x > width || y > height || (cell_x == x && cell_y == y))) {
        neighbors.push(this.grid[y][x]);
      }
    }
    
    return neighbors;
  },
  
  /**
   * Checks the game status
   *
   * @return this
   */
  checkState: function(target_cell) {
    for (var finished = true, has_blown = false, cell, len = this.cells.length, i=0; i < len; i++) {
      cell = this.cells[i];
      if (cell.blown) {
        has_blown = true;
        break;
      } else if (!cell.marked && !cell.open) {
        finished = false;
      }
    }
    
    if (has_blown) {
      this.state = 'looser';
      this.fire('loose', target_cell);
    } else if (finished) {
      this.state = 'winner';
      this.fire('win', target_cell);
    }
    
    return this;
  },
  
  /**
   * Shows the final animation starting from the cell
   *
   * @param String animation type
   * @param Element the last clicked cells
   * @return void
   */
  showAnimation: function(type, last_cell) {
    var fx_duration   = 400,
        fx_width      = 1.2,
        cell_x        = last_cell.pos[0],
        cell_y        = last_cell.pos[1],
        half_width    = this.width/2,
        half_height   = this.height/2,
        x_distance    = cell_x > half_width  ? cell_x + 1 : half_width.round(),
        y_distance    = cell_y > half_height ? cell_y + 1 : half_height.round(),
        distance      = x_distance < y_distance ? y_distance : x_distance,
        step_timeout  = fx_duration / distance,
        step_duration = step_timeout * fx_width;
        
    var start_fx = function(cell, class_name) {
      cell.className = class_name;
    };
    
    var end_fx   = function(cell, class_name) {
      cell.className = class_name;
      if (cell.marked && !cell.mined) {
        cell.removeClass('marked').addClass('wrong');
      } else if (cell.mined && !cell.blown && !cell.marked) {
        cell.addClass('mined');
      }
    };
    
    for (var y=0; y < this.height; y++) {
      for (var x=0; x < this.width; x++) {
        var x_diff  = (x - cell_x).abs(),
            y_diff  = (y - cell_y).abs(),
            diff    = x_diff < y_diff ? y_diff : x_diff,
            timeout = diff * step_timeout,
            cell    = this.grid[y][x];
        
        start_fx.delay(timeout, cell, type);
        end_fx.delay(timeout + step_duration, cell, cell.className);
      }
    }
  }
});