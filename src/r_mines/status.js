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
      this.timer = $E('div', {'class': 'timer', html: 'Time: 00:00:00'}),
      this.state = $E('div', {'class': 'state', html: 'Mines: 0/0'}),
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
    this.time   = 0;
    this.status = 'new';
    
    return this.fire('reset');
  },
  
  /**
   * updates the state
   *
   * @param RMines.Field field
   * @return this
   */
  update: function(field) {
    var smile_class = 'smile';
    
    switch (this.status = field.state) {
      case 'working': smile_class += ' working'; break;
      case 'winner':  smile_class += ' winner';  break;
      case 'looser':  smile_class += ' looser';  break;
    }
    
    this.smile.className = smile_class;
    
    this.state.update("Mines: "+ field.marked + "/" + field.overall);
    
    return this.fire('update');
  },
  
// protected

  // the timer counter 
  hartBeat: function() {
    if (this.status == 'working') {
      this.time ++;
      
      var seconds =  this.time % 60;
      var minutes = (this.time / 60).floor() % 60;
      var hours   = (this.time / 3600).floor();
      
      this.timer.update(
        "Time: " +
        (hours   > 9 ? '' : '0') + hours   +
        (minutes > 9 ? '' : '0') + minutes +
        (seconds > 9 ? '' : '0') + seconds
      );
    }
  }
});