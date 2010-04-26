#
# The building script
#
# NOTE: requires the 'front_compiler' gem
#
# Copyright (C) 2010 Nikolay V. Nemshilov
#

require 'rake'
require 'fileutils'
require 'rubygems'
require 'front_compiler'

BUILD_DIR  = 'build/'
BUILD_FILE = BUILD_DIR + 'r_mines.js'

JS_SOURCES = %w{
  r_mines
  r_mines/field
  r_mines/status
  r_mines/controls
}

CSS_SOURCES = %w{
  r_mines
}

task :default => :build

task :build do
  compiler = FrontCompiler.new
  
  puts " * Cleaning up"
  
  FileUtils.rm_rf   BUILD_DIR
  FileUtils.mkdir_p BUILD_DIR
  
  puts " * Compiling the script"
  
  src = JS_SOURCES.collect do |file|
    File.read("src/#{file}.js")
  end.join("\n\n")
  
  css = CSS_SOURCES.collect do |file|
    File.read("src/#{file}.css")
  end.join("\n\n")
  
  src += compiler.inline_css(css.gsub('../img', './img'))
  src = compiler.compact_js(src)#.create_self_build
  
  puts " * Writing the file"
  File.open(BUILD_FILE, "w") do |f|
    f.write File.read("src/header.js")
    f.write src
  end
  
end