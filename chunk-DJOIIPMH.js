import{a as V}from"./chunk-P4M4KEWW.js";import{a as ce,b as de}from"./chunk-NRYBK4J2.js";import{a as ge,b as pe}from"./chunk-EDEYQTI2.js";import{c as Ee,d as ke}from"./chunk-6D4PMVRL.js";import"./chunk-QLUPZFYD.js";import{H as ye,I as Ce,J as Se,K as ve,g as fe,k as _e,m as we,r as be}from"./chunk-O4HBUSJ5.js";import{c as ue,h as me,i as he}from"./chunk-FIJBWXAD.js";import"./chunk-EACUHEII.js";import{g as ne,j as ie,k as oe,l as ae,n as re,ta as O,ua as F,xa as le,za as se}from"./chunk-CWDSRUBR.js";import{$a as q,Ab as u,Hb as X,Jb as ee,Ka as A,L as z,La as H,M as I,N as j,Oa as Q,Qa as g,Rb as k,S as w,Tb as T,Wa as N,Xa as c,Z as b,Za as Z,_ as y,_a as W,a as M,aa as G,ab as S,ac as D,b as x,bc as te,dc as v,eb as r,fb as a,ga as U,gb as m,jb as Y,kb as E,ma as C,ob as h,pb as p,sb as R,tb as J,ub as P,vb as $,ya as s,zb as l}from"./chunk-TYCLC2SK.js";var $e=["handle"],De=["input"],Oe=e=>({checked:e});function Fe(e,n){e&1&&Y(0)}function Ve(e,n){if(e&1&&g(0,Fe,1,0,"ng-container",4),e&2){let t=p();c("ngTemplateOutlet",t.handleTemplate||t._handleTemplate)("ngTemplateOutletContext",ee(2,Oe,t.checked()))}}var Ke=({dt:e})=>`
.p-toggleswitch {
    display: inline-block;
    width: ${e("toggleswitch.width")};
    height: ${e("toggleswitch.height")};
}

.p-toggleswitch-input {
    cursor: pointer;
    appearance: none;
    position: absolute;
    top: 0;
    inset-inline-start: 0;
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    opacity: 0;
    z-index: 1;
    outline: 0 none;
    border-radius: ${e("toggleswitch.border.radius")};
}

.p-toggleswitch-slider {
    display: inline-block;
    cursor: pointer;
    width: 100%;
    height: 100%;
    border-width: ${e("toggleswitch.border.width")};
    border-style: solid;
    border-color: ${e("toggleswitch.border.color")};
    background: ${e("toggleswitch.background")};
    transition: background ${e("toggleswitch.transition.duration")}, color ${e("toggleswitch.transition.duration")}, border-color ${e("toggleswitch.transition.duration")}, outline-color ${e("toggleswitch.transition.duration")}, box-shadow ${e("toggleswitch.transition.duration")};
    border-radius: ${e("toggleswitch.border.radius")};
    outline-color: transparent;
    box-shadow: ${e("toggleswitch.shadow")};
}

.p-toggleswitch-handle {
    position: absolute;
    top: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${e("toggleswitch.handle.background")};
    color: ${e("toggleswitch.handle.color")};
    width: ${e("toggleswitch.handle.size")};
    height: ${e("toggleswitch.handle.size")};
    inset-inline-start: ${e("toggleswitch.gap")};
    margin-block-start: calc(-1 * calc(${e("toggleswitch.handle.size")} / 2));
    border-radius: ${e("toggleswitch.handle.border.radius")};
    transition: background ${e("toggleswitch.transition.duration")}, color ${e("toggleswitch.transition.duration")}, inset-inline-start ${e("toggleswitch.slide.duration")}, box-shadow ${e("toggleswitch.slide.duration")};
}

.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider {
    background: ${e("toggleswitch.checked.background")};
    border-color: ${e("toggleswitch.checked.border.color")};
}

.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-handle {
    background: ${e("toggleswitch.handle.checked.background")};
    color: ${e("toggleswitch.handle.checked.color")};
    inset-inline-start: calc(${e("toggleswitch.width")} - calc(${e("toggleswitch.handle.size")} + ${e("toggleswitch.gap")}));
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-slider {
    background: ${e("toggleswitch.hover.background")};
    border-color: ${e("toggleswitch.hover.border.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover) .p-toggleswitch-handle {
    background: ${e("toggleswitch.handle.hover.background")};
    color: ${e("toggleswitch.handle.hover.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-slider {
    background: ${e("toggleswitch.checked.hover.background")};
    border-color: ${e("toggleswitch.checked.hover.border.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:hover).p-toggleswitch-checked .p-toggleswitch-handle {
    background: ${e("toggleswitch.handle.checked.hover.background")};
    color: ${e("toggleswitch.handle.checked.hover.color")};
}

.p-toggleswitch:not(.p-disabled):has(.p-toggleswitch-input:focus-visible) .p-toggleswitch-slider {
    box-shadow: ${e("toggleswitch.focus.ring.shadow")};
    outline: ${e("toggleswitch.focus.ring.width")} ${e("toggleswitch.focus.ring.style")} ${e("toggleswitch.focus.ring.color")};
    outline-offset: ${e("toggleswitch.focus.ring.offset")};
}

.p-toggleswitch.p-invalid > .p-toggleswitch-slider {
    border-color: ${e("toggleswitch.invalid.border.color")};
}

.p-toggleswitch.p-disabled {
    opacity: 1;
}

.p-toggleswitch.p-disabled .p-toggleswitch-slider {
    background: ${e("toggleswitch.disabled.background")};
}

.p-toggleswitch.p-disabled .p-toggleswitch-handle {
    background: ${e("toggleswitch.handle.disabled.background")};
}

/* For PrimeNG */

p-toggleSwitch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider,
p-toggle-switch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider,
p-toggleswitch.ng-invalid.ng-dirty > .p-toggleswitch > .p-toggleswitch-slider {
    border-color: ${e("toggleswitch.invalid.border.color")};
}`,Le={root:{position:"relative"}},Be={root:({instance:e})=>({"p-toggleswitch p-component":!0,"p-toggleswitch-checked":e.checked(),"p-disabled":e.disabled,"p-invalid":e.invalid}),input:"p-toggleswitch-input",slider:"p-toggleswitch-slider",handle:"p-toggleswitch-handle"},Te=(()=>{class e extends le{name="toggleswitch";theme=Ke;classes=Be;inlineStyles=Le;static \u0275fac=(()=>{let t;return function(i){return(t||(t=G(e)))(i||e)}})();static \u0275prov=I({token:e,factory:e.\u0275fac})}return e})();var Ge={provide:fe,useExisting:z(()=>K),multi:!0},K=(()=>{class e extends se{style;styleClass;tabindex;inputId;name;disabled;readonly;trueValue=!0;falseValue=!1;ariaLabel;ariaLabelledBy;autofocus;onChange=new U;input;handleTemplate;_handleTemplate;modelValue=!1;focused=!1;onModelChange=()=>{};onModelTouched=()=>{};_componentStyle=w(Te);templates;ngAfterContentInit(){this.templates.forEach(t=>{t.getType()==="handle"?this._handleTemplate=t.template:this._handleTemplate=t.template})}onClick(t){!this.disabled&&!this.readonly&&(this.modelValue=this.checked()?this.falseValue:this.trueValue,this.onModelChange(this.modelValue),this.onChange.emit({originalEvent:t,checked:this.modelValue}),this.input.nativeElement.focus())}onFocus(){this.focused=!0}onBlur(){this.focused=!1,this.onModelTouched()}writeValue(t){this.modelValue=t,this.cd.markForCheck()}registerOnChange(t){this.onModelChange=t}registerOnTouched(t){this.onModelTouched=t}setDisabledState(t){this.disabled=t,this.cd.markForCheck()}checked(){return this.modelValue===this.trueValue}static \u0275fac=(()=>{let t;return function(i){return(t||(t=G(e)))(i||e)}})();static \u0275cmp=A({type:e,selectors:[["p-toggleswitch"],["p-toggleSwitch"],["p-toggle-switch"]],contentQueries:function(o,i,d){if(o&1&&(R(d,$e,4),R(d,O,4)),o&2){let _;P(_=$())&&(i.handleTemplate=_.first),P(_=$())&&(i.templates=_)}},viewQuery:function(o,i){if(o&1&&J(De,5),o&2){let d;P(d=$())&&(i.input=d.first)}},inputs:{style:"style",styleClass:"styleClass",tabindex:[2,"tabindex","tabindex",te],inputId:"inputId",name:"name",disabled:[2,"disabled","disabled",D],readonly:[2,"readonly","readonly",D],trueValue:"trueValue",falseValue:"falseValue",ariaLabel:"ariaLabel",ariaLabelledBy:"ariaLabelledBy",autofocus:[2,"autofocus","autofocus",D]},outputs:{onChange:"onChange"},features:[X([Ge,Te]),Q],decls:6,vars:23,consts:[["input",""],[3,"click","ngClass","ngStyle"],["type","checkbox","role","switch",3,"focus","blur","ngClass","checked","disabled","pAutoFocus"],[3,"ngClass"],[4,"ngTemplateOutlet","ngTemplateOutletContext"]],template:function(o,i){if(o&1){let d=E();r(0,"div",1),h("click",function(Pe){return b(d),y(i.onClick(Pe))}),r(1,"input",2,0),h("focus",function(){return b(d),y(i.onFocus())})("blur",function(){return b(d),y(i.onBlur())}),a(),r(3,"span",3)(4,"div",3),g(5,Ve,1,4,"ng-container"),a()()()}o&2&&(W(i.sx("root")),q(i.styleClass),c("ngClass",i.cx("root"))("ngStyle",i.style),N("data-pc-name","toggleswitch")("data-pc-section","root"),s(),c("ngClass",i.cx("input"))("checked",i.checked())("disabled",i.disabled)("pAutoFocus",i.autofocus),N("id",i.inputId)("aria-checked",i.checked())("aria-labelledby",i.ariaLabelledBy)("aria-label",i.ariaLabel)("name",i.name)("tabindex",i.tabindex)("data-pc-section","hiddenInput"),s(2),c("ngClass",i.cx("slider")),N("data-pc-section","slider"),s(),c("ngClass",i.cx("handle")),s(),S(i.handleTemplate||i._handleTemplate?5:-1))},dependencies:[re,ne,oe,ie,ue,F],encapsulation:2,changeDetection:0})}return e})(),xe=(()=>{class e{static \u0275fac=function(o){return new(o||e)};static \u0275mod=H({type:e});static \u0275inj=j({imports:[K,F,F]})}return e})();function Ie(e){return new Date(Date.now()-e*36e5).toISOString()}function L(e){let n=new Date;return n.setDate(n.getDate()+e),n.toISOString().slice(0,10)}var f=["Dr. med. Brandt","Dr. med. Vogel","Dr. med. Lindner","Dr. med. Ahrens"],B=class e{patientState=w(V);_connector=C({status:"ONLINE",lastSync:Ie(2),certificateValidUntil:L(312),firmwareVersion:"PTV5 4.1.3"});connector=this._connector.asReadonly();_kimMessages=C(this.generateKimMessages());kimMessages=this._kimMessages.asReadonly();unreadKimCount=v(()=>this._kimMessages().filter(n=>n.direction==="EINGANG"&&!n.read).length);_epaConsents=C(this.generateConsents());epaConsents=this._epaConsents.asReadonly();_epaDocuments=C(this.generateEpaDocuments());epaDocuments=this._epaDocuments.asReadonly();generateKimMessages(){let n=this.patientState.patients().slice(0,6),t=["Aktualisierter Medikationsplan","Arztbrief nach Krankenhausentlassung","R\xFCckfrage zur Wundversorgung","Verordnung h\xE4usliche Krankenpflege","Laborbefund angefordert","Anpassung Insulindosierung"];return n.map((o,i)=>({id:`kim-${i+1}`,direction:i%3===0?"AUSGANG":"EINGANG",sender:i%3===0?"Pflegedienst Manager":f[i%f.length],recipient:i%3===0?f[i%f.length]:"Pflegedienst Manager",subject:`${t[i%t.length]} \u2013 ${o.firstName} ${o.lastName}`,receivedAt:Ie(i*9+3),patientId:o.id,read:i%2===0}))}generateConsents(){return this.patientState.patients().map((n,t)=>({patientId:n.id,granted:t%4!==0,grantedAt:t%4!==0?L(-(30+t%10)):void 0}))}generateEpaDocuments(){let n=[];return this.generateConsents().filter(o=>o.granted).forEach((o,i)=>{this.patientState.getPatient(o.patientId)&&(n.push({id:`epa-${o.patientId}-1`,patientId:o.patientId,category:"MEDIKATIONSPLAN",title:"Bundeseinheitlicher Medikationsplan",author:f[i%f.length],createdAt:L(-(5+i%20))}),i%2===0&&n.push({id:`epa-${o.patientId}-2`,patientId:o.patientId,category:"ARZTBRIEF",title:"Arztbrief \u2013 haus\xE4rztliche Verlaufskontrolle",author:f[(i+1)%f.length],createdAt:L(-(15+i%30))}))}),n}simulateSync(){this._connector.update(n=>x(M({},n),{lastSync:new Date().toISOString()}))}markKimRead(n){this._kimMessages.update(t=>t.map(o=>o.id===n?x(M({},o),{read:!0}):o))}consentFor(n){return this._epaConsents().find(t=>t.patientId===n)}documentsFor(n){return this._epaDocuments().filter(t=>t.patientId===n)}toggleConsent(n){this._epaConsents.update(t=>t.map(o=>o.patientId===n?x(M({},o),{granted:!o.granted,grantedAt:o.granted?void 0:new Date().toISOString().slice(0,10)}):o))}static \u0275fac=function(t){return new(t||e)};static \u0275prov=I({token:e,factory:e.\u0275fac,providedIn:"root"})};var Ae={ARZTBRIEF:"Arztbrief",MEDIKATIONSPLAN:"Medikationsplan",BEFUND:"Befund",IMPFPASS:"Impfpass",PFLEGEBERICHT:"Pflegebericht"};function ze(e,n){if(e&1&&m(0,"p-tag",19),e&2){let t=p(2);c("value",t.unreadKimCount()+" ungelesen")}}function je(e,n){if(e&1&&(r(0,"div",18)(1,"span"),l(2,"KIM-Postfach"),a(),g(3,ze,1,1,"p-tag",19),a()),e&2){let t=p();s(3),S(t.unreadKimCount()>0?3:-1)}}function Ue(e,n){e&1&&(r(0,"tr"),m(1,"th"),r(2,"th"),l(3,"Richtung"),a(),r(4,"th"),l(5,"Von / An"),a(),r(6,"th"),l(7,"Betreff"),a(),r(8,"th"),l(9,"Empfangen"),a()())}function He(e,n){if(e&1){let t=E();r(0,"p-button",22),h("onClick",function(){b(t);let i=p().$implicit,d=p();return y(d.markRead(i.id))}),a()}e&2&&c("text",!0)}function Qe(e,n){e&1&&m(0,"i",21)}function Ze(e,n){if(e&1&&(r(0,"tr")(1,"td"),g(2,He,1,1,"p-button",20)(3,Qe,1,0,"i",21),a(),r(4,"td"),m(5,"p-tag",6),a(),r(6,"td"),l(7),a(),r(8,"td"),l(9),a(),r(10,"td"),l(11),k(12,"date"),a()()),e&2){let t=n.$implicit,o=p();Z("unread",!t.read&&t.direction==="EINGANG"),s(2),S(!t.read&&t.direction==="EINGANG"?2:3),s(3),c("value",o.directionLabel(t.direction))("severity",t.direction==="EINGANG"?"info":"secondary"),s(2),u(t.direction==="EINGANG"?t.sender:t.recipient),s(2),u(t.subject),s(2),u(T(12,8,t.receivedAt,"dd.MM.yyyy HH:mm"))}}function We(e,n){e&1&&(r(0,"tr")(1,"td",23),l(2,"Keine KIM-Nachrichten vorhanden."),a()())}function qe(e,n){e&1&&(r(0,"tr")(1,"th"),l(2,"Kategorie"),a(),r(3,"th"),l(4,"Titel"),a(),r(5,"th"),l(6,"Autor"),a(),r(7,"th"),l(8,"Datum"),a()())}function Ye(e,n){if(e&1&&(r(0,"tr")(1,"td"),m(2,"p-tag",29),a(),r(3,"td"),l(4),a(),r(5,"td"),l(6),a(),r(7,"td"),l(8),k(9,"date"),a()()),e&2){let t=n.$implicit,o=p(3);s(2),c("value",o.categoryLabel(t.category)),s(2),u(t.title),s(2),u(t.author),s(2),u(T(9,4,t.createdAt,"dd.MM.yyyy"))}}function Je(e,n){e&1&&(r(0,"tr")(1,"td",30),l(2,"Keine ePA-Dokumente vorhanden."),a()())}function Xe(e,n){if(e&1&&(r(0,"div",27)(1,"p-table",28),g(2,qe,9,0,"ng-template",9)(3,Ye,10,7,"ng-template",12)(4,Je,3,0,"ng-template",13),a()()),e&2){let t=p(2);s(),c("value",t.selectedDocuments())("scrollable",!0)}}function et(e,n){e&1&&(r(0,"p",17),l(1,"Patient hat den Zugriff auf die ePA (noch) nicht freigegeben."),a())}function tt(e,n){if(e&1){let t=E();r(0,"div",24)(1,"span"),l(2,"Einwilligung zum ePA-Zugriff"),a(),r(3,"div",25)(4,"p-toggleswitch",26),h("ngModelChange",function(){b(t);let i=p();return y(i.toggleConsent())}),a(),r(5,"span"),l(6),a()()(),g(7,Xe,5,2,"div",27)(8,et,2,0,"p",17)}if(e&2){let t=n;s(4),c("ngModel",t.granted),s(2),u(t.granted?"Erteilt":"Nicht erteilt"),s(),S(t.granted?7:8)}}var Ne=class e{tiState=w(B);patientState=w(V);connector=this.tiState.connector;kimMessages=this.tiState.kimMessages;unreadKimCount=this.tiState.unreadKimCount;patients=v(()=>this.patientState.activePatients());selectedPatientId=C(null);patientOptions=v(()=>this.patients().map(n=>({label:`${n.firstName} ${n.lastName}`,value:n.id})));selectedConsent=v(()=>{let n=this.selectedPatientId();return n?this.tiState.consentFor(n):void 0});selectedDocuments=v(()=>{let n=this.selectedPatientId();return n?this.tiState.documentsFor(n):[]});constructor(){let n=this.patientState.patients()[0];n&&this.selectedPatientId.set(n.id)}connectorLabel(n){switch(n){case"ONLINE":return"Online";case"OFFLINE":return"Offline";default:return"Wartung"}}connectorSeverity(n){switch(n){case"ONLINE":return"success";case"OFFLINE":return"danger";default:return"warn"}}directionLabel(n){return n==="EINGANG"?"Eingang":"Ausgang"}categoryLabel(n){return Ae[n]}patientNameFor(n){if(!n)return"\u2013";let t=this.patientState.getPatient(n);return t?`${t.firstName} ${t.lastName}`:"Unbekannt"}sync(){this.tiState.simulateSync()}markRead(n){this.tiState.markKimRead(n)}toggleConsent(){let n=this.selectedPatientId();n&&this.tiState.toggleConsent(n)}static \u0275fac=function(t){return new(t||e)};static \u0275cmp=A({type:e,selectors:[["app-ti-status"]],decls:43,vars:17,consts:[[1,"page-header"],["value","Simulation / Demo","severity","warn","icon","pi pi-info-circle"],[1,"sim-hint"],[1,"panels-grid"],["header","Konnektor-Status"],[1,"kv-row"],[3,"value","severity"],["label","Jetzt synchronisieren","icon","pi pi-sync",3,"onClick","text"],[1,"kim-card"],["pTemplate","header"],[1,"table-scroll"],["scrollHeight","18rem",1,"auto-scroll-table",3,"value","scrollable"],["pTemplate","body"],["pTemplate","emptymessage"],["header","ePA-Zugriffe"],["optionLabel","label","optionValue","value","placeholder","Patient w\xE4hlen",1,"patient-select",3,"ngModelChange","options","ngModel"],["header","TI-Messenger"],[1,"hint"],[1,"card-header-row"],["severity","warn",3,"value"],["icon","pi pi-envelope","severity","warn","pTooltip","Als gelesen markieren",3,"text"],[1,"pi","pi-envelope-open",2,"color","#94a3b8"],["icon","pi pi-envelope","severity","warn","pTooltip","Als gelesen markieren",3,"onClick","text"],["colspan","5"],[1,"kv-row","consent-row"],[1,"consent-toggle"],[3,"ngModelChange","ngModel"],[1,"table-scroll","docs"],["scrollHeight","14rem",1,"auto-scroll-table",3,"value","scrollable"],["severity","info",3,"value"],["colspan","4"]],template:function(t,o){if(t&1&&(r(0,"div",0)(1,"h2"),l(2,"Telematikinfrastruktur (TI)"),a(),m(3,"p-tag",1),a(),r(4,"p",2),l(5,` Diese Ansicht simuliert die TI-Anbindung (Konnektor, KIM, ePA). Eine echte Anbindung erfordert zertifizierte Konnektor-Hardware und eine SMC-B-Karte der Praxis/des Pflegedienstes.
`),a(),r(6,"div",3)(7,"p-card",4)(8,"div",5)(9,"span"),l(10,"Status"),a(),m(11,"p-tag",6),a(),r(12,"div",5)(13,"span"),l(14,"Letzte Synchronisation"),a(),r(15,"span"),l(16),k(17,"date"),a()(),r(18,"div",5)(19,"span"),l(20,"SMC-B-Zertifikat g\xFCltig bis"),a(),r(21,"span"),l(22),k(23,"date"),a()(),r(24,"div",5)(25,"span"),l(26,"Firmware"),a(),r(27,"span"),l(28),a()(),r(29,"p-button",7),h("onClick",function(){return o.sync()}),a()(),r(30,"p-card",8),g(31,je,4,1,"ng-template",9),r(32,"div",10)(33,"p-table",11),g(34,Ue,10,0,"ng-template",9)(35,Ze,13,11,"ng-template",12)(36,We,3,0,"ng-template",13),a()()(),r(37,"p-card",14)(38,"p-select",15),h("ngModelChange",function(d){return o.selectedPatientId.set(d)}),a(),g(39,tt,9,3),a(),r(40,"p-card",16)(41,"p",17),l(42,"Chatbasierte Kommunikation \xFCber TI-Messenger ist f\xFCr eine sp\xE4tere Ausbaustufe geplant."),a()()()),t&2){let i;s(11),c("value",o.connectorLabel(o.connector().status))("severity",o.connectorSeverity(o.connector().status)),s(5),u(T(17,11,o.connector().lastSync,"dd.MM.yyyy HH:mm")),s(6),u(T(23,14,o.connector().certificateValidUntil,"dd.MM.yyyy")),s(6),u(o.connector().firmwareVersion),s(),c("text",!0),s(4),c("value",o.kimMessages())("scrollable",!0),s(5),c("options",o.patientOptions())("ngModel",o.selectedPatientId()),s(),S((i=o.selectedConsent())?39:-1,i)}},dependencies:[ae,be,_e,we,he,me,O,de,ce,ke,Ee,pe,ge,ve,Se,Ce,ye,xe,K],styles:[".page-header[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.75rem;margin-bottom:.3rem}.page-header[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{margin:0}.sim-hint[_ngcontent-%COMP%]{color:#64748b;font-size:.85rem;margin:0 0 1rem;max-width:48rem}.panels-grid[_ngcontent-%COMP%]{display:grid;grid-template-columns:repeat(auto-fit,minmax(380px,1fr));gap:.85rem}.kim-card[_ngcontent-%COMP%]{grid-column:span 2}.card-header-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;padding:.75rem 1rem 0;font-weight:600}.kv-row[_ngcontent-%COMP%]{display:flex;align-items:center;justify-content:space-between;padding:.35rem 0;font-size:.85rem;border-bottom:1px solid #f1f5f9}.kv-row[_ngcontent-%COMP%]   span[_ngcontent-%COMP%]:first-child{color:#64748b}.table-scroll[_ngcontent-%COMP%]{margin-top:.5rem}.unread[_ngcontent-%COMP%]{background:#fffbeb}.patient-select[_ngcontent-%COMP%]{width:100%;margin-bottom:.5rem}.consent-row[_ngcontent-%COMP%]{border-bottom:none}.consent-toggle[_ngcontent-%COMP%]{display:flex;align-items:center;gap:.5rem;font-size:.85rem}.docs[_ngcontent-%COMP%]{margin-top:.75rem}.hint[_ngcontent-%COMP%]{color:#64748b;font-size:.85rem}"]})};export{Ne as TiStatusComponent};
