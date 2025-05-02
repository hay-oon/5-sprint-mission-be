// multer-s3 타입 확장 정의
declare namespace Express {
  namespace MulterS3 {
    interface File extends Express.Multer.File {
      bucket: string;
      key: string;
      acl: string;
      contentType: string;
      contentDisposition: string;
      contentEncoding: string;
      storageClass: string;
      serverSideEncryption: string;
      metadata: any;
      location: string;
      etag: string;
    }
  }
}
