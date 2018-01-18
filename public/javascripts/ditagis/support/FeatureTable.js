define([
  "esri/tasks/QueryTask",
  "esri/request"
], function (QueryTask,esriRequest) {
  'use strict';
  return class {
    constructor(params={}) {
      this.url = params.url;
      this.fieldID = params.fieldID || 'OBJECTID';
      this.queryTask = new QueryTask(this.url);
      $.get(this.url+'?f=json').done((res)=>{
        res = JSON.parse(res)
        for (const key in res) {
          this[key]=res[key]
        }
      })
    }
    findById(id) {
      return this.queryTask.execute({
        outFields: ['*'],
        where: `${this.fieldID} = '${id}'`
      });
    }
    getFieldDomain(field){
      return this. fields.find(function(f){
        return f.name === field;
      }).domain;
    }
    applyEdits(options = {
      addFeatures: [],
      updateFeatures: [],
      deleteFeatures: []
    }) {
      let form = document.createElement('form');
      form.method = 'post';
      if (options.addFeatures && options.addFeatures.length > 0) {
        let adds = document.createElement('input');
        adds.name = 'adds'
        adds.type = 'text';
        adds.value = JSON.stringify(options.addFeatures);
        form.appendChild(adds);
      }
      if (options.deleteFeatures && options.deleteFeatures.length > 0) {
        let deletes = document.createElement('input');
        deletes.name = 'deletes'
        deletes.type = 'text';
        deletes.value = options.deleteFeatures.join(',');
        form.appendChild(deletes);
      }
      if (options.updateFeatures && options.updateFeatures.length > 0) {
        let updates = document.createElement('input');
        updates.name = 'updates'
        updates.type = 'text';
        updates.value = JSON.stringify(options.updateFeatures);
        form.appendChild(updates);
      }
      let format = document.createElement('input');
      format.name = 'f';
      format.type = 'text';
      format.value = 'json';
      form.appendChild(format);
      return esriRequest(this.url + '/applyEdits?f=json', {
        method: 'post',
        body: form
      })
    }
  }


})