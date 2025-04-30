package blurhash

import (
	"fmt"
	"image"
	"image/png"
	"net/http"
	"os"
	"time"

	"github.com/buckket/go-blurhash"
)

func GetFromUrl(url string) (string, error) {
	client := http.Client{
		Timeout: 20 * time.Second,
	}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		panic(err)
	}
	res, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	img, _, err := image.Decode(res.Body)
	if err != nil {
		return "", err
	}
	return blurhash.Encode(4, 3, img)
}

func GetFromFile(path string) (string, error) {
	imageFile, err := os.Open(path)
	if err != nil {
		return "", err
	}
	fmt.Println(imageFile.Name())
	defer imageFile.Close()
	img, err := png.Decode(imageFile)
	if err != nil {
		return "", err
	}
	return blurhash.Encode(4, 3, img)
}
