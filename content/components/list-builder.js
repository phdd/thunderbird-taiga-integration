class ListBuilder {

  static fetchEntitiesFrom(fetchEntities) {
    let list = new ListBuilder();
    list.listElementName = false;
    list.fetchEntities = fetchEntities;
    return list;
  }
  
  createItemsNamed(name) {
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
  
  nameEntities(entityName, entitiesName) {
    this.entityName = entityName;
    this.entitiesName = entitiesName;
    return this;
  }
  
  mapEntityToItemWith(entityItemMapper) {
    this.entityItemMapper = entityItemMapper;
    return this;
  }
  
  consumeSelectionWith(callback) {
    this.entities = {};
    
    const listener = () => {
      const selectedItem = this.list.querySelector('[selected=true]');
      
      if (selectedItem) {
        callback(this.entities[selectedItem.value]);
        
        if (this.storeSelection)
          this.storeSelection(selectedItem.value);
        
      } else callback(null);
    };
    
    switch (this.list.localName) {
      case 'menupopup':
        this.list.parentNode.addEventListener('command', listener, false);
        break;
      default: 
        this.list.addEventListener('select', listener, false);
    }
    
    this.list.style.cursor = 'progress';
    this.list.setAttribute('disabled', 'true');
    
    return new Promise((resolve, reject) => { 
      this
        .fetchEntities()
        
        .then((entities) => {
          if (entities.length == 0) 
            throw new Error(i18n('noEntities', [ this.entityName ]));

          let entityItemMapping = {};
          entities.forEach((entity) => {
            if (this.filter && !this.filter(entity))
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
            this.entities[entity.id] = entity;
            entityItemMapping[entity.id] = item;
          });

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          const selection = this
            .loadSelection()
            .map(possibleSelection => String(possibleSelection))
            .find(possibleSelection => 
              Object.keys(entityItemMapping).includes(possibleSelection));
          
          if (selection !== null) {
            switch (this.list.localName) {
              case 'menupopup':
                this.list.parentNode.selectedItem = entityItemMapping[selection];
                break;
              default: 
                this.list.selectedItem = entityItemMapping[selection];
            }
            
            listener();
          }
          
          resolve();
        })
        
        .catch((error) => {
          console.log(error); 
          
          if (typeof(error) !== 'string') {
  					error = Extension
              .i18n('errorGettingEntities', [ this.entitiesName ]);
  				}

          this.list.style.cursor = 'auto';
          this.list.setAttribute('disabled', 'false');
          
          reject(error);
        });
    });
  }

}
