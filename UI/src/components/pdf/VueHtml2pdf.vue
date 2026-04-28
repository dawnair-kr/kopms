<template>
  <div class="vue-html2pdf">
    <section class="layout-container" v-show="progress != 100">
      <section class="content-wrapper" ref="pdfContent">
        <slot name="pdf-content" />
      </section>
    </section>

    <section class="pdf-preview" v-show="progress == 100" style="height: calc(100vh - 195px);">
      <iframe :src="pdfFile" width="100%" height="100%" />
    </section>
    <!-- <transition name="transition-anim">
      <section class="pdf-preview">
        <button @click.self="closePreview()">
          &times;
        </button>

        <iframe :src="pdfFile" width="100%" height="100%" />
      </section>
    </transition> -->
  </div>
</template>

<script>
// import { html2pdf } from 'html2pdf.js'
let html2pdf;
if (typeof window == "object") {

  import('html2pdf.js')
    .then(html2pdfFunction => {
      html2pdf = html2pdfFunction.default;
    });
}

export default {
  emits: ["progress", "startPagination", "hasPaginated", "beforeDownload", "hasDownloaded", "generatePdfEnd", "updatePdfFile"],
  props: {
    // progress: {
    //   type: Number,
    //   default: 0
    // },
    showLayout: {
      type: Boolean,
      default: false
    },

    floatLayout: {
      type: Boolean,
      default: false
    },

    enableDownload: {
      type: Boolean,
      default: true
    },

    previewModal: {
      type: Boolean,
      default: false
    },

    paginateElementsByHeight: {
      type: Number
    },

    filename: {
      type: String,
      default: `${new Date().getTime()}`
    },

    pdfQuality: {
      type: Number,
      default: 2,
    },

    pdfFormat: {
      default: 'a4',
    },

    pdfOrientation: {
      type: String,
      default: 'portrait'
    },

    pdfContentWidth: {
      default: '800px'
    },

    htmlToPdfOptions: {
      type: Object
    },

    manualPagination: {
      type: Boolean,
      default: false
    },
    pdfFile: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      hasAlreadyParsed: false,
      progress: 0,
      pdfWindow: null,
      // preview: false
      html2PdfSetup: null,
    }
  },

  watch: {
    progress(val) {
      this.$emit('progress', val)
    },

    paginateElementsByHeight() {
      this.resetPagination()
    },

    $props: {
      handler() {
        this.validateProps()
      },

      deep: true,
      immediate: true
    }
  },

  methods: {
    validateProps() {
      // If manual-pagination is false, paginate-elements-by-height props is required
      if (!this.manualPagination) {
        if (this.paginateElementsByHeight === undefined) {
          console.error('Error: paginate-elements-by-height is required if manual-pagination is false')
        }
      }
    },

    resetPagination() {
      const parentElement = this.$refs.pdfContent.firstChild
      const pageBreaks = parentElement.getElementsByClassName('html2pdf__page-break')
      const pageBreakLength = pageBreaks.length - 1

      if (pageBreakLength === -1) return

      this.hasAlreadyParsed = false

      // Remove All Page Break (For Pagination)
      for (let x = pageBreakLength; x >= 0; x--) {
        pageBreaks[x].parentNode.removeChild(pageBreaks[x])
      }
    },

    generatePdf() {

      // this.$emit('startPagination')
      this.progress = 20;
      this.paginationOfElements()
    },

    paginationOfElements() {
      this.progress = 30

      /*
        When this props is true, 
        the props paginate-elements-by-height will not be used.
        Instead the pagination process will rely on the elements with a class "html2pdf__page-break"
        to know where to page break, which is automatically done by html2pdf.js
      */
      if (this.manualPagination) {
        this.progress = 60
        this.makePdf()
        return
      }

      if (!this.hasAlreadyParsed) {

        // const parentElement = this.$refs.pdfContent.firstChild;
        const parentElement = this.$refs.pdfContent.firstElementChild;

        const ArrOfContentChildren = Array.from(parentElement.children)
        let childrenHeight = 0

        /*
          Loop through Elements and add there height with childrenHeight variable.
          Once the childrenHeight is >= this.paginateElementsByHeight, create a div with
          a class named 'html2pdf__page-break' and insert the element before the element
          that will be in the next page
        */
        for (const childElement of ArrOfContentChildren) {
          // Get The First Class of the element
          const elementFirstClass = childElement.classList[0]
          const isPageBreakClass = elementFirstClass === 'html2pdf__page-break'
          if (isPageBreakClass) {
            childrenHeight = 0
          } else {
            // Get Element Height
            const elementHeight = childElement.clientHeight

            // Get Computed Margin Top and Bottom
            const elementComputedStyle = childElement.currentStyle || window.getComputedStyle(childElement)
            const elementMarginTopBottom = parseInt(elementComputedStyle.marginTop) + parseInt(elementComputedStyle.marginBottom)

            // Add Both Element Height with the Elements Margin Top and Bottom
            const elementHeightWithMargin = elementHeight + elementMarginTopBottom

            if ((childrenHeight + elementHeight) < this.paginateElementsByHeight) {
              childrenHeight += elementHeightWithMargin
            } else {
              const section = document.createElement('div')
              section.classList.add('html2pdf__page-break')
              parentElement.insertBefore(section, childElement)

              // Reset Variables made the upper condition false
              childrenHeight = elementHeightWithMargin
            }
          }
        }

        this.progress = 60

        /*
          Set to true so that if would generate again we wouldn't need
          to parse the HTML to paginate the elements
        */
        this.hasAlreadyParsed = true
      } else {
        this.progress = 60
      }

      // this.$emit('hasPaginated')
      this.makePdf()
    },

    async makePdf() {
      // Set Element and Html2pdf.js Options

      const pdfContent = this.$refs.pdfContent;
      let options = this.setOptions();

      this.html2PdfSetup = html2pdf().set(options).from(pdfContent);
      this.progress = 85;

      let pdfFile = await this.html2PdfSetup.output('bloburl')

      this.$emit('updatePdfFile', pdfFile);
      this.progress = 100;
      this.$emit('generatePdfEnd');
    },

    async downloadPdf() {

      // console.log("downloadPdf");

      const pdfBlobUrl = await this.html2PdfSetup.save().output('bloburl');
      if (pdfBlobUrl) {
        const res = await fetch(pdfBlobUrl)
        const blobFile = await res.blob();
        this.$emit('hasDownloaded', blobFile)
      }
    },

    setOptions() {

      if (this.htmlToPdfOptions !== undefined && this.htmlToPdfOptions !== null) {
        return this.htmlToPdfOptions
      }

      return {
        margin: 0,

        filename: `${this.filename}.pdf`,

        image: {
          type: 'jpeg',
          quality: 0.98
        },

        enableLinks: false,

        html2canvas: {
          scale: this.pdfQuality,
          useCORS: true
        },

        jsPDF: {
          unit: 'in',
          format: this.pdfFormat,
          orientation: this.pdfOrientation
        }
      }
    },

    closePreview() {
      // this.preview = false;
    }
  }
}
</script>

<style lang="scss" scoped></style>