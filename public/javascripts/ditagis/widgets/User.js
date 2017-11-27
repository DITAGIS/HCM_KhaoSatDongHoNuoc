define([
    "dojo/on",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom",
    "esri/widgets/Expand",

    'css!ditagis/widgets/user.css'

], function (on,
    domConstruct, domClass, dom,
    Expand
) {
        'use strict';
        return class {
            constructor(view, options = {}) {
                this.view = view;
                this.options = {
                    position: "top-left",
                    icon: 'esri-icon-user',
                    title: 'Người dùng'
                }
                for (let i in options) {
                    this.options[i] = options[i];
                }
                this.isStartup = false;
            }
            get user(){
                return this.view.systemVariable.user;
            }
            startup() {
                if (this.user) {
                    if (!this.isStartup) {
                        this.initView();
                        this.view.ui.add(this.expand,this.options.position);
                        this.isStartup = true;
                    }
                }
            }
            destroy() {
                if (this.isStartup) {
                    this.view.ui.remove(this.expand);
                    delete this.DOM;
                    delete this.expand;
                    this.isStartup = false;
                }
            }
            initView() {
                try {
                    this.DOM = {};
                    this.DOM.container = domConstruct.create('div', {
                        class: 'esri-widget ditagis-widget-user'
                    });
                    this.DOM.ul = domConstruct.create('ul',{
                        
                    },this.DOM.container);
                    //thông tin tài khoản
                    domConstruct.create('li',{
                        class:'title',
                        innerHTML:this.user.displayName
                    },this.DOM.ul);
                    this.DOM.infoLi = domConstruct.create('li',{
                        class:'item'
                    },this.DOM.ul)
                    this.DOM.infoDiv = domConstruct.create('div', {
                        class: 'container info'
                    },this.DOM.infoLi)
                    //chỉnh sửa tài khoản
                    this.DOM.setting = domConstruct.create('button',{
                        class:'dtg-btn-widget setting',
                        innerHTML:'Cập nhật tài khoản'
                    },this.DOM.infoDiv);
                    on(this.DOM.setting,'click',()=>this.settingUserClickHandler());
                    //nút đăng xuất
                    this.DOM.btnLogout = domConstruct.create('button', {
                        class: 'dtg-btn-widget btn-logout',
                        innerHTML: 'Đăng xuất'
                    }, this.DOM.infoDiv);
                    //sự kiện khi nhấn vào nút đăng xuất
                    on(this.DOM.btnLogout,'click',()=>this.logoutClickHandler());


                    this.expand = new Expand({
                        expandIconClass: this.options.icon,
                        expandTooltip: this.options.title,
                        view: this.view,
                        content: this.DOM.container
                    });
                } catch (error) {
                    console.log(error);
                }
            }
            /**
             * Đăng xuất tài khoản
             */
            logoutClickHandler(){
                location.href='/account/logout';
            }
            successLogout(){

            }
            failLogout(){

            }
            /**
             * Cập nhật thông tin tài khoản
             */
            settingUserClickHandler(){

            }
        }
    });