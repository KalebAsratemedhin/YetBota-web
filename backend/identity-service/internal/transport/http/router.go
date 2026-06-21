package http

import (
	"net/http"

	authHttp "github.com/beka-birhanu/yetbota/identity-service/internal/transport/http/auth"
	domainAuth "github.com/beka-birhanu/yetbota/identity-service/internal/domain/auth"
	"github.com/beka-birhanu/yetbota/identity-service/internal/services/endpoint"
	internalgraphHttp "github.com/beka-birhanu/yetbota/identity-service/internal/transport/http/internalgraph"
	repoGraphRead "github.com/beka-birhanu/yetbota/identity-service/internal/services/repository/graphread"
	httpShared "github.com/beka-birhanu/yetbota/identity-service/internal/transport/http/shared"
	deviceHttp "github.com/beka-birhanu/yetbota/identity-service/internal/transport/http/userdevice"
	userHttp "github.com/beka-birhanu/yetbota/identity-service/internal/transport/http/user"
)

type Config struct {
	BasePath       string
	E              *endpoint.Endpoints
	SessionManager domainAuth.SessionManager
	CorsHosts      []string
	GraphReadRepo  repoGraphRead.Repository
	InternalToken  string
}

func NewRouter(cfg *Config) (http.Handler, error) {
	r := http.NewServeMux()

	v1 := http.NewServeMux()
	if cfg != nil && cfg.E != nil {
		authHandler, err := authHttp.NewHandler(&authHttp.Config{E: cfg.E, SessionManager: cfg.SessionManager})
		if err != nil {
			return nil, err
		}
		v1.Handle("/auth/", http.StripPrefix("/auth", authHandler))

		userHandler, err := userHttp.NewHandler(&userHttp.Config{E: cfg.E, SessionManager: cfg.SessionManager})
		if err != nil {
			return nil, err
		}
		v1.Handle("/users/", http.StripPrefix("/users", userHandler))

		deviceHandler, err := deviceHttp.NewHandler(&deviceHttp.Config{E: cfg.E, SessionManager: cfg.SessionManager})
		if err != nil {
			return nil, err
		}
		v1.Handle("/devices/", http.StripPrefix("/devices", deviceHandler))
	}

	if cfg != nil && cfg.GraphReadRepo != nil {
		internalHandler := internalgraphHttp.NewHandler(&internalgraphHttp.Config{
			Repo:         cfg.GraphReadRepo,
			ServiceToken: cfg.InternalToken,
		})
		v1.Handle("/internal/graph/", http.StripPrefix("/internal/graph", internalHandler))
	}

	if cfg != nil && cfg.BasePath != "" {
		r.Handle(cfg.BasePath+"/v1/", http.StripPrefix(cfg.BasePath+"/v1", v1))
	} else {
		r.Handle("/v1/", http.StripPrefix("/v1", v1))
	}

	var out http.Handler = r
	if cfg != nil && len(cfg.CorsHosts) > 0 {
		out = httpShared.CORS(cfg.CorsHosts)(out)
	}
	return out, nil
}

