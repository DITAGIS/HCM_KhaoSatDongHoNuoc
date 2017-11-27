define([
], function () {
    'use strict';
    return class {
        constructor(options) {
            this.view = options.view;
        }
        get popup(){
            return this.view.popup;
        }
        get selectedFeature(){
            return this.popup.selectedFeature;
        }

        uploadFile() {
            let url = this.view.popup.selectedFeature.layer.url + "/" + this.view.popup.selectedFeature.layer.layerId + "/" + this.view.popup.selectedFeature.attributes.OBJECTID + "/addAttachment";
            let attachmentForm = document.getElementById('attachment-data');
            if (attachmentForm) {
                esriRequest(url, {
                    responseType: 'json',
                    body: attachmentForm
                }).then(res => {
                    if (res.data && res.data.addAttachmentResult && res.data.addAttachmentResult.success) {
                        // let file = attachmentForm.getElementsByTagName('input')[0];
                        // let item = {
                        //     id:res.data.addAttachmentResult.objectId,
                        //     name: file.value.replace(/^.*[\\\/]/, '')
                        // }
                        // this.renderAttachmentEditPopup(item);
                        // //xoa duong dan da chon
                        // file.value = '';
                        $.notify('Thêm hình ảnh thành công', {
                            type: 'success',
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                    } else {
                        $.notify('Thêm hình ảnh không thành công', {
                            type: 'danger',
                            placement: {
                                from: 'top',
                                align: 'left'
                            }
                        });
                    }
                })
            }
        }
        viewAttachment() {

        }
        deleteAttachment() {

        }
        /**
         * Lấy attachments của feature layer
         * @param {*} feature 
         */
        getAttachments(layer, id) {
            return new Promise((resolve, reject) => {
                var url = layer.url + "/" + layer.layerId + "/" + id;
                esriRequest(url + "/attachments?f=json", {
                    responseType: 'json',
                    method: 'get'
                }).then(result => {
                    resolve(result.data || null);
                });
            });

        }
    }
});