/*! Mutiny v0.1.0dev - http://mutinyjs.com/ */
var Mutiny={init:function(a){a=a||"mutiny",$("[data-"+a+"]").mutiny(a)}};$.fn.mutiny=function(a){var t=function(a,t,n){if(void 0===Mutiny[t])throw'"'+t+'" not found';var e=$.extend({},Mutiny[t].defaults);"string"==typeof n?e[Mutiny[t].string_arg]=n:$.extend(e,n),Mutiny[t].init(a,e)};return a=a||"mutiny",this.each(function(n,e){var i=$(e),r=i.data(a);switch(typeof r){case"string":t(i,r,{});break;case"object":for(var s in r)t(i,s,r[s]);break;default:throw"Unsupported data"}}),this},Mutiny.accordion={defaults:{autoHeight:!1,collapsible:!0,active:!1},_hrefIndex:function(a,t){var n=-1;return a.find("a").each(function(a,e){return $(e).attr("href")==t?(n=a,!1):void 0}),n},init:function(a,t){var n=window.location.hash||void 0,e=t.menu?$(t.menu):void 0;if(n){var i=this._hrefIndex(e||a,n);i>-1&&(t.active=i)}if(e){var r=this;e.find("a").click(function(t){var n=r._hrefIndex(e,$(t.target).attr("href"));n>-1&&a.accordion("activate",n)})}a.accordion(t)}},Mutiny.datepicker={init:function(a){a.datepicker()}},Mutiny.slider={defaults:{range:"min"},_createFormatSpan:function(a,t,n){(null===t||""===t)&&(t="&nbsp;");var e=a.replace("%s","<span>"+t+"</span>");return n?'<span class="'+n+'">'+e+"</span>":"<span>"+e+"</span>"},init:function(a,t){var n;if(t.target)n=$(t.target);else{var e=a.attr("id"),i="";e&&(i=' id="'+e+'-mutiny-slider"'),n=$("<div"+i+"></div>").insertAfter(a)}if(t.value=a.val(),t.slide=function(t,n){a.val(n.value).change()},a.is("select")){var r=a.find("option");t.min=Number(r.first().val()),t.max=Number(r.last().val()),t.step=(t.max-t.min)/(r.length-1)}else t.min=Number(a.attr("min")||a.data("min")),t.max=Number(a.attr("max")||a.data("max")),t.step=Number(a.attr("step")||a.data("step"));if(a.change(function(){var e=Number(a.val());e>t.max&&(e=t.max),t.min>e&&(e=t.min),isNaN(e)&&(e=t.value),a.val(e),n.slider("value",e)}),t.minLabel&&n.append(this._createFormatSpan(t.minLabel,t.min,"min-label")),t.maxLabel&&n.append(this._createFormatSpan(t.maxLabel,t.max,"max-label")),n.slider(t),t.valueLabel){var s=$(this._createFormatSpan(t.valueLabel,t.value,"valueLabel")).appendTo(n.find(".ui-slider-handle")),l=s.find("span");a.change(function(){l.html(a.val())})}}},Mutiny.toggler={defaults:{style:{display:"none"},preventDefault:!1,instigatorClass:"active"},string_arg:"target",init:function(a,t){var n,e=$(t.target);if(t["class"])n=function(a){e.toggleClass(t["class"],a)};else{var i={};for(var r in t.style)i[r]=e.css(r);n=function(a){e.css(a?t.style:i)}}if(a.is("input[type=radio]")){var s=a.attr("name");$('input[name="'+s+'"]').change(function(){var e=a.is(":checked");a.toggleClass(t.instigatorClass,e),n(e)})}else{var l=!1;a.click(function(e){l=!l,a.toggleClass(t.instigatorClass,l),n(l),t.preventDefault&&e.preventDefault()})}}};