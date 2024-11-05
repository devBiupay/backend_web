<template>
    <div class="view-image" :style="width + ';' + height">
      <el-image
          style="width: 100%; height: 100%"
          :src="src"
          :fit="fit"
          :alt="alt"
          :referrerPolicy="referrerPolicy"
          :zIndex="zIndex"
          :preview-src-list="previewSrcList"
          @click="cusPreviewImage"
      >
      </el-image>
      <span
          class="el-image-viewer__btn el-image-viewer__download"
          v-show="dnFlag"
          @click="dnImage"
      >
          <i class="el-icon-download"></i>
      </span>
    </div>
  </template>
  <script>
  export default {
      name: "viewImage",
      data() {
          return {
              dnFlag: false,
              wrapperElem: null,
              hidElClassNameLists: [
                  "el-image-viewer__mask",
                  "el-image-viewer__btn el-image-viewer__close",
                  "el-icon-close",
              ],
          };
      },
      props: {
          src: {
              type: String,
              default: "",
          },
          previewSrcList: {
              type: Array,
              default: function () {
                  return [];
              },
          },
          width: {
              type: String,
              default: "100%",
          },
          height: {
              type: String,
              default: "100%",
          },
          fit: {
              type: String,
              default: "",
          },
          alt: {
              type: String,
              default: "",
          },
          referrerPolicy: {
              type: String,
              default: "",
          },
          zIndex: {
              type: Number,
              default: 2000,
          },
      },
      methods: {
          cusPreviewImage(e) {
              console.log(this.src,e,'cusPreviewImage')
              this.dnFlag = true;
              this.checkElemlents();
          },
          checkElemlents() {
              this.$nextTick(() => {
                  let wrapper = document.getElementsByClassName(
                      "el-image-viewer__wrapper"
                  );
                  if (wrapper.length > 0) {
                      this.wrapperElem = wrapper[0];
                      console.log(wrapper,'wrapper')
                      this.cusClickHandler();
                  } else {
                      this.checkElemlents();
                  }
              });
          },
          cusClickHandler() {
              this.wrapperElem.addEventListener("click", this.hideCusBtn);
          },
          hideCusBtn(e) {
              console.log(e,'e')
              let className = e.target.className;
              console.log(className,'className')
              if (this.hidElClassNameLists.includes(className)) {
                  this.dnFlag = false;
              }
          },
          dnImage() {
              let imgUrl = document.getElementsByClassName(
                  "el-image-viewer__canvas"
              )[0].children[0].src;
              this.downloadImage(imgUrl);
          },
          download(imgsrc, name) {//下载图片地址和图片名
              const image = new Image()
              // 解决跨域 Canvas 污染问题
              image.setAttribute('crossOrigin', 'anonymous')
              image.onload = () => {
                  const canvas = document.createElement('canvas')
                  canvas.width = image.width
                  canvas.height = image.height
                  const context = canvas.getContext('2d')
                  context.drawImage(image, 0, 0, image.width, image.height)
                  canvas.toBlob((blob) => {
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.download = name || 'photo'
                      a.href = url
                      a.click()
                      a.remove()
                      URL.revokeObjectURL(url)
                  })
              }
              image.src = imgsrc
          },
          downloadImage(imgUrl){
              this.download(imgUrl,name)
          }
      },
      mounted() {
      }
  };
  </script>
  <style scoped>
  .view-image {
      display: inline-block;
  }
  .view-image .el-image-viewer__download {
          top: 40px;
          right: 100px;
          width: 40px;
          height: 40px;
          font-size: 24px;
          color: #fff;
          background-color: #606266;
          z-index: 2001; /* 如果该组件需要传递 z-index 的值，这个值也需要做成动态的 props */
          cursor: pointer;
          position: fixed; 
  }
  </style>