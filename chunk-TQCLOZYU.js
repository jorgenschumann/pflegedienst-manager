import{g as j,i as x,j as E,k,n as w,ta as N,ua as _,xa as $,za as O}from"./chunk-XLEO3LZP.js";import{$a as D,Hb as F,Ka as I,La as M,M as v,N as h,Oa as S,Qa as c,S as C,Wa as p,Xa as r,aa as T,eb as s,fb as d,jb as y,pb as g,qb as Q,rb as B,sb as m,ub as f,vb as u,ya as i}from"./chunk-LBWSWUIJ.js";var L=["start"],R=["end"],P=["center"],A=["*"];function V(e,l){e&1&&y(0)}function z(e,l){if(e&1&&(s(0,"div",4),c(1,V,1,0,"ng-container",5),d()),e&2){let t=g();p("data-pc-section","start"),i(),r("ngTemplateOutlet",t.startTemplate||t._startTemplate)}}function G(e,l){e&1&&y(0)}function H(e,l){if(e&1&&(s(0,"div",6),c(1,G,1,0,"ng-container",5),d()),e&2){let t=g();p("data-pc-section","center"),i(),r("ngTemplateOutlet",t.centerTemplate||t._centerTemplate)}}function J(e,l){e&1&&y(0)}function K(e,l){if(e&1&&(s(0,"div",7),c(1,J,1,0,"ng-container",5),d()),e&2){let t=g();p("data-pc-section","end"),i(),r("ngTemplateOutlet",t.endTemplate||t._endTemplate)}}var U=({dt:e})=>`
.p-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    padding: ${e("toolbar.padding")};
    background: ${e("toolbar.background")};
    border: 1px solid ${e("toolbar.border.color")};
    color: ${e("toolbar.color")};
    border-radius: ${e("toolbar.border.radius")};
    gap: ${e("toolbar.gap")};
}

.p-toolbar-start,
.p-toolbar-center,
.p-toolbar-end {
    display: flex;
    align-items: center;
}
`,W={root:"p-toolbar p-component",start:"p-toolbar-start",center:"p-toolbar-center",end:"p-toolbar-end"},q=(()=>{class e extends ${name="toolbar";theme=U;classes=W;static \u0275fac=(()=>{let t;return function(n){return(t||(t=T(e)))(n||e)}})();static \u0275prov=v({token:e,factory:e.\u0275fac})}return e})();var X=(()=>{class e extends O{style;styleClass;ariaLabelledBy;_componentStyle=C(q);getBlockableElement(){return this.el.nativeElement.children[0]}startTemplate;endTemplate;centerTemplate;templates;_startTemplate;_endTemplate;_centerTemplate;ngAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"start":case"left":this._startTemplate=t.template;break;case"end":case"right":this._endTemplate=t.template;break;case"center":this._centerTemplate=t.template;break}})}static \u0275fac=(()=>{let t;return function(n){return(t||(t=T(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-toolbar"]],contentQueries:function(a,n,b){if(a&1&&(m(b,L,4),m(b,R,4),m(b,P,4),m(b,N,4)),a&2){let o;f(o=u())&&(n.startTemplate=o.first),f(o=u())&&(n.endTemplate=o.first),f(o=u())&&(n.centerTemplate=o.first),f(o=u())&&(n.templates=o)}},inputs:{style:"style",styleClass:"styleClass",ariaLabelledBy:"ariaLabelledBy"},features:[F([q]),S],ngContentSelectors:A,decls:5,vars:9,consts:[["role","toolbar",3,"ngClass","ngStyle"],["class","p-toolbar-start",4,"ngIf"],["class","p-toolbar-center",4,"ngIf"],["class","p-toolbar-end",4,"ngIf"],[1,"p-toolbar-start"],[4,"ngTemplateOutlet"],[1,"p-toolbar-center"],[1,"p-toolbar-end"]],template:function(a,n){a&1&&(Q(),s(0,"div",0),B(1),c(2,z,2,2,"div",1)(3,H,2,2,"div",2)(4,K,2,2,"div",3),d()),a&2&&(D(n.styleClass),r("ngClass","p-toolbar p-component")("ngStyle",n.style),p("aria-labelledby",n.ariaLabelledBy)("data-pc-name","toolbar"),i(2),r("ngIf",n.startTemplate||n._startTemplate),i(),r("ngIf",n.centerTemplate||n._centerTemplate),i(),r("ngIf",n.endTemplate||n._endTemplate))},dependencies:[w,j,x,k,E,_],encapsulation:2,changeDetection:0})}return e})(),fe=(()=>{class e{static \u0275fac=function(a){return new(a||e)};static \u0275mod=M({type:e});static \u0275inj=h({imports:[X,_,_]})}return e})();export{X as a,fe as b};
