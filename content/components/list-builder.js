class ListBuilder {

  static fetchEntitiesFrom(fetchEntities) {
    let list = new ListBuilder();
    list.listElementName = false;
    list.fetchEntities = fetchEntities;
    return list;
  }
  
  createElementsNamed(name) {
    this.listElementName = name;
    return this;
  }
  
  loadSelectionWith(callback) {
    this.loadSelection = callback;
    return this;
  }
  
  storeSelectionWith(callback) {
    this.storeSelection = callback;
    return this;
  }
  
  addItemsTo(list) {
    while (list.firstChild) 
      list.removeChild(list.firstChild);
      
    this.list = list;
    return this;
  }
  
  addItemOnlyWhen(filter) {
    this.filter = filter;
    return this;
  }
  
  mapEntityToItemWith(entityItemMapper) {
    this.entityItemMapper = entityItemMapper;
    return this;
  }
  
  consumeSelectionWith(callback) {
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
      this
        .fetchEntities()
        
        .then((entities) => {
          if (entities.length == 0) 
            throw new Error('Sorry, but there are no items.');

          let entityItemMapping = {};
          entities.forEach((entity) => {
            if (!this.filter(entity))
              return;

            let item = document.createElement(
              this.listElementName || 'listitem');
            
            if (this.entityItemMapper) {
              this.entityItemMapper(entity, item);
            } else {
              item.setAttribute('value', entity.id);
              item.setAttribute('label', entity.name);
            }

            this.list.appendChild(item);
            entityItemMapping[entity.id] = item;
          });

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          const lastSelection = this.loadSelection();

          if (lastSelection !== null &&
              Object.keys(entityItemMapping).includes(lastSelection))
            this.list.selectItem(entityItemMapping[lastSelection]);
          
          resolve();
        })
        
        .catch((error) => {
          if (typeof(error) !== 'string') {
  					error = 'There was an error getting the items'; // TODO localize
  					console.log(error);
  				}

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          reject(error);
        });
    });
  }

}
