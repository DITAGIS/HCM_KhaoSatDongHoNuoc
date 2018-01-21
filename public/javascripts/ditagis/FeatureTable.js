define(["require", "exports", "esri/tasks/QueryTask", "esri/request"], function (require, exports, QueryTask, esriRequest) {
    "use strict";
    class FeatureTable {
        constructor(params) {
            this.url = params.url;
            this.fieldID = params.fieldID || 'OBJECTID';
            this.queryTask = new QueryTask({ url: this.url });
            esriRequest(this.url + '?f=json', { method: "get" }).then(res => {
                for (const key in res.data) {
                    this[key] = res.data[key];
                }
            });
        }
        findById(id) {
            return this.queryTask.execute({
                outFields: ['*'],
                where: `${this.fieldID} = '${id}'`
            });
        }
        getFieldDomain(field) {
            return this.fields.find(function (f) {
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
                adds.name = 'adds';
                adds.type = 'text';
                adds.value = JSON.stringify(options.addFeatures);
                form.appendChild(adds);
            }
            if (options.deleteFeatures && options.deleteFeatures.length > 0) {
                let deletes = document.createElement('input');
                deletes.name = 'deletes';
                deletes.type = 'text';
                deletes.value = options.deleteFeatures.join(',');
                form.appendChild(deletes);
            }
            if (options.updateFeatures && options.updateFeatures.length > 0) {
                let updates = document.createElement('input');
                updates.name = 'updates';
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
            });
        }
    }
    return FeatureTable;
});
