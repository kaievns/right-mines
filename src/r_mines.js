/**
 * The RMines game main file
 *
 * Copyright (C) 2010 Nikolay Nemshilov
 */
var RMines = new Class({
  // default options
  Options: {
    size:   'small',
    level:  'normal',
    blocks: 'normal'
  },
  
  initialize: function() {
    this.element = $E('div', {'class': 'r-mines'});
    
    this.field    = new RMines.Field();
    this.status   = new RMines.Status();
    this.controls = new RMines.Controls();
    
    this.element.insert([
      this.status.element,
      this.field.element,
      this.controls.element
    ]);
    
    this.field.onChange(function() {
      this.status.update(this.field);
    }.bind(this));
    
    this.status.onReset(function() {
      this.field.reset(this.controls);
    }.bind(this));
    
    this.controls.onChange(function() {
      this.field.reset(this.controls);
      this.status.reset().update(this.field);
    }.bind(this));
    
    this.controls.onResize(function() {
      this.field.resize(this.controls);
    }.bind(this));
    
    this.controls.reset(this.Options);
  }
});