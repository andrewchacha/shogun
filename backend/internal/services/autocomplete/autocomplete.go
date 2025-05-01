package autocomplete

import (
	"shogun/internal/model/user"
	"shogun/internal/services/usercache"
	"shogun/internal/services/userstore"

	trie "github.com/Vivino/go-autocomplete-trie"
	"github.com/rs/zerolog/log"
)

type Trie struct {
	root      *trie.Trie
	userStore userstore.Store
	userCache usercache.Cache
}

func NewTrieAutocomplete(userStore userstore.Store, cache usercache.Cache) *Trie {
	t := trie.New().
		WithoutFuzzy().     //remove if you want fuzzy search
		WithNormalisation() //remove if you want case-sensitive search
	return &Trie{
		root:      t,
		userStore: userStore,
		userCache: cache,
	}
}

func (t *Trie) Run() {
	t.loadDbUsers()
}

func (t *Trie) loadDbUsers() {
	err := t.userStore.GetAllUsernames(func(username string) {
		t.insert(username)
	})
	if err != nil {
		log.Err(err).Msg("Failed to load users")
	}
}

func (t *Trie) insert(username string) {
	t.root.Insert(username)
}

func (t *Trie) Search(prefix string) ([]user.Simple, error) {
	results := t.root.Search(prefix, maxResults)
	if len(results) == 0 {
		return nil, nil
	}
	if len(results) > maxResults {
		results = results[:maxResults]
	}
	res := make([]user.Simple, 0, len(results))
	for _, username := range results {
		simple, err := t.userCache.GetByUsername(username)
		if err != nil {
			continue
		}
		res = append(res, *simple)
	}
	return res, nil
}
