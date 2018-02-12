var Helloworld = {
  onLoad: function() {
    this.initialized = true;
  },

  onMenuItemCommand: function() {
    window.open("chrome://taiga/content/options.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { Helloworld.onLoad(e); }, false); 
