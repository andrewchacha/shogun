package fileuploader

import (
	"fmt"
	"io"
	"shogun/config"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

const returnUrlPrefix = "https://images.shogun.social/"

type Uploader struct {
	endPoint string
	region   string
	bucket   string
}

type Data struct {
	Body        io.Reader
	FileName    string
	ContentType string
}

func NewUploaderService() *Uploader {
	endPoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", config.Cfg.R2AccountID)
	bucket := "shogun"
	region := "auto"
	return &Uploader{
		endPoint: endPoint,
		region:   region,
		bucket:   bucket,
	}
}

func (u *Uploader) Upload(params *Data) (string, error) {
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(u.region),
		Endpoint:    aws.String(u.endPoint),
		Credentials: credentials.NewStaticCredentials(config.Cfg.R2AccessKeyID, config.Cfg.R2SecretAccessKey, ""),
	})
	if err != nil {
		return "", err
	}
	uploader := s3manager.NewUploader(sess)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(u.bucket),
		Key:         aws.String(params.FileName),
		ContentType: aws.String(params.ContentType),
		Body:        params.Body,
	})
	if err != nil {
		return "", err
	}
	return returnUrlPrefix + params.FileName, nil
}
