(window.webpackJsonp=window.webpackJsonp||[]).push([[87],{173:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return c})),t.d(n,"metadata",(function(){return s})),t.d(n,"toc",(function(){return l})),t.d(n,"default",(function(){return d}));var a=t(3),o=t(7),r=(t(0),t(322)),i=t(328),c=(t(323),{id:"advanced-pagination",title:"Advanced Pagination",slug:"/guided-tour/list-data/advanced-pagination/"}),s={unversionedId:"guided-tour/list-data/advanced-pagination",id:"guided-tour/list-data/advanced-pagination",isDocsHomePage:!1,title:"Advanced Pagination",description:"In this section we're going to cover how to implement more advanced pagination use cases than the default cases covered by usePaginationFragment.",source:"@site/docs/guided-tour/list-data/advanced-pagination.md",slug:"/guided-tour/list-data/advanced-pagination/",permalink:"/docs/next/guided-tour/list-data/advanced-pagination/",editUrl:"https://github.com/facebook/relay/edit/master/website/docs/guided-tour/list-data/advanced-pagination.md",version:"current",lastUpdatedBy:"Andrey Lunyov",lastUpdatedAt:1615521596,sidebar:"docs",previous:{title:"Updating Connections",permalink:"/docs/next/guided-tour/list-data/updating-connections/"},next:{title:"Introduction",permalink:"/docs/next/guided-tour/updating-data/"}},l=[{value:"Pagination Over Multiple Connections",id:"pagination-over-multiple-connections",children:[]},{value:"Bi-directional Pagination",id:"bi-directional-pagination",children:[]},{value:"Custom Connection State",id:"custom-connection-state",children:[]},{value:"Refreshing connections",id:"refreshing-connections",children:[]},{value:"Prefetching Pages of a Connection",id:"prefetching-pages-of-a-connection",children:[]},{value:"Rendering One Page of Items at a Time",id:"rendering-one-page-of-items-at-a-time",children:[]}],u={toc:l};function d(e){var n=e.components,t=Object(o.a)(e,["components"]);return Object(r.b)("wrapper",Object(a.a)({},u,t,{components:n,mdxType:"MDXLayout"}),Object(r.b)("p",null,"In this section we're going to cover how to implement more advanced pagination use cases than the default cases covered by ",Object(r.b)("inlineCode",{parentName:"p"},"usePaginationFragment"),"."),Object(r.b)("h2",{id:"pagination-over-multiple-connections"},"Pagination Over Multiple Connections"),Object(r.b)("p",null,"If you need to paginate over multiple connections within the same component, you can use ",Object(r.b)("inlineCode",{parentName:"p"},"usePaginationFragment")," multiple times:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import type {CombinedFriendsListComponent_user$key} from 'CombinedFriendsListComponent_user.graphql';\nimport type {CombinedFriendsListComponent_viewer$key} from 'CombinedFriendsListComponent_viewer.graphql';\n\nconst React = require('React');\n\nconst {graphql, usePaginationFragment} = require('react-relay');\n\ntype Props = {\n  user: CombinedFriendsListComponent_user$key,\n  viewer: CombinedFriendsListComponent_viewer$key,\n};\n\nfunction CombinedFriendsListComponent(props: Props) {\n\n  const {data: userData, ...userPagination} = usePaginationFragment(\n    graphql`\n      fragment CombinedFriendsListComponent_user on User {\n        name\n        friends\n          @connection(\n            key: \"CombinedFriendsListComponent_user_friends_connection\"\n          ) {\n          edges {\n            node {\n              name\n              age\n            }\n          }\n        }\n      }\n    `,\n    props.user,\n  );\n\n  const {data: viewerData, ...viewerPagination} = usePaginationFragment(\n    graphql`\n      fragment CombinedFriendsListComponent_user on Viewer {\n        actor {\n          ... on User {\n            name\n            friends\n              @connection(\n                key: \"CombinedFriendsListComponent_viewer_friends_connection\"\n              ) {\n              edges {\n                node {\n                  name\n                  age\n                }\n              }\n            }\n          }\n        }\n      }\n    `,\n    props.viewer,\n  );\n\n  return (...);\n}\n")),Object(r.b)("p",null,"However, we recommend trying to keep a single connection per component, to keep the components easier to follow."),Object(r.b)("h2",{id:"bi-directional-pagination"},"Bi-directional Pagination"),Object(r.b)("p",null,"In the ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"../pagination/"}),"Pagination")," section we covered how to use ",Object(r.b)("inlineCode",{parentName:"p"},"usePaginationFragment")," to paginate in a single ",Object(r.b)("em",{parentName:"p"},'"forward"')," direction. However, connections also allow paginating in the opposite ",Object(r.b)("em",{parentName:"p"},'"backward"')," direction. The meaning of ",Object(r.b)("em",{parentName:"p"},'"forward"')," and ",Object(r.b)("em",{parentName:"p"},'"backward"')," directions will depend on how the items in the connection are sorted, for example  ",Object(r.b)("em",{parentName:"p"},'"forward"')," could mean more recent",Object(r.b)("em",{parentName:"p"},', and "backward"')," could mean less recent."),Object(r.b)("p",null,"Regardless of the semantic meaning of the direction, Relay also provides the same APIs to paginate in the opposite direction, using ",Object(r.b)("inlineCode",{parentName:"p"},"usePaginationFragment"),", as long  as the ",Object(r.b)("inlineCode",{parentName:"p"},"before")," and ",Object(r.b)("inlineCode",{parentName:"p"},"last")," connection arguments are also used along with ",Object(r.b)("inlineCode",{parentName:"p"},"after")," and ",Object(r.b)("inlineCode",{parentName:"p"},"first"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import type {FriendsListComponent_user$key} from 'FriendsListComponent_user.graphql';\n\nconst React = require('React');\nconst {Suspense} = require('React');\n\nconst {graphql, usePaginationFragment} = require('react-relay');\n\ntype Props = {\n  userRef: FriendsListComponent_user$key,\n};\n\nfunction FriendsListComponent(props: Props) {\n  const {\n    data,\n    loadPrevious,\n    hasPrevious,\n    // ... forward pagination values\n  } = usePaginationFragment(\n    graphql`\n      fragment FriendsListComponent_user on User {\n        name\n        friends(after: $after, before: $before, first: $first, last: $last)\n          @connection(key: \"FriendsListComponent_user_friends_connection\") {\n          edges {\n            node {\n              name\n              age\n            }\n          }\n        }\n      }\n    `,\n    userRef,\n  );\n\n  return (\n    <>\n      <h1>Friends of {data.name}:</h1>\n      <List items={data.friends?.edges.map(edge => edge.node)}>\n        {node => {\n          return (\n            <div>\n              {node.name} - {node.age}\n            </div>\n          );\n        }}\n      </List>\n\n      {hasPrevious ? (\n        <Button onClick={() => loadPrevious(10)}>\n          Load more friends\n        </Button>\n      ) : null}\n\n      {/* Forward pagination controls can go simultaneously here */}\n    </>\n  );\n}\n\n")),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"The APIs for both ",Object(r.b)("em",{parentName:"li"},'"forward"')," and ",Object(r.b)("em",{parentName:"li"},'"backward"')," are exactly the same, they're only named differently. When paginating forward, then the  ",Object(r.b)("inlineCode",{parentName:"li"},"after")," and ",Object(r.b)("inlineCode",{parentName:"li"},"first")," connection arguments will be used, when paginating backward, the ",Object(r.b)("inlineCode",{parentName:"li"},"before")," and ",Object(r.b)("inlineCode",{parentName:"li"},"last")," connection arguments will be used."),Object(r.b)("li",{parentName:"ul"},"Note that the primitives for both ",Object(r.b)("em",{parentName:"li"},'"forward"')," and ",Object(r.b)("em",{parentName:"li"},'"backward"')," pagination are exposed from a single call to ",Object(r.b)("inlineCode",{parentName:"li"},"usePaginationFragment"),", so both ",Object(r.b)("em",{parentName:"li"},'"forward"')," and ",Object(r.b)("em",{parentName:"li"},'"backward"')," pagination can be performed simultaneously in the same component.")),Object(r.b)("h2",{id:"custom-connection-state"},"Custom Connection State"),Object(r.b)("p",null,"By default, when using ",Object(r.b)("inlineCode",{parentName:"p"},"usePaginationFragment")," and ",Object(r.b)("inlineCode",{parentName:"p"},"@connection"),", Relay will ",Object(r.b)("em",{parentName:"p"},"append")," new pages of items to the connection when paginating ",Object(r.b)("em",{parentName:"p"},'"forward",')," and ",Object(r.b)("em",{parentName:"p"},"prepend")," new pages of items when paginating ",Object(r.b)("em",{parentName:"p"},'"backward"'),". This means that your component will always render the ",Object(r.b)("em",{parentName:"p"},"full")," connection, with ",Object(r.b)("em",{parentName:"p"},"all")," of the items that have been accumulated so far via pagination, and/or items that have been added or removed via mutations or subscriptions."),Object(r.b)("p",null,"However, it is possible that you'd need different behavior for how to merge and accumulate pagination results (or other updates to the connection), and/or derive local component state from changes to the connection. Some examples of this might be:"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"Keeping track of different ",Object(r.b)("em",{parentName:"li"},"visible")," slices or windows of the connection."),Object(r.b)("li",{parentName:"ul"},"Visually separating each ",Object(r.b)("em",{parentName:"li"},"page")," of items. This requires knowledge of the exact set of items inside each page that has been fetched."),Object(r.b)("li",{parentName:"ul"},'Displaying different ends of the same connection simultaneously, while keeping track of the "gaps" between them, and being able to merge results when preforming pagination between the gaps. For example, imagine rendering a list of comments where the oldest comments are displayed at the top, then a "gap" that can be interacted with to paginate, and then a section at the bottom which shows the most recent comments that have been added by the user or by real-time subscriptions.')),Object(r.b)("p",null,"To address these more complex use cases, Relay is still working on a solution:"),Object(r.b)("blockquote",null,Object(r.b)("p",{parentName:"blockquote"},"TBD")),Object(r.b)("h2",{id:"refreshing-connections"},"Refreshing connections"),Object(r.b)("blockquote",null,Object(r.b)("p",{parentName:"blockquote"},"TBD")),Object(r.b)("h2",{id:"prefetching-pages-of-a-connection"},"Prefetching Pages of a Connection"),Object(r.b)("blockquote",null,Object(r.b)("p",{parentName:"blockquote"},"TBD")),Object(r.b)("h2",{id:"rendering-one-page-of-items-at-a-time"},"Rendering One Page of Items at a Time"),Object(r.b)("blockquote",null,Object(r.b)("p",{parentName:"blockquote"},"TBD")),Object(r.b)(i.a,{mdxType:"DocsRating"}))}d.isMDXComponent=!0},322:function(e,n,t){"use strict";t.d(n,"a",(function(){return d})),t.d(n,"b",(function(){return f}));var a=t(0),o=t.n(a);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function c(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function s(e,n){if(null==e)return{};var t,a,o=function(e,n){if(null==e)return{};var t,a,o={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var l=o.a.createContext({}),u=function(e){var n=o.a.useContext(l),t=n;return e&&(t="function"==typeof e?e(n):c(c({},n),e)),t},d=function(e){var n=u(e.components);return o.a.createElement(l.Provider,{value:n},e.children)},p={inlineCode:"code",wrapper:function(e){var n=e.children;return o.a.createElement(o.a.Fragment,{},n)}},m=o.a.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,i=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),d=u(t),m=a,f=d["".concat(i,".").concat(m)]||d[m]||p[m]||r;return t?o.a.createElement(f,c(c({ref:n},l),{},{components:t})):o.a.createElement(f,c({ref:n},l))}));function f(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,i=new Array(r);i[0]=m;var c={};for(var s in n)hasOwnProperty.call(n,s)&&(c[s]=n[s]);c.originalType=e,c.mdxType="string"==typeof e?e:a,i[1]=c;for(var l=2;l<r;l++)i[l]=t[l];return o.a.createElement.apply(null,i)}return o.a.createElement.apply(null,t)}m.displayName="MDXCreateElement"},323:function(e,n,t){"use strict";(function(e){var a=this&&this.__createBinding||(Object.create?function(e,n,t,a){void 0===a&&(a=t),Object.defineProperty(e,a,{enumerable:!0,get:function(){return n[t]}})}:function(e,n,t,a){void 0===a&&(a=t),e[a]=n[t]}),o=this&&this.__setModuleDefault||(Object.create?function(e,n){Object.defineProperty(e,"default",{enumerable:!0,value:n})}:function(e,n){e.default=n}),r=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var n={};if(null!=e)for(var t in e)"default"!==t&&Object.prototype.hasOwnProperty.call(e,t)&&a(n,e,t);return o(n,e),n};Object.defineProperty(n,"__esModule",{value:!0}),n.OssOnly=n.FbInternalOnly=n.isInternal=n.validateFbContentArgs=n.fbInternalOnly=n.fbContent=n.bloks=void 0,n.bloks=r(t(326));const i=["internal","external"];let c;try{c=t(324).usePluginData}catch(p){c=null}function s(e){return u(e),d()?"internal"in e?l(e.internal):[]:"external"in e?l(e.external):[]}function l(e){return"function"==typeof e?e():e}function u(e){if("object"!=typeof e)throw new Error(`fbContent() args must be an object containing keys: ${i}. Instead got ${e}`);if(!Object.keys(e).find((e=>i.find((n=>n===e)))))throw new Error(`No valid args found in ${JSON.stringify(e)}. Accepted keys: ${i}`);const n=Object.keys(e).filter((e=>!i.find((n=>n===e))));if(n.length>0)throw new Error(`Unexpected keys ${n} found in fbContent() args. Accepted keys: ${i}`)}function d(){return e.env.FB_INTERNAL||c&&c("internaldocs-fb").FB_INTERNAL}n.fbContent=s,n.fbInternalOnly=function(e){return s({internal:e})},n.validateFbContentArgs=u,n.isInternal=d,n.FbInternalOnly=function(e){return d()?e.children:null},n.OssOnly=function(e){return d()?null:e.children}}).call(this,t(325))},324:function(e,n,t){"use strict";t.r(n),t.d(n,"default",(function(){return o})),t.d(n,"useAllPluginInstancesData",(function(){return r})),t.d(n,"usePluginData",(function(){return i}));var a=t(22);function o(){var e=Object(a.default)().globalData;if(!e)throw new Error("Docusaurus global data not found");return e}function r(e){var n=o()[e];if(!n)throw new Error("Docusaurus plugin global data not found for pluginName="+e);return n}function i(e,n){void 0===n&&(n="default");var t=r(e)[n];if(!t)throw new Error("Docusaurus plugin global data not found for pluginName="+e+" and pluginId="+n);return t}},325:function(e,n){var t,a,o=e.exports={};function r(){throw new Error("setTimeout has not been defined")}function i(){throw new Error("clearTimeout has not been defined")}function c(e){if(t===setTimeout)return setTimeout(e,0);if((t===r||!t)&&setTimeout)return t=setTimeout,setTimeout(e,0);try{return t(e,0)}catch(n){try{return t.call(null,e,0)}catch(n){return t.call(this,e,0)}}}!function(){try{t="function"==typeof setTimeout?setTimeout:r}catch(e){t=r}try{a="function"==typeof clearTimeout?clearTimeout:i}catch(e){a=i}}();var s,l=[],u=!1,d=-1;function p(){u&&s&&(u=!1,s.length?l=s.concat(l):d=-1,l.length&&m())}function m(){if(!u){var e=c(p);u=!0;for(var n=l.length;n;){for(s=l,l=[];++d<n;)s&&s[d].run();d=-1,n=l.length}s=null,u=!1,function(e){if(a===clearTimeout)return clearTimeout(e);if((a===i||!a)&&clearTimeout)return a=clearTimeout,clearTimeout(e);try{a(e)}catch(n){try{return a.call(null,e)}catch(n){return a.call(this,e)}}}(e)}}function f(e,n){this.fun=e,this.array=n}function b(){}o.nextTick=function(e){var n=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)n[t-1]=arguments[t];l.push(new f(e,n)),1!==l.length||u||c(m)},f.prototype.run=function(){this.fun.apply(null,this.array)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=b,o.addListener=b,o.once=b,o.off=b,o.removeListener=b,o.removeAllListeners=b,o.emit=b,o.prependListener=b,o.prependOnceListener=b,o.listeners=function(e){return[]},o.binding=function(e){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(e){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},326:function(e,n,t){"use strict";var a=this&&this.__awaiter||function(e,n,t,a){return new(t||(t=Promise))((function(o,r){function i(e){try{s(a.next(e))}catch(n){r(n)}}function c(e){try{s(a.throw(e))}catch(n){r(n)}}function s(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(i,c)}s((a=a.apply(e,n||[])).next())}))};Object.defineProperty(n,"__esModule",{value:!0}),n.getSpecInfo=void 0;const o=t(327);n.getSpecInfo=function(e){return a(this,void 0,void 0,(function*(){return yield o.call({module:"bloks",api:"getSpecInfo",args:{styleId:e}})}))}},327:function(e,n,t){"use strict";var a=this&&this.__awaiter||function(e,n,t,a){return new(t||(t=Promise))((function(o,r){function i(e){try{s(a.next(e))}catch(n){r(n)}}function c(e){try{s(a.throw(e))}catch(n){r(n)}}function s(e){var n;e.done?o(e.value):(n=e.value,n instanceof t?n:new t((function(e){e(n)}))).then(i,c)}s((a=a.apply(e,n||[])).next())}))};Object.defineProperty(n,"__esModule",{value:!0}),n.call=void 0;let o=!1,r=0;const i={};n.call=function(e){return a(this,void 0,void 0,(function*(){if("staticdocs.thefacebook.com"!==window.location.hostname&&"localhost"!==window.location.hostname)return Promise.reject(new Error("Not running on static docs"));o||(o=!0,window.addEventListener("message",(e=>{if("static-docs-bridge-response"!==e.data.event)return;const n=e.data.id;n in i||console.error(`Recieved response for id: ${n} with no matching receiver`),"response"in e.data?i[n].resolve(e.data.response):i[n].reject(new Error(e.data.error)),delete i[n]})));const n=r++,t=new Promise(((e,t)=>{i[n]={resolve:e,reject:t}})),a={event:"static-docs-bridge-call",id:n,module:e.module,api:e.api,args:e.args},c="localhost"===window.location.hostname?"*":"https://www.internalfb.com";return window.parent.postMessage(a,c),t}))}},328:function(e,n,t){"use strict";t(60);var a=t(323),o=t(0);var r=function(){var e=o.useState(!1),n=e[0],t=e[1],a=function(e){t(!0),function(e){window.ga&&window.ga("send",{hitType:"event",eventCategory:"button",eventAction:"feedback",eventValue:e})}(e)};return n?o.createElement("div",{className:"docsRating",id:"docsRating"},o.createElement("hr",null),"Thank you for letting us know!"):o.createElement("div",{className:"docsRating",id:"docsRating"},o.createElement("hr",null),"Is this page useful?",o.createElement("svg",{className:"i_thumbsup",alt:"Like",id:"docsRating-like",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 81.13 89.76",onClick:function(){return a(1)}},o.createElement("path",{d:"M22.9 6a18.57 18.57 0 002.67 8.4 25.72 25.72 0 008.65 7.66c3.86 2 8.67 7.13 13.51 11 3.86 3.11 8.57 7.11 11.54 8.45s13.59.26 14.64 1.17c1.88 1.63 1.55 9-.11 15.25-1.61 5.86-5.96 10.55-6.48 16.86-.4 4.83-2.7 4.88-10.93 4.88h-1.35c-3.82 0-8.24 2.93-12.92 3.62a68 68 0 01-9.73.5c-3.57 0-7.86-.08-13.25-.08-3.56 0-4.71-1.83-4.71-4.48h8.42a3.51 3.51 0 000-7H12.28a2.89 2.89 0 01-2.88-2.88 1.91 1.91 0 01.77-1.78h16.46a3.51 3.51 0 000-7H12.29c-3.21 0-4.84-1.83-4.84-4a6.41 6.41 0 011.17-3.78h19.06a3.5 3.5 0 100-7H9.75A3.51 3.51 0 016 42.27a3.45 3.45 0 013.75-3.48h13.11c5.61 0 7.71-3 5.71-5.52-4.43-4.74-10.84-12.62-11-18.71-.15-6.51 2.6-7.83 5.36-8.56m0-6a6.18 6.18 0 00-1.53.2c-6.69 1.77-10 6.65-9.82 14.5.08 5.09 2.99 11.18 8.52 18.09H9.74a9.52 9.52 0 00-6.23 16.9 12.52 12.52 0 00-2.07 6.84 9.64 9.64 0 003.65 7.7 7.85 7.85 0 00-1.7 5.13 8.9 8.9 0 005.3 8.13 6 6 0 00-.26 1.76c0 6.37 4.2 10.48 10.71 10.48h13.25a73.75 73.75 0 0010.6-.56 35.89 35.89 0 007.58-2.18 17.83 17.83 0 014.48-1.34h1.35c4.69 0 7.79 0 10.5-1 3.85-1.44 6-4.59 6.41-9.38.2-2.46 1.42-4.85 2.84-7.62a41.3 41.3 0 003.42-8.13 48 48 0 001.59-10.79c.1-5.13-1-8.48-3.35-10.55-2.16-1.87-4.64-1.87-9.6-1.88a46.86 46.86 0 01-6.64-.29c-1.92-.94-5.72-4-8.51-6.3l-1.58-1.28c-1.6-1.3-3.27-2.79-4.87-4.23-3.33-3-6.47-5.79-9.61-7.45a20.2 20.2 0 01-6.43-5.53 12.44 12.44 0 01-1.72-5.36 6 6 0 00-6-5.86z"})),o.createElement("svg",{className:"i_thumbsdown",alt:"Dislike",id:"docsRating-dislike",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 81.13 89.76",onClick:function(){return a(0)}},o.createElement("path",{d:"M22.9 6a18.57 18.57 0 002.67 8.4 25.72 25.72 0 008.65 7.66c3.86 2 8.67 7.13 13.51 11 3.86 3.11 8.57 7.11 11.54 8.45s13.59.26 14.64 1.17c1.88 1.63 1.55 9-.11 15.25-1.61 5.86-5.96 10.55-6.48 16.86-.4 4.83-2.7 4.88-10.93 4.88h-1.35c-3.82 0-8.24 2.93-12.92 3.62a68 68 0 01-9.73.5c-3.57 0-7.86-.08-13.25-.08-3.56 0-4.71-1.83-4.71-4.48h8.42a3.51 3.51 0 000-7H12.28a2.89 2.89 0 01-2.88-2.88 1.91 1.91 0 01.77-1.78h16.46a3.51 3.51 0 000-7H12.29c-3.21 0-4.84-1.83-4.84-4a6.41 6.41 0 011.17-3.78h19.06a3.5 3.5 0 100-7H9.75A3.51 3.51 0 016 42.27a3.45 3.45 0 013.75-3.48h13.11c5.61 0 7.71-3 5.71-5.52-4.43-4.74-10.84-12.62-11-18.71-.15-6.51 2.6-7.83 5.36-8.56m0-6a6.18 6.18 0 00-1.53.2c-6.69 1.77-10 6.65-9.82 14.5.08 5.09 2.99 11.18 8.52 18.09H9.74a9.52 9.52 0 00-6.23 16.9 12.52 12.52 0 00-2.07 6.84 9.64 9.64 0 003.65 7.7 7.85 7.85 0 00-1.7 5.13 8.9 8.9 0 005.3 8.13 6 6 0 00-.26 1.76c0 6.37 4.2 10.48 10.71 10.48h13.25a73.75 73.75 0 0010.6-.56 35.89 35.89 0 007.58-2.18 17.83 17.83 0 014.48-1.34h1.35c4.69 0 7.79 0 10.5-1 3.85-1.44 6-4.59 6.41-9.38.2-2.46 1.42-4.85 2.84-7.62a41.3 41.3 0 003.42-8.13 48 48 0 001.59-10.79c.1-5.13-1-8.48-3.35-10.55-2.16-1.87-4.64-1.87-9.6-1.88a46.86 46.86 0 01-6.64-.29c-1.92-.94-5.72-4-8.51-6.3l-1.58-1.28c-1.6-1.3-3.27-2.79-4.87-4.23-3.33-3-6.47-5.79-9.61-7.45a20.2 20.2 0 01-6.43-5.53 12.44 12.44 0 01-1.72-5.36 6 6 0 00-6-5.86z"})))},i=function(){return null};n.a=function(){return Object(a.fbContent)({internal:o.createElement(i,null),external:o.createElement(r,null)})}}}]);