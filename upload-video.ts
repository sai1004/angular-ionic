
  recordVideo(teamId:any, over:any, ball:any) {

    let options: CaptureVideoOptions = { limit: 1, duration: 30, quality: 0 };

    this.mediaCapture.captureVideo(options)
      .then(
        (data: MediaFile[]) => {
          this.uploadVideoToServer(data[0].fullPath,"file",teamId, over, ball);
        },
        (err: CaptureError) => console.error(err)
      );
  }


  selectVideoFromGallery(teamId:any, over:any, ball:any){

    const options: CameraOptions = {
      mediaType: this.camera.MediaType.VIDEO,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options)
      .then( async (videoUrl) => {
        if (videoUrl) {

          var filename = videoUrl.substr(videoUrl.lastIndexOf('/') + 1);
          var dirpath = videoUrl.substr(0, videoUrl.lastIndexOf('/') + 1);

          dirpath = dirpath.includes("file://") ? dirpath : "file://" + dirpath;

          try {
            var dirUrl = await this.file.resolveDirectoryUrl(dirpath);
            var retrievedFile = await this.file.getFile(dirUrl, filename, {});
          } catch(err) {
            this.global.hideLoading();
            return this.global.showToast("Something went wrong.");
          }
          retrievedFile.file( data => {
            this.global.hideLoading();
            if ( data.size > MAX_FILE_SIZE || data.type !== ALLOWED_MIME_TYPE ) {
              return this.global.showToast("Error cannot upload more than 5mb or Incorrect file type.")
            } else {
              this.uploadVideoToServer(retrievedFile.nativeURL,filename,teamId, over, ball);
            }
          });
        }
      },
      (err) => {
        console.log(err);
      });
  }


  uploadVideoToServer(videoData:any,fileName:any,teamId:any, over:any, ball:any){

    const fileTransfer: FileTransferObject = this.transfer.create();

    this.isVideoUploading = true;

    let options: FileUploadOptions = {
      chunkedMode: false,
      fileName: fileName,
      fileKey: "file",
      mimeType: ALLOWED_MIME_TYPE
    }

    fileTransfer.upload(videoData,  url , options)
      .then((data) => {
        // console.log(data);
        this.isVideoUploading = false;
        this.videoUploadPercent = 0;
        this.getMatchVideos();
        this.global.hideLoading();
        this.global.showToast('Video Saved Succesfully');

      }).catch((err)=>{
        this.isVideoUploading = false;
        this.videoUploadPercent = 0;
        this.global.showToast('Oops!! Try again');
      });
    /* --- get upload progress percentage ----- */

    fileTransfer.onProgress((progressEvent) => {
      this._zone.run(() =>{
        var perc = (progressEvent.lengthComputable) ?  Math.floor(progressEvent.loaded / progressEvent.total * 100) : -1;
        this.videoUploadPercent  = perc;
      });
    });

    if (this.isVideoUploading == true ) {
      this.global.presentLoading(`Please Wait Uploading in Progress...`);
    }

  }


  uploadVideo(teamId, over, ball, imageData){
    // let options: CaptureVideoOptions = { limit: 30, quality: 0 };
    // requestCameraAuthorization
    if(this.global.devicePlatform == 'android'){
      console.log('platform Android');
      this.diagnostic.requestExternalStorageAuthorization().then(()=>{
        this.selectVideoFromGallery(teamId, over, ball)
        // this.recordVideo(teamId, over, ball)
        // this.captureVideoAndUploadToServer(teamId, over, ball, imageData);
        // this.selectVideo(teamId, over, ball)
        }).catch(error=>{
        //Handle error
        });
    } else {
      console.log('platform IOS and others');
      // this.captureVideoAndUploadToServer(teamId, over, ball, imageData);
    }
    // this.diagnostic.requestExternalStorageAuthorization()
    //   .then((state) => {
    //     if (state == this.diagnostic.bluetoothState.POWERED_ON){
    //       // do something
    //     } else {
    //       // do something else
    //     }
    //   }).catch(e => console.error(e));

    // this.mediaCapture.captureVideo(options)
    //   .then(
    //     (data: MediaFile[]) => {
    //       console.log(data);
    //       console.log('video path' + data[0].fullPath);
    //       const fileTransfer: FileTransferObject = this.transfer.create();
    //       let options: FileUploadOptions = {
    //         chunkedMode: false,
    //         fileName: 'file',
    //         fileKey: "file",
    //         mimeType: "video/mp4"
    //       }

    //       fileTransfer.upload(data[0].fullPath,  url, options)
    //         .then((data) => {
    //           console.log(data);
    //           this.global.showToast('Video Saved Succesfully');
    //         }, (err) => {
    //           // error
    //           this.global.showToast('Oops!! Try again');
    //         })
    //     },
    //     (err: CaptureError) => console.error(err)
    //   );
  }
