<template no-gutters>
  <div class="br-richtexteditor">
    <ejs-richtexteditor ref="rte_richtexteditor" :height="editorHeight" v-model="editorText" :saveInterval="saveInterval"
      :toolbarSettings="toolbarSettings" :actionComplete="actionCompleteHandler"
      :fileManagerSettings="fileManagerSettings" :quickToolbarSettings='quickToolbarSettings'
      :enableTabKey="enableTabKey" enablePersistence=true>
    </ejs-richtexteditor>
  </div>
</template>

<script setup>
</script>

<script>
let hostUrl = 'http://192.168.0.245/';

import { Browser, addClass, removeClass, isNullOrUndefined as isNOU } from "@syncfusion/ej2-base";
import { RichTextEditorComponent, Toolbar, Link, Image, Count, HtmlEditor, QuickToolbar, Table, FileManager, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup }
  from "@syncfusion/ej2-vue-richtexteditor";

export default {
  emits: ["changeHtml"],
  props: {
    value: {
      type: String,
      default: "<p>Let's go Smart & Easy Invoice</p>"
    },
  },
  computed: {
    editorText: {
      get: function () {
        return this.value
      },
      set: function (value) {
        this.$emit('changeHtml', value) // 부모에서는 @input에 쓴 메소드가 호출된다. 인수에value
      },
    },
  },

  // watch: {
  //   editorText: {
  //     handler(curValue, oldValue) {
  //       console.log(curValue, oldValue);
  //     },
  //     deep: true,
  //     flush: false
  //   }
  // },
  components: {
    'ejs-richtexteditor': RichTextEditorComponent
  },
  provide: {
    richtexteditor: [Toolbar, Link, Image, Count, HtmlEditor, QuickToolbar, Table, FileManager, EmojiPicker, Video, Audio, FormatPainter, PasteCleanup]
  },

  mounted() {
    this.editorHeight = this.getHeight();
    window.addEventListener('resize', this.onResize);
  },
  destroyed() {
    window.removeEventListener('resize', this.onResize);
  },
  methods: {
    getHeight() {
      if (typeof window == "object") {
        const main = document.getElementsByClassName('v-main');
        if (main.length > 0) {
          let height = main[0].clientHeight - 700;
          if (height < 500) height = 500;
          return height + 'px';
        }
      }
      return "500px";

    },
    onResize() {
      this.editorHeight = this.getHeight();
    },

    getHtml() {
      return this.$refs.rte_richtexteditor.getHtml();
    },
    getContents() {
      return this.$refs.rte_richtexteditor.getContent();
    },

    mirrorConversion: function (e) {
      var textArea = this.$refs.rte_richtexteditor.ej2Instances.contentModule.getEditPanel();
      var id = this.$refs.rte_richtexteditor.ej2Instances.getID() + 'mirror-view';
      var mirrorView = this.$refs.rte_richtexteditor.$el.parentNode.querySelector('#' + id);
      var charCount = this.$refs.rte_richtexteditor.$el.parentNode.querySelector('.e-rte-character-count');
      if (e.targetItem === 'Preview') {
        textArea.style.display = 'block';
        mirrorView.style.display = 'none';
        textArea.innerHTML = this.myCodeMirror.getValue();
        charCount.style.display = 'block';
      }
      else {
        if (!mirrorView) {
          mirrorView = document.createElement('div', { className: 'e-content' });
          mirrorView.id = id;
          textArea.parentNode.appendChild(mirrorView);
        }
        else {
          mirrorView.innerHTML = '';
        }
        textArea.style.display = 'none';
        mirrorView.style.display = 'block';
        this.renderCodeMirror(mirrorView, this.$refs.rte_richtexteditor.ej2Instances.value === null ? "" : this.$refs.rte_richtexteditor.ej2Instances.value);
        charCount.style.display = 'none';
      }
    },
    renderCodeMirror: function (mirrorView, content) {
      this.myCodeMirror = CodeMirror(mirrorView, {
        value: content,
        lineNumbers: true,
        mode: 'text/html',
        lineWrapping: true,

      });
    },
    handleFullScreen: function (e) {
      var sbCntEle = document.querySelector('.sb-content.e-view');
      var sbHdrEle = document.querySelector('.sb-header.e-view');
      var leftBar;
      var transformElement;
      if (Browser.isDevice) {
        leftBar = document.querySelector('#right-sidebar');
        transformElement = document.querySelector('.sample-browser.e-view.e-content-animation');
      } else {
        leftBar = document.querySelector('#left-sidebar');
        transformElement = document.querySelector('#right-pane');
      }

      if (e.targetItem === 'Maximize') {
        if (Browser.isDevice && Browser.isIos) {
          addClass([sbCntEle, sbHdrEle], ['hide-header']);
        }
        addClass([leftBar], ['e-close']);
        removeClass([leftBar], ['e-open']);
        if (!Browser.isDevice) {
          transformElement.style.marginLeft = '0px';
        }
        transformElement.style.transform = 'inherit';
        sbHdrEle.style.cssText = 'z-index: 100 !important;';
      }
      else if (e.targetItem === 'Minimize') {
        if (Browser.isDevice && Browser.isIos) {
          removeClass([sbCntEle, sbHdrEle], ['hide-header']);
        }
        removeClass([leftBar], ['e-close']);
        if (!Browser.isDevice) {
          addClass([leftBar], ['e-open']);
          transformElement.style.marginLeft = leftBar.offsetWidth + 'px';
        }
        transformElement.style.transform = 'translateX(0px)';
      }
    },
    actionCompleteHandler: function (e) {
      if (e.targetItem && (e.targetItem === 'SourceCode' || e.targetItem === 'Preview')) {
        this.$refs.rte_richtexteditor.ej2Instances.sourceCodeModule.getPanel().style.display = 'none';
        this.mirrorConversion(e);
      }
      else {
        var proxy = this;
        setTimeout(function () { proxy.$refs.rte_richtexteditor.ej2Instances.toolbarModule.refreshToolbarOverflow(); }, 500);
      }
    }
  },

  data() {

    return {
      // editorText: this.value,
      saveInterval: 500,
      editorHeight: "",
      showCharCount: true,
      enableTabKey: true,
      myCodeMirror: '',
      fileManagerSettings: {
        enable: true,
        path: '/Pictures/Food',
        ajaxSettings: {
          url: hostUrl + 'api/FileManager/FileOperations',
          getImageUrl: hostUrl + 'api/FileManager/GetImage',
          uploadUrl: hostUrl + 'api/FileManager/Upload',
          downloadUrl: hostUrl + 'api/FileManager/Download'
        }
      },
      toolbarSettings: {
        type: 'Scrollable',
        // items: ['Bold', 'Italic', 'Underline', 'StrikeThrough', 'SuperScript', 'SubScript', '|',
        //   'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
        //   'LowerCase', 'UpperCase', '|',
        //   'Formats', 'Alignments', '|', 'NumberFormatList', 'BulletFormatList', '|',
        //   'CreateTable'
        // ]

        items: ['Bold', 'Italic', 'Underline', 'StrikeThrough', 'SuperScript', 'SubScript', '|',
          'FontName', 'FontSize', 'FontColor', 'BackgroundColor', '|',
          'LowerCase', 'UpperCase', '|',
          'Formats', 'Alignments', '|', 'NumberFormatList', 'BulletFormatList', '|',
          'Outdent', 'Indent', '|', 'CreateLink', 'Image', 'FileManager', 'Video', 'Audio', 'CreateTable', '|', 'FormatPainter', 'ClearFormat',
          '|', 'EmojiPicker', 'Print',
          '|', 'Undo', 'Redo'
        ]
      },
      quickToolbarSettings: {
        table: ['TableHeader', 'TableRows', 'TableColumns', 'TableCell', '-', 'BackgroundColor', 'TableRemove', 'TableCellVerticalAlign', 'Styles'],
        showOnRightClick: true,
      },
    }
  }
}
</script>

<style>
.br-richtexteditor {

  .e-code-mirror::before {
    content: '\e345';
  }

  .e-html-preview::before {
    content: '\e350';
  }

  .CodeMirror-linenumber,
  .CodeMirror-gutters {
    display: none;
  }

  .sb-header {
    z-index: 100;
  }

  .sb-content.e-view.hide-header {
    top: 0 !important;
  }

  .sb-header.e-view.hide-header {
    display: none;
  }

  .fabric-dark .cm-s-default .cm-tag,
  .bootstrap5-dark .cm-s-default .cm-tag,
  .material-dark .cm-s-default .cm-tag,
  .tailwind-dark .cm-s-default .cm-tag,
  .highcontrast .cm-s-default .cm-tag {
    color: #00ff00;
  }

  .fabric-dark .cm-s-default .cm-string,
  .bootstrap5-dark .cm-s-default .cm-string,
  .material-dark .cm-s-default .cm-string,
  .tailwind-dark .cm-s-default .cm-string {
    color: blue;
  }

  .highcontrast .cm-s-default .cm-string {
    color: #ffd939;
  }

  .fabric-dark .cm-s-default .cm-attribute,
  .bootstrap5-dark .cm-s-default .cm-attribute,
  .material-dark .cm-s-default .cm-attribute,
  .tailwind-dark .cm-s-default .cm-attribute,
  .highcontrast .cm-s-default .cm-attribute {
    color: #f00;
  }

  .fabric-dark .CodeMirror,
  .bootstrap5-dark .CodeMirror,
  .material-dark .CodeMirror,
  .tailwind-dark .CodeMirror {
    background: #303030;
    color: white;
  }

  .highcontrast .CodeMirror {
    background: black;
    color: white;
  }

  .e-richtexteditor .e-rte-content .e-content[contenteditable="true"] pre {
    padding: 10px;
    background: #F4F5F7;
  }

  .fabric-dark .e-richtexteditor .e-rte-content .e-content pre,
  .bootstrap5-dark .e-richtexteditor .e-rte-content .e-content pre,
  .material-dark .e-richtexteditor .e-rte-content .e-content pre,
  .tailwind-dark .e-richtexteditor .e-rte-content .e-content pre,
  .highcontrast .e-richtexteditor .e-rte-content .e-content pre {
    padding: 10px;
    background: #303030;
  }

  .e-richtexteditor .e-rte-content {

    border: 1px solid rgba(var(--color-sf-outline-variant)) !important;

    .e-content {
      padding: 10px;
      text-align: left;
    }
  }

  .e-toolbar .e-toolbar-items {
    display: flex;
  }


  .CodeMirror-code pre {
    background: transparent;
  }

}
</style>