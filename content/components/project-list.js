// TODO maybe generic 
// e.g. projects, priority, severity, …
class ProjectList {

  static connect(taigaApi) {
    let list = new ProjectList();
    list.listElementName = false;
    list.taigaApi = taigaApi;
    return list;
  }
  
  createElementsNamed(name) {
    this.listElementName = name;
    return this;
  }
  
  loadSelection(callback) {
    this.loadSelection = callback;
    return this;
  }
  
  storeSelection(callback) {
    this.storeSelection = callback;
    return this;
  }
  
  populate(list) {
    while (list.firstChild) 
      list.removeChild(list.firstChild);
      
    this.list = list;
    return this;
  }
  
  load(callback) {
    this.list.addEventListener('select', () => {
      if (this.list.selectedItem !== null) {
        const value = this.list.selectedItem.value;
        
        if (this.storeSelection)
          this.storeSelection(value);
          
        callback(value);
        
      } else callback(null);
    });
    
    this.list.style.cursor = 'progress';
    this.list.setAttribute('disabled', 'true');
    
    return new Promise((resolve, reject) => {       
      this.taigaApi
        .projects()
        
        .then((projects) => {
          if (projects.length == 0) 
            throw new Error('You are no member of any project.');

          let projectItemMapping = {};
          projects.forEach((project) => {
            if (!project.i_am_member) 
              return;

            let item = document.createElement(
              this.listElementName || 'listitem');
              
            item.setAttribute('value', project.id);
            item.setAttribute('label', project.name);
            
            this.list.appendChild(item);
            projectItemMapping[project.id] = item;
          });

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          const lastSelection = this.loadSelection();

          if (lastSelection !== null &&
              Object.keys(projectItemMapping).includes(lastSelection))
            this.list.selectItem(projectItemMapping[lastSelection]);
          
          resolve();
        })
        
        .catch((error) => {
          if (typeof(error) !== 'string') {
  					error = 'There was an error getting the Projects'; // TODO localize
  					console.log(error);
  				}

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          reject(error);
        });
    });
  }

}
