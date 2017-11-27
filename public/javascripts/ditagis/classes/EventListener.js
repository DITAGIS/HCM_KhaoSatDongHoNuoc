define([], function () {
    'use strict';
    /**
     * Tạo một giao thức để đăng ký sự kiện
     */
    return class {
        constructor(member) {
            this.eventListeners = {

            };
            //đăng ký phương thức và thuộc tính cho đối tượng cần tạo EventListener
            member.on = this.on;
            member.fire = this.fire;
            member.eventListeners = this.eventListeners;

        }
        /**
         * Đăng ký sự kiện cho {type} với công việc thực hiện {listener}
         * Ví dụ:
         * lớp lắng nghe đăng ký sự kiện 'change' và thực hiện callbackChange
         * on('change',callbackChange) tức là đăng ký một sự kiện 'change'
         * nếu lớp nguồn gọi phương thức fire('change')
         * thì phương thức callbackChange sẽ được gọi
         * @param {string} type 
         * @param {function} listener 
         */
        on(type, listener) {
            //kiểm tra có hay chưa
            if (this.eventListeners[type]) {
                //nếu có thì thêm vào
                this.eventListeners[type].push(listener);
            } else {
                //nếu chưa thì khởi tạo
                this.eventListeners[type] = [listener];
            }
        }
        /**
         * Gọi những phương thức đã được đăng ký với {type} hoạt động và truyền
         * vào tham số {evt}
         * Ví dụ:
         * Khi lớp nguồn thực hiện một việc nào đó và gọi phương thức fire
         * thì những thành phần nào đăng ký lắng nghe sự kiện {type} sẽ được gọi
         * phương thức mà nó đã đăng ký thực hiện ở phương thức on(type,listener)
         * và khi listener được gọi thì sẽ được truyền vào giá trị là {evt}
         * @param {string} type 
         * @param {*} evt
         */
        fire(type, evt) {
            let listeners = this.eventListeners[type];
            if (listeners) {
                for (let listener of listeners) {
                    listener(evt);
                }
            }
        }
    }
});