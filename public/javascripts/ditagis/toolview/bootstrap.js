define([
    'dojo/window',
], function (win) {
    'use strict';
    return class {
        static modal(id, title, body, footer) {
            try {
                let width = win.getBox().w + 'px';
                let _modal, modalDlg, modalContent, modalHeader, modalBody, modalFooter;
                _modal = document.createElement('div');
                _modal.classList.add('modal', 'fade');
                _modal.id = id;
                _modal.setAttribute('tabindex', '-1');
                _modal.setAttribute('role', 'dialog');
                _modal.setAttribute('aria-labelledby', 'myModalLabel');
                _modal.setAttribute('aria-hidden', 'true');
                modalDlg = document.createElement('div');
                modalDlg.classList.add('modal-dialog');
                modalContent = document.createElement('div');
                modalContent.classList.add('modal-content');
                modalContent.style.maxWidth = width;
                modalContent.style.width = 'fit-content';
                modalHeader = document.createElement('div');
                modalHeader.classList.add('modal-header');
                let closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.classList.add('close');
                closeBtn.setAttribute('data-dismiss', 'modal');
                closeBtn.innerHTML = '<span aria-hidden="true">×</span><span class="sr-only">Đóng</span>';
                modalHeader.appendChild(closeBtn);
                modalHeader.innerHTML += `<h4 class="modal-title">${title}</h4>`;
                modalBody = document.createElement('div');
                modalBody.classList.add('modal-body');
                modalBody.appendChild(body);
                if (footer) {
                    modalFooter = document.createElement('div');
                    modalFooter.classList.add('modal-footer')
                    modalFooter.appendChild(footer);
                }
                modalContent.appendChild(modalHeader);
                modalContent.appendChild(modalBody);
                if (modalFooter) modalContent.appendChild(modalFooter);
                modalDlg.appendChild(modalContent);
                _modal.appendChild(modalDlg);
                document.body.appendChild(_modal);
                let $modal = $(`#${id}`);
                if ($modal) {
                    $modal.on('hidden.bs.modal', function () {
                        $modal.remove();
                    })
                    return $modal;
                }
                else {
                    return null;
                }
            } catch (error) {
                throw error;
            }
        }
    }
});