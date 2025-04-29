package config

import "github.com/ilyakaznacheev/cleanenv"

type Mode string

const (
	Release Mode = "release"
	Dev     Mode = "dev"
)

var Cfg Config

type Config struct {
	ServerID          string `env:"server_id"`
	NatsUrl           string `env:"nats_url"`
	PostgresURL       string `env:"postgres_url"`
	Port              string `env:"port"`
	Mode              Mode   `env:"mode"`
	AccessTokenSecret string `env:"access_token_secret"`
	R2AccessKeyID     string `env:"r2_access_key_id"`
	R2SecretAccessKey string `env:"r2_secret_access_key"`
	R2AccountID       string `env:"r2_account_id"`

	SuiRPC             string `env:"sui_rpc"`
	SolanaRPC          string `env:"solana_rpc"`
	SolanaHeliusApiKey string `env:"solana_helius_api_key"`

	UsernameUpdateLockDays   int `env:"username_update_lock_days" env-default:"7"`
	NameUpdateLockDays       int `env:"name_update_lock_days" env-default:"1"`
	UsernameMaxLength        int `env:"username_max_length" env-default:"18"`
	UsernameMinLengthNormal  int `env:"username_min_length_normal" env-default:"6"`
	UsernameMinLengthSpecial int `env:"username_min_length_special" env-default:"2"`
	NameMaxLength            int `env:"name_max_length" env-default:"50"`
	BioMaxLength             int `env:"bio_max_length" env-default:"500"`
}

func (cfg *Config) IsRelease() bool {
	return cfg.Mode == Release
}

func Init() *Config {
	err := cleanenv.ReadConfig(".env", &Cfg)
	if err != nil {
		panic(err)
	}
	if Cfg.AccessTokenSecret == "" {
		panic("access_token_secret missing")
	}
	return &Cfg
}
