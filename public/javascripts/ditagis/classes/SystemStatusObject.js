define(["ditagis/classes/EventListener"], function (EventListener) {
    'use strict';
    return class {
        constructor() {
            this._customer = null;
            this.eventListener = new EventListener(this);
        }
        get user(){
            return this._user;
        }
        set user(user){
            this._user=user;
        }
        get selectedFeature() {
            return this._customer;
        }

        set selectedFeature(value) {
            this._customer = value;
            this.fire('change-selectedFeature',value);
        }

        existCustomer() {
            return this._customer != null;
        }
    }
});