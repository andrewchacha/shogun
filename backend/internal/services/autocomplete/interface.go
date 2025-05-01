package autocomplete

import (
	"shogun/internal/model/user"
)

const maxResults = 25

type Autocomplete interface {
	Run() error
	Search(prefix string) []user.Simple
}
