import{c as Le,e as Pe}from"./chunk-F2ONS6T4.js";import{a as He,b as Ke}from"./chunk-Z6WIBOCO.js";import{a as tt}from"./chunk-ZGZ265A2.js";import{a as je,b as Ue}from"./chunk-VT4TNMZE.js";import{a as Ge,b as Qe,d as Je,f as Ye,g as Xe,i as oe,n as et}from"./chunk-IDWJHHTY.js";import{f as ve,g as qe,h as We,i as Ze}from"./chunk-P7ZG6FVP.js";import{D as Ne,J as Ae,K as ze,L as q,R as fe,V as W,Y as me,g as Be,ga as ge,k as Oe,l as $e,ma as Fe,n as V,q as ie,ta as Ve,ua as he,wa as ae,ya as B}from"./chunk-OFVGZFTG.js";import{$b as E,Ab as v,Bb as j,Cb as U,Da as ce,Db as De,Ha as X,Hb as ne,Jb as Me,K as se,Ka as I,L as K,La as ee,M as J,Ma as ke,N as Y,Oa as D,Pa as Ie,Qa as f,Rb as G,S as b,Sb as Q,Wa as y,X as Se,Xa as m,Z as x,Za as M,_,a as P,aa as k,ab as g,ac as Re,b as N,cb as de,cc as p,da as le,db as pe,dc as be,eb as r,fb as s,ga as Ee,gb as R,jb as ue,ka as O,kb as T,la as we,ma as $,ob as h,p as Ce,pb as u,qb as A,rb as z,sb as te,tb as F,ub as C,vb as S,ya as l,zb as c}from"./chunk-LBWSWUIJ.js";function xe(e,a){let t=!a?.manualCleanup;t&&!a?.injector&&Se(xe);let i=t?a?.injector?.get(le)??b(le):null,n=pt(a?.equal),o;a?.requireSync?o=$({kind:0},{equal:n}):o=$({kind:1,value:a?.initialValue},{equal:n});let d,L=e.subscribe({next:w=>o.set({kind:1,value:w}),error:w=>{if(a?.rejectErrors)throw w;o.set({kind:2,error:w})},complete:()=>{d?.()}});if(a?.requireSync&&o().kind===0)throw new se(601,!1);return d=i?.onDestroy(L.unsubscribe.bind(L)),p(()=>{let w=o();switch(w.kind){case 1:return w.value;case 2:throw w.error;case 0:throw new se(601,!1)}},{equal:a?.equal})}function pt(e=Object.is){return(a,t)=>a.kind===1&&t.kind===1&&e(a.value,t.value)}var ut=["previcon"],bt=["nexticon"],ft=["content"],mt=["prevButton"],gt=["nextButton"],ht=["inkbar"],vt=["tabs"],Z=["*"],xt=e=>({"p-tablist-viewport":e});function _t(e,a){e&1&&ue(0)}function yt(e,a){if(e&1&&f(0,_t,1,0,"ng-container",11),e&2){let t=u(2);m("ngTemplateOutlet",t.prevIconTemplate||t._prevIconTemplate)}}function Tt(e,a){e&1&&R(0,"ChevronLeftIcon")}function Ct(e,a){if(e&1){let t=T();r(0,"button",10,3),h("click",function(){x(t);let n=u();return _(n.onPrevButtonClick())}),f(2,yt,1,1,"ng-container")(3,Tt,1,0,"ChevronLeftIcon"),s()}if(e&2){let t=u();y("aria-label",t.prevButtonAriaLabel)("tabindex",t.tabindex())("data-pc-group-section","navigator"),l(2),g(t.prevIconTemplate||t._prevIconTemplate?2:3)}}function St(e,a){e&1&&ue(0)}function Et(e,a){if(e&1&&f(0,St,1,0,"ng-container",11),e&2){let t=u(2);m("ngTemplateOutlet",t.nextIconTemplate||t._nextIconTemplate)}}function wt(e,a){e&1&&R(0,"ChevronRightIcon")}function kt(e,a){if(e&1){let t=T();r(0,"button",12,4),h("click",function(){x(t);let n=u();return _(n.onNextButtonClick())}),f(2,Et,1,1,"ng-container")(3,wt,1,0,"ChevronRightIcon"),s()}if(e&2){let t=u();y("aria-label",t.nextButtonAriaLabel)("tabindex",t.tabindex())("data-pc-group-section","navigator"),l(2),g(t.nextIconTemplate||t._nextIconTemplate?2:3)}}function It(e,a){e&1&&z(0)}var Dt=({dt:e})=>`
.p-tabs {
    display: flex;
    flex-direction: column;
}

.p-tablist {
    display: flex;
    position: relative;
}

.p-tabs-scrollable > .p-tablist {
    overflow: hidden;
}

.p-tablist-viewport {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-behavior: smooth;
    scrollbar-width: none;
    overscroll-behavior: contain auto;
}

.p-tablist-viewport::-webkit-scrollbar {
    display: none;
}

.p-tablist-tab-list {
    position: relative;
    display: flex;
    background: ${e("tabs.tablist.background")};
    border-style: solid;
    border-color: ${e("tabs.tablist.border.color")};
    border-width: ${e("tabs.tablist.border.width")};
}

.p-tablist-content {
    flex-grow: 1;
}

.p-tablist-nav-button {
    all: unset;
    position: absolute !important;
    flex-shrink: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${e("tabs.nav.button.background")};
    color: ${e("tabs.nav.button.color")};
    width: ${e("tabs.nav.button.width")};
    transition: color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    box-shadow: ${e("tabs.nav.button.shadow")};
    outline-color: transparent;
    cursor: pointer;
}

.p-tablist-nav-button:focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.nav.button.focus.ring.shadow")};
    outline: ${e("tabs.nav.button.focus.ring.width")} ${e("tabs.nav.button.focus.ring.style")} ${e("tabs.nav.button.focus.ring.color")};
    outline-offset: ${e("tabs.nav.button.focus.ring.offset")};
}

.p-tablist-nav-button:hover {
    color: ${e("tabs.nav.button.hover.color")};
}

.p-tablist-prev-button {
    left: 0;
}

.p-tablist-next-button {
    right: 0;
}

.p-tab {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    cursor: pointer;
    user-select: none;
    position: relative;
    border-style: solid;
    white-space: nowrap;
    gap: ${e("tabs.tab.gap")};
    background: ${e("tabs.tab.background")};
    border-width: ${e("tabs.tab.border.width")};
    border-color: ${e("tabs.tab.border.color")};
    color: ${e("tabs.tab.color")};
    padding: ${e("tabs.tab.padding")};
    font-weight: ${e("tabs.tab.font.weight")};
    transition: background ${e("tabs.transition.duration")}, border-color ${e("tabs.transition.duration")}, color ${e("tabs.transition.duration")}, outline-color ${e("tabs.transition.duration")}, box-shadow ${e("tabs.transition.duration")};
    margin: ${e("tabs.tab.margin")};
    outline-color: transparent;
}

.p-tab:not(.p-disabled):focus-visible {
    z-index: 1;
    box-shadow: ${e("tabs.tab.focus.ring.shadow")};
    outline: ${e("tabs.tab.focus.ring.width")} ${e("tabs.tab.focus.ring.style")} ${e("tabs.tab.focus.ring.color")};
    outline-offset: ${e("tabs.tab.focus.ring.offset")};
}

.p-tab:not(.p-tab-active):not(.p-disabled):hover {
    background: ${e("tabs.tab.hover.background")};
    border-color: ${e("tabs.tab.hover.border.color")};
    color: ${e("tabs.tab.hover.color")};
}

.p-tab-active {
    background: ${e("tabs.tab.active.background")};
    border-color: ${e("tabs.tab.active.border.color")};
    color: ${e("tabs.tab.active.color")};
}

.p-tabpanels {
    background: ${e("tabs.tabpanel.background")};
    color: ${e("tabs.tabpanel.color")};
    padding: ${e("tabs.tabpanel.padding")};
    outline: 0 none;
}

.p-tabpanel:focus-visible {
    box-shadow: ${e("tabs.tabpanel.focus.ring.shadow")};
    outline: ${e("tabs.tabpanel.focus.ring.width")} ${e("tabs.tabpanel.focus.ring.style")} ${e("tabs.tabpanel.focus.ring.color")};
    outline-offset: ${e("tabs.tabpanel.focus.ring.offset")};
}

.p-tablist-active-bar {
    z-index: 1;
    display: block;
    position: absolute;
    bottom: ${e("tabs.active.bar.bottom")};
    height: ${e("tabs.active.bar.height")};
    background: ${e("tabs.active.bar.background")};
    transition: 250ms cubic-bezier(0.35, 0, 0.25, 1);
}
`,Mt={root:({props:e})=>["p-tabs p-component",{"p-tabs-scrollable":e.scrollable}]},nt=(()=>{class e extends ae{name="tabs";theme=Dt;classes=Mt;static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275prov=J({token:e,factory:e.\u0275fac})}return e})();var re=(()=>{class e extends B{prevIconTemplate;nextIconTemplate;templates;content;prevButton;nextButton;inkbar;tabs;pcTabs=b(K(()=>H));isPrevButtonEnabled=$(!1);isNextButtonEnabled=$(!1);resizeObserver;showNavigators=p(()=>this.pcTabs.showNavigators());tabindex=p(()=>this.pcTabs.tabindex());scrollable=p(()=>this.pcTabs.scrollable());constructor(){super(),be(()=>{this.pcTabs.value(),ie(this.platformId)&&setTimeout(()=>{this.updateInkBar()})})}get prevButtonAriaLabel(){return this.config.translation.aria.previous}get nextButtonAriaLabel(){return this.config.translation.aria.next}ngAfterViewInit(){super.ngAfterViewInit(),this.showNavigators()&&ie(this.platformId)&&(this.updateButtonState(),this.bindResizeObserver())}_prevIconTemplate;_nextIconTemplate;ngAfterContentInit(){this.templates.forEach(t=>{switch(t.getType()){case"previcon":this._prevIconTemplate=t.template;break;case"nexticon":this._nextIconTemplate=t.template;break}})}ngOnDestroy(){this.unbindResizeObserver(),super.ngOnDestroy()}onScroll(t){this.showNavigators()&&this.updateButtonState(),t.preventDefault()}onPrevButtonClick(){let t=this.content.nativeElement,i=W(t),n=Math.abs(t.scrollLeft)-i,o=n<=0?0:n;t.scrollLeft=me(t)?-1*o:o}onNextButtonClick(){let t=this.content.nativeElement,i=W(t)-this.getVisibleButtonWidths(),n=t.scrollLeft+i,o=t.scrollWidth-i,d=n>=o?o:n;t.scrollLeft=me(t)?-1*d:d}updateButtonState(){let t=this.content?.nativeElement,i=this.el?.nativeElement,{scrollWidth:n,offsetWidth:o}=t,d=Math.abs(t.scrollLeft),L=W(t);this.isPrevButtonEnabled.set(d!==0),this.isNextButtonEnabled.set(i.offsetWidth>=o&&d!==n-L)}updateInkBar(){let t=this.content?.nativeElement,i=this.inkbar?.nativeElement,n=this.tabs?.nativeElement,o=Ae(t,'[data-pc-name="tab"][data-p-active="true"]');i&&(i.style.width=Ne(o)+"px",i.style.left=fe(o).left-fe(n).left+"px")}getVisibleButtonWidths(){let t=this.prevButton?.nativeElement,i=this.nextButton?.nativeElement;return[t,i].reduce((n,o)=>o?n+W(o):n,0)}bindResizeObserver(){this.resizeObserver=new ResizeObserver(()=>this.updateButtonState()),this.resizeObserver.observe(this.el.nativeElement)}unbindResizeObserver(){this.resizeObserver&&(this.resizeObserver.unobserve(this.el.nativeElement),this.resizeObserver=null)}static \u0275fac=function(i){return new(i||e)};static \u0275cmp=I({type:e,selectors:[["p-tablist"]],contentQueries:function(i,n,o){if(i&1&&(te(o,ut,4),te(o,bt,4),te(o,Ve,4)),i&2){let d;C(d=S())&&(n.prevIconTemplate=d.first),C(d=S())&&(n.nextIconTemplate=d.first),C(d=S())&&(n.templates=d)}},viewQuery:function(i,n){if(i&1&&(F(ft,5),F(mt,5),F(gt,5),F(ht,5),F(vt,5)),i&2){let o;C(o=S())&&(n.content=o.first),C(o=S())&&(n.prevButton=o.first),C(o=S())&&(n.nextButton=o.first),C(o=S())&&(n.inkbar=o.first),C(o=S())&&(n.tabs=o.first)}},hostVars:5,hostBindings:function(i,n){i&2&&(y("data-pc-name","tablist"),M("p-tablist",!0)("p-component",!0))},features:[D],ngContentSelectors:Z,decls:9,vars:6,consts:[["content",""],["tabs",""],["inkbar",""],["prevButton",""],["nextButton",""],["type","button","pRipple","",1,"p-tablist-nav-button","p-tablist-prev-button"],[1,"p-tablist-content",3,"scroll","ngClass"],["role","tablist",1,"p-tablist-tab-list"],["role","presentation",1,"p-tablist-active-bar"],["type","button","pRipple","",1,"p-tablist-nav-button","p-tablist-next-button"],["type","button","pRipple","",1,"p-tablist-nav-button","p-tablist-prev-button",3,"click"],[4,"ngTemplateOutlet"],["type","button","pRipple","",1,"p-tablist-nav-button","p-tablist-next-button",3,"click"]],template:function(i,n){if(i&1){let o=T();A(),f(0,Ct,4,4,"button",5),r(1,"div",6,0),h("scroll",function(L){return x(o),_(n.onScroll(L))}),r(3,"div",7,1),z(5),R(6,"span",8,2),s()(),f(8,kt,4,4,"button",9)}i&2&&(g(n.showNavigators()&&n.isPrevButtonEnabled()?0:-1),l(),m("ngClass",Me(4,xt,n.scrollable())),l(5),y("data-pc-section","inkbar"),l(2),g(n.showNavigators()&&n.isNextButtonEnabled()?8:-1))},dependencies:[V,Be,Oe,Ge,Qe,qe,ve,he],encapsulation:2,changeDetection:0})}return e})(),_e=(()=>{class e extends B{value=X();disabled=O(!1,{transform:E});pcTabs=b(K(()=>H));pcTabList=b(K(()=>re));el=b(we);ripple=p(()=>this.config.ripple());id=p(()=>`${this.pcTabs.id()}_tab_${this.value()}`);ariaControls=p(()=>`${this.pcTabs.id()}_tabpanel_${this.value()}`);active=p(()=>ge(this.pcTabs.value(),this.value()));tabindex=p(()=>this.active()?this.pcTabs.tabindex():-1);mutationObserver;onFocus(t){this.pcTabs.selectOnFocus()&&this.changeActiveValue()}onClick(t){this.changeActiveValue()}onKeyDown(t){switch(t.code){case"ArrowRight":this.onArrowRightKey(t);break;case"ArrowLeft":this.onArrowLeftKey(t);break;case"Home":this.onHomeKey(t);break;case"End":this.onEndKey(t);break;case"PageDown":this.onPageDownKey(t);break;case"PageUp":this.onPageUpKey(t);break;case"Enter":case"NumpadEnter":case"Space":this.onEnterKey(t);break;default:break}t.stopPropagation()}ngAfterViewInit(){super.ngAfterViewInit(),this.bindMutationObserver()}onArrowRightKey(t){let i=this.findNextTab(t.currentTarget);i?this.changeFocusedTab(t,i):this.onHomeKey(t),t.preventDefault()}onArrowLeftKey(t){let i=this.findPrevTab(t.currentTarget);i?this.changeFocusedTab(t,i):this.onEndKey(t),t.preventDefault()}onHomeKey(t){let i=this.findFirstTab();this.changeFocusedTab(t,i),t.preventDefault()}onEndKey(t){let i=this.findLastTab();this.changeFocusedTab(t,i),t.preventDefault()}onPageDownKey(t){this.scrollInView(this.findLastTab()),t.preventDefault()}onPageUpKey(t){this.scrollInView(this.findFirstTab()),t.preventDefault()}onEnterKey(t){this.changeActiveValue(),t.preventDefault()}findNextTab(t,i=!1){let n=i?t:t.nextElementSibling;return n?q(n,"data-p-disabled")||q(n,"data-pc-section")==="inkbar"?this.findNextTab(n):n:null}findPrevTab(t,i=!1){let n=i?t:t.previousElementSibling;return n?q(n,"data-p-disabled")||q(n,"data-pc-section")==="inkbar"?this.findPrevTab(n):n:null}findFirstTab(){return this.findNextTab(this.pcTabList?.tabs?.nativeElement?.firstElementChild,!0)}findLastTab(){return this.findPrevTab(this.pcTabList?.tabs?.nativeElement?.lastElementChild,!0)}changeActiveValue(){this.pcTabs.updateValue(this.value())}changeFocusedTab(t,i){ze(i),this.scrollInView(i)}scrollInView(t){t?.scrollIntoView?.({block:"nearest"})}bindMutationObserver(){ie(this.platformId)&&(this.mutationObserver=new MutationObserver(t=>{t.forEach(()=>{this.active()&&this.pcTabList?.updateInkBar()})}),this.mutationObserver.observe(this.el.nativeElement,{childList:!0,characterData:!0,subtree:!0}))}unbindMutationObserver(){this.mutationObserver.disconnect()}ngOnDestroy(){this.mutationObserver&&this.unbindMutationObserver(),super.ngOnDestroy()}static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-tab"]],hostVars:16,hostBindings:function(i,n){i&1&&h("focus",function(d){return n.onFocus(d)})("click",function(d){return n.onClick(d)})("keydown",function(d){return n.onKeyDown(d)}),i&2&&(y("data-pc-name","tab")("id",n.id())("aria-controls",n.ariaControls())("role","tab")("aria-selected",n.active())("data-p-disabled",n.disabled())("data-p-active",n.active())("tabindex",n.tabindex()),M("p-tab",!0)("p-tab-active",n.active())("p-disabled",n.disabled())("p-component",!0))},inputs:{value:[1,"value"],disabled:[1,"disabled"]},outputs:{value:"valueChange"},features:[Ie([ve]),D],ngContentSelectors:Z,decls:1,vars:0,template:function(i,n){i&1&&(A(),z(0))},dependencies:[V,he],encapsulation:2,changeDetection:0})}return e})(),ye=(()=>{class e extends B{pcTabs=b(K(()=>H));value=X(void 0);id=p(()=>`${this.pcTabs.id()}_tabpanel_${this.value()}`);ariaLabelledby=p(()=>`${this.pcTabs.id()}_tab_${this.value()}`);active=p(()=>ge(this.pcTabs.value(),this.value()));static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-tabpanel"]],hostVars:9,hostBindings:function(i,n){i&2&&(y("data-pc-name","tabpanel")("id",n.id())("role","tabpanel")("aria-labelledby",n.ariaLabelledby())("data-p-active",n.active()),M("p-tabpanel",!0)("p-component",!0))},inputs:{value:[1,"value"]},outputs:{value:"valueChange"},features:[D],ngContentSelectors:Z,decls:1,vars:1,template:function(i,n){i&1&&(A(),f(0,It,1,0)),i&2&&g(n.active()?0:-1)},dependencies:[V],encapsulation:2,changeDetection:0})}return e})(),Te=(()=>{class e extends B{static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-tabpanels"]],hostVars:6,hostBindings:function(i,n){i&2&&(y("data-pc-name","tabpanels")("role","presentation"),M("p-tabpanels",!0)("p-component",!0))},features:[D],ngContentSelectors:Z,decls:1,vars:0,template:function(i,n){i&1&&(A(),z(0))},dependencies:[V],encapsulation:2,changeDetection:0})}return e})(),H=(()=>{class e extends B{value=X(void 0);scrollable=O(!1,{transform:E});lazy=O(!1,{transform:E});selectOnFocus=O(!1,{transform:E});showNavigators=O(!0,{transform:E});tabindex=O(0,{transform:Re});id=$(Fe("pn_id_"));_componentStyle=b(nt);updateValue(t){this.value.update(()=>t)}static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275cmp=I({type:e,selectors:[["p-tabs"]],hostVars:8,hostBindings:function(i,n){i&2&&(y("data-pc-name","tabs")("id",n.id()),M("p-tabs",!0)("p-tabs-scrollable",n.scrollable())("p-component",!0))},inputs:{value:[1,"value"],scrollable:[1,"scrollable"],lazy:[1,"lazy"],selectOnFocus:[1,"selectOnFocus"],showNavigators:[1,"showNavigators"],tabindex:[1,"tabindex"]},outputs:{value:"valueChange"},features:[ne([nt]),D],ngContentSelectors:Z,decls:1,vars:0,template:function(i,n){i&1&&(A(),z(0))},dependencies:[V],encapsulation:2,changeDetection:0})}return e})(),at=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=ee({type:e});static \u0275inj=Y({imports:[H,Te,ye,re,_e]})}return e})();var Ot=({dt:e})=>`
.p-textarea {
    font-family: inherit;
    font-feature-settings: inherit;
    font-size: 1rem;
    color: ${e("textarea.color")};
    background: ${e("textarea.background")};
    padding: ${e("textarea.padding.y")} ${e("textarea.padding.x")};
    border: 1px solid ${e("textarea.border.color")};
    transition: background ${e("textarea.transition.duration")}, color ${e("textarea.transition.duration")}, border-color ${e("textarea.transition.duration")}, outline-color ${e("textarea.transition.duration")}, box-shadow ${e("textarea.transition.duration")};
    appearance: none;
    border-radius: ${e("textarea.border.radius")};
    outline-color: transparent;
    box-shadow: ${e("textarea.shadow")};
}

.p-textarea.ng-invalid.ng-dirty {
    border-color: ${e("textarea.invalid.border.color")};
}

.p-textarea:enabled:hover {
    border-color: ${e("textarea.hover.border.color")};
}

.p-textarea:enabled:focus {
    border-color: ${e("textarea.focus.border.color")};
    box-shadow: ${e("textarea.focus.ring.shadow")};
    outline: ${e("textarea.focus.ring.width")} ${e("textarea.focus.ring.style")} ${e("textarea.focus.ring.color")};
    outline-offset: ${e("textarea.focus.ring.offset")};
}

.p-textarea.p-invalid {
    border-color: ${e("textarea.invalid.border.color")};
}

.p-textarea.p-variant-filled {
    background: ${e("textarea.filled.background")};
}

.p-textarea.p-variant-filled:enabled:hover {
    background: ${e("textarea.filled.hover.background")};
}

.p-textarea.p-variant-filled:enabled:focus {
    background: ${e("textarea.filled.focus.background")};
}

.p-textarea:disabled {
    opacity: 1;
    background: ${e("textarea.disabled.background")};
    color: ${e("textarea.disabled.color")};
}

.p-textarea::placeholder {
    color: ${e("textarea.placeholder.color")};
}

.p-textarea.ng-invalid.ng-dirty::placeholder {
    color: ${e("textarea.invalid.placeholder.color")};
}

.p-textarea-fluid {
    width: 100%;
}

.p-textarea-resizable {
    overflow: hidden;
    resize: none;
}

.p-textarea-sm {
    font-size: ${e("textarea.sm.font.size")};
    padding-block: ${e("textarea.sm.padding.y")};
    padding-inline: ${e("textarea.sm.padding.x")};
}

.p-textarea-lg {
    font-size: ${e("textarea.lg.font.size")};
    padding-block: ${e("textarea.lg.padding.y")};
    padding-inline: ${e("textarea.lg.padding.x")};
}
`,$t={root:({instance:e,props:a})=>["p-textarea p-component",{"p-filled":e.filled,"p-textarea-resizable ":a.autoResize,"p-invalid":a.invalid,"p-variant-filled":a.variant?a.variant==="filled":e.config.inputStyle==="filled"||e.config.inputVariant==="filled","p-textarea-fluid":a.fluid}]},ot=(()=>{class e extends ae{name="textarea";theme=Ot;classes=$t;static \u0275fac=(()=>{let t;return function(n){return(t||(t=k(e)))(n||e)}})();static \u0275prov=J({token:e,factory:e.\u0275fac})}return e})();var rt=(()=>{class e extends B{ngModel;control;autoResize;variant;fluid=!1;pSize;onResize=new Ee;filled;cachedScrollHeight;ngModelSubscription;ngControlSubscription;_componentStyle=b(ot);constructor(t,i){super(),this.ngModel=t,this.control=i}ngOnInit(){super.ngOnInit(),this.ngModel&&(this.ngModelSubscription=this.ngModel.valueChanges.subscribe(()=>{this.updateState()})),this.control&&(this.ngControlSubscription=this.control.valueChanges.subscribe(()=>{this.updateState()}))}get hasFluid(){let i=this.el.nativeElement.closest("p-fluid");return this.fluid||!!i}ngAfterViewInit(){super.ngAfterViewInit(),this.autoResize&&this.resize(),this.updateFilledState(),this.cd.detectChanges()}ngAfterViewChecked(){this.autoResize&&this.resize()}onInput(t){this.updateState()}updateFilledState(){this.filled=this.el.nativeElement.value&&this.el.nativeElement.value.length}resize(t){this.el.nativeElement.style.height="auto",this.el.nativeElement.style.height=this.el.nativeElement.scrollHeight+"px",parseFloat(this.el.nativeElement.style.height)>=parseFloat(this.el.nativeElement.style.maxHeight)?(this.el.nativeElement.style.overflowY="scroll",this.el.nativeElement.style.height=this.el.nativeElement.style.maxHeight):this.el.nativeElement.style.overflow="hidden",this.onResize.emit(t||{})}updateState(){this.updateFilledState(),this.autoResize&&this.resize()}ngOnDestroy(){this.ngModelSubscription&&this.ngModelSubscription.unsubscribe(),this.ngControlSubscription&&this.ngControlSubscription.unsubscribe(),super.ngOnDestroy()}static \u0275fac=function(i){return new(i||e)(ce(oe,8),ce(Ye,8))};static \u0275dir=ke({type:e,selectors:[["","pTextarea",""],["","pInputTextarea",""]],hostAttrs:[1,"p-textarea","p-component"],hostVars:16,hostBindings:function(i,n){i&1&&h("input",function(d){return n.onInput(d)}),i&2&&M("p-filled",n.filled)("p-textarea-resizable",n.autoResize)("p-variant-filled",n.variant==="filled"||n.config.inputStyle()==="filled"||n.config.inputVariant()==="filled")("p-textarea-fluid",n.hasFluid)("p-textarea-sm",n.pSize==="small")("p-inputfield-sm",n.pSize==="small")("p-textarea-lg",n.pSize==="large")("p-inputfield-lg",n.pSize==="large")},inputs:{autoResize:[2,"autoResize","autoResize",E],variant:"variant",fluid:[2,"fluid","fluid",E],pSize:"pSize"},outputs:{onResize:"onResize"},features:[ne([ot]),D]})}return e})(),st=(()=>{class e{static \u0275fac=function(i){return new(i||e)};static \u0275mod=ee({type:e});static \u0275inj=Y({})}return e})();var lt={KOGNITION_KOMMUNIKATION:"Kognition und Kommunikation",MOBILITAET_BEWEGLICHKEIT:"Mobilit\xE4t und Beweglichkeit",KRANKHEITSBEZOGENE_ANFORDERUNGEN:"Krankheitsbezogene Anforderungen und Belastungen",SELBSTVERSORGUNG:"Selbstversorgung",LEBEN_SOZIALE_BEZIEHUNGEN:"Leben in sozialen Beziehungen",HAUSHALTSFUEHRUNG:"Haushaltsf\xFChrung"};var ct={STURZ:"Sturzrisiko",DEKUBITUS:"Dekubitusrisiko (Braden-Skala)",ERNAEHRUNG:"Ern\xE4hrungsrisiko (Screening)"};var Pt=(e,a)=>a.id,Nt=(e,a)=>a.code;function At(e,a){if(e&1&&(r(0,"dt"),c(1,"E-Mail"),s(),r(2,"dd"),c(3),s()),e&2){let t=u();l(3),v(t.email)}}function zt(e,a){if(e&1&&(r(0,"p-card",10)(1,"dl")(2,"dt"),c(3,"Name"),s(),r(4,"dd"),c(5),s(),r(6,"dt"),c(7,"Telefon"),s(),r(8,"dd"),c(9),s(),r(10,"dt"),c(11,"Art"),s(),r(12,"dd"),c(13),s()()()),e&2){let t=a;l(5),U("",t.name," (",t.relationship,")"),l(4),v(t.phone),l(4),v(t.isLegalGuardian?"Gerichtlich bestellte Betreuung":"Vorsorgevollmacht")}}function Ft(e,a){if(e&1){let t=T();r(0,"p-card",13)(1,"textarea",18),h("ngModelChange",function(n){let o=x(t).$implicit,d=u(3);return _(d.updateThemenfeldText(o.code,n))}),s()()}if(e&2){let t=a.$implicit,i=u(3);m("header",i.themenfeldLabels[t.code]),l(),m("ngModel",t.text)}}function Vt(e,a){if(e&1){let t=T();r(0,"p-card",14)(1,"textarea",15),h("ngModelChange",function(n){x(t);let o=u(2);return _(o.updateBiografie(n))}),s()(),r(2,"div",16),de(3,Ft,2,2,"p-card",13,Nt),s(),r(5,"p",17),c(6),G(7,"date"),s()}if(e&2){let t=a;l(),m("ngModel",t.biografieNotizen),l(2),pe(t.themenfelder),l(3),j("N\xE4chste Evaluation geplant: ",Q(7,2,t.nextReviewDate,"dd.MM.yyyy"),"")}}function Ht(e,a){e&1&&(r(0,"p"),c(1,"Keine SIS-Dokumentation vorhanden."),s())}function Kt(e,a){if(e&1&&(r(0,"span",20),c(1),s()),e&2){let t=u().$implicit;l(),j("Score: ",t.score,"")}}function jt(e,a){if(e&1){let t=T();r(0,"p-card",13)(1,"div",19),R(2,"p-tag",3),f(3,Kt,2,1,"span",20),s(),r(4,"p",21),c(5),G(6,"date"),R(7,"br"),c(8),G(9,"date"),s(),r(10,"p-button",22),h("onClick",function(){let n=x(t).$implicit,o=u(2);return _(o.reassess(n))}),s()()}if(e&2){let t=a.$implicit,i=u(2);m("header",i.riskLabels[t.type]),l(2),m("value",t.riskLevel)("severity",i.riskSeverity(t.riskLevel)),l(),g(t.score!==void 0?3:-1),l(2),j(" Letzte Einsch\xE4tzung: ",Q(6,7,t.assessedAt,"dd.MM.yyyy"),""),l(3),j(" N\xE4chste Einsch\xE4tzung: ",Q(9,10,t.nextAssessmentDate,"dd.MM.yyyy")," "),l(2),m("text",!0)}}function Ut(e,a){if(e&1){let t=T();r(0,"div",0)(1,"p-button",1),h("onClick",function(){x(t);let n=u();return _(n.goBack())}),s(),r(2,"div")(3,"h2"),c(4),s(),r(5,"span",2),c(6),s()(),R(7,"p-tag",3),s(),r(8,"p-tabs",4)(9,"p-tablist")(10,"p-tab",4),c(11,"Stammdaten"),s(),r(12,"p-tab",5),c(13,"SIS-Dokumentation"),s(),r(14,"p-tab",6),c(15,"Risikoeinsch\xE4tzungen"),s()(),r(16,"p-tabpanels")(17,"p-tabpanel",4)(18,"div",7)(19,"p-card",8)(20,"dl")(21,"dt"),c(22,"Adresse"),s(),r(23,"dd"),c(24),s(),r(25,"dt"),c(26,"Telefon"),s(),r(27,"dd"),c(28),s(),f(29,At,4,1),r(30,"dt"),c(31,"Geburtsdatum"),s(),r(32,"dd"),c(33),G(34,"date"),s()()(),r(35,"p-card",9)(36,"dl")(37,"dt"),c(38,"Art"),s(),r(39,"dd"),c(40),s(),r(41,"dt"),c(42,"Krankenkasse"),s(),r(43,"dd"),c(44),s(),r(45,"dt"),c(46,"Versichertennummer"),s(),r(47,"dd"),c(48),s()()(),f(49,zt,14,4,"p-card",10),r(50,"p-card",11)(51,"dl")(52,"dt"),c(53,"Name"),s(),r(54,"dd"),c(55),s(),r(56,"dt"),c(57,"Telefon"),s(),r(58,"dd"),c(59),s()()()()(),r(60,"p-tabpanel",5),f(61,Vt,8,5)(62,Ht,2,0,"p"),s(),r(63,"p-tabpanel",6)(64,"div",12),de(65,jt,11,13,"p-card",13,Pt),s()()()()}if(e&2){let t,i,n=a,o=u();l(),m("text",!0),l(3),U("",n.firstName," ",n.lastName,""),l(2),U("",o.age(n.dateOfBirth)," Jahre \xB7 ",n.address.city,""),l(),m("value",n.pflegegrad>0?"Pflegegrad "+n.pflegegrad:"Kein Pflegegrad")("severity",o.pflegegradSeverity(n.pflegegrad)),l(17),De("",n.address.street,", ",n.address.zip," ",n.address.city,""),l(4),v(n.phone),l(),g(n.email?29:-1),l(4),v(Q(34,21,n.dateOfBirth,"dd.MM.yyyy")),l(7),v(n.insurance.type==="GKV"?"Gesetzlich (GKV)":"Privat (PKV)"),l(4),v(n.insurance.providerName),l(4),v(n.insurance.insuranceNumber),l(),g((t=n.legalRepresentative)?49:-1,t),l(6),U("",n.emergencyContact.name," (",n.emergencyContact.relationship,")"),l(4),v(n.emergencyContact.phone),l(2),g((i=o.sisRecord())?61:62,i),l(4),pe(o.riskAssessments())}}function Gt(e,a){e&1&&(r(0,"p"),c(1,"Patient nicht gefunden."),s())}var dt=class e{route=b(Le);router=b(Pe);patientState=b(tt);patientId=xe(this.route.paramMap.pipe(Ce(a=>a.get("id")??"")),{initialValue:this.route.snapshot.paramMap.get("id")??""});patient=p(()=>this.patientState.getPatient(this.patientId()));sisRecord=p(()=>this.patientState.getSisRecord(this.patientId()));riskAssessments=p(()=>this.patientState.getRiskAssessments(this.patientId()));themenfeldLabels=lt;riskLabels=ct;pflegegradSeverity(a){return a<=1?"success":a<=3?"info":a===4?"warn":"danger"}riskSeverity(a){return a==="HOCH"?"danger":a==="MITTEL"?"warn":"success"}age(a){let t=new Date(a),i=Date.now()-t.getTime();return Math.floor(i/(1e3*60*60*24*365.25))}updateThemenfeldText(a,t){let i=this.sisRecord();i&&this.patientState.upsertSisRecord(N(P({},i),{themenfelder:i.themenfelder.map(n=>n.code===a?N(P({},n),{text:t}):n),lastUpdatedAt:new Date().toISOString().slice(0,10)}))}updateBiografie(a){let t=this.sisRecord();t&&this.patientState.upsertSisRecord(N(P({},t),{biografieNotizen:a,lastUpdatedAt:new Date().toISOString().slice(0,10)}))}reassess(a){this.patientState.upsertRiskAssessment(N(P({},a),{assessedAt:new Date().toISOString().slice(0,10),nextAssessmentDate:this.addDays(new Date,30)}))}addDays(a,t){let i=new Date(a);return i.setDate(i.getDate()+t),i.toISOString().slice(0,10)}goBack(){this.router.navigate(["/patienten"])}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=I({type:e,selectors:[["app-patient-detail"]],decls:2,vars:1,consts:[[1,"detail-header"],["icon","pi pi-arrow-left",3,"onClick","text"],[1,"subtitle"],[3,"value","severity"],["value","stammdaten"],["value","sis"],["value","risiken"],[1,"stammdaten-grid"],["header","Kontakt & Adresse"],["header","Versicherung"],["header","Rechtliche Vertretung"],["header","Notfallkontakt"],[1,"risk-grid"],[3,"header"],["header","Biografie & Gewohnheiten"],["pTextarea","","rows","3",3,"ngModelChange","ngModel"],[1,"themenfelder-grid"],[1,"review-hint"],["pTextarea","","rows","4",3,"ngModelChange","ngModel"],[1,"risk-body"],[1,"risk-score"],[1,"risk-meta"],["label","Neu einsch\xE4tzen","icon","pi pi-refresh",3,"onClick","text"]],template:function(t,i){if(t&1&&f(0,Ut,67,24)(1,Gt,2,0,"p"),t&2){let n;g((n=i.patient())?0:1,n)}},dependencies:[$e,Ze,We,Ke,He,at,H,Te,ye,re,_e,Ue,je,st,rt,et,Je,Xe,oe],styles:[".detail-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:1rem;margin-bottom:1rem}.detail-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0}.detail-header[_ngcontent-%COMP%]   .subtitle[_ngcontent-%COMP%]{color:#64748b;font-size:.9rem}.detail-header[_ngcontent-%COMP%]   p-tag[_ngcontent-%COMP%]{margin-left:auto}.stammdaten-grid[_ngcontent-%COMP%], .themenfelder-grid[_ngcontent-%COMP%], .risk-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem}.themenfelder-grid[_ngcontent-%COMP%]{margin-top:1rem}dl[_ngcontent-%COMP%]{display:grid;grid-template-columns:auto 1fr;gap:.35rem .75rem;margin:0}dl[_ngcontent-%COMP%]   dt[_ngcontent-%COMP%]{font-weight:600;color:#475569}dl[_ngcontent-%COMP%]   dd[_ngcontent-%COMP%]{margin:0}textarea[_ngcontent-%COMP%]{width:100%;resize:vertical}.review-hint[_ngcontent-%COMP%]{color:#64748b;font-size:.9rem;margin-top:.75rem}.risk-body[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}.risk-score[_ngcontent-%COMP%]{color:#475569;font-size:.9rem}.risk-meta[_ngcontent-%COMP%]{color:#64748b;font-size:.85rem;margin:.5rem 0}"]})};export{dt as PatientDetailComponent};
