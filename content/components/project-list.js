// TODO maybe generic 
// e.g. projects, priority, severity, …
class ProjectList {

  // TODO consider using a factory 
  // e.g. ComponentFactory.projectListWith(taigaApi)
  static connect(taigaApi) {
    let list = new ProjectList();
    list.listElementName = false;
    list.taigaApi = taigaApi;
    return list;
  }
  
  createElementsNamed(name) {
    this.listElementName = name;
  }
  
  populate(list) {
    while (list.firstChild) 
      list.removeChild(list.firstChild);
      
    this.list = list;
    return this;
  }
  
  load(callback) {
    this.list.addEventListener('select', () => {
      if (this.list.selectedItem !== null) 
        callback(this.list.selectedItem.value);
      else 
        callback(null);
    });
    
    this.list.style.cursor = 'progress';
    this.list.setAttribute('disabled', 'true');
    
    return new Promise((resolve, reject) => {       
      this.taigaApi
        .projects()
        
        .then((projects) => {
          if (projects.length == 0) 
            throw new Error('You are no member of any project.');

          projects.forEach((project) => {
            if (!project.i_am_member) 
              return;

            let item = document.createElement(
              this.listElementName || 'listitem');
              
            item.setAttribute('value', project.id);
            item.setAttribute('label', project.name);
            
            this.list.appendChild(item);
          });

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
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
