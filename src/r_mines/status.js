/**
 * Presents the status bar for the game
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
RMines.Status = new Class(Observer, {
  EVENTS: $w('reset update'),
  
  initialize: function() {
    this.$super();
    this.element = $E('div', {'class': 'status-bar'});
    
    this.element.insert([
      this.timer = $E('div', {'class': 'timer'}),
      this.state = $E('div', {'class': 'state'}),
      this.smile = $E('div', {'class': 'smile', title: 'Reset'})
    ]);
    
    this.smile.onClick(this.reset.bind(this));
    
    this.hartBeat.bind(this).periodical(1000);
    this.reset();
  },
  
  /**
   * Resets the state
   *
   * @return this
   */
  reset: function() {
    this.time    = 0;
    this.marked  = 0;
    this.overall = 0;
    this.status  = 'new';
    this.smile.className = 'smile';
    
    return this.updateTime().updateSmile().updateMines().fire('reset');
  },
  
  /**
   * updates the state
   *
   * @param RMines.Field field
   * @return this
   */
  update: function(field) {
    this.status  = field.state;
    this.marked  = field.marked;
    this.overall = field.overall;
    
    return this.updateSmile().updateMines().fire('update');
  },
  
// protected

  // the timer counter 
  hartBeat: function() {
    if (this.status == 'working') {
      this.time ++;
      this.updateTime();
    }
  },
  
  // updates the timer
  updateTime: function() {
    var seconds =  this.time % 60;
    var minutes = (this.time / 60).floor() % 60;
    var hours   = (this.time / 3600).floor();
    
    this.timer.update(
      "Time: " +
      (hours   > 9 ? '' : '0') + hours   + ":" +
      (minutes > 9 ? '' : '0') + minutes + ":" +
      (seconds > 9 ? '' : '0') + seconds
    );
    
    return this;
  },
  
  // updates the smile block
  updateSmile: function() {
    var smile_class;
    
    switch (this.status) {
      case 'working': smile_class = 'working'; break;
      case 'winner':  smile_class = 'winner';  break;
      case 'looser':  smile_class = 'looser';  break;
    }
    
    this.smile.className = 'smile '+ smile_class;
    
    return this;
  },
  
  // updates the mines counter block
  updateMines: function() {
    this.state.update("Mines: "+ this.marked + "/" + this.overall);
    
    return this;
  }
});